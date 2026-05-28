package ma.omotal.service;

import static org.assertj.core.api.Assertions.assertThat;

import java.math.BigDecimal;
import java.util.List;
import ma.omotal.domain.CaisseTransactionEntity;
import ma.omotal.domain.EquipmentTimesheetEntity;
import ma.omotal.domain.GasoilEntryEntity;
import ma.omotal.domain.GasoilExitEntity;
import ma.omotal.domain.PersonnelTimesheetEntity;
import ma.omotal.domain.enums.BillingMode;
import ma.omotal.domain.enums.DayType;
import ma.omotal.domain.enums.OperationStatus;
import ma.omotal.domain.enums.RemunerationType;
import ma.omotal.domain.enums.TransactionType;
import org.junit.jupiter.api.Test;

class CalculationServiceTest {
  @Test
  void cashSummaryOnlyUsesOfficialTransactions() {
    var credit = transaction(TransactionType.CREDIT, "1000", OperationStatus.VALIDE);
    var debit = transaction(TransactionType.DEBIT, "300", OperationStatus.VALIDE);
    var draftDebit = transaction(TransactionType.DEBIT, "500", OperationStatus.BROUILLON);

    var result = CalculationService.calculateCashSummary(List.of(credit, debit, draftDebit));

    assertThat(result.credit()).isEqualByComparingTo("1000");
    assertThat(result.debit()).isEqualByComparingTo("300");
    assertThat(result.balance()).isEqualByComparingTo("700");
  }

  @Test
  void gasoilStockUsesValidatedEntriesAndExits() {
    var entry = new GasoilEntryEntity();
    entry.setLiters(new BigDecimal("1000"));
    entry.setStatus(OperationStatus.VALIDE);
    var exit = new GasoilExitEntity();
    exit.setLiters(new BigDecimal("120"));
    exit.setStatus(OperationStatus.VALIDE);
    var submittedExit = new GasoilExitEntity();
    submittedExit.setLiters(new BigDecimal("90"));
    submittedExit.setStatus(OperationStatus.SOUMIS);

    var result = CalculationService.calculateGasoilStock(List.of(entry), List.of(exit, submittedExit));

    assertThat(result.stockLiters()).isEqualByComparingTo("880");
  }

  @Test
  void equipmentCostSupportsHourlyAndDailyBilling() {
    var hourly = new EquipmentTimesheetEntity();
    hourly.setAppliedBillingMode(BillingMode.HEURE);
    hourly.setHoursWorked(new BigDecimal("8"));
    hourly.setAppliedHourlyRate(new BigDecimal("350"));
    hourly.setStatus(OperationStatus.VALIDE);

    var daily = new EquipmentTimesheetEntity();
    daily.setAppliedBillingMode(BillingMode.JOUR);
    daily.setDaysBilled(new BigDecimal("1"));
    daily.setAppliedDailyRate(new BigDecimal("2600"));
    daily.setStatus(OperationStatus.VALIDE);

    assertThat(CalculationService.calculateEquipmentCost(List.of(hourly, daily))).isEqualByComparingTo("5400");
  }

  @Test
  void personnelMonthlySalaryFallsBackToMonthlyDividedBy26And9() {
    var item = new PersonnelTimesheetEntity();
    item.setDayType(DayType.NORMAL);
    item.setAppliedRemunerationType(RemunerationType.MOIS);
    item.setHoursWorked(new BigDecimal("9"));
    item.setAppliedMonthlySalary(new BigDecimal("5200"));

    assertThat(CalculationService.calculatePersonnelDue(item)).isEqualByComparingTo("200.00");
  }

  private CaisseTransactionEntity transaction(TransactionType type, String amount, OperationStatus status) {
    var item = new CaisseTransactionEntity();
    item.setType(type);
    item.setAmount(new BigDecimal(amount));
    item.setStatus(status);
    return item;
  }
}
