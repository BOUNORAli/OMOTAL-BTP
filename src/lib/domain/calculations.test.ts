import { describe, expect, it } from "vitest";
import {
  calculateCashSummary,
  calculateEquipmentTimesheetCost,
  calculateGasoilStock,
  calculatePersonnelTimesheetDue,
  buildDashboardSummary,
} from "./calculations";
import type { CaisseTransaction, EquipmentTimesheet, GasoilEntry, GasoilExit, PersonnelTimesheet, Production } from "./types";

describe("calculs caisse", () => {
  it("ignore les transactions non validees dans le solde officiel", () => {
    const transactions: CaisseTransaction[] = [
      {
        id: "t1",
        date: "2026-05-01",
        chantierId: "c1",
        type: "credit",
        amount: 1000,
        paymentMode: "banque_omotal",
        category: "financement",
        description: "credit",
        status: "valide",
        hasDocument: true,
        enteredByUserId: "u1",
      },
      {
        id: "t2",
        date: "2026-05-02",
        chantierId: "c1",
        type: "debit",
        amount: 300,
        paymentMode: "banque_omotal",
        category: "gasoil",
        description: "debit",
        status: "soumis",
        hasDocument: true,
        enteredByUserId: "u1",
      },
    ];

    expect(calculateCashSummary(transactions)).toEqual({
      credit: 1000,
      debit: 0,
      balance: 1000,
    });
  });
});

describe("calculs gasoil", () => {
  it("calcule le stock theorique avec les entrees et sorties validees", () => {
    const entries: GasoilEntry[] = [
      {
        id: "e1",
        date: "2026-05-01",
        chantierId: "c1",
        supplierId: "s1",
        liters: 1000,
        unitPrice: 12,
        status: "valide",
        hasDocument: true,
        enteredByUserId: "u1",
      },
    ];
    const exits: GasoilExit[] = [
      {
        id: "x1",
        date: "2026-05-02",
        chantierId: "c1",
        equipmentId: "eq1",
        responsible: "Said",
        allocation: "production",
        liters: 120,
        unitPrice: 12,
        status: "valide",
        hasDocument: true,
        enteredByUserId: "u2",
      },
      {
        id: "x2",
        date: "2026-05-02",
        chantierId: "c1",
        equipmentId: "eq1",
        responsible: "Said",
        allocation: "production",
        liters: 80,
        unitPrice: 12,
        status: "soumis",
        hasDocument: true,
        enteredByUserId: "u2",
      },
    ];

    expect(calculateGasoilStock(entries, exits)).toEqual({
      inputLiters: 1000,
      outputLiters: 120,
      stockLiters: 880,
    });
  });
});

describe("calculs engins", () => {
  it("calcule une location horaire", () => {
    const timesheet: EquipmentTimesheet = {
      id: "p1",
      date: "2026-05-01",
      chantierId: "c1",
      equipmentId: "eq1",
      driver: "Said",
      hoursWorked: 8,
      activityType: "production",
      appliedBillingMode: "heure",
      appliedHourlyRate: 350,
      status: "valide",
    };

    expect(calculateEquipmentTimesheetCost(timesheet)).toBe(2800);
  });

  it("calcule une location journaliere", () => {
    const timesheet: EquipmentTimesheet = {
      id: "p1",
      date: "2026-05-01",
      chantierId: "c1",
      equipmentId: "eq1",
      driver: "Mustapha",
      daysBilled: 2,
      activityType: "reglage",
      appliedBillingMode: "jour",
      appliedDailyRate: 2600,
      status: "valide",
    };

    expect(calculateEquipmentTimesheetCost(timesheet)).toBe(5200);
  });
});

describe("calculs personnel", () => {
  it("calcule le salaire horaire par defaut depuis le salaire mensuel", () => {
    const timesheet: PersonnelTimesheet = {
      id: "p1",
      date: "2026-05-01",
      chantierId: "c1",
      employeeId: "emp1",
      hoursWorked: 9,
      dayType: "normal",
      appliedRemunerationType: "mois",
      appliedMonthlySalary: 4680,
      status: "valide",
    };

    expect(calculatePersonnelTimesheetDue(timesheet)).toBe(180);
  });
});

describe("dashboard production", () => {
  it("ajoute les quantites, rendements et couts de production officiels", () => {
    const productions: Production[] = [
      {
        id: "prod-1",
        chantierId: "c1",
        date: "2026-06-01",
        voie: "VOIE1",
        workType: "Deblai",
        quantity: 450,
        unit: "m3",
        hours: 9,
        totalAllocatedCost: 9000,
        status: "valide",
      },
      {
        id: "prod-2",
        chantierId: "c1",
        date: "2026-06-02",
        voie: "VOIE2",
        workType: "Reglage",
        quantity: 100,
        unit: "m2",
        hours: 2,
        totalAllocatedCost: 1000,
        status: "soumis",
      },
    ];

    const summary = buildDashboardSummary({
      chantierId: "c1",
      transactions: [],
      gasoilEntries: [],
      gasoilExits: [],
      personnelTimesheets: [],
      personnelAdvances: [],
      equipment: [],
      equipmentTimesheets: [],
      productions,
      highPaymentThreshold: 30000,
    });

    expect(summary.productionQuantity).toBe(450);
    expect(summary.productionHours).toBe(9);
    expect(summary.productionCost).toBe(9000);
    expect(summary.productionRendement).toBe(50);
    expect(summary.productionCostPerUnit).toBe(20);
  });
});
