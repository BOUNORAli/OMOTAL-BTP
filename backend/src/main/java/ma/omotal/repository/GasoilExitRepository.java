package ma.omotal.repository;

import java.util.List;
import java.util.UUID;
import ma.omotal.domain.GasoilExitEntity;
import ma.omotal.domain.enums.OperationStatus;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GasoilExitRepository extends JpaRepository<GasoilExitEntity, UUID> {
  List<GasoilExitEntity> findByChantierId(UUID chantierId);

  List<GasoilExitEntity> findByChantierIdIn(List<UUID> chantierIds);

  List<GasoilExitEntity> findByStatus(OperationStatus status);
}
