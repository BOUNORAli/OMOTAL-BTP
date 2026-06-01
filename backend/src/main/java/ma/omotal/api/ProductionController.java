package ma.omotal.api;

import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import ma.omotal.api.dto.CoreDtos;
import ma.omotal.domain.ProductionRecordEntity;
import ma.omotal.domain.enums.OperationStatus;
import ma.omotal.domain.enums.Role;
import ma.omotal.repository.ProductionRecordRepository;
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
@RequestMapping("/api/v1/production")
public class ProductionController {
  private final ProductionRecordRepository productions;
  private final CurrentUserService currentUser;
  private final AccessPolicy accessPolicy;
  private final AuditService audit;

  public ProductionController(
      ProductionRecordRepository productions,
      CurrentUserService currentUser,
      AccessPolicy accessPolicy,
      AuditService audit
  ) {
    this.productions = productions;
    this.currentUser = currentUser;
    this.accessPolicy = accessPolicy;
    this.audit = audit;
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
    item.setVoie(request.voie());
    item.setTranche(request.tranche());
    item.setTroncon(request.troncon());
    item.setWorkType(request.workType());
    item.setEquipmentId(request.equipmentId());
    item.setDriver(request.driver());
    item.setLengthValue(request.lengthValue());
    item.setWidthValue(request.widthValue());
    item.setDepthValue(request.depthValue());
    item.setUnit(request.unit());
    item.setHours(request.hours());
    item.setQuantity(CalculationService.calculateProductionQuantity(
        request.unit(), request.lengthValue(), request.widthValue(), request.depthValue(), request.quantity()));
    item.setEnteredByUserId(user.getId());
    item.setStatus(request.submit() ? OperationStatus.SOUMIS : OperationStatus.BROUILLON);
    var saved = productions.save(item);
    audit.record(user.getId(), "production", "create", "ProductionRecord", saved.getId(), saved.getWorkType());
    return Mapper.production(saved);
  }
}
