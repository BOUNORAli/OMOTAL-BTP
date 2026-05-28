package ma.omotal.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.util.UUID;
import ma.omotal.domain.enums.RemunerationType;

@Entity
@Table(name = "employees")
public class EmployeeEntity extends BaseEntity {
  @Column(nullable = false)
  private String firstName;

  @Column(nullable = false)
  private String lastName;

  @Column(nullable = false)
  private String position;

  @Column(nullable = false)
  private UUID chantierId;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private RemunerationType remunerationType;

  private BigDecimal monthlySalary;
  private BigDecimal dailySalary;
  private BigDecimal hourlySalary;

  @Column(nullable = false)
  private boolean active = true;

  public String getFirstName() {
    return firstName;
  }

  public void setFirstName(String firstName) {
    this.firstName = firstName;
  }

  public String getLastName() {
    return lastName;
  }

  public void setLastName(String lastName) {
    this.lastName = lastName;
  }

  public String getPosition() {
    return position;
  }

  public void setPosition(String position) {
    this.position = position;
  }

  public UUID getChantierId() {
    return chantierId;
  }

  public void setChantierId(UUID chantierId) {
    this.chantierId = chantierId;
  }

  public RemunerationType getRemunerationType() {
    return remunerationType;
  }

  public void setRemunerationType(RemunerationType remunerationType) {
    this.remunerationType = remunerationType;
  }

  public BigDecimal getMonthlySalary() {
    return monthlySalary;
  }

  public void setMonthlySalary(BigDecimal monthlySalary) {
    this.monthlySalary = monthlySalary;
  }

  public BigDecimal getDailySalary() {
    return dailySalary;
  }

  public void setDailySalary(BigDecimal dailySalary) {
    this.dailySalary = dailySalary;
  }

  public BigDecimal getHourlySalary() {
    return hourlySalary;
  }

  public void setHourlySalary(BigDecimal hourlySalary) {
    this.hourlySalary = hourlySalary;
  }

  public boolean isActive() {
    return active;
  }

  public void setActive(boolean active) {
    this.active = active;
  }
}
