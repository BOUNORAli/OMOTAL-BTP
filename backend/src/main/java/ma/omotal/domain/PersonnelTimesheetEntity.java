package ma.omotal.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;
import ma.omotal.domain.enums.DayType;
import ma.omotal.domain.enums.OperationStatus;
import ma.omotal.domain.enums.RemunerationType;

@Entity
@Table(name = "personnel_timesheets")
public class PersonnelTimesheetEntity extends BaseEntity {
  @Column(nullable = false)
  private LocalDate date;

  @Column(nullable = false)
  private UUID chantierId;

  @Column(nullable = false)
  private UUID employeeId;

  @Column(nullable = false)
  private BigDecimal hoursWorked;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private DayType dayType;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private RemunerationType appliedRemunerationType;

  private BigDecimal appliedHourlyRate;
  private BigDecimal appliedDailyRate;
  private BigDecimal appliedMonthlySalary;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private OperationStatus status = OperationStatus.BROUILLON;

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

  public UUID getEmployeeId() {
    return employeeId;
  }

  public void setEmployeeId(UUID employeeId) {
    this.employeeId = employeeId;
  }

  public BigDecimal getHoursWorked() {
    return hoursWorked;
  }

  public void setHoursWorked(BigDecimal hoursWorked) {
    this.hoursWorked = hoursWorked;
  }

  public DayType getDayType() {
    return dayType;
  }

  public void setDayType(DayType dayType) {
    this.dayType = dayType;
  }

  public RemunerationType getAppliedRemunerationType() {
    return appliedRemunerationType;
  }

  public void setAppliedRemunerationType(RemunerationType appliedRemunerationType) {
    this.appliedRemunerationType = appliedRemunerationType;
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

  public BigDecimal getAppliedMonthlySalary() {
    return appliedMonthlySalary;
  }

  public void setAppliedMonthlySalary(BigDecimal appliedMonthlySalary) {
    this.appliedMonthlySalary = appliedMonthlySalary;
  }

  public OperationStatus getStatus() {
    return status;
  }

  public void setStatus(OperationStatus status) {
    this.status = status;
  }
}
