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
@Table(name = "driver_expenses")
public class DriverExpenseEntity extends BaseEntity {
  @Column(nullable = false)
  private UUID chantierId;
  @Column(nullable = false)
  private LocalDate dateStart;
  @Column(nullable = false)
  private LocalDate dateEnd;
  @Column(nullable = false)
  private String driver;
  @Column(nullable = false)
  private String expenseType;
  @Column(nullable = false)
  private BigDecimal totalAmount;
  @Column(nullable = false)
  private BigDecimal driversCount = BigDecimal.ONE;
  @Column(nullable = false)
  private BigDecimal dailyDriverAmount;
  private String note;
  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private OperationStatus status = OperationStatus.BROUILLON;
  @Column(nullable = false)
  private UUID enteredByUserId;

  public UUID getChantierId() { return chantierId; }
  public void setChantierId(UUID chantierId) { this.chantierId = chantierId; }
  public LocalDate getDateStart() { return dateStart; }
  public void setDateStart(LocalDate dateStart) { this.dateStart = dateStart; }
  public LocalDate getDateEnd() { return dateEnd; }
  public void setDateEnd(LocalDate dateEnd) { this.dateEnd = dateEnd; }
  public String getDriver() { return driver; }
  public void setDriver(String driver) { this.driver = driver; }
  public String getExpenseType() { return expenseType; }
  public void setExpenseType(String expenseType) { this.expenseType = expenseType; }
  public BigDecimal getTotalAmount() { return totalAmount; }
  public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }
  public BigDecimal getDriversCount() { return driversCount; }
  public void setDriversCount(BigDecimal driversCount) { this.driversCount = driversCount; }
  public BigDecimal getDailyDriverAmount() { return dailyDriverAmount; }
  public void setDailyDriverAmount(BigDecimal dailyDriverAmount) { this.dailyDriverAmount = dailyDriverAmount; }
  public String getNote() { return note; }
  public void setNote(String note) { this.note = note; }
  public OperationStatus getStatus() { return status; }
  public void setStatus(OperationStatus status) { this.status = status; }
  public UUID getEnteredByUserId() { return enteredByUserId; }
  public void setEnteredByUserId(UUID enteredByUserId) { this.enteredByUserId = enteredByUserId; }
}
