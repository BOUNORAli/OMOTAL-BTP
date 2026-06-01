package ma.omotal.api;

import jakarta.validation.Valid;
import java.math.BigDecimal;
import java.util.UUID;
import ma.omotal.api.dto.CoreDtos;
import ma.omotal.domain.EtpImputationEntity;
import ma.omotal.domain.EtpPrestationEntity;
import ma.omotal.domain.enums.OperationStatus;
import ma.omotal.domain.enums.Role;
import ma.omotal.repository.EtpImputationRepository;
import ma.omotal.repository.EtpPrestationRepository;
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
@RequestMapping("/api/v1/etp")
public class EtpController {
  private final EtpPrestationRepository prestations;
  private final EtpImputationRepository imputations;
  private final CurrentUserService currentUser;
  private final AccessPolicy accessPolicy;
  private final AuditService audit;

  public EtpController(
      EtpPrestationRepository prestations,
      EtpImputationRepository imputations,
      CurrentUserService currentUser,
      AccessPolicy accessPolicy,
      AuditService audit
  ) {
    this.prestations = prestations;
    this.imputations = imputations;
    this.currentUser = currentUser;
    this.accessPolicy = accessPolicy;
    this.audit = audit;
  }

  @GetMapping
  public CoreDtos.EtpOverviewDto overview(@RequestParam UUID chantierId) {
    var user = currentUser.currentUser();
    accessPolicy.requireRole(user, Role.SUPER_ADMIN, Role.DIRECTEUR, Role.COMPTABLE);
    accessPolicy.requireChantier(user, chantierId);
    var prestationItems = prestations.findByChantierId(chantierId);
    var imputationItems = imputations.findByChantierId(chantierId);
    var totalPrestations = prestationItems.stream()
        .filter(item -> CalculationService.isOfficial(item.getStatus()))
        .map(EtpPrestationEntity::getAmountTtc)
        .reduce(BigDecimal.ZERO, BigDecimal::add);
    var totalImputations = imputationItems.stream()
        .filter(item -> CalculationService.isOfficial(item.getStatus()))
        .map(EtpImputationEntity::getAmount)
        .reduce(BigDecimal.ZERO, BigDecimal::add);
    return new CoreDtos.EtpOverviewDto(
        prestationItems.stream().map(Mapper::etpPrestation).toList(),
        imputationItems.stream().map(Mapper::etpImputation).toList(),
        totalPrestations,
        totalImputations,
        totalPrestations.subtract(totalImputations)
    );
  }

  @PostMapping("/prestations")
  public CoreDtos.EtpPrestationDto createPrestation(@Valid @RequestBody CoreDtos.CreateEtpPrestationRequest request) {
    var user = currentUser.currentUser();
    accessPolicy.requireRole(user, Role.SUPER_ADMIN, Role.COMPTABLE);
    accessPolicy.requireChantier(user, request.chantierId());
    var amountHt = CalculationService.lineTotal(request.quantity(), request.unitPrice());
    var vatRate = request.vatRate() == null ? BigDecimal.ZERO : request.vatRate();
    var item = new EtpPrestationEntity();
    item.setDate(request.date());
    item.setChantierId(request.chantierId());
    item.setSupplierId(request.supplierId());
    item.setDesignation(request.designation());
    item.setQuantity(request.quantity());
    item.setUnitPrice(request.unitPrice());
    item.setAmountHt(amountHt);
    item.setVatRate(vatRate);
    item.setAmountTtc(CalculationService.withVat(amountHt, vatRate));
    item.setStatus(request.submit() ? OperationStatus.SOUMIS : OperationStatus.BROUILLON);
    item.setEnteredByUserId(user.getId());
    var saved = prestations.save(item);
    audit.record(user.getId(), "etp", "create_prestation", "EtpPrestation", saved.getId(), saved.getDesignation());
    return Mapper.etpPrestation(saved);
  }

  @PostMapping("/imputations")
  public CoreDtos.EtpImputationDto createImputation(@Valid @RequestBody CoreDtos.CreateEtpImputationRequest request) {
    var user = currentUser.currentUser();
    accessPolicy.requireRole(user, Role.SUPER_ADMIN, Role.COMPTABLE);
    accessPolicy.requireChantier(user, request.chantierId());
    var item = new EtpImputationEntity();
    item.setDate(request.date());
    item.setChantierId(request.chantierId());
    item.setSupplierId(request.supplierId());
    item.setImputationType(request.imputationType());
    item.setAmount(request.amount());
    item.setNote(request.note());
    item.setStatus(request.submit() ? OperationStatus.SOUMIS : OperationStatus.BROUILLON);
    item.setEnteredByUserId(user.getId());
    var saved = imputations.save(item);
    audit.record(user.getId(), "etp", "create_imputation", "EtpImputation", saved.getId(), saved.getImputationType());
    return Mapper.etpImputation(saved);
  }
}
