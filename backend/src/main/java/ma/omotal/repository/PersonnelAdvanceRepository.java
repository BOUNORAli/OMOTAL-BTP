package ma.omotal.repository;

import java.util.List;
import java.util.UUID;
import ma.omotal.domain.PersonnelAdvanceEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PersonnelAdvanceRepository extends JpaRepository<PersonnelAdvanceEntity, UUID> {
  List<PersonnelAdvanceEntity> findByChantierId(UUID chantierId);

  List<PersonnelAdvanceEntity> findByChantierIdIn(List<UUID> chantierIds);
}
