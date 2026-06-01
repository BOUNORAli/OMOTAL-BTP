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
@Table(name = "etp_prestations")
public class EtpPrestationEntity extends BaseEntity {
  @Column(nullable = false)
  private LocalDate date;
  @Column(nullable = false)
  private UUID chantierId;
  @Column(nullable = false)
  private UUID supplierId;
  @Column(nullable = false)
  private String designation;
  @Column(nullable = false)
  private BigDecimal quantity;
  @Column(nullable = false)
  private BigDecimal unitPrice;
  @Column(nullable = false)
  private BigDecimal amountHt;
  @Column(nullable = false)
  private BigDecimal vatRate = BigDecimal.ZERO;
  @Column(nullable = false)
  private BigDecimal amountTtc;
  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private OperationStatus status = OperationStatus.BROUILLON;
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
  public BigDecimal getQuantity() { return quantity; }
  public void setQuantity(BigDecimal quantity) { this.quantity = quantity; }
  public BigDecimal getUnitPrice() { return unitPrice; }
  public void setUnitPrice(BigDecimal unitPrice) { this.unitPrice = unitPrice; }
  public BigDecimal getAmountHt() { return amountHt; }
  public void setAmountHt(BigDecimal amountHt) { this.amountHt = amountHt; }
  public BigDecimal getVatRate() { return vatRate; }
  public void setVatRate(BigDecimal vatRate) { this.vatRate = vatRate; }
  public BigDecimal getAmountTtc() { return amountTtc; }
  public void setAmountTtc(BigDecimal amountTtc) { this.amountTtc = amountTtc; }
  public OperationStatus getStatus() { return status; }
  public void setStatus(OperationStatus status) { this.status = status; }
  public UUID getEnteredByUserId() { return enteredByUserId; }
  public void setEnteredByUserId(UUID enteredByUserId) { this.enteredByUserId = enteredByUserId; }
}
