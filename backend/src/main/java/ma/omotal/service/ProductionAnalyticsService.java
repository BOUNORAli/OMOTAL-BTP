package ma.omotal.service;

import java.math.BigDecimal;
import java.math.MathContext;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import ma.omotal.api.dto.CoreDtos;
import ma.omotal.domain.ProductionRecordEntity;
import ma.omotal.domain.enums.OperationStatus;
import ma.omotal.domain.enums.ProductionFamily;
import ma.omotal.repository.ProductionRecordRepository;
import org.springframework.stereotype.Service;

@Service
public class ProductionAnalyticsService {
  private final ProductionRecordRepository productions;

  public ProductionAnalyticsService(ProductionRecordRepository productions) {
    this.productions = productions;
  }

  public CoreDtos.ProductionAnalyticsDto analytics(UUID chantierId, LocalDate from, LocalDate to, ProductionFamily family) {
    var start = from == null ? LocalDate.of(1900, 1, 1) : from;
    var end = to == null ? LocalDate.of(9999, 12, 31) : to;
    var rows = family == null
        ? productions.findByChantierIdAndDateBetween(chantierId, start, end)
        : productions.findByChantierIdAndProductionFamilyAndDateBetween(chantierId, family, start, end);
    var officialRows = rows.stream().filter(row -> CalculationService.isOfficial(row.getStatus())).toList();

    return new CoreDtos.ProductionAnalyticsDto(
        chantierId,
        start,
        end,
        family,
        sum(officialRows, ProductionRecordEntity::getQuantity),
        sum(officialRows, ProductionRecordEntity::getHours),
        sum(officialRows, ProductionRecordEntity::getAllocatedGasoilLiters),
        sum(officialRows, ProductionRecordEntity::getTotalAllocatedCost),
        ratio(sum(officialRows, ProductionRecordEntity::getQuantity), sum(officialRows, ProductionRecordEntity::getHours)),
        ratio(sum(officialRows, ProductionRecordEntity::getTotalAllocatedCost), sum(officialRows, ProductionRecordEntity::getQuantity)),
        breakdown(officialRows, row -> row.getProductionFamily().name()),
        breakdown(officialRows, ProductionRecordEntity::getVoie),
        breakdown(officialRows, row -> row.getEquipmentId() == null ? "Sans engin" : row.getEquipmentId().toString()),
        breakdown(officialRows, row -> blank(row.getDriver(), "Sans chauffeur"))
    );
  }

  private List<CoreDtos.ProductionBreakdownDto> breakdown(
      List<ProductionRecordEntity> rows,
      Function<ProductionRecordEntity, String> key
  ) {
    Map<String, List<ProductionRecordEntity>> groups = new LinkedHashMap<>();
    for (var row : rows) {
      groups.computeIfAbsent(blank(key.apply(row), "Non renseigne"), ignored -> new java.util.ArrayList<>()).add(row);
    }
    return groups.entrySet().stream()
        .map(entry -> {
          var quantity = sum(entry.getValue(), ProductionRecordEntity::getQuantity);
          var hours = sum(entry.getValue(), ProductionRecordEntity::getHours);
          var liters = sum(entry.getValue(), ProductionRecordEntity::getAllocatedGasoilLiters);
          var cost = sum(entry.getValue(), ProductionRecordEntity::getTotalAllocatedCost);
          return new CoreDtos.ProductionBreakdownDto(
              entry.getKey(),
              quantity,
              hours,
              liters,
              cost,
              ratio(quantity, hours),
              ratio(cost, quantity)
          );
        })
        .toList();
  }

  private static BigDecimal sum(List<ProductionRecordEntity> rows, Function<ProductionRecordEntity, BigDecimal> getter) {
    return rows.stream().map(getter).map(ProductionAnalyticsService::nvl).reduce(BigDecimal.ZERO, BigDecimal::add);
  }

  private static BigDecimal ratio(BigDecimal value, BigDecimal divisor) {
    if (divisor == null || divisor.compareTo(BigDecimal.ZERO) == 0) {
      return BigDecimal.ZERO;
    }
    return nvl(value).divide(divisor, MathContext.DECIMAL64).setScale(2, RoundingMode.HALF_UP);
  }

  private static BigDecimal nvl(BigDecimal value) {
    return value == null ? BigDecimal.ZERO : value;
  }

  private static String blank(String value, String fallback) {
    return value == null || value.isBlank() ? fallback : value;
  }
}
