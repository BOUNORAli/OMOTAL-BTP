package ma.omotal.repository;

import java.util.List;
import java.util.UUID;
import ma.omotal.domain.BqArticleEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BqArticleRepository extends JpaRepository<BqArticleEntity, UUID> {
  List<BqArticleEntity> findByChantierId(UUID chantierId);
}
