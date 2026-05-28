package ma.omotal.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "omotal.security")
public record SecurityProperties(
    String jwtSecret,
    long jwtExpirationMinutes
) {
}
