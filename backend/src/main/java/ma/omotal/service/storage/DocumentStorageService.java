package ma.omotal.service.storage;

import java.io.IOException;
import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

public interface DocumentStorageService {
  void store(String storageKey, MultipartFile file) throws IOException;

  Resource load(String storageKey) throws IOException;
}
