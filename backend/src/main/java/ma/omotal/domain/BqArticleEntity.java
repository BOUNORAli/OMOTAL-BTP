package ma.omotal.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "bq_articles")
public class BqArticleEntity extends BaseEntity {
  @Column(nullable = false)
  private UUID chantierId;
  @Column(nullable = false)
  private String articleNumber;
  @Column(nullable = false)
  private String designation;
  @Column(nullable = false)
  private String unit;
  @Column(nullable = false)
  private BigDecimal marketQuantity;
  @Column(nullable = false)
  private BigDecimal marketUnitPriceHt;
  @Column(nullable = false)
  private BigDecimal plannedCostTotal = BigDecimal.ZERO;
  @Column(nullable = false)
  private boolean active = true;

  public UUID getChantierId() { return chantierId; }
  public void setChantierId(UUID chantierId) { this.chantierId = chantierId; }
  public String getArticleNumber() { return articleNumber; }
  public void setArticleNumber(String articleNumber) { this.articleNumber = articleNumber; }
  public String getDesignation() { return designation; }
  public void setDesignation(String designation) { this.designation = designation; }
  public String getUnit() { return unit; }
  public void setUnit(String unit) { this.unit = unit; }
  public BigDecimal getMarketQuantity() { return marketQuantity; }
  public void setMarketQuantity(BigDecimal marketQuantity) { this.marketQuantity = marketQuantity; }
  public BigDecimal getMarketUnitPriceHt() { return marketUnitPriceHt; }
  public void setMarketUnitPriceHt(BigDecimal marketUnitPriceHt) { this.marketUnitPriceHt = marketUnitPriceHt; }
  public BigDecimal getPlannedCostTotal() { return plannedCostTotal; }
  public void setPlannedCostTotal(BigDecimal plannedCostTotal) { this.plannedCostTotal = plannedCostTotal; }
  public boolean isActive() { return active; }
  public void setActive(boolean active) { this.active = active; }
}
