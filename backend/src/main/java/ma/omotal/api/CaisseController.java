package ma.omotal.api;

import jakarta.validation.Valid;
import java.util.List;
import ma.omotal.api.dto.CoreDtos;
import ma.omotal.config.AppProperties;
import ma.omotal.domain.CaisseTransactionEntity;
import ma.omotal.domain.enums.OperationStatus;
import ma.omotal.domain.enums.Role;
import ma.omotal.domain.enums.TransactionType;
import ma.omotal.repository.CaisseTransactionRepository;
import ma.omotal.security.AccessPolicy;
import ma.omotal.security.CurrentUserService;
import ma.omotal.service.AuditService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/caisse")
public class CaisseController {
  private final CaisseTransactionRepository transactions;
  private final CurrentUserService currentUser;
  private final AccessPolicy accessPolicy;
  private final AuditService audit;
  private final AppProperties properties;

  public CaisseController(
      CaisseTransactionRepository transactions,
      CurrentUserService currentUser,
      AccessPolicy accessPolicy,
      AuditService audit,
      AppProperties properties
  ) {
    this.transactions = transactions;
    this.currentUser = currentUser;
    this.accessPolicy = accessPolicy;
    this.audit = audit;
    this.properties = properties;
  }

  @GetMapping("/transactions")
  public List<CoreDtos.CaisseTransactionDto> list() {
    var user = currentUser.currentUser();
    accessPolicy.requireRole(user, Role.SUPER_ADMIN, Role.DIRECTEUR, Role.COMPTABLE);
    var ids = accessPolicy.authorizedChantierIds(user);
    var data = ids.isEmpty() ? transactions.findAll() : transactions.findByChantierIdIn(ids);
    return data.stream().map(Mapper::transaction).toList();
  }

  @PostMapping("/transactions")
  public CoreDtos.CaisseTransactionDto create(@Valid @RequestBody CoreDtos.CreateTransactionRequest request) {
    var user = currentUser.currentUser();
    accessPolicy.requireRole(user, Role.SUPER_ADMIN, Role.COMPTABLE);
    accessPolicy.requireChantier(user, request.chantierId());

    var item = new CaisseTransactionEntity();
    item.setDate(request.date());
    item.setChantierId(request.chantierId());
    item.setType(request.type());
    item.setAmount(request.amount());
    item.setPaymentMode(request.paymentMode());
    item.setCategory(request.category());
    item.setDescription(request.description());
    item.setPersonOrSupplier(request.personOrSupplier());
    item.setEnteredByUserId(user.getId());
    var needsApproval = request.type() == TransactionType.DEBIT
        && request.amount().longValue() >= properties.highPaymentThreshold();
    item.setStatus(request.submit() || needsApproval ? OperationStatus.SOUMIS : OperationStatus.BROUILLON);
    var saved = transactions.save(item);
    audit.record(user.getId(), "caisse", "create", "CaisseTransaction", saved.getId(), saved.getDescription());
    return Mapper.transaction(saved);
  }
}
