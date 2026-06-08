package ma.omotal.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import ma.omotal.domain.ProductionRecordEntity;
import ma.omotal.domain.enums.OperationStatus;
import ma.omotal.domain.enums.ProductionFamily;
import ma.omotal.repository.ProductionRecordRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ProductionAnalyticsServiceTest {
  @Mock
  private ProductionRecordRepository productions;

  @Test
  void analyticsUsesOnlyOfficialProductionRows() {
    var chantierId = UUID.randomUUID();
    var from = LocalDate.of(2026, 6, 1);
    var to = LocalDate.of(2026, 6, 30);
    when(productions.findByChantierIdAndDateBetween(chantierId, from, to)).thenReturn(List.of(
        production("VOIE1", "450", "9", "90", "9000", OperationStatus.VALIDE),
        production("VOIE2", "100", "2", "20", "1000", OperationStatus.SOUMIS)
    ));

    var result = new ProductionAnalyticsService(productions).analytics(chantierId, from, to, null);

    assertThat(result.totalQuantity()).isEqualByComparingTo("450");
    assertThat(result.totalHours()).isEqualByComparingTo("9");
    assertThat(result.totalGasoilLiters()).isEqualByComparingTo("90");
    assertThat(result.totalCost()).isEqualByComparingTo("9000");
    assertThat(result.rendementPerHour()).isEqualByComparingTo("50.00");
    assertThat(result.costPerUnit()).isEqualByComparingTo("20.00");
    assertThat(result.byVoie()).hasSize(1);
  }

  private ProductionRecordEntity production(
      String voie,
      String quantity,
      String hours,
      String gasoil,
      String cost,
      OperationStatus status
  ) {
    var item = new ProductionRecordEntity();
    item.setProductionFamily(ProductionFamily.DECAPAGE);
    item.setVoie(voie);
    item.setQuantity(new BigDecimal(quantity));
    item.setHours(new BigDecimal(hours));
    item.setAllocatedGasoilLiters(new BigDecimal(gasoil));
    item.setTotalAllocatedCost(new BigDecimal(cost));
    item.setStatus(status);
    return item;
  }
}
