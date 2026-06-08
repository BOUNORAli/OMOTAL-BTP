package ma.omotal.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import ma.omotal.domain.ChantierReferenceValueEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ChantierReferenceValueRepository extends JpaRepository<ChantierReferenceValueEntity, UUID> {
  List<ChantierReferenceValueEntity> findByChantierIdOrderByCategoryAscSortOrderAscValueAsc(UUID chantierId);

  List<ChantierReferenceValueEntity> findByChantierIdAndCategoryOrderBySortOrderAscValueAsc(UUID chantierId, String category);

  Optional<ChantierReferenceValueEntity> findByChantierIdAndCategoryAndNormalizedValue(
      UUID chantierId,
      String category,
      String normalizedValue
  );
}
