package ma.omotal.repository;

import java.util.List;
import java.util.UUID;
import ma.omotal.domain.ImportRowEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ImportRowRepository extends JpaRepository<ImportRowEntity, UUID> {
  List<ImportRowEntity> findByBatchIdOrderBySheetNameAscSourceRowNumberAsc(UUID batchId);
}
