package ma.omotal.repository;

import java.util.List;
import java.util.UUID;
import ma.omotal.domain.ImportBatchEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ImportBatchRepository extends JpaRepository<ImportBatchEntity, UUID> {
  List<ImportBatchEntity> findByChantierIdOrderByCreatedAtDesc(UUID chantierId);
}
