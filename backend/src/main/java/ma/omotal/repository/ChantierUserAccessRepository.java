package ma.omotal.repository;

import java.util.List;
import java.util.UUID;
import ma.omotal.domain.ChantierUserAccessEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ChantierUserAccessRepository extends JpaRepository<ChantierUserAccessEntity, UUID> {
  boolean existsByUserIdAndChantierId(UUID userId, UUID chantierId);

  List<ChantierUserAccessEntity> findByUserId(UUID userId);
}
