import {
  activeChantier,
  chantiers,
  dashboardSummary,
  employees,
  equipment,
  equipmentTimesheets,
  gasoilEntries,
  gasoilExits,
  personnelAdvances,
  personnelTimesheets,
  productions,
  suppliers,
  transactions,
  users,
} from "@/lib/domain/mock-data";
import { buildDashboardSummary, calculateGasoilStock } from "@/lib/domain/calculations";
import type { GasoilExit, Production } from "@/lib/domain/types";

const wait = (ms = 180) => new Promise((resolve) => setTimeout(resolve, ms));

export const authService = {
  async getUsers() {
    await wait();
    return users;
  },
};

export const chantierService = {
  async list() {
    await wait();
    return chantiers;
  },

  async getById(chantierId: string) {
    await wait();
    return chantiers.find((chantier) => chantier.id === chantierId) ?? activeChantier;
  },
};

export const dashboardService = {
  async global() {
    await wait();
    const stock = calculateGasoilStock(gasoilEntries, gasoilExits);

    return {
      activeChantiers: chantiers.filter((chantier) => chantier.status === "en_cours").length,
      totalExpenses: dashboardSummary.cashDebit,
      cashBalance: dashboardSummary.cashBalance,
      gasoilStock: stock.stockLiters,
      pendingValidations: dashboardSummary.pendingValidations,
      criticalAlerts: dashboardSummary.alerts.filter((alert) => alert.severity === "critical").length,
      chantiers: chantiers.map((chantier) => ({
        ...chantier,
        expensesMonth: chantier.id === activeChantier.id ? dashboardSummary.cashDebit : Math.round(Math.random() * 50000 + 12000),
        gasoilStock: chantier.id === activeChantier.id ? stock.stockLiters : Math.round(Math.random() * 700 + 120),
        alerts: chantier.id === activeChantier.id ? dashboardSummary.alerts.length : Math.round(Math.random() * 3),
        production: chantier.id === activeChantier.id ? 1477 : Math.round(Math.random() * 900 + 200),
      })),
    };
  },

  async chantier(chantierId: string) {
    await wait();
    return buildDashboardSummary({
      chantierId,
      transactions: transactions.filter((item) => item.chantierId === chantierId),
      gasoilEntries: gasoilEntries.filter((item) => item.chantierId === chantierId),
      gasoilExits: gasoilExits.filter((item) => item.chantierId === chantierId),
      personnelTimesheets: personnelTimesheets.filter((item) => item.chantierId === chantierId),
      personnelAdvances: personnelAdvances.filter((item) => item.chantierId === chantierId),
      equipment: equipment.filter((item) => item.chantierId === chantierId),
      equipmentTimesheets: equipmentTimesheets.filter((item) => item.chantierId === chantierId),
      highPaymentThreshold: 30000,
    });
  },
};

export const caisseService = {
  async listTransactions() {
    await wait();
    return transactions;
  },
};

export const gasoilService = {
  async overview(chantierId: string) {
    await wait();
    const entries = gasoilEntries.filter((entry) => entry.chantierId === chantierId);
    const exits = gasoilExits.filter((exit) => exit.chantierId === chantierId);
    return {
      entries,
      exits,
      stock: calculateGasoilStock(entries, exits),
    };
  },

  async createSortie(input: Pick<GasoilExit, "equipmentId" | "liters" | "allocation" | "responsible">) {
    await wait(260);
    return {
      id: `gasoil-exit-${Date.now()}`,
      date: new Date().toISOString(),
      chantierId: activeChantier.id,
      unitPrice: 11.8,
      status: "soumis" as const,
      hasDocument: false,
      enteredByUserId: "user-ayoub",
      ...input,
    };
  },
};

export const personnelService = {
  async list() {
    await wait();
    return {
      employees,
      timesheets: personnelTimesheets,
      advances: personnelAdvances,
    };
  },
};

export const enginsService = {
  async list() {
    await wait();
    return {
      equipment,
      timesheets: equipmentTimesheets,
    };
  },
};

export const productionService = {
  async list() {
    await wait();
    return productions;
  },

  async create(input: Omit<Production, "id" | "status" | "date" | "chantierId">) {
    await wait(260);
    return {
      id: `production-${Date.now()}`,
      chantierId: activeChantier.id,
      date: new Date().toISOString(),
      status: "soumis" as const,
      ...input,
    };
  },
};

export const fournisseurService = {
  async list() {
    await wait();
    return suppliers;
  },
};

export const validationService = {
  async listPending() {
    await wait();
    return [
      ...gasoilExits
        .filter((item) => item.status === "soumis")
        .map((item) => ({
          id: item.id,
          type: "Sortie gasoil",
          chantierId: item.chantierId,
          date: item.date,
          summary: `${item.liters} L - ${item.responsible}`,
          amountOrQuantity: `${item.liters} L`,
          status: item.status,
          hasDocument: item.hasDocument,
        })),
      ...equipmentTimesheets
        .filter((item) => item.status === "soumis")
        .map((item) => ({
          id: item.id,
          type: "Pointage engin",
          chantierId: item.chantierId,
          date: item.date,
          summary: `${item.driver} - ${item.hoursWorked ?? item.daysBilled ?? 0}`,
          amountOrQuantity: item.hoursWorked ? `${item.hoursWorked} h` : `${item.daysBilled} j`,
          status: item.status,
          hasDocument: false,
        })),
      ...productions
        .filter((item) => item.status === "soumis")
        .map((item) => ({
          id: item.id,
          type: "Production",
          chantierId: item.chantierId,
          date: item.date,
          summary: `${item.workType} - ${item.voie}`,
          amountOrQuantity: `${item.quantity} ${item.unit}`,
          status: item.status,
          hasDocument: false,
        })),
      ...transactions
        .filter((item) => item.status === "soumis")
        .map((item) => ({
          id: item.id,
          type: "Transaction elevee",
          chantierId: item.chantierId,
          date: item.date,
          summary: item.description,
          amountOrQuantity: `${item.amount} DH`,
          status: item.status,
          hasDocument: item.hasDocument,
        })),
    ];
  },
};

export const alertService = {
  async list() {
    await wait();
    return dashboardSummary.alerts;
  },
};
