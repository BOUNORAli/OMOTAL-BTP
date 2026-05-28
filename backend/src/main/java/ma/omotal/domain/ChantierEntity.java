package ma.omotal.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;
import ma.omotal.domain.enums.ChantierStatus;

@Entity
@Table(name = "chantiers")
public class ChantierEntity extends BaseEntity {
  @Column(nullable = false)
  private String name;

  @Column(nullable = false, unique = true)
  private String code;

  @Column(nullable = false)
  private String client;

  @Column(nullable = false)
  private String location;

  @Column(nullable = false)
  private LocalDate startedAt;

  private LocalDate expectedEndAt;

  private BigDecimal marketAmountHt;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private ChantierStatus status = ChantierStatus.EN_COURS;

  private UUID managerUserId;

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public String getCode() {
    return code;
  }

  public void setCode(String code) {
    this.code = code;
  }

  public String getClient() {
    return client;
  }

  public void setClient(String client) {
    this.client = client;
  }

  public String getLocation() {
    return location;
  }

  public void setLocation(String location) {
    this.location = location;
  }

  public LocalDate getStartedAt() {
    return startedAt;
  }

  public void setStartedAt(LocalDate startedAt) {
    this.startedAt = startedAt;
  }

  public LocalDate getExpectedEndAt() {
    return expectedEndAt;
  }

  public void setExpectedEndAt(LocalDate expectedEndAt) {
    this.expectedEndAt = expectedEndAt;
  }

  public BigDecimal getMarketAmountHt() {
    return marketAmountHt;
  }

  public void setMarketAmountHt(BigDecimal marketAmountHt) {
    this.marketAmountHt = marketAmountHt;
  }

  public ChantierStatus getStatus() {
    return status;
  }

  public void setStatus(ChantierStatus status) {
    this.status = status;
  }

  public UUID getManagerUserId() {
    return managerUserId;
  }

  public void setManagerUserId(UUID managerUserId) {
    this.managerUserId = managerUserId;
  }
}
