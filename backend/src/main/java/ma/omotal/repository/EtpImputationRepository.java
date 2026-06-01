package ma.omotal.repository;

import java.util.List;
import java.util.UUID;
import ma.omotal.domain.EtpImputationEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EtpImputationRepository extends JpaRepository<EtpImputationEntity, UUID> {
  List<EtpImputationEntity> findByChantierId(UUID chantierId);
  List<EtpImputationEntity> findByChantierIdIn(List<UUID> chantierIds);
}
