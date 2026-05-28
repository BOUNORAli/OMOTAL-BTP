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
import ma.omotal.domain.enums.TransactionCategory;
import ma.omotal.domain.enums.TransactionType;

@Entity
@Table(name = "caisse_transactions")
public class CaisseTransactionEntity extends BaseEntity {
  @Column(nullable = false)
  private LocalDate date;

  @Column(nullable = false)
  private UUID chantierId;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private TransactionType type;

  @Column(nullable = false)
  private BigDecimal amount;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private PaymentMode paymentMode;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private TransactionCategory category;

  @Column(nullable = false)
  private String description;

  private String personOrSupplier;

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

  public TransactionType getType() {
    return type;
  }

  public void setType(TransactionType type) {
    this.type = type;
  }

  public BigDecimal getAmount() {
    return amount;
  }

  public void setAmount(BigDecimal amount) {
    this.amount = amount;
  }

  public PaymentMode getPaymentMode() {
    return paymentMode;
  }

  public void setPaymentMode(PaymentMode paymentMode) {
    this.paymentMode = paymentMode;
  }

  public TransactionCategory getCategory() {
    return category;
  }

  public void setCategory(TransactionCategory category) {
    this.category = category;
  }

  public String getDescription() {
    return description;
  }

  public void setDescription(String description) {
    this.description = description;
  }

  public String getPersonOrSupplier() {
    return personOrSupplier;
  }

  public void setPersonOrSupplier(String personOrSupplier) {
    this.personOrSupplier = personOrSupplier;
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
