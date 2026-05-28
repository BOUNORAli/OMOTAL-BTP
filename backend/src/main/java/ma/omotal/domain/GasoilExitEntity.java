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
@Table(name = "gasoil_exits")
public class GasoilExitEntity extends BaseEntity {
  @Column(nullable = false)
  private LocalDate date;

  @Column(nullable = false)
  private UUID chantierId;

  private UUID equipmentId;

  @Column(nullable = false)
  private String responsible;

  @Column(nullable = false)
  private String allocation;

  @Column(nullable = false)
  private BigDecimal liters;

  @Column(nullable = false)
  private BigDecimal unitPrice;

  private String exitNumber;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private OperationStatus status = OperationStatus.BROUILLON;

  @Column(nullable = false)
  private boolean hasDocument = false;

  @Column(nullable = false)
  private UUID enteredByUserId;

  private UUID validatedByUserId;

  public LocalDate getDate() {
    return date;
  }

  public void setDate(LocalDate date) {
    this.date = date;
  }

  public UUID getChantierId() {
    return chantierId;
  }

  public void setChantierId(UUID chantierId) {
    this.chantierId = chantierId;
  }

  public UUID getEquipmentId() {
    return equipmentId;
  }

  public void setEquipmentId(UUID equipmentId) {
    this.equipmentId = equipmentId;
  }

  public String getResponsible() {
    return responsible;
  }

  public void setResponsible(String responsible) {
    this.responsible = responsible;
  }

  public String getAllocation() {
    return allocation;
  }

  public void setAllocation(String allocation) {
    this.allocation = allocation;
  }

  public BigDecimal getLiters() {
    return liters;
  }

  public void setLiters(BigDecimal liters) {
    this.liters = liters;
  }

  public BigDecimal getUnitPrice() {
    return unitPrice;
  }

  public void setUnitPrice(BigDecimal unitPrice) {
    this.unitPrice = unitPrice;
  }

  public String getExitNumber() {
    return exitNumber;
  }

  public void setExitNumber(String exitNumber) {
    this.exitNumber = exitNumber;
  }

  public OperationStatus getStatus() {
    return status;
  }

  public void setStatus(OperationStatus status) {
    this.status = status;
  }

  public boolean isHasDocument() {
    return hasDocument;
  }

  public void setHasDocument(boolean hasDocument) {
    this.hasDocument = hasDocument;
  }

  public UUID getEnteredByUserId() {
    return enteredByUserId;
  }

  public void setEnteredByUserId(UUID enteredByUserId) {
    this.enteredByUserId = enteredByUserId;
  }

  public UUID getValidatedByUserId() {
    return validatedByUserId;
  }

  public void setValidatedByUserId(UUID validatedByUserId) {
    this.validatedByUserId = validatedByUserId;
  }
}
