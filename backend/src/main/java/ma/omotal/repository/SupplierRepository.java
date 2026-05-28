package ma.omotal.repository;

import java.util.List;
import java.util.UUID;
import ma.omotal.domain.SupplierEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SupplierRepository extends JpaRepository<SupplierEntity, UUID> {
  List<SupplierEntity> findByActiveTrueOrderByNameAsc();
}
