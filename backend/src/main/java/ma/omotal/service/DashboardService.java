package ma.omotal.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import ma.omotal.api.dto.CoreDtos;
import ma.omotal.config.AppProperties;
import ma.omotal.domain.CaisseTransactionEntity;
import ma.omotal.domain.EquipmentEntity;
import ma.omotal.domain.EquipmentTimesheetEntity;
import ma.omotal.domain.GasoilExitEntity;
import ma.omotal.domain.enums.EquipmentStatus;
import ma.omotal.domain.enums.OperationStatus;
import ma.omotal.domain.enums.TransactionType;
import ma.omotal.repository.CaisseTransactionRepository;
import ma.omotal.repository.EquipmentRepository;
import ma.omotal.repository.EquipmentTimesheetRepository;
import ma.omotal.repository.GasoilEntryRepository;
import ma.omotal.repository.GasoilExitRepository;
import ma.omotal.repository.PersonnelAdvanceRepository;
import ma.omotal.repository.PersonnelTimesheetRepository;
import org.springframework.stereotype.Service;

@Service
public class DashboardService {
  private final CaisseTransactionRepository transactions;
  private final GasoilEntryRepository gasoilEntries;
  private final GasoilExitRepository gasoilExits;
  private final PersonnelTimesheetRepository personnelTimesheets;
  private final PersonnelAdvanceRepository personnelAdvances;
  private final EquipmentRepository equipment;
  private final EquipmentTimesheetRepository equipmentTimesheets;
  private final ProductionAnalyticsService productionAnalytics;
  private final AppProperties properties;

  public DashboardService(
      CaisseTransactionRepository transactions,
      GasoilEntryRepository gasoilEntries,
      GasoilExitRepository gasoilExits,
      PersonnelTimesheetRepository personnelTimesheets,
      PersonnelAdvanceRepository personnelAdvances,
      EquipmentRepository equipment,
      EquipmentTimesheetRepository equipmentTimesheets,
      ProductionAnalyticsService productionAnalytics,
      AppProperties properties
  ) {
    this.transactions = transactions;
    this.gasoilEntries = gasoilEntries;
    this.gasoilExits = gasoilExits;
    this.personnelTimesheets = personnelTimesheets;
    this.personnelAdvances = personnelAdvances;
    this.equipment = equipment;
    this.equipmentTimesheets = equipmentTimesheets;
    this.productionAnalytics = productionAnalytics;
    this.properties = properties;
  }

  public CoreDtos.DashboardSummaryDto chantier(UUID chantierId) {
    return chantier(chantierId, null, null);
  }

  public CoreDtos.DashboardSummaryDto chantier(UUID chantierId, LocalDate from, LocalDate to) {
    var chantierTransactions = transactions.findByChantierId(chantierId);
    var entries = gasoilEntries.findByChantierId(chantierId);
    var exits = gasoilExits.findByChantierId(chantierId);
    var personTimesheets = personnelTimesheets.findByChantierId(chantierId);
    var advances = personnelAdvances.findByChantierId(chantierId);
    var equipmentItems = equipment.findByChantierId(chantierId);
    var equipmentSheets = equipmentTimesheets.findByChantierId(chantierId);

    var cash = CalculationService.calculateCashSummary(chantierTransactions);
    var gasoil = CalculationService.calculateGasoilStock(entries, exits);
    var production = productionAnalytics.analytics(chantierId, from, to, null);
    var alerts = buildAlerts(chantierId, gasoil.stockLiters(), exits, equipmentItems, equipmentSheets, chantierTransactions);
    var pending = (int) exits.stream().filter(item -> item.getStatus() == OperationStatus.SOUMIS).count()
        + (int) equipmentSheets.stream().filter(item -> item.getStatus() == OperationStatus.SOUMIS).count()
        + (int) chantierTransactions.stream().filter(item -> item.getStatus() == OperationStatus.SOUMIS).count();

    return new CoreDtos.DashboardSummaryDto(
        cash.balance(),
        cash.debit(),
        cash.credit(),
        gasoil.stockLiters(),
        gasoil.inputLiters(),
        gasoil.outputLiters(),
        CalculationService.calculatePersonnelDue(personTimesheets),
        CalculationService.calculatePersonnelAdvances(advances),
        CalculationService.calculateEquipmentCost(equipmentSheets),
        production.totalQuantity(),
        production.totalHours(),
        production.totalCost(),
        production.rendementPerHour(),
        production.costPerUnit(),
        pending,
        alerts
    );
  }

  private List<CoreDtos.AlertDto> buildAlerts(
      UUID chantierId,
      BigDecimal stockLiters,
      List<GasoilExitEntity> exits,
      List<EquipmentEntity> equipmentItems,
      List<EquipmentTimesheetEntity> equipmentSheets,
      List<CaisseTransactionEntity> transactions
  ) {
    var alerts = new ArrayList<CoreDtos.AlertDto>();
    if (stockLiters.compareTo(BigDecimal.ZERO) < 0) {
      alerts.add(new CoreDtos.AlertDto("stock-negatif-" + chantierId, "CRITICAL", "gasoil", chantierId,
          "Stock gasoil negatif", "Les sorties validees depassent les entrees validees."));
    }
    exits.stream()
        .filter(exit -> CalculationService.isOfficial(exit.getStatus()) && exit.getEquipmentId() == null)
        .forEach(exit -> alerts.add(new CoreDtos.AlertDto("sortie-sans-engin-" + exit.getId(), "WARNING", "gasoil",
            chantierId, "Sortie gasoil sans engin", exit.getLiters() + " L sans engin rattache.")));
    equipmentItems.stream()
        .filter(item -> item.getStatus() == EquipmentStatus.MOBILISE)
        .filter(item -> item.getHourlyRate() == null && item.getDailyRate() == null)
        .forEach(item -> alerts.add(new CoreDtos.AlertDto("engin-sans-tarif-" + item.getId(), "WARNING", "engins",
            chantierId, "Engin sans tarif", item.getDesignation() + " est mobilise sans tarif.")));
    equipmentSheets.stream()
        .filter(item -> item.getStatus() == OperationStatus.SOUMIS)
        .forEach(item -> alerts.add(new CoreDtos.AlertDto("pointage-attente-" + item.getId(), "INFO", "engins",
            chantierId, "Pointage engin a valider", "Pointage du " + item.getDate() + " en attente.")));
    transactions.stream()
        .filter(item -> item.getType() == TransactionType.DEBIT)
        .filter(item -> item.getAmount().compareTo(BigDecimal.valueOf(properties.highPaymentThreshold())) >= 0)
        .filter(item -> item.getStatus() == OperationStatus.SOUMIS)
        .forEach(item -> alerts.add(new CoreDtos.AlertDto("depense-elevee-" + item.getId(), "CRITICAL", "caisse",
            chantierId, "Depense elevee en attente", item.getAmount() + " DH attend une approbation.")));
    return alerts;
  }
}
