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
import ma.omotal.domain.enums.ProductionFamily;

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
  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private ProductionFamily productionFamily = ProductionFamily.DECAPAGE;
  private UUID equipmentId;
  private String driver;
  private BigDecimal lengthValue;
  private BigDecimal widthValue;
  private BigDecimal depthValue;
  private String diameter;
  private String pipeType;
  private String soilType;
  private String poseType;
  @Column(nullable = false)
  private BigDecimal quantity;
  @Column(nullable = false)
  private String unit;
  private BigDecimal hours;
  private BigDecimal allocatedGasoilLiters;
  private BigDecimal allocatedGasoilAmount;
  private BigDecimal allocatedEquipmentCost;
  private BigDecimal allocatedWorkerCost;
  private BigDecimal allocatedDriverExpenses;
  private BigDecimal allocatedOtherCost;
  private BigDecimal overheadAmount;
  private BigDecimal totalAllocatedCost;
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
  public ProductionFamily getProductionFamily() { return productionFamily; }
  public void setProductionFamily(ProductionFamily productionFamily) { this.productionFamily = productionFamily; }
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
  public String getDiameter() { return diameter; }
  public void setDiameter(String diameter) { this.diameter = diameter; }
  public String getPipeType() { return pipeType; }
  public void setPipeType(String pipeType) { this.pipeType = pipeType; }
  public String getSoilType() { return soilType; }
  public void setSoilType(String soilType) { this.soilType = soilType; }
  public String getPoseType() { return poseType; }
  public void setPoseType(String poseType) { this.poseType = poseType; }
  public BigDecimal getQuantity() { return quantity; }
  public void setQuantity(BigDecimal quantity) { this.quantity = quantity; }
  public String getUnit() { return unit; }
  public void setUnit(String unit) { this.unit = unit; }
  public BigDecimal getHours() { return hours; }
  public void setHours(BigDecimal hours) { this.hours = hours; }
  public BigDecimal getAllocatedGasoilLiters() { return allocatedGasoilLiters; }
  public void setAllocatedGasoilLiters(BigDecimal allocatedGasoilLiters) { this.allocatedGasoilLiters = allocatedGasoilLiters; }
  public BigDecimal getAllocatedGasoilAmount() { return allocatedGasoilAmount; }
  public void setAllocatedGasoilAmount(BigDecimal allocatedGasoilAmount) { this.allocatedGasoilAmount = allocatedGasoilAmount; }
  public BigDecimal getAllocatedEquipmentCost() { return allocatedEquipmentCost; }
  public void setAllocatedEquipmentCost(BigDecimal allocatedEquipmentCost) { this.allocatedEquipmentCost = allocatedEquipmentCost; }
  public BigDecimal getAllocatedWorkerCost() { return allocatedWorkerCost; }
  public void setAllocatedWorkerCost(BigDecimal allocatedWorkerCost) { this.allocatedWorkerCost = allocatedWorkerCost; }
  public BigDecimal getAllocatedDriverExpenses() { return allocatedDriverExpenses; }
  public void setAllocatedDriverExpenses(BigDecimal allocatedDriverExpenses) { this.allocatedDriverExpenses = allocatedDriverExpenses; }
  public BigDecimal getAllocatedOtherCost() { return allocatedOtherCost; }
  public void setAllocatedOtherCost(BigDecimal allocatedOtherCost) { this.allocatedOtherCost = allocatedOtherCost; }
  public BigDecimal getOverheadAmount() { return overheadAmount; }
  public void setOverheadAmount(BigDecimal overheadAmount) { this.overheadAmount = overheadAmount; }
  public BigDecimal getTotalAllocatedCost() { return totalAllocatedCost; }
  public void setTotalAllocatedCost(BigDecimal totalAllocatedCost) { this.totalAllocatedCost = totalAllocatedCost; }
  public OperationStatus getStatus() { return status; }
  public void setStatus(OperationStatus status) { this.status = status; }
  public UUID getEnteredByUserId() { return enteredByUserId; }
  public void setEnteredByUserId(UUID enteredByUserId) { this.enteredByUserId = enteredByUserId; }
  public UUID getValidatedByUserId() { return validatedByUserId; }
  public void setValidatedByUserId(UUID validatedByUserId) { this.validatedByUserId = validatedByUserId; }
}
