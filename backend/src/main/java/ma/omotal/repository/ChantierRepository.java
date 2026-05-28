package ma.omotal.repository;

import java.util.UUID;
import ma.omotal.domain.ChantierEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ChantierRepository extends JpaRepository<ChantierEntity, UUID> {
  boolean existsByCodeIgnoreCase(String code);
}
