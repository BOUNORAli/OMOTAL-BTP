package ma.omotal.api;

import java.util.Map;
import java.util.UUID;
import ma.omotal.api.dto.CoreDtos;
import ma.omotal.repository.ChantierRepository;
import ma.omotal.security.AccessPolicy;
import ma.omotal.security.CurrentUserService;
import ma.omotal.service.DashboardService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/dashboard")
public class DashboardController {
  private final DashboardService dashboard;
  private final ChantierRepository chantiers;
  private final CurrentUserService currentUser;
  private final AccessPolicy accessPolicy;

  public DashboardController(
      DashboardService dashboard,
      ChantierRepository chantiers,
      CurrentUserService currentUser,
      AccessPolicy accessPolicy
  ) {
    this.dashboard = dashboard;
    this.chantiers = chantiers;
    this.currentUser = currentUser;
    this.accessPolicy = accessPolicy;
  }

  @GetMapping("/global")
  public Map<String, Object> global() {
    var user = currentUser.currentUser();
    var chantierDtos = chantiers.findAll().stream()
        .filter(chantier -> accessPolicy.canAccessChantier(user, chantier.getId()))
        .map(Mapper::chantier)
        .toList();
    return Map.of("activeChantiers", chantierDtos.size(), "chantiers", chantierDtos);
  }

  @GetMapping("/chantier/{chantierId}")
  public CoreDtos.DashboardSummaryDto chantier(@PathVariable UUID chantierId) {
    var user = currentUser.currentUser();
    accessPolicy.requireChantier(user, chantierId);
    return dashboard.chantier(chantierId);
  }
}
