package ma.omotal.api;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;
import ma.omotal.domain.CaisseTransactionEntity;
import ma.omotal.domain.ChantierEntity;
import ma.omotal.domain.ChantierUserAccessEntity;
import ma.omotal.domain.EmployeeEntity;
import ma.omotal.domain.EquipmentEntity;
import ma.omotal.domain.EquipmentTimesheetEntity;
import ma.omotal.domain.GasoilExitEntity;
import ma.omotal.domain.UserEntity;
import ma.omotal.domain.enums.BillingMode;
import ma.omotal.domain.enums.ChantierStatus;
import ma.omotal.domain.enums.DayType;
import ma.omotal.domain.enums.EquipmentStatus;
import ma.omotal.domain.enums.OperationStatus;
import ma.omotal.domain.enums.PaymentMode;
import ma.omotal.domain.enums.RemunerationType;
import ma.omotal.domain.enums.Role;
import ma.omotal.domain.enums.TransactionCategory;
import ma.omotal.domain.enums.TransactionType;
import ma.omotal.repository.AuditLogRepository;
import ma.omotal.repository.CaisseTransactionRepository;
import ma.omotal.repository.ChantierRepository;
import ma.omotal.repository.ChantierUserAccessRepository;
import ma.omotal.repository.DocumentRepository;
import ma.omotal.repository.EmployeeRepository;
import ma.omotal.repository.EquipmentRepository;
import ma.omotal.repository.EquipmentTimesheetRepository;
import ma.omotal.repository.GasoilEntryRepository;
import ma.omotal.repository.GasoilExitRepository;
import ma.omotal.repository.PersonnelAdvanceRepository;
import ma.omotal.repository.PersonnelTimesheetRepository;
import ma.omotal.repository.SupplierRepository;
import ma.omotal.repository.UserRepository;
import ma.omotal.repository.ValidationLogRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ApiSecurityMockMvcTest {
  @Autowired
  private MockMvc mockMvc;
  @Autowired
  private ObjectMapper objectMapper;
  @Autowired
  private PasswordEncoder passwordEncoder;
  @Autowired
  private UserRepository users;
  @Autowired
  private ChantierRepository chantiers;
  @Autowired
  private ChantierUserAccessRepository access;
  @Autowired
  private CaisseTransactionRepository transactions;
  @Autowired
  private GasoilEntryRepository gasoilEntries;
  @Autowired
  private GasoilExitRepository gasoilExits;
  @Autowired
  private EmployeeRepository employees;
  @Autowired
  private PersonnelTimesheetRepository personnelTimesheets;
  @Autowired
  private PersonnelAdvanceRepository advances;
  @Autowired
  private EquipmentRepository equipment;
  @Autowired
  private EquipmentTimesheetRepository equipmentTimesheets;
  @Autowired
  private SupplierRepository suppliers;
  @Autowired
  private DocumentRepository documents;
  @Autowired
  private AuditLogRepository auditLogs;
  @Autowired
  private ValidationLogRepository validationLogs;

  @BeforeEach
  void cleanDatabase() {
    validationLogs.deleteAll();
    auditLogs.deleteAll();
    documents.deleteAll();
    equipmentTimesheets.deleteAll();
    personnelTimesheets.deleteAll();
    advances.deleteAll();
    gasoilExits.deleteAll();
    gasoilEntries.deleteAll();
    transactions.deleteAll();
    equipment.deleteAll();
    employees.deleteAll();
    suppliers.deleteAll();
    access.deleteAll();
    chantiers.deleteAll();
    users.deleteAll();
  }

  @Test
  void loginReturnsJwtAndUserRole() throws Exception {
    user("Ali BOUNOR", "ali@omotal.ma", Role.SUPER_ADMIN);

    mockMvc.perform(post("/api/v1/auth/login")
            .contentType(MediaType.APPLICATION_JSON)
            .content("""
                {"email":"ali@omotal.ma","password":"password"}
                """))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.token").isNotEmpty())
        .andExpect(jsonPath("$.user.role").value("SUPER_ADMIN"));
  }

  @Test
  void pointeurCannotReadSensitiveFinanceSalaryDashboardOrExports() throws Exception {
    var ayoub = user("Ayoub", "ayoub@omotal.ma", Role.POINTEUR);
    var chantier = chantier("GM-62-2026");
    grant(ayoub, chantier);
    transaction(chantier, ayoub, OperationStatus.VALIDE);
    employee(chantier);

    var token = login("ayoub@omotal.ma");

    mockMvc.perform(get("/api/v1/caisse/transactions").header("Authorization", bearer(token)))
        .andExpect(status().isForbidden());
    mockMvc.perform(get("/api/v1/personnel").header("Authorization", bearer(token)))
        .andExpect(status().isForbidden());
    mockMvc.perform(get("/api/v1/dashboard/chantier/" + chantier.getId()).header("Authorization", bearer(token)))
        .andExpect(status().isForbidden());
    mockMvc.perform(get("/api/v1/exports/caisse.xlsx")
            .queryParam("chantierId", chantier.getId().toString())
            .header("Authorization", bearer(token)))
        .andExpect(status().isForbidden());
  }

  @Test
  void chantierIsolationBlocksUnauthorizedChantier() throws Exception {
    var ayoub = user("Ayoub", "ayoub@omotal.ma", Role.POINTEUR);
    var allowed = chantier("GM-62-2026");
    var blocked = chantier("ZAI-2026");
    grant(ayoub, allowed);

    var token = login("ayoub@omotal.ma");

    mockMvc.perform(get("/api/v1/gasoil/overview")
            .queryParam("chantierId", blocked.getId().toString())
            .header("Authorization", bearer(token)))
        .andExpect(status().isForbidden());
  }

  @Test
  void responsableCanValidateAndRejectOwnChantierOperations() throws Exception {
    var responsable = user("Responsable", "responsable@omotal.ma", Role.RESPONSABLE_CHANTIER);
    var chantier = chantier("GM-62-2026");
    grant(responsable, chantier);
    var machine = equipment(chantier);
    var gasoilExit = gasoilExit(chantier, machine, responsable);
    var timesheet = equipmentTimesheet(chantier, machine);

    var token = login("responsable@omotal.ma");

    mockMvc.perform(post("/api/v1/validations/GASOIL_EXIT/" + gasoilExit.getId() + "/validate")
            .header("Authorization", bearer(token)))
        .andExpect(status().isOk());
    mockMvc.perform(post("/api/v1/validations/EQUIPMENT_TIMESHEET/" + timesheet.getId() + "/reject")
            .contentType(MediaType.APPLICATION_JSON)
            .content("""
                {"reason":"Heures a corriger"}
                """)
            .header("Authorization", bearer(token)))
        .andExpect(status().isOk());

    assertThat(gasoilExits.findById(gasoilExit.getId()).orElseThrow().getStatus()).isEqualTo(OperationStatus.VALIDE);
    assertThat(equipmentTimesheets.findById(timesheet.getId()).orElseThrow().getStatus()).isEqualTo(OperationStatus.REJETE);
    assertThat(validationLogs.count()).isEqualTo(2);
  }

  @Test
  void xlsxExportReturnsFormattedWorkbook() throws Exception {
    var ali = user("Ali BOUNOR", "ali@omotal.ma", Role.SUPER_ADMIN);
    var chantier = chantier("GM-62-2026");
    grant(ali, chantier);
    transaction(chantier, ali, OperationStatus.VALIDE);

    var token = login("ali@omotal.ma");

    var response = mockMvc.perform(get("/api/v1/exports/caisse.xlsx")
            .queryParam("chantierId", chantier.getId().toString())
            .queryParam("from", "2026-05-01")
            .queryParam("to", "2026-05-31")
            .header("Authorization", bearer(token)))
        .andExpect(status().isOk())
        .andExpect(content().contentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
        .andReturn()
        .getResponse()
        .getContentAsByteArray();

    assertThat(response).startsWith(new byte[]{'P', 'K'});
  }

  private String login(String email) throws Exception {
    var response = mockMvc.perform(post("/api/v1/auth/login")
            .contentType(MediaType.APPLICATION_JSON)
            .content("""
                {"email":"%s","password":"password"}
                """.formatted(email)))
        .andExpect(status().isOk())
        .andReturn()
        .getResponse()
        .getContentAsString();
    return objectMapper.readTree(response).get("token").asText();
  }

  private String bearer(String token) {
    return "Bearer " + token;
  }

  private UserEntity user(String name, String email, Role role) {
    var user = new UserEntity();
    user.setName(name);
    user.setEmail(email);
    user.setRole(role);
    user.setPasswordHash(passwordEncoder.encode("password"));
    user.setActive(true);
    return users.save(user);
  }

  private ChantierEntity chantier(String code) {
    var chantier = new ChantierEntity();
    chantier.setName("Chantier " + code);
    chantier.setCode(code);
    chantier.setClient("Maitre d'ouvrage test");
    chantier.setLocation("Meknes");
    chantier.setStartedAt(LocalDate.of(2026, 5, 1));
    chantier.setExpectedEndAt(LocalDate.of(2026, 12, 31));
    chantier.setMarketAmountHt(new BigDecimal("1000000"));
    chantier.setStatus(ChantierStatus.EN_COURS);
    return chantiers.save(chantier);
  }

  private void grant(UserEntity user, ChantierEntity chantier) {
    var row = new ChantierUserAccessEntity();
    row.setUserId(user.getId());
    row.setChantierId(chantier.getId());
    access.save(row);
  }

  private CaisseTransactionEntity transaction(ChantierEntity chantier, UserEntity user, OperationStatus status) {
    var item = new CaisseTransactionEntity();
    item.setDate(LocalDate.of(2026, 5, 10));
    item.setChantierId(chantier.getId());
    item.setType(TransactionType.DEBIT);
    item.setAmount(new BigDecimal("1200"));
    item.setPaymentMode(PaymentMode.BANQUE_OMOTAL);
    item.setCategory(TransactionCategory.GASOIL);
    item.setDescription("Achat test");
    item.setStatus(status);
    item.setEnteredByUserId(user.getId());
    return transactions.save(item);
  }

  private EmployeeEntity employee(ChantierEntity chantier) {
    var employee = new EmployeeEntity();
    employee.setFirstName("Omar");
    employee.setLastName("Test");
    employee.setPosition("Ouvrier");
    employee.setChantierId(chantier.getId());
    employee.setRemunerationType(RemunerationType.JOUR);
    employee.setDailySalary(new BigDecimal("160"));
    employee.setActive(true);
    return employees.save(employee);
  }

  private EquipmentEntity equipment(ChantierEntity chantier) {
    var item = new EquipmentEntity();
    item.setDesignation("Pelle test");
    item.setType("pelle");
    item.setOwner("Loueur test");
    item.setChantierId(chantier.getId());
    item.setBillingMode(BillingMode.HEURE);
    item.setHourlyRate(new BigDecimal("350"));
    item.setStatus(EquipmentStatus.MOBILISE);
    return equipment.save(item);
  }

  private GasoilExitEntity gasoilExit(ChantierEntity chantier, EquipmentEntity machine, UserEntity user) {
    var item = new GasoilExitEntity();
    item.setDate(LocalDate.of(2026, 5, 12));
    item.setChantierId(chantier.getId());
    item.setEquipmentId(machine.getId());
    item.setResponsible("Said");
    item.setAllocation("production");
    item.setLiters(new BigDecimal("120"));
    item.setUnitPrice(new BigDecimal("11.8"));
    item.setExitNumber("BS-" + UUID.randomUUID());
    item.setStatus(OperationStatus.SOUMIS);
    item.setEnteredByUserId(user.getId());
    return gasoilExits.save(item);
  }

  private EquipmentTimesheetEntity equipmentTimesheet(ChantierEntity chantier, EquipmentEntity machine) {
    var item = new EquipmentTimesheetEntity();
    item.setDate(LocalDate.of(2026, 5, 12));
    item.setChantierId(chantier.getId());
    item.setEquipmentId(machine.getId());
    item.setDriver("Said");
    item.setHoursWorked(new BigDecimal("8"));
    item.setActivityType("production");
    item.setAppliedBillingMode(BillingMode.HEURE);
    item.setAppliedHourlyRate(new BigDecimal("350"));
    item.setStatus(OperationStatus.SOUMIS);
    return equipmentTimesheets.save(item);
  }
}
