package ma.omotal.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import ma.omotal.domain.GasoilEntryEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GasoilEntryRepository extends JpaRepository<GasoilEntryEntity, UUID> {
  List<GasoilEntryEntity> findByChantierId(UUID chantierId);

  List<GasoilEntryEntity> findByChantierIdIn(List<UUID> chantierIds);

  Optional<GasoilEntryEntity> findByChantierIdAndReceiptNumber(UUID chantierId, String receiptNumber);
}
