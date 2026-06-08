package ma.omotal.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "chantier_settings")
public class ChantierSettingsEntity extends BaseEntity {
  @Column(nullable = false)
  private UUID chantierId;
  @Column(nullable = false)
  private BigDecimal standardHoursPerDay = new BigDecimal("9");
  @Column(nullable = false)
  private BigDecimal overheadRate = new BigDecimal("0.05");
  @Column(nullable = false)
  private BigDecimal defaultVatRate = new BigDecimal("0.20");
  @Column(nullable = false)
  private String gasoilPriceStrategy = "LAST_VALIDATED";
  @Column(nullable = false)
  private String currency = "DH";

  public UUID getChantierId() { return chantierId; }
  public void setChantierId(UUID chantierId) { this.chantierId = chantierId; }
  public BigDecimal getStandardHoursPerDay() { return standardHoursPerDay; }
  public void setStandardHoursPerDay(BigDecimal standardHoursPerDay) { this.standardHoursPerDay = standardHoursPerDay; }
  public BigDecimal getOverheadRate() { return overheadRate; }
  public void setOverheadRate(BigDecimal overheadRate) { this.overheadRate = overheadRate; }
  public BigDecimal getDefaultVatRate() { return defaultVatRate; }
  public void setDefaultVatRate(BigDecimal defaultVatRate) { this.defaultVatRate = defaultVatRate; }
  public String getGasoilPriceStrategy() { return gasoilPriceStrategy; }
  public void setGasoilPriceStrategy(String gasoilPriceStrategy) { this.gasoilPriceStrategy = gasoilPriceStrategy; }
  public String getCurrency() { return currency; }
  public void setCurrency(String currency) { this.currency = currency; }
}
