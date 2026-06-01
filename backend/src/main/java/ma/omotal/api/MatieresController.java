package ma.omotal.api;

import jakarta.validation.Valid;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import ma.omotal.api.dto.CoreDtos;
import ma.omotal.domain.MaterialPurchaseEntity;
import ma.omotal.domain.enums.OperationStatus;
import ma.omotal.domain.enums.Role;
import ma.omotal.repository.MaterialPurchaseRepository;
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
@RequestMapping("/api/v1/matieres")
public class MatieresController {
  private final MaterialPurchaseRepository purchases;
  private final CurrentUserService currentUser;
  private final AccessPolicy accessPolicy;
  private final AuditService audit;

  public MatieresController(MaterialPurchaseRepository purchases, CurrentUserService currentUser, AccessPolicy accessPolicy, AuditService audit) {
    this.purchases = purchases;
    this.currentUser = currentUser;
    this.accessPolicy = accessPolicy;
    this.audit = audit;
  }

  @GetMapping
  public List<CoreDtos.MaterialPurchaseDto> list(@RequestParam UUID chantierId) {
    var user = currentUser.currentUser();
    accessPolicy.requireRole(user, Role.SUPER_ADMIN, Role.DIRECTEUR, Role.COMPTABLE);
    accessPolicy.requireChantier(user, chantierId);
    return purchases.findByChantierId(chantierId).stream().map(Mapper::materialPurchase).toList();
  }

  @PostMapping
  public CoreDtos.MaterialPurchaseDto create(@Valid @RequestBody CoreDtos.CreateMaterialPurchaseRequest request) {
    var user = currentUser.currentUser();
    accessPolicy.requireRole(user, Role.SUPER_ADMIN, Role.COMPTABLE);
    accessPolicy.requireChantier(user, request.chantierId());

    var transport = request.transportHt() == null ? BigDecimal.ZERO : request.transportHt();
    var vatRate = request.vatRate() == null ? BigDecimal.ZERO : request.vatRate();
    var totalHt = CalculationService.lineTotal(request.quantity(), request.unitPriceHt()).add(transport);
    var item = new MaterialPurchaseEntity();
    item.setDate(request.date());
    item.setChantierId(request.chantierId());
    item.setSupplierId(request.supplierId());
    item.setDesignation(request.designation());
    item.setUnit(request.unit());
    item.setQuantity(request.quantity());
    item.setUnitPriceHt(request.unitPriceHt());
    item.setTransportHt(transport);
    item.setTotalHt(totalHt);
    item.setVatRate(vatRate);
    item.setTotalTtc(CalculationService.withVat(totalHt, vatRate));
    item.setReceiptNumber(request.receiptNumber());
    item.setSupplierDocumentNumber(request.supplierDocumentNumber());
    item.setDueDate(request.dueDate());
    item.setStatus(request.submit() ? OperationStatus.SOUMIS : OperationStatus.BROUILLON);
    item.setEnteredByUserId(user.getId());
    var saved = purchases.save(item);
    audit.record(user.getId(), "matieres", "create", "MaterialPurchase", saved.getId(), saved.getDesignation());
    return Mapper.materialPurchase(saved);
  }
}
