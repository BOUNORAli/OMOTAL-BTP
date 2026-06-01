package ma.omotal.api;

import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import ma.omotal.api.dto.CoreDtos;
import ma.omotal.domain.MaintenanceRecordEntity;
import ma.omotal.domain.enums.OperationStatus;
import ma.omotal.domain.enums.Role;
import ma.omotal.repository.MaintenanceRecordRepository;
import ma.omotal.security.AccessPolicy;
import ma.omotal.security.CurrentUserService;
import ma.omotal.service.AuditService;
import ma.omotal.service.CalculationService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/entretien")
public class EntretienController {
  private final MaintenanceRecordRepository records;
  private final CurrentUserService currentUser;
  private final AccessPolicy accessPolicy;
  private final AuditService audit;

  public EntretienController(MaintenanceRecordRepository records, CurrentUserService currentUser, AccessPolicy accessPolicy, AuditService audit) {
    this.records = records;
    this.currentUser = currentUser;
    this.accessPolicy = accessPolicy;
    this.audit = audit;
  }

  @GetMapping
  public List<CoreDtos.MaintenanceRecordDto> list(@RequestParam UUID chantierId) {
    var user = currentUser.currentUser();
    accessPolicy.requireRole(user, Role.SUPER_ADMIN, Role.DIRECTEUR, Role.COMPTABLE, Role.MATERIEL, Role.RESPONSABLE_CHANTIER);
    accessPolicy.requireChantier(user, chantierId);
    return records.findByChantierId(chantierId).stream().map(Mapper::maintenance).toList();
  }

  @PostMapping
  public CoreDtos.MaintenanceRecordDto create(@Valid @RequestBody CoreDtos.CreateMaintenanceRecordRequest request) {
    var user = currentUser.currentUser();
    accessPolicy.requireRole(user, Role.SUPER_ADMIN, Role.MATERIEL, Role.RESPONSABLE_CHANTIER);
    accessPolicy.requireChantier(user, request.chantierId());
    var item = new MaintenanceRecordEntity();
    item.setDate(request.date());
    item.setChantierId(request.chantierId());
    item.setEquipmentId(request.equipmentId());
    item.setSupplierId(request.supplierId());
    item.setInterventionType(request.interventionType());
    item.setDesignation(request.designation());
    item.setQuantity(request.quantity());
    item.setUnitPrice(request.unitPrice());
    item.setTotalAmount(CalculationService.lineTotal(request.quantity(), request.unitPrice()));
    item.setImmobilized(request.immobilized());
    item.setDowntimeDays(request.downtimeDays());
    item.setStatus(request.submit() ? OperationStatus.SOUMIS : OperationStatus.BROUILLON);
    item.setEnteredByUserId(user.getId());
    var saved = records.save(item);
    audit.record(user.getId(), "entretien", "create", "MaintenanceRecord", saved.getId(), saved.getDesignation());
    return Mapper.maintenance(saved);
  }
}
