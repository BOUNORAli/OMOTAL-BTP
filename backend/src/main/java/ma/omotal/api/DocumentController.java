package ma.omotal.api;

import java.util.List;
import java.util.UUID;
import ma.omotal.domain.DocumentEntity;
import ma.omotal.repository.DocumentRepository;
import ma.omotal.security.AccessPolicy;
import ma.omotal.security.CurrentUserService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/documents")
public class DocumentController {
  private final DocumentRepository documents;
  private final CurrentUserService currentUser;
  private final AccessPolicy accessPolicy;

  public DocumentController(DocumentRepository documents, CurrentUserService currentUser, AccessPolicy accessPolicy) {
    this.documents = documents;
    this.currentUser = currentUser;
    this.accessPolicy = accessPolicy;
  }

  @GetMapping
  public List<DocumentEntity> list(@RequestParam UUID chantierId) {
    var user = currentUser.currentUser();
    accessPolicy.requireChantier(user, chantierId);
    return documents.findByChantierId(chantierId);
  }
}
