package ma.omotal.api;

import jakarta.validation.Valid;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import ma.omotal.api.dto.CoreDtos;
import ma.omotal.domain.enums.OperationStatus;
import ma.omotal.domain.enums.Role;
import ma.omotal.repository.CaisseTransactionRepository;
import ma.omotal.repository.EquipmentTimesheetRepository;
import ma.omotal.repository.GasoilExitRepository;
import ma.omotal.security.AccessPolicy;
import ma.omotal.security.CurrentUserService;
import ma.omotal.service.ValidationWorkflowService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/validations")
public class ValidationController {
  private final GasoilExitRepository gasoilExits;
  private final EquipmentTimesheetRepository equipmentTimesheets;
  private final CaisseTransactionRepository transactions;
  private final CurrentUserService currentUser;
  private final AccessPolicy accessPolicy;
  private final ValidationWorkflowService workflow;

  public ValidationController(
      GasoilExitRepository gasoilExits,
      EquipmentTimesheetRepository equipmentTimesheets,
      CaisseTransactionRepository transactions,
      CurrentUserService currentUser,
      AccessPolicy accessPolicy,
      ValidationWorkflowService workflow
  ) {
    this.gasoilExits = gasoilExits;
    this.equipmentTimesheets = equipmentTimesheets;
    this.transactions = transactions;
    this.currentUser = currentUser;
    this.accessPolicy = accessPolicy;
    this.workflow = workflow;
  }

  @GetMapping
  public List<CoreDtos.ValidationItemDto> pending() {
    var user = currentUser.currentUser();
    accessPolicy.requireRole(user, Role.SUPER_ADMIN, Role.DIRECTEUR, Role.RESPONSABLE_CHANTIER);
    var items = new ArrayList<CoreDtos.ValidationItemDto>();

    gasoilExits.findByStatus(OperationStatus.SOUMIS).stream()
        .filter(item -> accessPolicy.canAccessChantier(user, item.getChantierId()))
        .map(item -> new CoreDtos.ValidationItemDto(
            item.getId(), "GASOIL_EXIT", item.getChantierId(), item.getDate(), item.getResponsible(),
            item.getLiters() + " L", item.getStatus(), item.isHasDocument()))
        .forEach(items::add);

    equipmentTimesheets.findByStatus(OperationStatus.SOUMIS).stream()
        .filter(item -> accessPolicy.canAccessChantier(user, item.getChantierId()))
        .map(item -> new CoreDtos.ValidationItemDto(
            item.getId(), "EQUIPMENT_TIMESHEET", item.getChantierId(), item.getDate(), item.getDriver(),
            item.getHoursWorked() != null ? item.getHoursWorked() + " h" : item.getDaysBilled() + " j",
            item.getStatus(), false))
        .forEach(items::add);

    transactions.findByStatus(OperationStatus.SOUMIS).stream()
        .filter(item -> accessPolicy.canAccessChantier(user, item.getChantierId()))
        .map(item -> new CoreDtos.ValidationItemDto(
            item.getId(), "CAISSE_TRANSACTION", item.getChantierId(), item.getDate(), item.getDescription(),
            item.getAmount() + " DH", item.getStatus(), item.isHasDocument()))
        .forEach(items::add);

    return items;
  }

  @PostMapping("/{type}/{id}/validate")
  public void validate(@PathVariable String type, @PathVariable UUID id) {
    changeStatus(type, id, OperationStatus.VALIDE, null);
  }

  @PostMapping("/{type}/{id}/reject")
  public void reject(@PathVariable String type, @PathVariable UUID id, @Valid @RequestBody CoreDtos.RejectRequest request) {
    changeStatus(type, id, OperationStatus.REJETE, request.reason());
  }

  private void changeStatus(String type, UUID id, OperationStatus toStatus, String reason) {
    var user = currentUser.currentUser();
    accessPolicy.requireRole(user, Role.SUPER_ADMIN, Role.DIRECTEUR, Role.RESPONSABLE_CHANTIER);

    switch (type) {
      case "GASOIL_EXIT" -> {
        var item = gasoilExits.findById(id).orElseThrow();
        accessPolicy.requireChantier(user, item.getChantierId());
        var from = item.getStatus();
        workflow.record(type, id, user.getId(), from, toStatus, reason);
        item.setStatus(toStatus);
        item.setValidatedByUserId(user.getId());
        gasoilExits.save(item);
      }
      case "EQUIPMENT_TIMESHEET" -> {
        var item = equipmentTimesheets.findById(id).orElseThrow();
        accessPolicy.requireChantier(user, item.getChantierId());
        var from = item.getStatus();
        workflow.record(type, id, user.getId(), from, toStatus, reason);
        item.setStatus(toStatus);
        item.setValidatedByUserId(user.getId());
        equipmentTimesheets.save(item);
      }
      case "CAISSE_TRANSACTION" -> {
        var item = transactions.findById(id).orElseThrow();
        accessPolicy.requireChantier(user, item.getChantierId());
        var from = item.getStatus();
        workflow.record(type, id, user.getId(), from, toStatus, reason);
        item.setStatus(toStatus);
        item.setValidatedByUserId(user.getId());
        transactions.save(item);
      }
      default -> throw new IllegalArgumentException("Type de validation inconnu.");
    }
  }
}
