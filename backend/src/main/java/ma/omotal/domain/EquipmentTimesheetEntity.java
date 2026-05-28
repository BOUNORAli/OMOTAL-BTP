package ma.omotal.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;
import ma.omotal.domain.enums.BillingMode;
import ma.omotal.domain.enums.OperationStatus;

@Entity
@Table(name = "equipment_timesheets")
public class EquipmentTimesheetEntity extends BaseEntity {
  @Column(nullable = false)
  private LocalDate date;

  @Column(nullable = false)
  private UUID chantierId;

  @Column(nullable = false)
  private UUID equipmentId;

  @Column(nullable = false)
  private String driver;

  private BigDecimal hoursWorked;
  private BigDecimal daysBilled;

  @Column(nullable = false)
  private String activityType;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private BillingMode appliedBillingMode;

  private BigDecimal appliedHourlyRate;
  private BigDecimal appliedDailyRate;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private OperationStatus status = OperationStatus.BROUILLON;

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

  public String getDriver() {
    return driver;
  }

  public void setDriver(String driver) {
    this.driver = driver;
  }

  public BigDecimal getHoursWorked() {
    return hoursWorked;
  }

  public void setHoursWorked(BigDecimal hoursWorked) {
    this.hoursWorked = hoursWorked;
  }

  public BigDecimal getDaysBilled() {
    return daysBilled;
  }

  public void setDaysBilled(BigDecimal daysBilled) {
    this.daysBilled = daysBilled;
  }

  public String getActivityType() {
    return activityType;
  }

  public void setActivityType(String activityType) {
    this.activityType = activityType;
  }

  public BillingMode getAppliedBillingMode() {
    return appliedBillingMode;
  }

  public void setAppliedBillingMode(BillingMode appliedBillingMode) {
    this.appliedBillingMode = appliedBillingMode;
  }

  public BigDecimal getAppliedHourlyRate() {
    return appliedHourlyRate;
  }

  public void setAppliedHourlyRate(BigDecimal appliedHourlyRate) {
    this.appliedHourlyRate = appliedHourlyRate;
  }

  public BigDecimal getAppliedDailyRate() {
    return appliedDailyRate;
  }

  public void setAppliedDailyRate(BigDecimal appliedDailyRate) {
    this.appliedDailyRate = appliedDailyRate;
  }

  public OperationStatus getStatus() {
    return status;
  }

  public void setStatus(OperationStatus status) {
    this.status = status;
  }

  public UUID getValidatedByUserId() {
    return validatedByUserId;
  }

  public void setValidatedByUserId(UUID validatedByUserId) {
    this.validatedByUserId = validatedByUserId;
  }
}
