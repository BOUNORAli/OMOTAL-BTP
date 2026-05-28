package ma.omotal.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.util.UUID;
import ma.omotal.domain.enums.BillingMode;
import ma.omotal.domain.enums.EquipmentStatus;

@Entity
@Table(name = "equipment")
public class EquipmentEntity extends BaseEntity {
  @Column(nullable = false)
  private String designation;

  @Column(nullable = false)
  private String type;

  @Column(nullable = false)
  private String owner;

  @Column(nullable = false)
  private UUID chantierId;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private BillingMode billingMode;

  private BigDecimal hourlyRate;
  private BigDecimal dailyRate;
  private String usualDriver;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private EquipmentStatus status = EquipmentStatus.MOBILISE;

  public String getDesignation() {
    return designation;
  }

  public void setDesignation(String designation) {
    this.designation = designation;
  }

  public String getType() {
    return type;
  }

  public void setType(String type) {
    this.type = type;
  }

  public String getOwner() {
    return owner;
  }

  public void setOwner(String owner) {
    this.owner = owner;
  }

  public UUID getChantierId() {
    return chantierId;
  }

  public void setChantierId(UUID chantierId) {
    this.chantierId = chantierId;
  }

  public BillingMode getBillingMode() {
    return billingMode;
  }

  public void setBillingMode(BillingMode billingMode) {
    this.billingMode = billingMode;
  }

  public BigDecimal getHourlyRate() {
    return hourlyRate;
  }

  public void setHourlyRate(BigDecimal hourlyRate) {
    this.hourlyRate = hourlyRate;
  }

  public BigDecimal getDailyRate() {
    return dailyRate;
  }

  public void setDailyRate(BigDecimal dailyRate) {
    this.dailyRate = dailyRate;
  }

  public String getUsualDriver() {
    return usualDriver;
  }

  public void setUsualDriver(String usualDriver) {
    this.usualDriver = usualDriver;
  }

  public EquipmentStatus getStatus() {
    return status;
  }

  public void setStatus(EquipmentStatus status) {
    this.status = status;
  }
}
