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
import ma.omotal.domain.enums.PaymentMode;

@Entity
@Table(name = "supplier_payments")
public class SupplierPaymentEntity extends BaseEntity {
  @Column(nullable = false)
  private LocalDate date;
  @Column(nullable = false)
  private UUID chantierId;
  @Column(nullable = false)
  private UUID supplierId;
  @Column(nullable = false)
  private BigDecimal amount;
  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private PaymentMode paymentMode;
  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private OperationStatus status = OperationStatus.BROUILLON;
  private String note;
  @Column(nullable = false)
  private UUID enteredByUserId;

  public LocalDate getDate() { return date; }
  public void setDate(LocalDate date) { this.date = date; }
  public UUID getChantierId() { return chantierId; }
  public void setChantierId(UUID chantierId) { this.chantierId = chantierId; }
  public UUID getSupplierId() { return supplierId; }
  public void setSupplierId(UUID supplierId) { this.supplierId = supplierId; }
  public BigDecimal getAmount() { return amount; }
  public void setAmount(BigDecimal amount) { this.amount = amount; }
  public PaymentMode getPaymentMode() { return paymentMode; }
  public void setPaymentMode(PaymentMode paymentMode) { this.paymentMode = paymentMode; }
  public OperationStatus getStatus() { return status; }
  public void setStatus(OperationStatus status) { this.status = status; }
  public String getNote() { return note; }
  public void setNote(String note) { this.note = note; }
  public UUID getEnteredByUserId() { return enteredByUserId; }
  public void setEnteredByUserId(UUID enteredByUserId) { this.enteredByUserId = enteredByUserId; }
}
