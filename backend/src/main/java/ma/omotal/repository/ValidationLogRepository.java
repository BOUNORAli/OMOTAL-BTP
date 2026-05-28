package ma.omotal.repository;

import java.util.UUID;
import ma.omotal.domain.ValidationLogEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ValidationLogRepository extends JpaRepository<ValidationLogEntity, UUID> {
}
