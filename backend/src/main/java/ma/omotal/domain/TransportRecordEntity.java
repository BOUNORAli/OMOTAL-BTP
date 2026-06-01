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
@Table(name = "transport_records")
public class TransportRecordEntity extends BaseEntity {
  @Column(nullable = false)
  private LocalDate date;
  @Column(nullable = false)
  private UUID chantierId;
  @Column(nullable = false)
  private UUID supplierId;
  @Column(nullable = false)
  private String designation;
  private String departure;
  private String arrival;
  @Column(nullable = false)
  private BigDecimal trips;
  @Column(nullable = false)
  private BigDecimal unitPrice;
  @Column(nullable = false)
  private BigDecimal totalAmount;
  private String receiptNumber;
  private String allocation;
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
  public String getDeparture() { return departure; }
  public void setDeparture(String departure) { this.departure = departure; }
  public String getArrival() { return arrival; }
  public void setArrival(String arrival) { this.arrival = arrival; }
  public BigDecimal getTrips() { return trips; }
  public void setTrips(BigDecimal trips) { this.trips = trips; }
  public BigDecimal getUnitPrice() { return unitPrice; }
  public void setUnitPrice(BigDecimal unitPrice) { this.unitPrice = unitPrice; }
  public BigDecimal getTotalAmount() { return totalAmount; }
  public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }
  public String getReceiptNumber() { return receiptNumber; }
  public void setReceiptNumber(String receiptNumber) { this.receiptNumber = receiptNumber; }
  public String getAllocation() { return allocation; }
  public void setAllocation(String allocation) { this.allocation = allocation; }
  public OperationStatus getStatus() { return status; }
  public void setStatus(OperationStatus status) { this.status = status; }
  public boolean isHasDocument() { return hasDocument; }
  public void setHasDocument(boolean hasDocument) { this.hasDocument = hasDocument; }
  public UUID getEnteredByUserId() { return enteredByUserId; }
  public void setEnteredByUserId(UUID enteredByUserId) { this.enteredByUserId = enteredByUserId; }
}
