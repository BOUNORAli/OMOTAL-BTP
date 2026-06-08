package ma.omotal.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import ma.omotal.domain.ProductionRecordEntity;
import ma.omotal.domain.enums.OperationStatus;
import ma.omotal.domain.enums.ProductionFamily;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductionRecordRepository extends JpaRepository<ProductionRecordEntity, UUID> {
  List<ProductionRecordEntity> findByChantierId(UUID chantierId);
  List<ProductionRecordEntity> findByChantierIdIn(List<UUID> chantierIds);
  List<ProductionRecordEntity> findByStatus(OperationStatus status);
  List<ProductionRecordEntity> findByChantierIdAndDateBetween(UUID chantierId, LocalDate from, LocalDate to);
  List<ProductionRecordEntity> findByChantierIdAndProductionFamilyAndDateBetween(
      UUID chantierId,
      ProductionFamily productionFamily,
      LocalDate from,
      LocalDate to
  );
}
