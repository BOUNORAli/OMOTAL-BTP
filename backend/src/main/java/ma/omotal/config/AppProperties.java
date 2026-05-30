package ma.omotal.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "omotal.app")
public record AppProperties(
    long highPaymentThreshold,
    boolean demoDataEnabled,
    String frontendOrigin,
    String documentStorageProvider,
    String documentStoragePath,
    String s3Endpoint,
    String s3Region,
    String s3Bucket,
    String s3AccessKey,
    String s3SecretKey,
    boolean s3PathStyleAccess
) {
}
