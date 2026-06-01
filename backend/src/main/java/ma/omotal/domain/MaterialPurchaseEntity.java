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
@Table(name = "material_purchases")
public class MaterialPurchaseEntity extends BaseEntity {
  @Column(nullable = false)
  private LocalDate date;
  @Column(nullable = false)
  private UUID chantierId;
  @Column(nullable = false)
  private UUID supplierId;
  @Column(nullable = false)
  private String designation;
  @Column(nullable = false)
  private String unit;
  @Column(nullable = false)
  private BigDecimal quantity;
  @Column(nullable = false)
  private BigDecimal unitPriceHt;
  @Column(nullable = false)
  private BigDecimal transportHt = BigDecimal.ZERO;
  @Column(nullable = false)
  private BigDecimal totalHt;
  @Column(nullable = false)
  private BigDecimal vatRate = BigDecimal.ZERO;
  @Column(nullable = false)
  private BigDecimal totalTtc;
  private String receiptNumber;
  private String supplierDocumentNumber;
  private LocalDate dueDate;
  @Column(nullable = false)
  private BigDecimal paidAmount = BigDecimal.ZERO;
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
  public UUID getSupplierId() { return supplierId; }
  public void setSupplierId(UUID supplierId) { this.supplierId = supplierId; }
  public String getDesignation() { return designation; }
  public void setDesignation(String designation) { this.designation = designation; }
  public String getUnit() { return unit; }
  public void setUnit(String unit) { this.unit = unit; }
  public BigDecimal getQuantity() { return quantity; }
  public void setQuantity(BigDecimal quantity) { this.quantity = quantity; }
  public BigDecimal getUnitPriceHt() { return unitPriceHt; }
  public void setUnitPriceHt(BigDecimal unitPriceHt) { this.unitPriceHt = unitPriceHt; }
  public BigDecimal getTransportHt() { return transportHt; }
  public void setTransportHt(BigDecimal transportHt) { this.transportHt = transportHt; }
  public BigDecimal getTotalHt() { return totalHt; }
  public void setTotalHt(BigDecimal totalHt) { this.totalHt = totalHt; }
  public BigDecimal getVatRate() { return vatRate; }
  public void setVatRate(BigDecimal vatRate) { this.vatRate = vatRate; }
  public BigDecimal getTotalTtc() { return totalTtc; }
  public void setTotalTtc(BigDecimal totalTtc) { this.totalTtc = totalTtc; }
  public String getReceiptNumber() { return receiptNumber; }
  public void setReceiptNumber(String receiptNumber) { this.receiptNumber = receiptNumber; }
  public String getSupplierDocumentNumber() { return supplierDocumentNumber; }
  public void setSupplierDocumentNumber(String supplierDocumentNumber) { this.supplierDocumentNumber = supplierDocumentNumber; }
  public LocalDate getDueDate() { return dueDate; }
  public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }
  public BigDecimal getPaidAmount() { return paidAmount; }
  public void setPaidAmount(BigDecimal paidAmount) { this.paidAmount = paidAmount; }
  public OperationStatus getStatus() { return status; }
  public void setStatus(OperationStatus status) { this.status = status; }
  public boolean isHasDocument() { return hasDocument; }
  public void setHasDocument(boolean hasDocument) { this.hasDocument = hasDocument; }
  public UUID getEnteredByUserId() { return enteredByUserId; }
  public void setEnteredByUserId(UUID enteredByUserId) { this.enteredByUserId = enteredByUserId; }
}
