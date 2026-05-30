package ma.omotal.service.storage;

import java.io.IOException;
import java.net.URI;
import ma.omotal.config.AppProperties;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3Configuration;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

@Service
@ConditionalOnProperty(name = "omotal.app.document-storage-provider", havingValue = "s3")
public class S3DocumentStorageService implements DocumentStorageService {
  private final AppProperties properties;
  private final S3Client s3;

  public S3DocumentStorageService(AppProperties properties) {
    this.properties = properties;
    validateConfiguration(properties);

    var builder = S3Client.builder()
        .region(Region.of(properties.s3Region()))
        .credentialsProvider(StaticCredentialsProvider.create(
            AwsBasicCredentials.create(properties.s3AccessKey(), properties.s3SecretKey())))
        .serviceConfiguration(S3Configuration.builder()
            .pathStyleAccessEnabled(properties.s3PathStyleAccess())
            .build());

    if (!properties.s3Endpoint().isBlank()) {
      builder.endpointOverride(URI.create(properties.s3Endpoint()));
    }

    this.s3 = builder.build();
  }

  @Override
  public void store(String storageKey, MultipartFile file) throws IOException {
    var request = PutObjectRequest.builder()
        .bucket(properties.s3Bucket())
        .key(storageKey)
        .contentType(file.getContentType())
        .contentLength(file.getSize())
        .build();

    s3.putObject(request, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));
  }

  @Override
  public Resource load(String storageKey) {
    var request = GetObjectRequest.builder()
        .bucket(properties.s3Bucket())
        .key(storageKey)
        .build();
    return new InputStreamResource(s3.getObject(request));
  }

  private static void validateConfiguration(AppProperties properties) {
    if (properties.s3Bucket().isBlank()
        || properties.s3AccessKey().isBlank()
        || properties.s3SecretKey().isBlank()) {
      throw new IllegalStateException("Configuration S3/MinIO incomplete.");
    }
  }
}
