package ma.omotal.api;

import jakarta.validation.Valid;
import java.math.BigDecimal;
import java.util.UUID;
import ma.omotal.api.dto.CoreDtos;
import ma.omotal.domain.BqArticleEntity;
import ma.omotal.domain.BqRealisationEntity;
import ma.omotal.domain.enums.OperationStatus;
import ma.omotal.domain.enums.Role;
import ma.omotal.repository.BqArticleRepository;
import ma.omotal.repository.BqRealisationRepository;
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
@RequestMapping("/api/v1/bq")
public class BqController {
  private final BqArticleRepository articles;
  private final BqRealisationRepository realisations;
  private final CurrentUserService currentUser;
  private final AccessPolicy accessPolicy;
  private final AuditService audit;

  public BqController(
      BqArticleRepository articles,
      BqRealisationRepository realisations,
      CurrentUserService currentUser,
      AccessPolicy accessPolicy,
      AuditService audit
  ) {
    this.articles = articles;
    this.realisations = realisations;
    this.currentUser = currentUser;
    this.accessPolicy = accessPolicy;
    this.audit = audit;
  }

  @GetMapping
  public CoreDtos.BqOverviewDto overview(@RequestParam UUID chantierId) {
    var user = currentUser.currentUser();
    accessPolicy.requireRole(user, Role.SUPER_ADMIN, Role.DIRECTEUR);
    accessPolicy.requireChantier(user, chantierId);
    var realisationItems = realisations.findByChantierId(chantierId);
    var articleItems = articles.findByChantierId(chantierId).stream()
        .map(article -> Mapper.bqArticle(article, realisedQuantity(article.getId(), realisationItems)))
        .toList();
    return new CoreDtos.BqOverviewDto(articleItems, realisationItems.stream().map(Mapper::bqRealisation).toList());
  }

  @PostMapping("/articles")
  public CoreDtos.BqArticleDto createArticle(@Valid @RequestBody CoreDtos.CreateBqArticleRequest request) {
    var user = currentUser.currentUser();
    accessPolicy.requireRole(user, Role.SUPER_ADMIN);
    accessPolicy.requireChantier(user, request.chantierId());
    var item = new BqArticleEntity();
    item.setChantierId(request.chantierId());
    item.setArticleNumber(request.articleNumber());
    item.setDesignation(request.designation());
    item.setUnit(request.unit());
    item.setMarketQuantity(request.marketQuantity());
    item.setMarketUnitPriceHt(request.marketUnitPriceHt());
    item.setPlannedCostTotal(request.plannedCostTotal() == null ? BigDecimal.ZERO : request.plannedCostTotal());
    var saved = articles.save(item);
    audit.record(user.getId(), "bq", "create_article", "BqArticle", saved.getId(), saved.getArticleNumber());
    return Mapper.bqArticle(saved, BigDecimal.ZERO);
  }

  @PostMapping("/realisations")
  public CoreDtos.BqRealisationDto createRealisation(@Valid @RequestBody CoreDtos.CreateBqRealisationRequest request) {
    var user = currentUser.currentUser();
    accessPolicy.requireRole(user, Role.SUPER_ADMIN);
    accessPolicy.requireChantier(user, request.chantierId());
    var article = articles.findById(request.bqArticleId()).orElseThrow();
    if (!article.getChantierId().equals(request.chantierId())) {
      throw new IllegalArgumentException("Article BQ hors chantier.");
    }
    var item = new BqRealisationEntity();
    item.setDate(request.date());
    item.setChantierId(request.chantierId());
    item.setBqArticleId(request.bqArticleId());
    item.setQuantity(request.quantity());
    item.setSource(request.source());
    item.setStatus(request.submit() ? OperationStatus.VALIDE : OperationStatus.BROUILLON);
    item.setEnteredByUserId(user.getId());
    var saved = realisations.save(item);
    audit.record(user.getId(), "bq", "create_realisation", "BqRealisation", saved.getId(), saved.getSource());
    return Mapper.bqRealisation(saved);
  }

  private BigDecimal realisedQuantity(UUID articleId, java.util.List<BqRealisationEntity> items) {
    return items.stream()
        .filter(item -> item.getBqArticleId().equals(articleId))
        .filter(item -> CalculationService.isOfficial(item.getStatus()))
        .map(BqRealisationEntity::getQuantity)
        .reduce(BigDecimal.ZERO, BigDecimal::add);
  }
}
