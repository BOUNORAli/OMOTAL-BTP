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
@Table(name = "gasoil_entries")
public class GasoilEntryEntity extends BaseEntity {
  @Column(nullable = false)
  private LocalDate date;

  @Column(nullable = false)
  private UUID chantierId;

  @Column(nullable = false)
  private UUID supplierId;

  @Column(nullable = false)
  private BigDecimal liters;

  @Column(nullable = false)
  private BigDecimal unitPrice;

  private String receiptNumber;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private OperationStatus status = OperationStatus.BROUILLON;

  @Column(nullable = false)
  private boolean hasDocument = false;

  @Column(nullable = false)
  private UUID enteredByUserId;

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

  public UUID getSupplierId() {
    return supplierId;
  }

  public void setSupplierId(UUID supplierId) {
    this.supplierId = supplierId;
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

  public String getReceiptNumber() {
    return receiptNumber;
  }

  public void setReceiptNumber(String receiptNumber) {
    this.receiptNumber = receiptNumber;
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
}
