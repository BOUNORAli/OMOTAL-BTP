package ma.omotal.repository;

import java.util.List;
import java.util.UUID;
import ma.omotal.domain.DriverExpenseEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DriverExpenseRepository extends JpaRepository<DriverExpenseEntity, UUID> {
  List<DriverExpenseEntity> findByChantierId(UUID chantierId);
}
