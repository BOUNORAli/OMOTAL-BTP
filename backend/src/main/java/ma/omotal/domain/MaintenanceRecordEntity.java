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
@Table(name = "maintenance_records")
public class MaintenanceRecordEntity extends BaseEntity {
  @Column(nullable = false)
  private LocalDate date;
  @Column(nullable = false)
  private UUID chantierId;
  @Column(nullable = false)
  private UUID equipmentId;
  private UUID supplierId;
  @Column(nullable = false)
  private String interventionType;
  @Column(nullable = false)
  private String designation;
  @Column(nullable = false)
  private BigDecimal quantity;
  @Column(nullable = false)
  private BigDecimal unitPrice;
  @Column(nullable = false)
  private BigDecimal totalAmount;
  @Column(nullable = false)
  private boolean immobilized = false;
  private BigDecimal downtimeDays;
  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private OperationStatus status = OperationStatus.BROUILLON;
  @Column(nullable = false)
  private boolean hasDocument = false;
  @Column(nullable = false)
  private UUID enteredByUserId;

  public LocalDate getDate() { return date; }
  public void setDate(LocalDate date) { this.date = date; }
  public UUID getChantierId() { return chantierId; }
  public void setChantierId(UUID chantierId) { this.chantierId = chantierId; }
  public UUID getEquipmentId() { return equipmentId; }
  public void setEquipmentId(UUID equipmentId) { this.equipmentId = equipmentId; }
  public UUID getSupplierId() { return supplierId; }
  public void setSupplierId(UUID supplierId) { this.supplierId = supplierId; }
  public String getInterventionType() { return interventionType; }
  public void setInterventionType(String interventionType) { this.interventionType = interventionType; }
  public String getDesignation() { return designation; }
  public void setDesignation(String designation) { this.designation = designation; }
  public BigDecimal getQuantity() { return quantity; }
  public void setQuantity(BigDecimal quantity) { this.quantity = quantity; }
  public BigDecimal getUnitPrice() { return unitPrice; }
  public void setUnitPrice(BigDecimal unitPrice) { this.unitPrice = unitPrice; }
  public BigDecimal getTotalAmount() { return totalAmount; }
  public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }
  public boolean isImmobilized() { return immobilized; }
  public void setImmobilized(boolean immobilized) { this.immobilized = immobilized; }
  public BigDecimal getDowntimeDays() { return downtimeDays; }
  public void setDowntimeDays(BigDecimal downtimeDays) { this.downtimeDays = downtimeDays; }
  public OperationStatus getStatus() { return status; }
  public void setStatus(OperationStatus status) { this.status = status; }
  public boolean isHasDocument() { return hasDocument; }
  public void setHasDocument(boolean hasDocument) { this.hasDocument = hasDocument; }
  public UUID getEnteredByUserId() { return enteredByUserId; }
  public void setEnteredByUserId(UUID enteredByUserId) { this.enteredByUserId = enteredByUserId; }
}
