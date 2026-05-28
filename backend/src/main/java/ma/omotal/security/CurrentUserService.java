package ma.omotal.security;

import ma.omotal.domain.UserEntity;
import ma.omotal.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class CurrentUserService {
  private final UserRepository users;

  public CurrentUserService(UserRepository users) {
    this.users = users;
  }

  public UserEntity currentUser() {
    var principal = (UserPrincipal) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    return users.findById(principal.id()).orElseThrow();
  }
}
