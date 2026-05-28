package ma.omotal.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "audit_logs")
public class AuditLogEntity extends BaseEntity {
  @Column(nullable = false)
  private UUID userId;

  @Column(nullable = false)
  private String module;

  @Column(nullable = false)
  private String operation;

  @Column(nullable = false)
  private String targetType;

  @Column(nullable = false)
  private UUID targetId;

  @Column(columnDefinition = "text")
  private String oldValue;

  @Column(columnDefinition = "text")
  private String newValue;

  private String reason;

  @Column(nullable = false)
  private OffsetDateTime occurredAt = OffsetDateTime.now();

  public UUID getUserId() {
    return userId;
  }

  public void setUserId(UUID userId) {
    this.userId = userId;
  }

  public String getModule() {
    return module;
  }

  public void setModule(String module) {
    this.module = module;
  }

  public String getOperation() {
    return operation;
  }

  public void setOperation(String operation) {
    this.operation = operation;
  }

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

  public String getOldValue() {
    return oldValue;
  }

  public void setOldValue(String oldValue) {
    this.oldValue = oldValue;
  }

  public String getNewValue() {
    return newValue;
  }

  public void setNewValue(String newValue) {
    this.newValue = newValue;
  }

  public String getReason() {
    return reason;
  }

  public void setReason(String reason) {
    this.reason = reason;
  }

  public OffsetDateTime getOccurredAt() {
    return occurredAt;
  }
}
