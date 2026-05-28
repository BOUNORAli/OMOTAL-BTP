package ma.omotal.api;

import jakarta.validation.Valid;
import java.util.UUID;
import ma.omotal.api.dto.CoreDtos;
import ma.omotal.domain.ChantierEntity;
import ma.omotal.domain.enums.ChantierStatus;
import ma.omotal.domain.enums.Role;
import ma.omotal.repository.ChantierRepository;
import ma.omotal.repository.ChantierUserAccessRepository;
import ma.omotal.security.AccessPolicy;
import ma.omotal.security.CurrentUserService;
import ma.omotal.service.AuditService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/chantiers")
public class ChantierController {
  private final ChantierRepository chantiers;
  private final ChantierUserAccessRepository access;
  private final CurrentUserService currentUser;
  private final AccessPolicy accessPolicy;
  private final AuditService audit;

  public ChantierController(
      ChantierRepository chantiers,
      ChantierUserAccessRepository access,
      CurrentUserService currentUser,
      AccessPolicy accessPolicy,
      AuditService audit
  ) {
    this.chantiers = chantiers;
    this.access = access;
    this.currentUser = currentUser;
    this.accessPolicy = accessPolicy;
    this.audit = audit;
  }

  @GetMapping
  public java.util.List<CoreDtos.ChantierDto> list() {
    var user = currentUser.currentUser();
    if (user.getRole() == Role.SUPER_ADMIN || user.getRole() == Role.DIRECTEUR) {
      return chantiers.findAll().stream().map(Mapper::chantier).toList();
    }
    var ids = access.findByUserId(user.getId()).stream().map(item -> item.getChantierId()).toList();
    return chantiers.findAllById(ids).stream().map(Mapper::chantier).toList();
  }

  @GetMapping("/{id}")
  public CoreDtos.ChantierDto get(@PathVariable UUID id) {
    var user = currentUser.currentUser();
    accessPolicy.requireChantier(user, id);
    return chantiers.findById(id).map(Mapper::chantier).orElseThrow();
  }

  @PostMapping
  public CoreDtos.ChantierDto create(@Valid @RequestBody CoreDtos.CreateChantierRequest request) {
    var user = currentUser.currentUser();
    accessPolicy.requireRole(user, Role.SUPER_ADMIN);
    if (chantiers.existsByCodeIgnoreCase(request.code())) {
      throw new IllegalArgumentException("Le code chantier existe deja.");
    }
    var chantier = new ChantierEntity();
    chantier.setName(request.name());
    chantier.setCode(request.code());
    chantier.setClient(request.client());
    chantier.setLocation(request.location());
    chantier.setStartedAt(request.startedAt());
    chantier.setExpectedEndAt(request.expectedEndAt());
    chantier.setMarketAmountHt(request.marketAmountHt());
    chantier.setManagerUserId(request.managerUserId());
    chantier.setStatus(ChantierStatus.EN_COURS);
    var saved = chantiers.save(chantier);
    audit.record(user.getId(), "chantiers", "create", "Chantier", saved.getId(), saved.getCode());
    return Mapper.chantier(saved);
  }
}
