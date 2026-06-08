package ma.omotal.api;

import java.util.List;
import java.util.UUID;
import ma.omotal.api.dto.CoreDtos;
import ma.omotal.domain.enums.Role;
import ma.omotal.security.AccessPolicy;
import ma.omotal.security.CurrentUserService;
import ma.omotal.service.AuditService;
import ma.omotal.service.ControlledImportService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/imports")
public class ImportController {
  private final CurrentUserService currentUser;
  private final AccessPolicy accessPolicy;
  private final AuditService audit;
  private final ControlledImportService imports;

  public ImportController(
      CurrentUserService currentUser,
      AccessPolicy accessPolicy,
      AuditService audit,
      ControlledImportService imports
  ) {
    this.currentUser = currentUser;
    this.accessPolicy = accessPolicy;
    this.audit = audit;
    this.imports = imports;
  }

  @PostMapping("/preview")
  public CoreDtos.ImportWorkbookPreviewDto preview(
      @RequestParam("file") MultipartFile file,
      @RequestParam(value = "workbookRole", required = false) String workbookRole
  ) throws Exception {
    var user = currentUser.currentUser();
    accessPolicy.requireRole(user, Role.SUPER_ADMIN, Role.COMPTABLE);
    var preview = imports.preview(file, workbookRole);
    audit.record(user.getId(), "imports", "preview", "ImportFile", user.getId(), file.getOriginalFilename());
    return preview;
  }

  @PostMapping("/commit")
  public CoreDtos.ImportCommitDto commit(
      @RequestParam("file") MultipartFile file,
      @RequestParam UUID chantierId,
      @RequestParam(value = "workbookRole", required = false) String workbookRole
  ) throws Exception {
    var user = currentUser.currentUser();
    accessPolicy.requireRole(user, Role.SUPER_ADMIN, Role.COMPTABLE);
    accessPolicy.requireChantier(user, chantierId);
    var result = imports.commit(file, chantierId, workbookRole, user.getId());
    audit.record(user.getId(), "imports", "commit", "ImportBatch", result.batchId(), file.getOriginalFilename());
    return result;
  }

  @GetMapping("/{batchId}")
  public CoreDtos.ImportBatchDto batch(@PathVariable UUID batchId) {
    var user = currentUser.currentUser();
    accessPolicy.requireRole(user, Role.SUPER_ADMIN, Role.COMPTABLE, Role.DIRECTEUR);
    return imports.getBatch(batchId);
  }

  @GetMapping("/{batchId}/issues")
  public List<CoreDtos.ImportRowDto> issues(@PathVariable UUID batchId) {
    var user = currentUser.currentUser();
    accessPolicy.requireRole(user, Role.SUPER_ADMIN, Role.COMPTABLE, Role.DIRECTEUR);
    return imports.getIssues(batchId);
  }
}
