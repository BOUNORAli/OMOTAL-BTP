package ma.omotal.api;

import jakarta.validation.Valid;
import ma.omotal.api.dto.AuthDtos;
import ma.omotal.repository.ChantierUserAccessRepository;
import ma.omotal.repository.UserRepository;
import ma.omotal.security.JwtService;
import ma.omotal.security.UserPrincipal;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {
  private final AuthenticationManager authenticationManager;
  private final JwtService jwtService;
  private final UserRepository users;
  private final ChantierUserAccessRepository access;

  public AuthController(
      AuthenticationManager authenticationManager,
      JwtService jwtService,
      UserRepository users,
      ChantierUserAccessRepository access
  ) {
    this.authenticationManager = authenticationManager;
    this.jwtService = jwtService;
    this.users = users;
    this.access = access;
  }

  @PostMapping("/login")
  public AuthDtos.AuthResponse login(@Valid @RequestBody AuthDtos.LoginRequest request) {
    var authentication = authenticationManager.authenticate(
        new UsernamePasswordAuthenticationToken(request.email(), request.password())
    );
    var principal = (UserPrincipal) authentication.getPrincipal();
    var user = users.findById(principal.id()).orElseThrow();
    var chantierIds = access.findByUserId(user.getId()).stream().map(item -> item.getChantierId()).toList();

    return new AuthDtos.AuthResponse(
        jwtService.generate(principal),
        new AuthDtos.UserDto(user.getId(), user.getName(), user.getEmail(), user.getRole(), user.isActive(), chantierIds)
    );
  }
}
