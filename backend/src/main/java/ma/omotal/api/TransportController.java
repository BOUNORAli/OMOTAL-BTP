package ma.omotal.api;

import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import ma.omotal.api.dto.CoreDtos;
import ma.omotal.domain.TransportRecordEntity;
import ma.omotal.domain.enums.OperationStatus;
import ma.omotal.domain.enums.Role;
import ma.omotal.repository.TransportRecordRepository;
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
@RequestMapping("/api/v1/transport")
public class TransportController {
  private final TransportRecordRepository records;
  private final CurrentUserService currentUser;
  private final AccessPolicy accessPolicy;
  private final AuditService audit;

  public TransportController(TransportRecordRepository records, CurrentUserService currentUser, AccessPolicy accessPolicy, AuditService audit) {
    this.records = records;
    this.currentUser = currentUser;
    this.accessPolicy = accessPolicy;
    this.audit = audit;
  }

  @GetMapping
  public List<CoreDtos.TransportRecordDto> list(@RequestParam UUID chantierId) {
    var user = currentUser.currentUser();
    accessPolicy.requireRole(user, Role.SUPER_ADMIN, Role.DIRECTEUR, Role.COMPTABLE, Role.RESPONSABLE_CHANTIER);
    accessPolicy.requireChantier(user, chantierId);
    return records.findByChantierId(chantierId).stream().map(Mapper::transport).toList();
  }

  @PostMapping
  public CoreDtos.TransportRecordDto create(@Valid @RequestBody CoreDtos.CreateTransportRecordRequest request) {
    var user = currentUser.currentUser();
    accessPolicy.requireRole(user, Role.SUPER_ADMIN, Role.COMPTABLE, Role.RESPONSABLE_CHANTIER);
    accessPolicy.requireChantier(user, request.chantierId());
    var item = new TransportRecordEntity();
    item.setDate(request.date());
    item.setChantierId(request.chantierId());
    item.setSupplierId(request.supplierId());
    item.setDesignation(request.designation());
    item.setDeparture(request.departure());
    item.setArrival(request.arrival());
    item.setTrips(request.trips());
    item.setUnitPrice(request.unitPrice());
    item.setTotalAmount(CalculationService.lineTotal(request.trips(), request.unitPrice()));
    item.setReceiptNumber(request.receiptNumber());
    item.setAllocation(request.allocation());
    item.setStatus(request.submit() ? OperationStatus.SOUMIS : OperationStatus.BROUILLON);
    item.setEnteredByUserId(user.getId());
    var saved = records.save(item);
    audit.record(user.getId(), "transport", "create", "TransportRecord", saved.getId(), saved.getDesignation());
    return Mapper.transport(saved);
  }
}
