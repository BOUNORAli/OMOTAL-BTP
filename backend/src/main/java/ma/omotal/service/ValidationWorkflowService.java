package ma.omotal.service;

import java.util.UUID;
import ma.omotal.domain.ValidationLogEntity;
import ma.omotal.domain.enums.OperationStatus;
import ma.omotal.repository.ValidationLogRepository;
import org.springframework.stereotype.Service;

@Service
public class ValidationWorkflowService {
  private final ValidationLogRepository validationLogs;

  public ValidationWorkflowService(ValidationLogRepository validationLogs) {
    this.validationLogs = validationLogs;
  }

  public void validateTransition(OperationStatus from, OperationStatus to, String reason) {
    if (to == OperationStatus.REJETE && (reason == null || reason.isBlank())) {
      throw new IllegalArgumentException("Le motif est obligatoire en cas de rejet.");
    }
    if (from == OperationStatus.VERROUILLE) {
      throw new IllegalArgumentException("Une operation verrouillee ne peut pas etre modifiee.");
    }
  }

  public void record(String targetType, UUID targetId, UUID userId, OperationStatus from, OperationStatus to, String reason) {
    validateTransition(from, to, reason);
    var log = new ValidationLogEntity();
    log.setTargetType(targetType);
    log.setTargetId(targetId);
    log.setUserId(userId);
    log.setFromStatus(from);
    log.setToStatus(to);
    log.setReason(reason);
    validationLogs.save(log);
  }
}
