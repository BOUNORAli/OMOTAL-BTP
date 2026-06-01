package ma.omotal.repository;

import java.util.List;
import java.util.UUID;
import ma.omotal.domain.MaterialPurchaseEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MaterialPurchaseRepository extends JpaRepository<MaterialPurchaseEntity, UUID> {
  List<MaterialPurchaseEntity> findByChantierId(UUID chantierId);
  List<MaterialPurchaseEntity> findByChantierIdIn(List<UUID> chantierIds);
}
