package ma.omotal.repository;

import java.util.List;
import java.util.UUID;
import ma.omotal.domain.BqRealisationEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BqRealisationRepository extends JpaRepository<BqRealisationEntity, UUID> {
  List<BqRealisationEntity> findByChantierId(UUID chantierId);
  List<BqRealisationEntity> findByBqArticleId(UUID bqArticleId);
}
