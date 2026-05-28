package ma.omotal.service;

import java.math.BigDecimal;
import java.math.MathContext;
import java.math.RoundingMode;
import java.util.List;
import ma.omotal.domain.CaisseTransactionEntity;
import ma.omotal.domain.EquipmentTimesheetEntity;
import ma.omotal.domain.GasoilEntryEntity;
import ma.omotal.domain.GasoilExitEntity;
import ma.omotal.domain.PersonnelAdvanceEntity;
import ma.omotal.domain.PersonnelTimesheetEntity;
import ma.omotal.domain.enums.BillingMode;
import ma.omotal.domain.enums.DayType;
import ma.omotal.domain.enums.OperationStatus;
import ma.omotal.domain.enums.RemunerationType;
import ma.omotal.domain.enums.TransactionType;
import org.springframework.stereotype.Service;

@Service
public class CalculationService {
  private static final List<OperationStatus> OFFICIAL = List.of(OperationStatus.VALIDE, OperationStatus.VERROUILLE);

  public static boolean isOfficial(OperationStatus status) {
    return OFFICIAL.contains(status);
  }

  public static CashSummary calculateCashSummary(List<CaisseTransactionEntity> transactions) {
    var debit = BigDecimal.ZERO;
    var credit = BigDecimal.ZERO;

    for (var transaction : transactions) {
      if (!isOfficial(transaction.getStatus())) {
        continue;
      }
      if (transaction.getType() == TransactionType.CREDIT) {
        credit = credit.add(transaction.getAmount());
      } else {
        debit = debit.add(transaction.getAmount());
      }
    }

    return new CashSummary(credit, debit, credit.subtract(debit));
  }

  public static GasoilStock calculateGasoilStock(List<GasoilEntryEntity> entries, List<GasoilExitEntity> exits) {
    var inputLiters = entries.stream()
        .filter(entry -> isOfficial(entry.getStatus()))
        .map(GasoilEntryEntity::getLiters)
        .reduce(BigDecimal.ZERO, BigDecimal::add);

    var outputLiters = exits.stream()
        .filter(exit -> isOfficial(exit.getStatus()))
        .map(GasoilExitEntity::getLiters)
        .reduce(BigDecimal.ZERO, BigDecimal::add);

    return new GasoilStock(inputLiters, outputLiters, inputLiters.subtract(outputLiters));
  }

  public static BigDecimal calculateEquipmentCost(EquipmentTimesheetEntity timesheet) {
    if (timesheet.getAppliedBillingMode() == BillingMode.HEURE) {
      return nvl(timesheet.getHoursWorked()).multiply(nvl(timesheet.getAppliedHourlyRate()));
    }
    if (timesheet.getAppliedBillingMode() == BillingMode.JOUR) {
      return nvl(timesheet.getDaysBilled()).multiply(nvl(timesheet.getAppliedDailyRate()));
    }
    return BigDecimal.ZERO;
  }

  public static BigDecimal calculateEquipmentCost(List<EquipmentTimesheetEntity> timesheets) {
    return timesheets.stream()
        .filter(item -> isOfficial(item.getStatus()))
        .map(CalculationService::calculateEquipmentCost)
        .reduce(BigDecimal.ZERO, BigDecimal::add);
  }

  public static BigDecimal calculatePersonnelDue(PersonnelTimesheetEntity timesheet) {
    if (timesheet.getDayType() == DayType.ABSENCE) {
      return BigDecimal.ZERO;
    }

    if (timesheet.getAppliedRemunerationType() == RemunerationType.HEURE) {
      return nvl(timesheet.getHoursWorked()).multiply(nvl(timesheet.getAppliedHourlyRate()));
    }

    if (timesheet.getAppliedRemunerationType() == RemunerationType.JOUR) {
      var factor = timesheet.getDayType() == DayType.DEMI_JOURNEE ? new BigDecimal("0.5") : BigDecimal.ONE;
      return factor.multiply(nvl(timesheet.getAppliedDailyRate()));
    }

    var hourlyRate = timesheet.getAppliedHourlyRate();
    if (hourlyRate == null && timesheet.getAppliedMonthlySalary() != null) {
      hourlyRate = timesheet.getAppliedMonthlySalary().divide(new BigDecimal("234"), MathContext.DECIMAL64);
    }
    return nvl(timesheet.getHoursWorked()).multiply(nvl(hourlyRate)).setScale(2, RoundingMode.HALF_UP);
  }

  public static BigDecimal calculatePersonnelDue(List<PersonnelTimesheetEntity> timesheets) {
    return timesheets.stream()
        .filter(item -> isOfficial(item.getStatus()))
        .map(CalculationService::calculatePersonnelDue)
        .reduce(BigDecimal.ZERO, BigDecimal::add);
  }

  public static BigDecimal calculatePersonnelAdvances(List<PersonnelAdvanceEntity> advances) {
    return advances.stream()
        .filter(item -> isOfficial(item.getStatus()))
        .map(PersonnelAdvanceEntity::getAmount)
        .reduce(BigDecimal.ZERO, BigDecimal::add);
  }

  private static BigDecimal nvl(BigDecimal value) {
    return value == null ? BigDecimal.ZERO : value;
  }

  public record CashSummary(BigDecimal credit, BigDecimal debit, BigDecimal balance) {
  }

  public record GasoilStock(BigDecimal inputLiters, BigDecimal outputLiters, BigDecimal stockLiters) {
  }
}
