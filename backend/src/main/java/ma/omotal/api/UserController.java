package ma.omotal.api;

import jakarta.validation.Valid;
import java.util.List;
import ma.omotal.api.dto.AuthDtos;
import ma.omotal.domain.ChantierUserAccessEntity;
import ma.omotal.domain.UserEntity;
import ma.omotal.domain.enums.Role;
import ma.omotal.repository.ChantierUserAccessRepository;
import ma.omotal.repository.UserRepository;
import ma.omotal.security.AccessPolicy;
import ma.omotal.security.CurrentUserService;
import ma.omotal.service.AuditService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {
  private final UserRepository users;
  private final ChantierUserAccessRepository access;
  private final PasswordEncoder passwordEncoder;
  private final CurrentUserService currentUser;
  private final AccessPolicy accessPolicy;
  private final AuditService audit;

  public UserController(
      UserRepository users,
      ChantierUserAccessRepository access,
      PasswordEncoder passwordEncoder,
      CurrentUserService currentUser,
      AccessPolicy accessPolicy,
      AuditService audit
  ) {
    this.users = users;
    this.access = access;
    this.passwordEncoder = passwordEncoder;
    this.currentUser = currentUser;
    this.accessPolicy = accessPolicy;
    this.audit = audit;
  }

  @GetMapping
  public List<AuthDtos.UserDto> list() {
    var user = currentUser.currentUser();
    accessPolicy.requireRole(user, Role.SUPER_ADMIN);
    return users.findAll().stream().map(this::toDto).toList();
  }

  @PostMapping
  public AuthDtos.UserDto create(@Valid @RequestBody AuthDtos.CreateUserRequest request) {
    var user = currentUser.currentUser();
    accessPolicy.requireRole(user, Role.SUPER_ADMIN);
    if (users.findByEmailIgnoreCase(request.email()).isPresent()) {
      throw new IllegalArgumentException("Cet email existe deja.");
    }

    var item = new UserEntity();
    item.setName(request.name());
    item.setEmail(request.email());
    item.setPasswordHash(passwordEncoder.encode(request.password()));
    item.setRole(request.role() == null ? Role.LECTURE_SEULE : request.role());
    item.setActive(true);
    var saved = users.save(item);

    for (var chantierId : request.chantierIds() == null ? List.<java.util.UUID>of() : request.chantierIds()) {
      var accessRow = new ChantierUserAccessEntity();
      accessRow.setUserId(saved.getId());
      accessRow.setChantierId(chantierId);
      access.save(accessRow);
    }

    audit.record(user.getId(), "admin", "create_user", "User", saved.getId(), saved.getEmail());
    return toDto(saved);
  }

  private AuthDtos.UserDto toDto(UserEntity user) {
    var chantierIds = access.findByUserId(user.getId()).stream().map(item -> item.getChantierId()).toList();
    return new AuthDtos.UserDto(user.getId(), user.getName(), user.getEmail(), user.getRole(), user.isActive(), chantierIds);
  }
}
