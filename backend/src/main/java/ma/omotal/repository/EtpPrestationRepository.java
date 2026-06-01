package ma.omotal.repository;

import java.util.List;
import java.util.UUID;
import ma.omotal.domain.EtpPrestationEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EtpPrestationRepository extends JpaRepository<EtpPrestationEntity, UUID> {
  List<EtpPrestationEntity> findByChantierId(UUID chantierId);
  List<EtpPrestationEntity> findByChantierIdIn(List<UUID> chantierIds);
}
