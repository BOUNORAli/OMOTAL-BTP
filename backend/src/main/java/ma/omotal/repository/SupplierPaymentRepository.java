package ma.omotal.repository;

import java.util.List;
import java.util.UUID;
import ma.omotal.domain.SupplierPaymentEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SupplierPaymentRepository extends JpaRepository<SupplierPaymentEntity, UUID> {
  List<SupplierPaymentEntity> findByChantierId(UUID chantierId);
  List<SupplierPaymentEntity> findBySupplierId(UUID supplierId);
}
