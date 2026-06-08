package ma.omotal.service;

import java.text.Normalizer;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import ma.omotal.domain.ChantierReferenceValueEntity;
import ma.omotal.domain.ChantierSettingsEntity;
import ma.omotal.repository.ChantierReferenceValueRepository;
import ma.omotal.repository.ChantierSettingsRepository;
import org.springframework.stereotype.Service;

@Service
public class ReferenceService {
  private final ChantierReferenceValueRepository references;
  private final ChantierSettingsRepository settings;

  public ReferenceService(ChantierReferenceValueRepository references, ChantierSettingsRepository settings) {
    this.references = references;
    this.settings = settings;
  }

  public List<ChantierReferenceValueEntity> list(UUID chantierId, String category) {
    if (category == null || category.isBlank()) {
      return references.findByChantierIdOrderByCategoryAscSortOrderAscValueAsc(chantierId);
    }
    return references.findByChantierIdAndCategoryOrderBySortOrderAscValueAsc(chantierId, category.toUpperCase(Locale.ROOT));
  }

  public ChantierReferenceValueEntity getOrCreate(UUID chantierId, String category, String value) {
    return getOrCreate(chantierId, category, value, null, 0);
  }

  public ChantierReferenceValueEntity getOrCreate(
      UUID chantierId,
      String category,
      String value,
      String aliasOfValue,
      int sortOrder
  ) {
    var normalizedCategory = category.toUpperCase(Locale.ROOT);
    var normalizedValue = normalize(value);
    return references.findByChantierIdAndCategoryAndNormalizedValue(chantierId, normalizedCategory, normalizedValue)
        .orElseGet(() -> {
          var item = new ChantierReferenceValueEntity();
          item.setChantierId(chantierId);
          item.setCategory(normalizedCategory);
          item.setValue(value.trim());
          item.setNormalizedValue(normalizedValue);
          item.setAliasOfValue(aliasOfValue == null || aliasOfValue.isBlank() ? null : aliasOfValue.trim());
          item.setSortOrder(sortOrder);
          return references.save(item);
        });
  }

  public ChantierSettingsEntity getOrCreateSettings(UUID chantierId) {
    return settings.findByChantierId(chantierId).orElseGet(() -> {
      var item = new ChantierSettingsEntity();
      item.setChantierId(chantierId);
      return settings.save(item);
    });
  }

  public static String normalize(String value) {
    if (value == null) {
      return "";
    }
    var noAccents = Normalizer.normalize(value, Normalizer.Form.NFD).replaceAll("\\p{M}", "");
    return noAccents.trim().replaceAll("\\s+", " ").toUpperCase(Locale.ROOT);
  }
}
