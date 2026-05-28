package ma.omotal.api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import java.util.List;
import java.util.UUID;
import ma.omotal.domain.enums.Role;

public final class AuthDtos {
  private AuthDtos() {
  }

  public record LoginRequest(
      @Email @NotBlank String email,
      @NotBlank String password
  ) {
  }

  public record AuthResponse(
      String token,
      UserDto user
  ) {
  }

  public record UserDto(
      UUID id,
      String name,
      String email,
      Role role,
      boolean active,
      List<UUID> chantierIds
  ) {
  }
}
