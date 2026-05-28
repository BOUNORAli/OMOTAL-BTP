package ma.omotal.security;

import java.util.Collection;
import java.util.List;
import java.util.UUID;
import ma.omotal.domain.UserEntity;
import ma.omotal.domain.enums.Role;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

public class UserPrincipal implements UserDetails {
  private final UUID id;
  private final String email;
  private final String password;
  private final Role role;
  private final boolean active;

  public UserPrincipal(UserEntity user) {
    this.id = user.getId();
    this.email = user.getEmail();
    this.password = user.getPasswordHash();
    this.role = user.getRole();
    this.active = user.isActive();
  }

  public UUID id() {
    return id;
  }

  public Role role() {
    return role;
  }

  @Override
  public Collection<? extends GrantedAuthority> getAuthorities() {
    return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
  }

  @Override
  public String getPassword() {
    return password;
  }

  @Override
  public String getUsername() {
    return email;
  }

  @Override
  public boolean isEnabled() {
    return active;
  }
}
