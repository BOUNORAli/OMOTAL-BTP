package ma.omotal.service.storage;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import ma.omotal.config.AppProperties;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
@ConditionalOnProperty(name = "omotal.app.document-storage-provider", havingValue = "local", matchIfMissing = true)
public class LocalDocumentStorageService implements DocumentStorageService {
  private final AppProperties properties;

  public LocalDocumentStorageService(AppProperties properties) {
    this.properties = properties;
  }

  @Override
  public void store(String storageKey, MultipartFile file) throws IOException {
    var target = resolve(storageKey);
    Files.createDirectories(target.getParent());
    file.transferTo(target);
  }

  @Override
  public Resource load(String storageKey) {
    var file = resolve(storageKey);
    if (!Files.exists(file)) {
      throw new IllegalArgumentException("Fichier introuvable.");
    }
    return new FileSystemResource(file);
  }

  private Path resolve(String storageKey) {
    var root = Path.of(properties.documentStoragePath()).toAbsolutePath().normalize();
    var target = root.resolve(storageKey).normalize();
    if (!target.startsWith(root)) {
      throw new IllegalArgumentException("Chemin document invalide.");
    }
    return target;
  }
}
