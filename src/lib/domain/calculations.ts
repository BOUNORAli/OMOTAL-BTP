import type {
  Alert,
  CaisseTransaction,
  DashboardSummary,
  Equipment,
  EquipmentTimesheet,
  GasoilEntry,
  GasoilExit,
  OperationStatus,
  PersonnelAdvance,
  PersonnelTimesheet,
} from "./types";

const officialStatuses: OperationStatus[] = ["valide", "verrouille"];

export function isOfficial(status: OperationStatus): boolean {
  return officialStatuses.includes(status);
}

export function calculateCashSummary(transactions: CaisseTransaction[]) {
  return transactions.filter((transaction) => isOfficial(transaction.status)).reduce(
    (summary, transaction) => {
      if (transaction.type === "credit") {
        summary.credit += transaction.amount;
      } else {
        summary.debit += transaction.amount;
      }

      summary.balance = summary.credit - summary.debit;
      return summary;
    },
    { credit: 0, debit: 0, balance: 0 },
  );
}

export function calculateGasoilStock(entries: GasoilEntry[], exits: GasoilExit[]) {
  const inputLiters = entries
    .filter((entry) => isOfficial(entry.status))
    .reduce((total, entry) => total + entry.liters, 0);

  const outputLiters = exits
    .filter((exit) => isOfficial(exit.status))
    .reduce((total, exit) => total + exit.liters, 0);

  return {
    inputLiters,
    outputLiters,
    stockLiters: inputLiters - outputLiters,
  };
}

export function calculateEquipmentTimesheetCost(timesheet: EquipmentTimesheet): number {
  if (timesheet.appliedBillingMode === "heure") {
    return (timesheet.hoursWorked ?? 0) * (timesheet.appliedHourlyRate ?? 0);
  }

  if (timesheet.appliedBillingMode === "jour") {
    return (timesheet.daysBilled ?? 0) * (timesheet.appliedDailyRate ?? 0);
  }

  return 0;
}

export function calculateEquipmentCost(timesheets: EquipmentTimesheet[]): number {
  return timesheets
    .filter((timesheet) => isOfficial(timesheet.status))
    .reduce((total, timesheet) => total + calculateEquipmentTimesheetCost(timesheet), 0);
}

export function calculatePersonnelTimesheetDue(timesheet: PersonnelTimesheet): number {
  if (timesheet.dayType === "absence") {
    return 0;
  }

  if (timesheet.appliedRemunerationType === "heure") {
    return timesheet.hoursWorked * (timesheet.appliedHourlyRate ?? 0);
  }

  if (timesheet.appliedRemunerationType === "jour") {
    const dayFactor = timesheet.dayType === "demi_journee" ? 0.5 : 1;
    return dayFactor * (timesheet.appliedDailyRate ?? 0);
  }

  const hourlyRate = timesheet.appliedHourlyRate ?? (timesheet.appliedMonthlySalary ?? 0) / 26 / 9;
  return timesheet.hoursWorked * hourlyRate;
}

export function calculatePersonnelDue(timesheets: PersonnelTimesheet[]): number {
  return timesheets
    .filter((timesheet) => isOfficial(timesheet.status))
    .reduce((total, timesheet) => total + calculatePersonnelTimesheetDue(timesheet), 0);
}

export function calculatePersonnelAdvances(advances: PersonnelAdvance[]): number {
  return advances
    .filter((advance) => isOfficial(advance.status))
    .reduce((total, advance) => total + advance.amount, 0);
}

