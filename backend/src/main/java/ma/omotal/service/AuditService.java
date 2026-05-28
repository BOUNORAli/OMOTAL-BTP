package ma.omotal.service;

import java.util.UUID;
import ma.omotal.domain.AuditLogEntity;
import ma.omotal.repository.AuditLogRepository;
import org.springframework.stereotype.Service;

@Service
public class AuditService {
  private final AuditLogRepository auditLogs;

  public AuditService(AuditLogRepository auditLogs) {
    this.auditLogs = auditLogs;
  }

  public void record(UUID userId, String module, String operation, String targetType, UUID targetId, String newValue) {
    var log = new AuditLogEntity();
    log.setUserId(userId);
    log.setModule(module);
    log.setOperation(operation);
    log.setTargetType(targetType);
    log.setTargetId(targetId);
    log.setNewValue(newValue);
    auditLogs.save(log);
  }
}
