package ma.omotal.api;

import java.util.List;
import java.util.UUID;
import jakarta.validation.Valid;
import ma.omotal.domain.SupplierPaymentEntity;
import ma.omotal.api.dto.CoreDtos;
import ma.omotal.domain.SupplierEntity;
import ma.omotal.domain.enums.OperationStatus;
import ma.omotal.domain.enums.Role;
import ma.omotal.repository.SupplierPaymentRepository;
import ma.omotal.repository.SupplierRepository;
import ma.omotal.security.AccessPolicy;
import ma.omotal.security.CurrentUserService;
import ma.omotal.service.AuditService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/fournisseurs")
public class FournisseurController {
  private final SupplierRepository suppliers;
  private final CurrentUserService currentUser;
  private final AccessPolicy accessPolicy;
  private final AuditService audit;
  private final SupplierPaymentRepository payments;

  public FournisseurController(
      SupplierRepository suppliers,
      CurrentUserService currentUser,
      AccessPolicy accessPolicy,
      AuditService audit,
      SupplierPaymentRepository payments
  ) {
    this.suppliers = suppliers;
    this.currentUser = currentUser;
    this.accessPolicy = accessPolicy;
    this.audit = audit;
    this.payments = payments;
  }

  @GetMapping
  public List<CoreDtos.SupplierDto> list() {
    return suppliers.findByActiveTrueOrderByNameAsc().stream().map(Mapper::supplier).toList();
  }

  @PostMapping
  public CoreDtos.SupplierDto create(@Valid @RequestBody CoreDtos.CreateSupplierRequest request) {
    var user = currentUser.currentUser();
    accessPolicy.requireRole(user, Role.SUPER_ADMIN, Role.COMPTABLE);
    var supplier = new SupplierEntity();
    supplier.setName(request.name());
    supplier.setType(request.type());
    supplier.setPhone(request.phone());
    supplier.setActive(true);
    var saved = suppliers.save(supplier);
    audit.record(user.getId(), "fournisseurs", "create", "Supplier", saved.getId(), saved.getName());
    return Mapper.supplier(saved);
  }

  @GetMapping("/payments")
  public List<CoreDtos.SupplierPaymentDto> payments(@RequestParam UUID chantierId) {
    var user = currentUser.currentUser();
    accessPolicy.requireRole(user, Role.SUPER_ADMIN, Role.DIRECTEUR, Role.COMPTABLE);
    accessPolicy.requireChantier(user, chantierId);
    return payments.findByChantierId(chantierId).stream().map(Mapper::supplierPayment).toList();
  }

  @PostMapping("/payments")
  public CoreDtos.SupplierPaymentDto createPayment(@Valid @RequestBody CoreDtos.CreateSupplierPaymentRequest request) {
    var user = currentUser.currentUser();
    accessPolicy.requireRole(user, Role.SUPER_ADMIN, Role.COMPTABLE);
    accessPolicy.requireChantier(user, request.chantierId());
    var item = new SupplierPaymentEntity();
    item.setDate(request.date());
    item.setChantierId(request.chantierId());
    item.setSupplierId(request.supplierId());
    item.setAmount(request.amount());
    item.setPaymentMode(request.paymentMode());
    item.setNote(request.note());
    item.setStatus(request.submit() ? OperationStatus.VALIDE : OperationStatus.BROUILLON);
    item.setEnteredByUserId(user.getId());
    var saved = payments.save(item);
    audit.record(user.getId(), "fournisseurs", "create_payment", "SupplierPayment", saved.getId(), saved.getAmount().toPlainString());
    return Mapper.supplierPayment(saved);
  }
}