export function buildAlerts(input: {
  chantierId: string;
  gasoilStockLiters: number;
  gasoilExits: GasoilExit[];
  equipment: Equipment[];
  equipmentTimesheets: EquipmentTimesheet[];
  transactions: CaisseTransaction[];
  highPaymentThreshold: number;
}): Alert[] {
  const alerts: Alert[] = [];

  if (input.gasoilStockLiters < 0) {
    alerts.push({
      id: "alert-stock-negatif",
      severity: "critical",
      title: "Stock gasoil negatif",
      description: "Les sorties validees depassent les entrees validees.",
      module: "gasoil",
      chantierId: input.chantierId,
    });
  }

  input.gasoilExits
    .filter((exit) => isOfficial(exit.status) && !exit.equipmentId)
    .forEach((exit) => {
      alerts.push({
        id: `alert-sortie-sans-engin-${exit.id}`,
        severity: "warning",
        title: "Sortie gasoil sans engin",
        description: `${exit.liters} L saisis le ${exit.date} sans engin rattache.`,
        module: "gasoil",
        chantierId: exit.chantierId,
      });
    });

  input.equipment
    .filter((item) => item.status === "mobilise" && item.billingMode !== "interne")
    .filter((item) => !item.hourlyRate && !item.dailyRate)
    .forEach((item) => {
      alerts.push({
        id: `alert-engin-sans-tarif-${item.id}`,
        severity: "warning",
        title: "Engin sans tarif",
        description: `${item.designation} est mobilise sans tarif de location.`,
        module: "engins",
        chantierId: item.chantierId,
      });
    });

  input.equipmentTimesheets
    .filter((timesheet) => timesheet.status === "soumis")
    .forEach((timesheet) => {
      alerts.push({
        id: `alert-pointage-attente-${timesheet.id}`,
        severity: "info",
        title: "Pointage engin a valider",
        description: `Pointage du ${timesheet.date} en attente de validation.`,
        module: "engins",
        chantierId: timesheet.chantierId,
      });
    });

  input.transactions
    .filter((transaction) => transaction.type === "debit" && transaction.amount >= input.highPaymentThreshold)
    .filter((transaction) => transaction.status === "soumis")
    .forEach((transaction) => {
      alerts.push({
        id: `alert-depense-elevee-${transaction.id}`,
        severity: "critical",
        title: "Depense elevee en attente",
        description: `${transaction.amount.toLocaleString("fr-MA")} DH attend une approbation.`,
        module: "caisse",
        chantierId: transaction.chantierId,
      });
    });

  return alerts;
}

export function buildDashboardSummary(input: {
  chantierId: string;
  transactions: CaisseTransaction[];
  gasoilEntries: GasoilEntry[];
  gasoilExits: GasoilExit[];
  personnelTimesheets: PersonnelTimesheet[];
  personnelAdvances: PersonnelAdvance[];
  equipment: Equipment[];
  equipmentTimesheets: EquipmentTimesheet[];
  highPaymentThreshold: number;
}): DashboardSummary {
  const cash = calculateCashSummary(input.transactions);
  const gasoil = calculateGasoilStock(input.gasoilEntries, input.gasoilExits);
  const personnelDue = calculatePersonnelDue(input.personnelTimesheets);
  const personnelAdvances = calculatePersonnelAdvances(input.personnelAdvances);
  const equipmentCost = calculateEquipmentCost(input.equipmentTimesheets);

  const pendingValidations = [
    ...input.gasoilExits,
    ...input.equipmentTimesheets,
    ...input.transactions,
  ].filter((operation) => operation.status === "soumis").length;

  const alerts = buildAlerts({
    chantierId: input.chantierId,
    gasoilStockLiters: gasoil.stockLiters,
    gasoilExits: input.gasoilExits,
    equipment: input.equipment,
    equipmentTimesheets: input.equipmentTimesheets,
    transactions: input.transactions,
    highPaymentThreshold: input.highPaymentThreshold,
  });

  return {
    cashBalance: cash.balance,
    cashDebit: cash.debit,
    cashCredit: cash.credit,
    gasoilStockLiters: gasoil.stockLiters,
    gasoilInputLiters: gasoil.inputLiters,
    gasoilOutputLiters: gasoil.outputLiters,
    personnelDue,
    personnelAdvances,
    equipmentCost,
    pendingValidations,
    alerts,
  };
}
