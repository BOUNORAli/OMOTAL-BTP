package ma.omotal.api;

import java.io.IOException;
import java.util.List;
import java.util.UUID;
import ma.omotal.api.dto.CoreDtos;
import ma.omotal.domain.DocumentEntity;
import ma.omotal.domain.enums.DocumentType;
import ma.omotal.repository.CaisseTransactionRepository;
import ma.omotal.repository.DocumentRepository;
import ma.omotal.repository.EquipmentTimesheetRepository;
import ma.omotal.repository.GasoilEntryRepository;
import ma.omotal.repository.GasoilExitRepository;
import ma.omotal.repository.PersonnelTimesheetRepository;
import ma.omotal.security.AccessPolicy;
import ma.omotal.security.CurrentUserService;
import ma.omotal.service.AuditService;
import ma.omotal.service.storage.DocumentStorageService;
import org.springframework.core.io.Resource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/documents")
public class DocumentController {
  private final DocumentRepository documents;
  private final CurrentUserService currentUser;
  private final AccessPolicy accessPolicy;
  private final DocumentStorageService storage;
  private final AuditService audit;
  private final CaisseTransactionRepository transactions;
  private final GasoilEntryRepository gasoilEntries;
  private final GasoilExitRepository gasoilExits;
  private final PersonnelTimesheetRepository personnelTimesheets;
  private final EquipmentTimesheetRepository equipmentTimesheets;

  public DocumentController(
      DocumentRepository documents,
      CurrentUserService currentUser,
      AccessPolicy accessPolicy,
      DocumentStorageService storage,
      AuditService audit,
      CaisseTransactionRepository transactions,
      GasoilEntryRepository gasoilEntries,
      GasoilExitRepository gasoilExits,
      PersonnelTimesheetRepository personnelTimesheets,
      EquipmentTimesheetRepository equipmentTimesheets
  ) {
    this.documents = documents;
    this.currentUser = currentUser;
    this.accessPolicy = accessPolicy;
    this.storage = storage;
    this.audit = audit;
    this.transactions = transactions;
    this.gasoilEntries = gasoilEntries;
    this.gasoilExits = gasoilExits;
    this.personnelTimesheets = personnelTimesheets;
    this.equipmentTimesheets = equipmentTimesheets;
  }

  @GetMapping
  public List<CoreDtos.DocumentDto> list(@RequestParam UUID chantierId) {
    var user = currentUser.currentUser();
    accessPolicy.requireChantier(user, chantierId);
    return documents.findByChantierId(chantierId).stream().map(Mapper::document).toList();
  }

  @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  public CoreDtos.DocumentDto upload(
      @RequestParam UUID chantierId,
      @RequestParam DocumentType documentType,
      @RequestParam String module,
      @RequestParam String targetType,
      @RequestParam UUID targetId,
      @RequestParam MultipartFile file
  ) throws IOException {
    var user = currentUser.currentUser();
    accessPolicy.requireChantier(user, chantierId);
    requireTargetBelongsToChantier(targetType, targetId, chantierId);

    if (file.isEmpty()) {
      throw new IllegalArgumentException("Le fichier est obligatoire.");
    }
    if (file.getSize() > 10 * 1024 * 1024) {
      throw new IllegalArgumentException("Le fichier ne doit pas depasser 10 Mo.");
    }
    var contentType = file.getContentType() == null ? "application/octet-stream" : file.getContentType();
    if (!List.of("image/jpeg", "image/png", "application/pdf").contains(contentType)) {
      throw new IllegalArgumentException("Formats acceptes : JPG, PNG, PDF.");
    }

    var safeName = file.getOriginalFilename() == null ? "document" : file.getOriginalFilename().replaceAll("[^a-zA-Z0-9._-]", "_");
    var storageKey = chantierId + "/" + UUID.randomUUID() + "-" + safeName;
    storage.store(storageKey, file);

    var document = new DocumentEntity();
    document.setChantierId(chantierId);
    document.setDocumentType(documentType);
    document.setFileName(safeName);
    document.setContentType(contentType);
    document.setSizeBytes(file.getSize());
    document.setStorageKey(storageKey);
    document.setModule(module);
    document.setTargetType(targetType);
    document.setTargetId(targetId);
    document.setAddedByUserId(user.getId());
    var saved = documents.save(document);
    markTargetHasDocument(targetType, targetId);
    audit.record(user.getId(), "documents", "upload", "Document", saved.getId(), saved.getFileName());
    return Mapper.document(saved);
  }

  @GetMapping("/{id}/download")
  public ResponseEntity<Resource> download(@PathVariable UUID id) throws IOException {
    var user = currentUser.currentUser();
    var document = documents.findById(id).orElseThrow();
    accessPolicy.requireChantier(user, document.getChantierId());

    var headers = new HttpHeaders();
    headers.setContentType(MediaType.parseMediaType(document.getContentType()));
    headers.setContentDisposition(ContentDisposition.attachment().filename(document.getFileName()).build());
    return ResponseEntity.ok().headers(headers).body(storage.load(document.getStorageKey()));
  }

  private void markTargetHasDocument(String targetType, UUID targetId) {
    switch (targetType) {
      case "CAISSE_TRANSACTION" -> transactions.findById(targetId).ifPresent(item -> {
        item.setHasDocument(true);
        transactions.save(item);
      });
      case "GASOIL_ENTRY" -> gasoilEntries.findById(targetId).ifPresent(item -> {
        item.setHasDocument(true);
        gasoilEntries.save(item);
      });
      case "GASOIL_EXIT" -> gasoilExits.findById(targetId).ifPresent(item -> {
        item.setHasDocument(true);
        gasoilExits.save(item);
      });
      case "PERSONNEL_TIMESHEET" -> personnelTimesheets.findById(targetId).ifPresent(personnelTimesheets::save);
      case "EQUIPMENT_TIMESHEET" -> equipmentTimesheets.findById(targetId).ifPresent(equipmentTimesheets::save);
      default -> {
      }
    }
  }

  private void requireTargetBelongsToChantier(String targetType, UUID targetId, UUID chantierId) {
    var belongs = switch (targetType) {
      case "CAISSE_TRANSACTION" -> transactions.findById(targetId)
          .map(item -> item.getChantierId().equals(chantierId))
          .orElse(false);
      case "GASOIL_ENTRY" -> gasoilEntries.findById(targetId)
          .map(item -> item.getChantierId().equals(chantierId))
          .orElse(false);
      case "GASOIL_EXIT" -> gasoilExits.findById(targetId)
          .map(item -> item.getChantierId().equals(chantierId))
          .orElse(false);
      case "PERSONNEL_TIMESHEET" -> personnelTimesheets.findById(targetId)
          .map(item -> item.getChantierId().equals(chantierId))
          .orElse(false);
      case "EQUIPMENT_TIMESHEET" -> equipmentTimesheets.findById(targetId)
          .map(item -> item.getChantierId().equals(chantierId))
          .orElse(false);
      default -> false;
    };
    if (!belongs) {
      throw new IllegalArgumentException("Operation cible introuvable pour ce chantier.");
    }
  }
}
