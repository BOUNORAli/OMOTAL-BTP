package ma.omotal.api;

import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import ma.omotal.api.dto.CoreDtos;
import ma.omotal.domain.ProductionRecordEntity;
import ma.omotal.domain.enums.OperationStatus;
import ma.omotal.domain.enums.ProductionFamily;
import ma.omotal.domain.enums.Role;
import ma.omotal.repository.ProductionRecordRepository;
import ma.omotal.security.AccessPolicy;
import ma.omotal.security.CurrentUserService;
import ma.omotal.service.AuditService;
import ma.omotal.service.CalculationService;
import ma.omotal.service.ProductionAnalyticsService;
import ma.omotal.service.ReferenceService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/production")
public class ProductionController {
  private final ProductionRecordRepository productions;
  private final CurrentUserService currentUser;
  private final AccessPolicy accessPolicy;
  private final AuditService audit;
  private final ProductionAnalyticsService analytics;
  private final ReferenceService references;

  public ProductionController(
      ProductionRecordRepository productions,
      CurrentUserService currentUser,
      AccessPolicy accessPolicy,
      AuditService audit,
      ProductionAnalyticsService analytics,
      ReferenceService references
  ) {
    this.productions = productions;
    this.currentUser = currentUser;
    this.accessPolicy = accessPolicy;
    this.audit = audit;
    this.analytics = analytics;
    this.references = references;
  }

  @GetMapping
  public List<CoreDtos.ProductionRecordDto> list(@RequestParam UUID chantierId) {
    var user = currentUser.currentUser();
    accessPolicy.requireRole(user, Role.SUPER_ADMIN, Role.DIRECTEUR, Role.RESPONSABLE_CHANTIER, Role.POINTEUR);
    accessPolicy.requireChantier(user, chantierId);
    return productions.findByChantierId(chantierId).stream().map(Mapper::production).toList();
  }

  @PostMapping
  public CoreDtos.ProductionRecordDto create(@Valid @RequestBody CoreDtos.CreateProductionRecordRequest request) {
    var user = currentUser.currentUser();
    accessPolicy.requireRole(user, Role.SUPER_ADMIN, Role.RESPONSABLE_CHANTIER, Role.POINTEUR);
    accessPolicy.requireChantier(user, request.chantierId());

    var item = new ProductionRecordEntity();
    item.setDate(request.date());
    item.setChantierId(request.chantierId());
    item.setProductionFamily(request.productionFamily() == null ? inferFamily(request.unit(), request.workType()) : request.productionFamily());
    item.setVoie(request.voie());
    item.setTranche(request.tranche());
    item.setTroncon(request.troncon());
    item.setWorkType(request.workType());
    item.setEquipmentId(request.equipmentId());
    item.setDriver(request.driver());
    item.setLengthValue(request.lengthValue());
    item.setWidthValue(request.widthValue());
    item.setDepthValue(request.depthValue());
    item.setDiameter(request.diameter());
    item.setPipeType(request.pipeType());
    item.setSoilType(request.soilType());
    item.setPoseType(request.poseType());
    item.setUnit(request.unit());
    item.setHours(request.hours());
    item.setAllocatedGasoilLiters(request.allocatedGasoilLiters());
    item.setAllocatedGasoilAmount(request.allocatedGasoilAmount());
    item.setAllocatedEquipmentCost(request.allocatedEquipmentCost());
    item.setAllocatedWorkerCost(request.allocatedWorkerCost());
    item.setAllocatedDriverExpenses(request.allocatedDriverExpenses());
    item.setAllocatedOtherCost(request.allocatedOtherCost());
    item.setOverheadAmount(request.overheadAmount());
    item.setTotalAllocatedCost(request.totalAllocatedCost());
    item.setQuantity(CalculationService.calculateProductionQuantity(
        request.unit(), request.lengthValue(), request.widthValue(), request.depthValue(), request.quantity()));
    item.setEnteredByUserId(user.getId());
    item.setStatus(request.submit() ? OperationStatus.SOUMIS : OperationStatus.BROUILLON);
    rememberReferences(request);
    var saved = productions.save(item);
    audit.record(user.getId(), "production", "create", "ProductionRecord", saved.getId(), saved.getWorkType());
    return Mapper.production(saved);
  }

  @GetMapping("/analytics")
  public CoreDtos.ProductionAnalyticsDto analytics(
      @RequestParam UUID chantierId,
      @RequestParam(required = false) java.time.LocalDate from,
      @RequestParam(required = false) java.time.LocalDate to,
      @RequestParam(required = false) ProductionFamily family
  ) {
    var user = currentUser.currentUser();
    accessPolicy.requireRole(user, Role.SUPER_ADMIN, Role.DIRECTEUR, Role.COMPTABLE, Role.RESPONSABLE_CHANTIER);
    accessPolicy.requireChantier(user, chantierId);
    return analytics.analytics(chantierId, from, to, family);
  }

  private void rememberReferences(CoreDtos.CreateProductionRecordRequest request) {
    references.getOrCreate(request.chantierId(), "VOIE", request.voie());
    if (request.tranche() != null && !request.tranche().isBlank()) {
      references.getOrCreate(request.chantierId(), "TRANCHE", request.tranche());
    }
    references.getOrCreate(request.chantierId(), "TRAVAIL", request.workType());
    if (request.driver() != null && !request.driver().isBlank()) {
      references.getOrCreate(request.chantierId(), "CHAUFFEUR", request.driver());
    }
    if (request.diameter() != null && !request.diameter().isBlank()) {
      references.getOrCreate(request.chantierId(), "DIAMETRE", request.diameter());
    }
    if (request.pipeType() != null && !request.pipeType().isBlank()) {
      references.getOrCreate(request.chantierId(), "TYPE_CANALISATION", request.pipeType());
    }
    if (request.soilType() != null && !request.soilType().isBlank()) {
      references.getOrCreate(request.chantierId(), "NATURE_SOL", request.soilType());
    }
    if (request.poseType() != null && !request.poseType().isBlank()) {
      references.getOrCreate(request.chantierId(), "NATURE_POSE", request.poseType());
    }
  }

  private ProductionFamily inferFamily(String unit, String workType) {
    var normalized = (workType == null ? "" : workType).toLowerCase();
    if ("ML".equalsIgnoreCase(unit)) {
      return ProductionFamily.CANA_POSE;
    }
    if (normalized.contains("cana") || normalized.contains("tranch")) {
      return ProductionFamily.CANA_TRANCHEE;
    }
    if ("M2".equalsIgnoreCase(unit) || normalized.contains("reglage") || normalized.contains("réglage")) {
      return ProductionFamily.REGLAGE;
    }
    return ProductionFamily.DECAPAGE;
  }
}
