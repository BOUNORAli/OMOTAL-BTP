package ma.omotal.config;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;
import ma.omotal.domain.CaisseTransactionEntity;
import ma.omotal.domain.ChantierEntity;
import ma.omotal.domain.ChantierUserAccessEntity;
import ma.omotal.domain.EmployeeEntity;
import ma.omotal.domain.EquipmentEntity;
import ma.omotal.domain.EquipmentTimesheetEntity;
import ma.omotal.domain.GasoilEntryEntity;
import ma.omotal.domain.GasoilExitEntity;
import ma.omotal.domain.PersonnelAdvanceEntity;
import ma.omotal.domain.PersonnelTimesheetEntity;
import ma.omotal.domain.SupplierEntity;
import ma.omotal.domain.UserEntity;
import ma.omotal.domain.enums.BillingMode;
import ma.omotal.domain.enums.ChantierStatus;
import ma.omotal.domain.enums.DayType;
import ma.omotal.domain.enums.EquipmentStatus;
import ma.omotal.domain.enums.OperationStatus;
import ma.omotal.domain.enums.PaymentMode;
import ma.omotal.domain.enums.RemunerationType;
import ma.omotal.domain.enums.Role;
import ma.omotal.domain.enums.SupplierType;
import ma.omotal.domain.enums.TransactionCategory;
import ma.omotal.domain.enums.TransactionType;
import ma.omotal.repository.CaisseTransactionRepository;
import ma.omotal.repository.ChantierRepository;
import ma.omotal.repository.ChantierUserAccessRepository;
import ma.omotal.repository.EmployeeRepository;
import ma.omotal.repository.EquipmentRepository;
import ma.omotal.repository.EquipmentTimesheetRepository;
import ma.omotal.repository.GasoilEntryRepository;
import ma.omotal.repository.GasoilExitRepository;
import ma.omotal.repository.PersonnelAdvanceRepository;
import ma.omotal.repository.PersonnelTimesheetRepository;
import ma.omotal.repository.SupplierRepository;
import ma.omotal.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DemoDataLoader {
  @Bean
  CommandLineRunner seedDemoData(
      AppProperties properties,
      PasswordEncoder passwordEncoder,
      UserRepository users,
      ChantierRepository chantiers,
      ChantierUserAccessRepository access,
      SupplierRepository suppliers,
      EquipmentRepository equipment,
      EmployeeRepository employees,
      CaisseTransactionRepository transactions,
      GasoilEntryRepository gasoilEntries,
      GasoilExitRepository gasoilExits,
      PersonnelTimesheetRepository personnelTimesheets,
      PersonnelAdvanceRepository advances,
      EquipmentTimesheetRepository equipmentTimesheets
  ) {
    return args -> {
      if (!properties.demoDataEnabled() || users.count() > 0) {
        return;
      }

      var ali = user("Ali BOUNOR", "ali@omotal.ma", Role.SUPER_ADMIN, passwordEncoder);
      var boubker = user("Boubker", "direction@omotal.ma", Role.DIRECTEUR, passwordEncoder);
      var ayoub = user("Ayoub", "ayoub@omotal.ma", Role.POINTEUR, passwordEncoder);
      var comptable = user("Comptable OMOTAL", "admin@omotal.ma", Role.COMPTABLE, passwordEncoder);
      var responsable = user("Responsable chantier", "responsable@omotal.ma", Role.RESPONSABLE_CHANTIER, passwordEncoder);
      users.save(ali);
      users.save(boubker);
      users.save(ayoub);
      users.save(comptable);
      users.save(responsable);

      var chantier = new ChantierEntity();
      chantier.setName("Genie Meknes AO 62/2026");
      chantier.setCode("GM-62-2026");
      chantier.setClient("Maitre d'ouvrage pilote");
      chantier.setLocation("Meknes");
      chantier.setStartedAt(LocalDate.of(2026, 5, 1));
      chantier.setExpectedEndAt(LocalDate.of(2026, 12, 20));
      chantier.setMarketAmountHt(new BigDecimal("12800000"));
      chantier.setStatus(ChantierStatus.EN_COURS);
      chantier.setManagerUserId(ali.getId());
      chantiers.save(chantier);

      for (var user : new UserEntity[]{ali, boubker, ayoub, comptable, responsable}) {
        var item = new ChantierUserAccessEntity();
        item.setChantierId(chantier.getId());
        item.setUserId(user.getId());
        access.save(item);
      }

      var station = new SupplierEntity();
      station.setName("Station Nord Meknes");
      station.setType(SupplierType.STATION);
      station.setPhone("+212600000001");
      suppliers.save(station);

      var loueur = new SupplierEntity();
      loueur.setName("Location Atlas Engins");
      loueur.setType(SupplierType.LOUEUR);
      loueur.setPhone("+212600000002");
      suppliers.save(loueur);

      var pelle = equipment("Pelle CAT 320", "pelle", "Location Atlas Engins", chantier.getId(), BillingMode.HEURE, "350", null, "Said");
      var niveleuse = equipment("Niveleuse 140K", "niveleuse", "OMOTAL", chantier.getId(), BillingMode.JOUR, null, "2600", "Mustapha");
      var camion = equipment("Camion 8x4", "camion", "Transport partenaire", chantier.getId(), BillingMode.HEURE, null, null, "Hamid");
      equipment.save(pelle);
      equipment.save(niveleuse);
      equipment.save(camion);

      var omar = employee("Omar", "El Fassi", "Ouvrier", chantier.getId(), RemunerationType.JOUR, null, "160", null);
      var yassine = employee("Yassine", "Bennani", "Chef equipe", chantier.getId(), RemunerationType.MOIS, "5200", null, null);
      employees.save(omar);
      employees.save(yassine);

      transactions.save(transaction(chantier.getId(), comptable.getId(), LocalDate.of(2026, 5, 10), TransactionType.CREDIT,
          "150000", PaymentMode.BANQUE_OMOTAL, TransactionCategory.FINANCEMENT, "Alimentation chantier pilote", OperationStatus.VALIDE));
      transactions.save(transaction(chantier.getId(), comptable.getId(), LocalDate.of(2026, 5, 11), TransactionType.DEBIT,
          "11800", PaymentMode.BANQUE_OMOTAL, TransactionCategory.GASOIL, "Achat gasoil Station Nord", OperationStatus.VALIDE));
      transactions.save(transaction(chantier.getId(), comptable.getId(), LocalDate.of(2026, 5, 18), TransactionType.DEBIT,
          "42000", PaymentMode.BANQUE_OMOTAL, TransactionCategory.LOCATION_ENGINS, "Acompte location engins", OperationStatus.SOUMIS));

      var entry = new GasoilEntryEntity();
      entry.setDate(LocalDate.of(2026, 5, 11));
      entry.setChantierId(chantier.getId());
      entry.setSupplierId(station.getId());
      entry.setLiters(new BigDecimal("1000"));
      entry.setUnitPrice(new BigDecimal("11.8"));
      entry.setReceiptNumber("BR-001");
      entry.setStatus(OperationStatus.VALIDE);
      entry.setHasDocument(true);
      entry.setEnteredByUserId(comptable.getId());
      gasoilEntries.save(entry);

      gasoilExits.save(gasoilExit(chantier.getId(), pelle.getId(), ayoub.getId(), LocalDate.of(2026, 5, 12), "Said", "120", "BS-001", OperationStatus.VALIDE));
      gasoilExits.save(gasoilExit(chantier.getId(), niveleuse.getId(), ayoub.getId(), LocalDate.of(2026, 5, 13), "Mustapha", "90", "BS-002", OperationStatus.SOUMIS));

      personnelTimesheets.save(personnelTimesheet(chantier.getId(), omar.getId(), LocalDate.of(2026, 5, 12), RemunerationType.JOUR, null, "160", null));
      personnelTimesheets.save(personnelTimesheet(chantier.getId(), yassine.getId(), LocalDate.of(2026, 5, 12), RemunerationType.MOIS, null, null, "5200"));

      var advance = new PersonnelAdvanceEntity();
      advance.setDate(LocalDate.of(2026, 5, 15));
      advance.setChantierId(chantier.getId());
      advance.setEmployeeId(omar.getId());
      advance.setAmount(new BigDecimal("500"));
      advance.setStatus(OperationStatus.VALIDE);
      advances.save(advance);

      equipmentTimesheets.save(equipmentTimesheet(chantier.getId(), pelle.getId(), LocalDate.of(2026, 5, 12), "Said", BillingMode.HEURE, "8", null, "350", null, OperationStatus.VALIDE));
      equipmentTimesheets.save(equipmentTimesheet(chantier.getId(), niveleuse.getId(), LocalDate.of(2026, 5, 12), "Mustapha", BillingMode.JOUR, null, "1", null, "2600", OperationStatus.VALIDE));
      equipmentTimesheets.save(equipmentTimesheet(chantier.getId(), camion.getId(), LocalDate.of(2026, 5, 13), "Hamid", BillingMode.HEURE, "7", null, null, null, OperationStatus.SOUMIS));
    };
  }

  private UserEntity user(String name, String email, Role role, PasswordEncoder passwordEncoder) {
    var user = new UserEntity();
    user.setId(UUID.randomUUID());
    user.setName(name);
    user.setEmail(email);
    user.setRole(role);
    user.setPasswordHash(passwordEncoder.encode("password"));
    user.setActive(true);
    return user;
  }

  private EquipmentEntity equipment(String designation, String type, String owner, UUID chantierId, BillingMode mode, String hourly, String daily, String driver) {
    var item = new EquipmentEntity();
    item.setDesignation(designation);
    item.setType(type);
    item.setOwner(owner);
    item.setChantierId(chantierId);
    item.setBillingMode(mode);
    item.setHourlyRate(hourly == null ? null : new BigDecimal(hourly));
    item.setDailyRate(daily == null ? null : new BigDecimal(daily));
    item.setUsualDriver(driver);
    item.setStatus(EquipmentStatus.MOBILISE);
    return item;
  }

  private EmployeeEntity employee(String firstName, String lastName, String position, UUID chantierId, RemunerationType type, String monthly, String daily, String hourly) {
    var item = new EmployeeEntity();
    item.setFirstName(firstName);
    item.setLastName(lastName);
    item.setPosition(position);
    item.setChantierId(chantierId);
    item.setRemunerationType(type);
    item.setMonthlySalary(monthly == null ? null : new BigDecimal(monthly));
    item.setDailySalary(daily == null ? null : new BigDecimal(daily));
    item.setHourlySalary(hourly == null ? null : new BigDecimal(hourly));
    item.setActive(true);
    return item;
  }

  private CaisseTransactionEntity transaction(UUID chantierId, UUID userId, LocalDate date, TransactionType type, String amount, PaymentMode mode, TransactionCategory category, String description, OperationStatus status) {
    var item = new CaisseTransactionEntity();
    item.setDate(date);
    item.setChantierId(chantierId);
    item.setType(type);
    item.setAmount(new BigDecimal(amount));
    item.setPaymentMode(mode);
    item.setCategory(category);
    item.setDescription(description);
    item.setStatus(status);
    item.setHasDocument(status == OperationStatus.VALIDE);
    item.setEnteredByUserId(userId);
    return item;
  }

  private GasoilExitEntity gasoilExit(UUID chantierId, UUID equipmentId, UUID userId, LocalDate date, String responsible, String liters, String exitNumber, OperationStatus status) {
    var item = new GasoilExitEntity();
    item.setDate(date);
    item.setChantierId(chantierId);
    item.setEquipmentId(equipmentId);
    item.setResponsible(responsible);
    item.setAllocation("production");
    item.setLiters(new BigDecimal(liters));
    item.setUnitPrice(new BigDecimal("11.8"));
    item.setExitNumber(exitNumber);
    item.setStatus(status);
    item.setHasDocument(true);
    item.setEnteredByUserId(userId);
    return item;
  }

  private PersonnelTimesheetEntity personnelTimesheet(UUID chantierId, UUID employeeId, LocalDate date, RemunerationType type, String hourly, String daily, String monthly) {
    var item = new PersonnelTimesheetEntity();
    item.setDate(date);
    item.setChantierId(chantierId);
    item.setEmployeeId(employeeId);
    item.setHoursWorked(new BigDecimal("9"));
    item.setDayType(DayType.NORMAL);
    item.setAppliedRemunerationType(type);
    item.setAppliedHourlyRate(hourly == null ? null : new BigDecimal(hourly));
    item.setAppliedDailyRate(daily == null ? null : new BigDecimal(daily));
    item.setAppliedMonthlySalary(monthly == null ? null : new BigDecimal(monthly));
    item.setStatus(OperationStatus.VALIDE);
    return item;
  }

  private EquipmentTimesheetEntity equipmentTimesheet(UUID chantierId, UUID equipmentId, LocalDate date, String driver, BillingMode mode, String hours, String days, String hourly, String daily, OperationStatus status) {
    var item = new EquipmentTimesheetEntity();
    item.setDate(date);
    item.setChantierId(chantierId);
    item.setEquipmentId(equipmentId);
    item.setDriver(driver);
    item.setAppliedBillingMode(mode);
    item.setHoursWorked(hours == null ? null : new BigDecimal(hours));
    item.setDaysBilled(days == null ? null : new BigDecimal(days));
    item.setAppliedHourlyRate(hourly == null ? null : new BigDecimal(hourly));
    item.setAppliedDailyRate(daily == null ? null : new BigDecimal(daily));
    item.setActivityType("production");
    item.setStatus(status);
    return item;
  }
}
