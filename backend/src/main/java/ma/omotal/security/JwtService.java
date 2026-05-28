package ma.omotal.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import ma.omotal.config.SecurityProperties;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

@Service
public class JwtService {
  private final SecurityProperties properties;

  public JwtService(SecurityProperties properties) {
    this.properties = properties;
  }

  public String generate(UserPrincipal principal) {
    var now = Instant.now();
    return Jwts.builder()
        .subject(principal.getUsername())
        .claim("userId", principal.id().toString())
        .claim("role", principal.role().name())
        .issuedAt(Date.from(now))
        .expiration(Date.from(now.plusSeconds(properties.jwtExpirationMinutes() * 60)))
        .signWith(Keys.hmacShaKeyFor(properties.jwtSecret().getBytes(StandardCharsets.UTF_8)))
        .compact();
  }

  public String subject(String token) {
    return claims(token).getSubject();
  }

  public boolean isValid(String token, UserDetails userDetails) {
    return userDetails.getUsername().equals(subject(token)) && claims(token).getExpiration().after(new Date());
  }

  private Claims claims(String token) {
    return Jwts.parser()
        .verifyWith(Keys.hmacShaKeyFor(properties.jwtSecret().getBytes(StandardCharsets.UTF_8)))
        .build()
        .parseSignedClaims(token)
        .getPayload();
  }
}
