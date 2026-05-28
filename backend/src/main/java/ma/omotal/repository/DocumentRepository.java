package ma.omotal.repository;

import java.util.List;
import java.util.UUID;
import ma.omotal.domain.DocumentEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DocumentRepository extends JpaRepository<DocumentEntity, UUID> {
  List<DocumentEntity> findByChantierId(UUID chantierId);
}
