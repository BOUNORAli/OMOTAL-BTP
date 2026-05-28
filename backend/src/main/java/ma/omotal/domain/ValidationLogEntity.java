package ma.omotal.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;
import java.util.UUID;
import ma.omotal.domain.enums.OperationStatus;

@Entity
@Table(name = "validation_logs")
public class ValidationLogEntity extends BaseEntity {
  @Column(nullable = false)
  private String targetType;

  @Column(nullable = false)
  private UUID targetId;

  @Column(nullable = false)
  private UUID userId;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private OperationStatus fromStatus;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private OperationStatus toStatus;

  private String reason;

  @Column(nullable = false)
  private OffsetDateTime occurredAt = OffsetDateTime.now();

  public String getTargetType() {
    return targetType;
  }

  public void setTargetType(String targetType) {
    this.targetType = targetType;
  }

  public UUID getTargetId() {
    return targetId;
  }

  public void setTargetId(UUID targetId) {
    this.targetId = targetId;
  }

  public UUID getUserId() {
    return userId;
  }

  public void setUserId(UUID userId) {
    this.userId = userId;
  }

  public OperationStatus getFromStatus() {
    return fromStatus;
  }

  public void setFromStatus(OperationStatus fromStatus) {
    this.fromStatus = fromStatus;
  }

  public OperationStatus getToStatus() {
    return toStatus;
  }

  public void setToStatus(OperationStatus toStatus) {
    this.toStatus = toStatus;
  }

  public String getReason() {
    return reason;
  }

  public void setReason(String reason) {
    this.reason = reason;
  }
}
