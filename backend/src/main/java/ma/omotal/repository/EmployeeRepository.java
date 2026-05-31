package ma.omotal.repository;

import java.util.List;
import java.util.UUID;
import ma.omotal.domain.EmployeeEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EmployeeRepository extends JpaRepository<EmployeeEntity, UUID> {
  List<EmployeeEntity> findByChantierId(UUID chantierId);

  List<EmployeeEntity> findByChantierIdIn(List<UUID> chantierIds);
}
