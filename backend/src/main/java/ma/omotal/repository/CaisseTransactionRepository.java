package ma.omotal.repository;

import java.util.List;
import java.util.UUID;
import ma.omotal.domain.CaisseTransactionEntity;
import ma.omotal.domain.enums.OperationStatus;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CaisseTransactionRepository extends JpaRepository<CaisseTransactionEntity, UUID> {
  List<CaisseTransactionEntity> findByChantierIdIn(List<UUID> chantierIds);

  List<CaisseTransactionEntity> findByChantierId(UUID chantierId);

  List<CaisseTransactionEntity> findByStatus(OperationStatus status);
}
