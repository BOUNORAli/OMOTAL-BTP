package ma.omotal.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;
import ma.omotal.domain.enums.OperationStatus;

@Entity
@Table(name = "production_records")
public class ProductionRecordEntity extends BaseEntity {
  @Column(nullable = false)
  private LocalDate date;
  @Column(nullable = false)
  private UUID chantierId;
  @Column(nullable = false)
  private String voie;
  private String tranche;
  private String troncon;
  @Column(nullable = false)
  private String workType;
  private UUID equipmentId;
  private String driver;
  private BigDecimal lengthValue;
  private BigDecimal widthValue;
  private BigDecimal depthValue;
  @Column(nullable = false)
  private BigDecimal quantity;
  @Column(nullable = false)
  private String unit;
  private BigDecimal hours;
  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private OperationStatus status = OperationStatus.BROUILLON;
  @Column(nullable = false)
  private UUID enteredByUserId;
  private UUID validatedByUserId;

  public LocalDate getDate() { return date; }
  public void setDate(LocalDate date) { this.date = date; }
  public UUID getChantierId() { return chantierId; }
  public void setChantierId(UUID chantierId) { this.chantierId = chantierId; }
  public String getVoie() { return voie; }
  public void setVoie(String voie) { this.voie = voie; }
  public String getTranche() { return tranche; }
  public void setTranche(String tranche) { this.tranche = tranche; }
  public String getTroncon() { return troncon; }
  public void setTroncon(String troncon) { this.troncon = troncon; }
  public String getWorkType() { return workType; }
  public void setWorkType(String workType) { this.workType = workType; }
  public UUID getEquipmentId() { return equipmentId; }
  public void setEquipmentId(UUID equipmentId) { this.equipmentId = equipmentId; }
  public String getDriver() { return driver; }
  public void setDriver(String driver) { this.driver = driver; }
  public BigDecimal getLengthValue() { return lengthValue; }
  public void setLengthValue(BigDecimal lengthValue) { this.lengthValue = lengthValue; }
  public BigDecimal getWidthValue() { return widthValue; }
  public void setWidthValue(BigDecimal widthValue) { this.widthValue = widthValue; }
  public BigDecimal getDepthValue() { return depthValue; }
  public void setDepthValue(BigDecimal depthValue) { this.depthValue = depthValue; }
  public BigDecimal getQuantity() { return quantity; }
  public void setQuantity(BigDecimal quantity) { this.quantity = quantity; }
  public String getUnit() { return unit; }
  public void setUnit(String unit) { this.unit = unit; }
  public BigDecimal getHours() { return hours; }
  public void setHours(BigDecimal hours) { this.hours = hours; }
  public OperationStatus getStatus() { return status; }
  public void setStatus(OperationStatus status) { this.status = status; }
  public UUID getEnteredByUserId() { return enteredByUserId; }
  public void setEnteredByUserId(UUID enteredByUserId) { this.enteredByUserId = enteredByUserId; }
  public UUID getValidatedByUserId() { return validatedByUserId; }
  public void setValidatedByUserId(UUID validatedByUserId) { this.validatedByUserId = validatedByUserId; }
}
