package ma.omotal.api;

import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import ma.omotal.api.dto.CoreDtos;
import ma.omotal.domain.enums.Role;
import ma.omotal.security.AccessPolicy;
import ma.omotal.security.CurrentUserService;
import ma.omotal.service.ReferenceService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/referentiels")
public class ReferentielController {
  private final ReferenceService referenceService;
  private final CurrentUserService currentUser;
  private final AccessPolicy accessPolicy;

  public ReferentielController(ReferenceService referenceService, CurrentUserService currentUser, AccessPolicy accessPolicy) {
    this.referenceService = referenceService;
    this.currentUser = currentUser;
    this.accessPolicy = accessPolicy;
  }

  @GetMapping
  public List<CoreDtos.ReferenceValueDto> list(@RequestParam UUID chantierId, @RequestParam(required = false) String category) {
    var user = currentUser.currentUser();
    accessPolicy.requireRole(user, Role.SUPER_ADMIN, Role.DIRECTEUR, Role.COMPTABLE, Role.RESPONSABLE_CHANTIER, Role.POINTEUR);
    accessPolicy.requireChantier(user, chantierId);
    return referenceService.list(chantierId, category).stream().map(Mapper::referenceValue).toList();
  }

  @PostMapping
  public CoreDtos.ReferenceValueDto create(@Valid @RequestBody CoreDtos.CreateReferenceValueRequest request) {
    var user = currentUser.currentUser();
    accessPolicy.requireRole(user, Role.SUPER_ADMIN, Role.COMPTABLE, Role.RESPONSABLE_CHANTIER);
    accessPolicy.requireChantier(user, request.chantierId());
    var item = referenceService.getOrCreate(
        request.chantierId(),
        request.category(),
        request.value(),
        request.aliasOfValue(),
        request.sortOrder() == null ? 0 : request.sortOrder()
    );
    return Mapper.referenceValue(item);
  }

  @GetMapping("/settings")
  public CoreDtos.ChantierSettingsDto settings(@RequestParam UUID chantierId) {
    var user = currentUser.currentUser();
    accessPolicy.requireRole(user, Role.SUPER_ADMIN, Role.DIRECTEUR, Role.COMPTABLE, Role.RESPONSABLE_CHANTIER);
    accessPolicy.requireChantier(user, chantierId);
    return Mapper.chantierSettings(referenceService.getOrCreateSettings(chantierId));
  }
}
