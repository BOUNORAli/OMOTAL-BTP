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
import type {
  BqOverview,
  CaisseTransaction,
  Chantier,
  Employee,
  Equipment,
  EquipmentTimesheet,
  EtpOverview,
  GasoilEntry,
  GasoilExit,
  ImportPreview,
  MaintenanceRecord,
  MaterialPurchase,
  PersonnelTimesheet,
  Production,
  Supplier,
  SupplierPayment,
  TransportRecord,
  User,
} from "@/lib/domain/types";

const wait = (ms = 180) => new Promise((resolve) => setTimeout(resolve, ms));

export const authService = {
  async getUsers() {
    await wait();
    return users;
  },

  async login(email: string) {
    await wait();
    const user = users.find((item) => item.email === email) ?? users[0];
    return {
      token: "mock-token",
      user,
    };
  },

  async createUser(input: Pick<User, "name" | "email" | "role" | "chantierIds"> & { password: string }) {
    await wait(180);
    return {
      id: `user-${Date.now()}`,
      active: true,
      ...input,
    };
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

  async create(input: Omit<Chantier, "id" | "status">) {
    await wait(260);
    return {
      id: `chantier-${Date.now()}`,
      status: "en_cours" as const,
      ...input,
    };
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

  async createTransaction(input: Omit<CaisseTransaction, "id" | "status" | "hasDocument" | "enteredByUserId"> & { submit: boolean }) {
    await wait(260);
    return {
      id: `transaction-${Date.now()}`,
      status: input.submit ? "soumis" as const : "brouillon" as const,
      hasDocument: false,
      enteredByUserId: "user-ali",
      ...input,
    };
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

  async createEntry(input: Omit<GasoilEntry, "id" | "status" | "hasDocument" | "enteredByUserId"> & { submit: boolean }) {
    await wait(260);
    return {
      id: `gasoil-entry-${Date.now()}`,
      status: input.submit ? "valide" as const : "brouillon" as const,
      hasDocument: false,
      enteredByUserId: "user-comptable",
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

  async createEmployee(input: Omit<Employee, "id" | "active">) {
    await wait(260);
    return {
      id: `employee-${Date.now()}`,
      active: true,
      ...input,
    };
  },

  async createTimesheet(input: Pick<PersonnelTimesheet, "date" | "chantierId" | "employeeId" | "hoursWorked" | "dayType"> & { submit: boolean }) {
    await wait(260);
    return {
      id: `personnel-timesheet-${Date.now()}`,
      appliedRemunerationType: "jour" as const,
      status: input.submit ? "valide" as const : "brouillon" as const,
      ...input,
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

  async createEquipment(input: Omit<Equipment, "id" | "status">) {
    await wait(260);
    return {
      id: `equipment-${Date.now()}`,
      status: "mobilise" as const,
      ...input,
    };
  },

  async createTimesheet(input: Pick<EquipmentTimesheet, "date" | "chantierId" | "equipmentId" | "driver" | "hoursWorked" | "daysBilled" | "activityType"> & { submit: boolean }) {
    await wait(260);
    return {
      id: `equipment-timesheet-${Date.now()}`,
      appliedBillingMode: "heure" as const,
      status: input.submit ? "soumis" as const : "brouillon" as const,
      ...input,
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

  async create(input: Pick<Supplier, "name" | "type" | "phone">) {
    await wait(260);
    return {
      id: `supplier-${Date.now()}`,
      active: true,
      ...input,
    };
  },

  async listPayments(): Promise<SupplierPayment[]> {
    await wait();
    return [];
  },

  async createPayment(input: Omit<SupplierPayment, "id" | "status"> & { submit: boolean }) {
    await wait(260);
    return {
      id: `supplier-payment-${Date.now()}`,
      status: input.submit ? "valide" as const : "brouillon" as const,
      ...input,
    };
  },
};

export const matieresService = {
  async listPurchases(): Promise<MaterialPurchase[]> {
    await wait();
    return [];
  },

  async createPurchase(input: Omit<MaterialPurchase, "id" | "status" | "hasDocument" | "totalHt" | "totalTtc" | "paidAmount" | "remainingAmount"> & { submit: boolean }) {
    await wait(260);
    const totalHt = input.quantity * input.unitPriceHt + (input.transportHt ?? 0);
    const totalTtc = totalHt * (1 + (input.vatRate ?? 0) / 100);
    return {
      id: `material-${Date.now()}`,
      totalHt,
      totalTtc,
      paidAmount: 0,
      remainingAmount: totalTtc,
      hasDocument: false,
      status: input.submit ? "soumis" as const : "brouillon" as const,
      ...input,
    };
  },
};

export const etpService = {
  async overview(): Promise<EtpOverview> {
    await wait();
    return { prestations: [], imputations: [], totalPrestations: 0, totalImputations: 0, remainingAmount: 0 };
  },
};

export const transportService = {
  async list(): Promise<TransportRecord[]> {
    await wait();
    return [];
  },

  async create(input: Omit<TransportRecord, "id" | "status" | "hasDocument" | "totalAmount"> & { submit: boolean }) {
    await wait(260);
    return {
      id: `transport-${Date.now()}`,
      totalAmount: input.trips * input.unitPrice,
      hasDocument: false,
      status: input.submit ? "soumis" as const : "brouillon" as const,
      ...input,
    };
  },
};

export const entretienService = {
  async list(): Promise<MaintenanceRecord[]> {
    await wait();
    return [];
  },

  async create(input: Omit<MaintenanceRecord, "id" | "status" | "hasDocument" | "totalAmount"> & { submit: boolean }) {
    await wait(260);
    return {
      id: `maintenance-${Date.now()}`,
      totalAmount: input.quantity * input.unitPrice,
      hasDocument: false,
      status: input.submit ? "soumis" as const : "brouillon" as const,
      ...input,
    };
  },
};

export const bqService = {
  async overview(): Promise<BqOverview> {
    await wait();
    return { articles: [], realisations: [] };
  },
};

export const importService = {
  async preview(file: File): Promise<ImportPreview> {
    await wait(260);
    return { fileName: file.name, sheetName: "Feuil1", headers: [], sampleRows: [], errors: [] };
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

  async validate() {
    await wait(180);
  },

  async reject() {
    await wait(180);
  },
};

export const alertService = {
  async list() {
    await wait();
    return dashboardSummary.alerts;
  },
};

export const documentService = {
  async list() {
    await wait();
    return [];
  },

  async upload(input: {
    chantierId: string;
    documentType: string;
    module: string;
    targetType: string;
    targetId: string;
    file: File;
  }) {
    await wait(260);
    return {
      id: `document-${Date.now()}`,
      chantierId: input.chantierId,
      documentType: input.documentType,
      fileName: input.file.name,
      contentType: input.file.type,
      sizeBytes: input.file.size,
      module: input.module,
      targetType: input.targetType,
      targetId: input.targetId,
    };
  },
};

export const exportService = {
  async download(input: {
    type: "caisse" | "gasoil" | "personnel" | "engins" | "dashboard";
    chantierId: string;
    from?: string;
    to?: string;
    onlyValidated?: boolean;
  }) {
    await wait(220);
    const lines = [
      "Rapport;OMOTAL TRAVAUX",
      `Type;${input.type}`,
      `Chantier;${input.chantierId}`,
      `Periode;${input.from ?? "debut"} au ${input.to ?? "fin"}`,
      `Filtre;${input.onlyValidated === false ? "toutes operations" : "valide uniquement"}`,
    ];
    return new Blob([lines.join("\n")], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
  },
};
