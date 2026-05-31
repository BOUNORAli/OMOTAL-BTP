package ma.omotal.api;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.nio.charset.StandardCharsets;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.UUID;
import ma.omotal.domain.enums.OperationStatus;
import ma.omotal.domain.enums.Role;
import ma.omotal.repository.CaisseTransactionRepository;
import ma.omotal.repository.ChantierRepository;
import ma.omotal.repository.EmployeeRepository;
import ma.omotal.repository.EquipmentRepository;
import ma.omotal.repository.EquipmentTimesheetRepository;
import ma.omotal.repository.GasoilEntryRepository;
import ma.omotal.repository.GasoilExitRepository;
import ma.omotal.repository.PersonnelTimesheetRepository;
import ma.omotal.security.AccessPolicy;
import ma.omotal.security.CurrentUserService;
import ma.omotal.service.CalculationService;
import ma.omotal.service.DashboardService;
import ma.omotal.service.ExportWorkbookService;
import ma.omotal.service.ExportWorkbookService.ExportMetadata;
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
  private final PersonnelTimesheetRepository personnelTimesheets;
  private final EquipmentTimesheetRepository equipmentTimesheets;
  private final EmployeeRepository employees;
  private final EquipmentRepository equipment;
  private final ChantierRepository chantiers;
  private final DashboardService dashboard;
  private final ExportWorkbookService workbooks;
  private final CurrentUserService currentUser;
  private final AccessPolicy accessPolicy;

  public ExportController(
      CaisseTransactionRepository transactions,
      GasoilEntryRepository gasoilEntries,
      GasoilExitRepository gasoilExits,
      PersonnelTimesheetRepository personnelTimesheets,
      EquipmentTimesheetRepository equipmentTimesheets,
      EmployeeRepository employees,
      EquipmentRepository equipment,
      ChantierRepository chantiers,
      DashboardService dashboard,
      ExportWorkbookService workbooks,
      CurrentUserService currentUser,
      AccessPolicy accessPolicy
  ) {
    this.transactions = transactions;
    this.gasoilEntries = gasoilEntries;
    this.gasoilExits = gasoilExits;
    this.personnelTimesheets = personnelTimesheets;
    this.equipmentTimesheets = equipmentTimesheets;
    this.employees = employees;
    this.equipment = equipment;
    this.chantiers = chantiers;
    this.dashboard = dashboard;
    this.workbooks = workbooks;
    this.currentUser = currentUser;
    this.accessPolicy = accessPolicy;
  }

  @GetMapping("/caisse.csv")
  public ResponseEntity<byte[]> caisse(@RequestParam UUID chantierId) {
    var user = currentUser.currentUser();
    accessPolicy.requireRole(user, Role.SUPER_ADMIN, Role.DIRECTEUR, Role.COMPTABLE);
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
    accessPolicy.requireRole(user, Role.SUPER_ADMIN, Role.DIRECTEUR, Role.COMPTABLE);
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

  @GetMapping("/caisse.xlsx")
  public ResponseEntity<byte[]> caisseXlsx(
      @RequestParam UUID chantierId,
      @RequestParam(required = false) LocalDate from,
      @RequestParam(required = false) LocalDate to,
      @RequestParam(defaultValue = "true") boolean onlyValidated
  ) {
    var user = currentUser.currentUser();
    accessPolicy.requireRole(user, Role.SUPER_ADMIN, Role.DIRECTEUR, Role.COMPTABLE);
    accessPolicy.requireChantier(user, chantierId);

    var data = transactions.findByChantierId(chantierId).stream()
        .filter(item -> inPeriod(item.getDate(), from, to))
        .filter(item -> includeStatus(item.getStatus(), onlyValidated))
        .sorted(Comparator.comparing(item -> item.getDate()))
        .toList();
    var bytes = workbooks.caisse(metadata("Rapport caisse", chantierId, from, to, onlyValidated), data);
    return xlsx(filename("caisse", chantierId), bytes);
  }

  @GetMapping("/gasoil.xlsx")
  public ResponseEntity<byte[]> gasoilXlsx(
      @RequestParam UUID chantierId,
      @RequestParam(required = false) LocalDate from,
      @RequestParam(required = false) LocalDate to,
      @RequestParam(defaultValue = "true") boolean onlyValidated
  ) {
    var user = currentUser.currentUser();
    accessPolicy.requireRole(user, Role.SUPER_ADMIN, Role.DIRECTEUR, Role.COMPTABLE);
    accessPolicy.requireChantier(user, chantierId);

    var entries = gasoilEntries.findByChantierId(chantierId).stream()
        .filter(item -> inPeriod(item.getDate(), from, to))
        .filter(item -> includeStatus(item.getStatus(), onlyValidated))
        .sorted(Comparator.comparing(item -> item.getDate()))
        .toList();
    var exits = gasoilExits.findByChantierId(chantierId).stream()
        .filter(item -> inPeriod(item.getDate(), from, to))
        .filter(item -> includeStatus(item.getStatus(), onlyValidated))
        .sorted(Comparator.comparing(item -> item.getDate()))
        .toList();
    var bytes = workbooks.gasoil(metadata("Rapport gasoil", chantierId, from, to, onlyValidated), entries, exits);
    return xlsx(filename("gasoil", chantierId), bytes);
  }

  @GetMapping("/personnel.xlsx")
  public ResponseEntity<byte[]> personnelXlsx(
      @RequestParam UUID chantierId,
      @RequestParam(required = false) LocalDate from,
      @RequestParam(required = false) LocalDate to,
      @RequestParam(defaultValue = "true") boolean onlyValidated
  ) {
    var user = currentUser.currentUser();
    accessPolicy.requireRole(user, Role.SUPER_ADMIN, Role.DIRECTEUR, Role.COMPTABLE);
    accessPolicy.requireChantier(user, chantierId);

    var data = personnelTimesheets.findByChantierId(chantierId).stream()
        .filter(item -> inPeriod(item.getDate(), from, to))
        .filter(item -> includeStatus(item.getStatus(), onlyValidated))
        .sorted(Comparator.comparing(item -> item.getDate()))
        .toList();
    var employeeMap = employees.findByChantierId(chantierId).stream()
        .collect(Collectors.toMap(item -> item.getId(), Function.identity()));
    var bytes = workbooks.personnel(metadata("Rapport pointage personnel", chantierId, from, to, onlyValidated), data, employeeMap);
    return xlsx(filename("personnel", chantierId), bytes);
  }

  @GetMapping("/engins.xlsx")
  public ResponseEntity<byte[]> enginsXlsx(
      @RequestParam UUID chantierId,
      @RequestParam(required = false) LocalDate from,
      @RequestParam(required = false) LocalDate to,
      @RequestParam(defaultValue = "true") boolean onlyValidated
  ) {
    var user = currentUser.currentUser();
    accessPolicy.requireRole(user, Role.SUPER_ADMIN, Role.DIRECTEUR, Role.COMPTABLE);
    accessPolicy.requireChantier(user, chantierId);

    var data = equipmentTimesheets.findByChantierId(chantierId).stream()
        .filter(item -> inPeriod(item.getDate(), from, to))
        .filter(item -> includeStatus(item.getStatus(), onlyValidated))
        .sorted(Comparator.comparing(item -> item.getDate()))
        .toList();
    var equipmentMap = equipment.findByChantierId(chantierId).stream()
        .collect(Collectors.toMap(item -> item.getId(), Function.identity()));
    var bytes = workbooks.engins(metadata("Rapport pointage engins", chantierId, from, to, onlyValidated), data, equipmentMap);
    return xlsx(filename("engins", chantierId), bytes);
  }

  @GetMapping("/dashboard.xlsx")
  public ResponseEntity<byte[]> dashboardXlsx(
      @RequestParam UUID chantierId,
      @RequestParam(required = false) LocalDate from,
      @RequestParam(required = false) LocalDate to
  ) {
    var user = currentUser.currentUser();
    accessPolicy.requireRole(user, Role.SUPER_ADMIN, Role.DIRECTEUR, Role.COMPTABLE);
    accessPolicy.requireChantier(user, chantierId);

    var bytes = workbooks.dashboard(metadata("Synthese dashboard chantier", chantierId, from, to, true), dashboard.chantier(chantierId));
    return xlsx(filename("dashboard", chantierId), bytes);
  }

  private ResponseEntity<byte[]> csv(String filename, String content) {
    var headers = new HttpHeaders();
    headers.setContentType(new MediaType("text", "csv", StandardCharsets.UTF_8));
    headers.setContentDisposition(ContentDisposition.attachment().filename(filename).build());
    return ResponseEntity.ok().headers(headers).body(content.getBytes(StandardCharsets.UTF_8));
  }

  private ResponseEntity<byte[]> xlsx(String filename, byte[] content) {
    var headers = new HttpHeaders();
    headers.setContentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
    headers.setContentDisposition(ContentDisposition.attachment().filename(filename).build());
    return ResponseEntity.ok().headers(headers).body(content);
  }

  private ExportMetadata metadata(String title, UUID chantierId, LocalDate from, LocalDate to, boolean onlyValidated) {
    var chantier = chantiers.findById(chantierId).orElseThrow();
    return new ExportMetadata(title, chantier, from, to, currentUser.currentUser().getName(), onlyValidated);
  }

  private boolean inPeriod(LocalDate date, LocalDate from, LocalDate to) {
    return (from == null || !date.isBefore(from)) && (to == null || !date.isAfter(to));
  }

  private boolean includeStatus(OperationStatus status, boolean onlyValidated) {
    return !onlyValidated || CalculationService.isOfficial(status);
  }

  private String filename(String prefix, UUID chantierId) {
    return prefix + "-" + chantierId + ".xlsx";
  }

  private String escape(String value) {
    return value == null ? "" : value.replace(";", ",").replace("\n", " ");
  }
}
