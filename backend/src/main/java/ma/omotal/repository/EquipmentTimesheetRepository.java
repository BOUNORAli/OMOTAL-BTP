package ma.omotal.repository;

import java.util.List;
import java.util.UUID;
import ma.omotal.domain.EquipmentTimesheetEntity;
import ma.omotal.domain.enums.OperationStatus;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EquipmentTimesheetRepository extends JpaRepository<EquipmentTimesheetEntity, UUID> {
  List<EquipmentTimesheetEntity> findByChantierId(UUID chantierId);

  List<EquipmentTimesheetEntity> findByChantierIdIn(List<UUID> chantierIds);

  List<EquipmentTimesheetEntity> findByStatus(OperationStatus status);
}
