package ma.omotal.api;

import java.nio.charset.StandardCharsets;
import java.util.UUID;
import ma.omotal.repository.CaisseTransactionRepository;
import ma.omotal.repository.GasoilEntryRepository;
import ma.omotal.repository.GasoilExitRepository;
import ma.omotal.security.AccessPolicy;
import ma.omotal.security.CurrentUserService;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/exports")
public class ExportController {
  private final CaisseTransactionRepository transactions;
  private final GasoilEntryRepository gasoilEntries;
  private final GasoilExitRepository gasoilExits;
  private final CurrentUserService currentUser;
  private final AccessPolicy accessPolicy;

  public ExportController(
      CaisseTransactionRepository transactions,
      GasoilEntryRepository gasoilEntries,
      GasoilExitRepository gasoilExits,
      CurrentUserService currentUser,
      AccessPolicy accessPolicy
  ) {
    this.transactions = transactions;
    this.gasoilEntries = gasoilEntries;
    this.gasoilExits = gasoilExits;
    this.currentUser = currentUser;
    this.accessPolicy = accessPolicy;
  }

  @GetMapping("/caisse.csv")
  public ResponseEntity<byte[]> caisse(@RequestParam UUID chantierId) {
    var user = currentUser.currentUser();
    accessPolicy.requireChantier(user, chantierId);
    var csv = new StringBuilder("date;type;categorie;description;montant;mode;statut\n");
    transactions.findByChantierId(chantierId).forEach(item -> csv.append(item.getDate()).append(';')
        .append(item.getType()).append(';')
        .append(item.getCategory()).append(';')
        .append(escape(item.getDescription())).append(';')
        .append(item.getAmount()).append(';')
        .append(item.getPaymentMode()).append(';')
        .append(item.getStatus()).append('\n'));
    return csv("caisse-" + chantierId + ".csv", csv.toString());
  }

  @GetMapping("/gasoil.csv")
  public ResponseEntity<byte[]> gasoil(@RequestParam UUID chantierId) {
    var user = currentUser.currentUser();
    accessPolicy.requireChantier(user, chantierId);
    var csv = new StringBuilder("type;date;litres;prix_unitaire;bon;statut\n");
    gasoilEntries.findByChantierId(chantierId).forEach(item -> csv.append("ENTREE;")
        .append(item.getDate()).append(';')
        .append(item.getLiters()).append(';')
        .append(item.getUnitPrice()).append(';')
        .append(escape(item.getReceiptNumber())).append(';')
        .append(item.getStatus()).append('\n'));
    gasoilExits.findByChantierId(chantierId).forEach(item -> csv.append("SORTIE;")
        .append(item.getDate()).append(';')
        .append(item.getLiters()).append(';')
        .append(item.getUnitPrice()).append(';')
        .append(escape(item.getExitNumber())).append(';')
        .append(item.getStatus()).append('\n'));
    return csv("gasoil-" + chantierId + ".csv", csv.toString());
  }

  private ResponseEntity<byte[]> csv(String filename, String content) {
    var headers = new HttpHeaders();
    headers.setContentType(new MediaType("text", "csv", StandardCharsets.UTF_8));
    headers.setContentDisposition(ContentDisposition.attachment().filename(filename).build());
    return ResponseEntity.ok().headers(headers).body(content.getBytes(StandardCharsets.UTF_8));
  }

  private String escape(String value) {
    return value == null ? "" : value.replace(";", ",").replace("\n", " ");
  }
}
