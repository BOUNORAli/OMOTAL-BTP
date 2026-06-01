package ma.omotal.repository;

import java.util.List;
import java.util.UUID;
import ma.omotal.domain.MaintenanceRecordEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MaintenanceRecordRepository extends JpaRepository<MaintenanceRecordEntity, UUID> {
  List<MaintenanceRecordEntity> findByChantierId(UUID chantierId);
  List<MaintenanceRecordEntity> findByChantierIdIn(List<UUID> chantierIds);
}
