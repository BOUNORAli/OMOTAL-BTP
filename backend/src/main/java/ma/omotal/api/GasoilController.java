package ma.omotal.api;

import jakarta.validation.Valid;
import java.util.UUID;
import ma.omotal.api.dto.CoreDtos;
import ma.omotal.domain.GasoilEntryEntity;
import ma.omotal.domain.GasoilExitEntity;
import ma.omotal.domain.enums.OperationStatus;
import ma.omotal.domain.enums.Role;
import ma.omotal.repository.GasoilEntryRepository;
import ma.omotal.repository.GasoilExitRepository;
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
@RequestMapping("/api/v1/gasoil")
public class GasoilController {
  private final GasoilEntryRepository entries;
  private final GasoilExitRepository exits;
  private final CurrentUserService currentUser;
  private final AccessPolicy accessPolicy;
  private final AuditService audit;

  public GasoilController(
      GasoilEntryRepository entries,
      GasoilExitRepository exits,
      CurrentUserService currentUser,
      AccessPolicy accessPolicy,
      AuditService audit
  ) {
    this.entries = entries;
    this.exits = exits;
    this.currentUser = currentUser;
    this.accessPolicy = accessPolicy;
    this.audit = audit;
  }

  @GetMapping("/overview")
  public CoreDtos.GasoilOverviewDto overview(@RequestParam UUID chantierId) {
    var user = currentUser.currentUser();
    accessPolicy.requireChantier(user, chantierId);
    var chantierEntries = entries.findByChantierId(chantierId);
    var chantierExits = exits.findByChantierId(chantierId);
    var stock = CalculationService.calculateGasoilStock(chantierEntries, chantierExits);
    return new CoreDtos.GasoilOverviewDto(
        chantierEntries.stream().map(Mapper::gasoilEntry).toList(),
        chantierExits.stream().map(Mapper::gasoilExit).toList(),
        stock.inputLiters(),
        stock.outputLiters(),
        stock.stockLiters()
    );
  }

  @PostMapping("/entries")
  public CoreDtos.GasoilEntryDto createEntry(@Valid @RequestBody CoreDtos.CreateGasoilEntryRequest request) {
    var user = currentUser.currentUser();
    accessPolicy.requireRole(user, Role.SUPER_ADMIN, Role.COMPTABLE);
    accessPolicy.requireChantier(user, request.chantierId());

    var item = new GasoilEntryEntity();
    item.setDate(request.date());
    item.setChantierId(request.chantierId());
    item.setSupplierId(request.supplierId());
    item.setLiters(request.liters());
    item.setUnitPrice(request.unitPrice());
    item.setReceiptNumber(request.receiptNumber());
    item.setEnteredByUserId(user.getId());
    item.setStatus(request.submit() ? OperationStatus.VALIDE : OperationStatus.BROUILLON);
    var saved = entries.save(item);
    audit.record(user.getId(), "gasoil", "create_entry", "GasoilEntry", saved.getId(), saved.getReceiptNumber());
    return Mapper.gasoilEntry(saved);
  }

  @PostMapping("/exits")
  public CoreDtos.GasoilExitDto createExit(@Valid @RequestBody CoreDtos.CreateGasoilExitRequest request) {
    var user = currentUser.currentUser();
    accessPolicy.requireRole(user, Role.SUPER_ADMIN, Role.RESPONSABLE_CHANTIER, Role.POINTEUR);
    accessPolicy.requireChantier(user, request.chantierId());

    var item = new GasoilExitEntity();
    item.setDate(request.date());
    item.setChantierId(request.chantierId());
    item.setEquipmentId(request.equipmentId());
    item.setResponsible(request.responsible());
    item.setAllocation(request.allocation());
    item.setLiters(request.liters());
    item.setUnitPrice(request.unitPrice());
    item.setExitNumber(request.exitNumber());
    item.setEnteredByUserId(user.getId());
    item.setStatus(request.submit() ? OperationStatus.SOUMIS : OperationStatus.BROUILLON);
    var saved = exits.save(item);
    audit.record(user.getId(), "gasoil", "create_exit", "GasoilExit", saved.getId(), saved.getExitNumber());
    return Mapper.gasoilExit(saved);
  }
}
