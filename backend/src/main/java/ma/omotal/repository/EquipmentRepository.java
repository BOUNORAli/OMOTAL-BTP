package ma.omotal.repository;

import java.util.List;
import java.util.UUID;
import ma.omotal.domain.EquipmentEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EquipmentRepository extends JpaRepository<EquipmentEntity, UUID> {
  List<EquipmentEntity> findByChantierIdIn(List<UUID> chantierIds);

  List<EquipmentEntity> findByChantierId(UUID chantierId);
}
