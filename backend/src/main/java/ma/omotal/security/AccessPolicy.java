package ma.omotal.security;

import java.util.List;
import java.util.UUID;
import ma.omotal.domain.UserEntity;
import ma.omotal.domain.enums.Role;
import ma.omotal.repository.ChantierUserAccessRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

@Service
public class AccessPolicy {
  private final ChantierUserAccessRepository access;

  public AccessPolicy(ChantierUserAccessRepository access) {
    this.access = access;
  }

  public boolean canAccessChantier(UserEntity user, UUID chantierId) {
    return user.getRole() == Role.SUPER_ADMIN
        || user.getRole() == Role.DIRECTEUR
        || access.existsByUserIdAndChantierId(user.getId(), chantierId);
  }

  public List<UUID> authorizedChantierIds(UserEntity user) {
    if (user.getRole() == Role.SUPER_ADMIN || user.getRole() == Role.DIRECTEUR) {
      return List.of();
    }
    return access.findByUserId(user.getId()).stream().map(item -> item.getChantierId()).toList();
  }

  public void requireChantier(UserEntity user, UUID chantierId) {
    if (!canAccessChantier(user, chantierId)) {
      throw new AccessDeniedException("Vous n'avez pas acces a ce chantier.");
    }
  }

  public void requireRole(UserEntity user, Role... roles) {
    for (var role : roles) {
      if (user.getRole() == role) {
        return;
      }
    }
    throw new AccessDeniedException("Permission insuffisante.");
  }
}
