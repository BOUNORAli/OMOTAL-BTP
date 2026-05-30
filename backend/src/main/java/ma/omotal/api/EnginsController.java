package ma.omotal.api;

import jakarta.validation.Valid;
import java.math.BigDecimal;
import java.util.List;
import ma.omotal.api.dto.CoreDtos;
import ma.omotal.domain.EquipmentEntity;
import ma.omotal.domain.EquipmentTimesheetEntity;
import ma.omotal.domain.enums.OperationStatus;
import ma.omotal.domain.enums.Role;
import ma.omotal.repository.EquipmentRepository;
import ma.omotal.repository.EquipmentTimesheetRepository;
import ma.omotal.security.AccessPolicy;
import ma.omotal.security.CurrentUserService;
import ma.omotal.service.AuditService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/engins")
public class EnginsController {
  private final EquipmentRepository equipment;
  private final EquipmentTimesheetRepository timesheets;
  private final CurrentUserService currentUser;
  private final AccessPolicy accessPolicy;
  private final AuditService audit;

  public EnginsController(
      EquipmentRepository equipment,
      EquipmentTimesheetRepository timesheets,
      CurrentUserService currentUser,
      AccessPolicy accessPolicy,
      AuditService audit
  ) {
    this.equipment = equipment;
    this.timesheets = timesheets;
    this.currentUser = currentUser;
    this.accessPolicy = accessPolicy;
    this.audit = audit;
  }

  @GetMapping
  public EquipmentPayload list() {
    var user = currentUser.currentUser();
    var ids = accessPolicy.authorizedChantierIds(user);
    var equipmentData = ids.isEmpty() ? equipment.findAll() : equipment.findByChantierIdIn(ids);
    var timesheetData = ids.isEmpty() ? timesheets.findAll() : timesheets.findByChantierIdIn(ids);
    return new EquipmentPayload(
        equipmentData.stream().map(Mapper::equipment).toList(),
        timesheetData.stream().map(Mapper::equipmentTimesheet).toList()
    );
  }

  @PostMapping
  public CoreDtos.EquipmentDto create(@Valid @RequestBody CoreDtos.CreateEquipmentRequest request) {
    var user = currentUser.currentUser();
    accessPolicy.requireRole(user, Role.SUPER_ADMIN, Role.COMPTABLE, Role.RESPONSABLE_CHANTIER);
    accessPolicy.requireChantier(user, request.chantierId());

    var item = new EquipmentEntity();
    item.setDesignation(request.designation());
    item.setType(request.type());
    item.setOwner(request.owner());
    item.setChantierId(request.chantierId());
    item.setBillingMode(request.billingMode());
    item.setHourlyRate(request.hourlyRate());
    item.setDailyRate(request.dailyRate());
    item.setUsualDriver(request.usualDriver());
    var saved = equipment.save(item);
    audit.record(user.getId(), "engins", "create_equipment", "Equipment", saved.getId(), saved.getDesignation());
    return Mapper.equipment(saved);
  }

  @PostMapping("/timesheets")
  public CoreDtos.EquipmentTimesheetDto createTimesheet(@Valid @RequestBody CoreDtos.CreateEquipmentTimesheetRequest request) {
    var user = currentUser.currentUser();
    accessPolicy.requireRole(user, Role.SUPER_ADMIN, Role.RESPONSABLE_CHANTIER, Role.POINTEUR);
    accessPolicy.requireChantier(user, request.chantierId());

    var equipmentItem = equipment.findById(request.equipmentId()).orElseThrow();
    accessPolicy.requireChantier(user, equipmentItem.getChantierId());

    if (equipmentItem.getBillingMode().name().equals("HEURE") && nvl(request.hoursWorked()).compareTo(BigDecimal.ZERO) <= 0) {
      throw new IllegalArgumentException("Les heures sont obligatoires pour un engin facture a l'heure.");
    }
    if (equipmentItem.getBillingMode().name().equals("JOUR") && nvl(request.daysBilled()).compareTo(BigDecimal.ZERO) <= 0) {
      throw new IllegalArgumentException("Les jours sont obligatoires pour un engin facture au jour.");
    }

    var item = new EquipmentTimesheetEntity();
    item.setDate(request.date());
    item.setChantierId(request.chantierId());
    item.setEquipmentId(request.equipmentId());
    item.setDriver(request.driver());
    item.setHoursWorked(request.hoursWorked());
    item.setDaysBilled(request.daysBilled());
    item.setActivityType(request.activityType());
    item.setAppliedBillingMode(equipmentItem.getBillingMode());
    item.setAppliedHourlyRate(equipmentItem.getHourlyRate());
    item.setAppliedDailyRate(equipmentItem.getDailyRate());
    item.setStatus(request.submit() ? OperationStatus.SOUMIS : OperationStatus.BROUILLON);
    var saved = timesheets.save(item);
    audit.record(user.getId(), "engins", "create_timesheet", "EquipmentTimesheet", saved.getId(), saved.getDriver());
    return Mapper.equipmentTimesheet(saved);
  }

  private BigDecimal nvl(BigDecimal value) {
    return value == null ? BigDecimal.ZERO : value;
  }

  public record EquipmentPayload(List<CoreDtos.EquipmentDto> equipment, List<CoreDtos.EquipmentTimesheetDto> timesheets) {
  }
}
