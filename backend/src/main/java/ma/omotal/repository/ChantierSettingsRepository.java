package ma.omotal.repository;

import java.util.Optional;
import java.util.UUID;
import ma.omotal.domain.ChantierSettingsEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ChantierSettingsRepository extends JpaRepository<ChantierSettingsEntity, UUID> {
  Optional<ChantierSettingsEntity> findByChantierId(UUID chantierId);
}
