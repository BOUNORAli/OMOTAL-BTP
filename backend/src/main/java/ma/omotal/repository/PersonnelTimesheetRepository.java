package ma.omotal.repository;

import java.util.List;
import java.util.UUID;
import ma.omotal.domain.PersonnelTimesheetEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PersonnelTimesheetRepository extends JpaRepository<PersonnelTimesheetEntity, UUID> {
  List<PersonnelTimesheetEntity> findByChantierId(UUID chantierId);

  List<PersonnelTimesheetEntity> findByChantierIdIn(List<UUID> chantierIds);
}
