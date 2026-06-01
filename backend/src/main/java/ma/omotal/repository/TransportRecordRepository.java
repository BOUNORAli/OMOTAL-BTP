package ma.omotal.repository;

import java.util.List;
import java.util.UUID;
import ma.omotal.domain.TransportRecordEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TransportRecordRepository extends JpaRepository<TransportRecordEntity, UUID> {
  List<TransportRecordEntity> findByChantierId(UUID chantierId);
  List<TransportRecordEntity> findByChantierIdIn(List<UUID> chantierIds);
}
