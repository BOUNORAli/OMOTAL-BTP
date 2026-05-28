package ma.omotal.repository;

import java.util.Optional;
import java.util.UUID;
import ma.omotal.domain.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<UserEntity, UUID> {
  Optional<UserEntity> findByEmailIgnoreCase(String email);
}
