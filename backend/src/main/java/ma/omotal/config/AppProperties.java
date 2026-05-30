package ma.omotal.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "omotal.app")
public record AppProperties(
    long highPaymentThreshold,
    boolean demoDataEnabled,
    String frontendOrigin,
    String documentStoragePath
) {
}
