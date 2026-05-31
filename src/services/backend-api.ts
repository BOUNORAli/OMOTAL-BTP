import { activeChantier, productions } from "@/lib/domain/mock-data";
import type {
  Alert,
  CaisseTransaction,
  Chantier,
  DashboardSummary,
  DocumentRecord,
  Employee,
  Equipment,
  EquipmentTimesheet,
  GasoilEntry,
  GasoilExit,
  PersonnelAdvance,
  PersonnelTimesheet,
  Production,
  Supplier,
  User,
} from "@/lib/domain/types";
import { apiDownload, apiFetch, getPersistedSelectedChantierId, normalizeRole } from "./api-client";

type BackendUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
  chantierIds: string[];
};

type BackendChantier = {
  id: string;
  name: string;
  code: string;
  client: string;
  location: string;
  startedAt: string;
  expectedEndAt?: string;
  marketAmountHt?: number;
  status: string;
  managerUserId: string;
};

type BackendTransaction = {
  id: string;
  date: string;
  chantierId: string;
  type: string;
  amount: number;
  paymentMode: string;
  category: string;
  description: string;
  personOrSupplier?: string;
  status: string;
  hasDocument: boolean;
  enteredByUserId: string;
};

type BackendGasoilEntry = {
  id: string;
  date: string;
  chantierId: string;
  supplierId: string;
  liters: number;
  unitPrice: number;
  receiptNumber?: string;
  status: string;
  hasDocument: boolean;
};

type BackendGasoilExit = {
  id: string;
  date: string;
  chantierId: string;
  equipmentId?: string;
  responsible: string;
  allocation: string;
  liters: number;
  unitPrice: number;
  exitNumber?: string;
  status: string;
  hasDocument: boolean;
  enteredByUserId: string;
};

type BackendEquipment = {
  id: string;
  designation: string;
  type: string;
  owner: string;
  chantierId: string;
  billingMode: string;
  hourlyRate?: number;
  dailyRate?: number;
  usualDriver?: string;
  status: string;
};

type BackendEquipmentTimesheet = {
  id: string;
  date: string;
  chantierId: string;
  equipmentId: string;
  driver: string;
  hoursWorked?: number;
  daysBilled?: number;
  activityType: string;
  appliedBillingMode: string;
  status: string;
};

type BackendEmployee = {
  id: string;
  firstName: string;
  lastName: string;
  position: string;
  chantierId: string;
  remunerationType: string;
  monthlySalary?: number;
  dailySalary?: number;
  hourlySalary?: number;
  active: boolean;
};

type BackendPersonnelTimesheet = {
  id: string;
  date: string;
  chantierId: string;
  employeeId: string;
  hoursWorked: number;
  dayType: string;
  appliedRemunerationType: string;
  status: string;
};

type BackendPersonnelAdvance = {
  id: string;
  date: string;
  chantierId: string;
  employeeId: string;
  amount: number;
  transactionId?: string;
  status: string;
};

type BackendSupplier = {
  id: string;
  name: string;
  type: string;
  phone?: string;
  active: boolean;
};

type BackendAlert = {
  id: string;
  severity: string;
  module: string;
  chantierId: string;
  title: string;
  description: string;
};

type BackendValidationItem = {
  id: string;
  type: string;
  chantierId: string;
  date: string;
  summary: string;
  amountOrQuantity: string;
  status: string;
  hasDocument: boolean;
};

type BackendDocument = {
  id: string;
  chantierId: string;
  documentType: string;
  fileName: string;
  contentType: string;
  sizeBytes: number;
  module: string;
  targetType: string;
  targetId: string;
};

type BackendDashboardSummary = {
  cashBalance: number;
  cashDebit: number;
  cashCredit: number;
  gasoilStockLiters: number;
  gasoilInputLiters: number;
  gasoilOutputLiters: number;
  personnelDue: number;
  personnelAdvances: number;
  equipmentCost: number;
  pendingValidations: number;
  alerts: BackendAlert[];
};

function userFromBackend(user: BackendUser): User {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: normalizeRole(user.role),
    chantierIds: user.chantierIds,
    active: user.active,
  };
}

function status(value: string) {
  return value.toLowerCase() as never;
}

function equipmentType(value: string): Equipment["type"] {
  return value.toLowerCase() as Equipment["type"];
}

function chantierFromBackend(item: BackendChantier): Chantier {
  return {
    id: item.id,
    name: item.name,
    code: item.code,
    client: item.client,
    location: item.location,
    startedAt: item.startedAt,
    expectedEndAt: item.expectedEndAt,
    marketAmountHt: item.marketAmountHt,
    status: status(item.status),
    managerUserId: item.managerUserId,
  };
}

function transactionFromBackend(item: BackendTransaction): CaisseTransaction {
  return {
    id: item.id,
    date: item.date,
    chantierId: item.chantierId,
    type: status(item.type),
    amount: item.amount,
    paymentMode: status(item.paymentMode),
    category: status(item.category),
    description: item.description,
    personOrSupplier: item.personOrSupplier,
    status: status(item.status),
    hasDocument: item.hasDocument,
    enteredByUserId: item.enteredByUserId,
  };
}

function gasoilEntryFromBackend(item: BackendGasoilEntry): GasoilEntry {
  return {
    id: item.id,
    date: item.date,
    chantierId: item.chantierId,
    supplierId: item.supplierId,
    liters: item.liters,
    unitPrice: item.unitPrice,
    receiptNumber: item.receiptNumber,
    status: status(item.status),
    hasDocument: item.hasDocument,
    enteredByUserId: "",
  };
}

function gasoilExitFromBackend(item: BackendGasoilExit): GasoilExit {
  return {
    id: item.id,
    date: item.date,
    chantierId: item.chantierId,
    equipmentId: item.equipmentId,
    responsible: item.responsible,
    allocation: status(item.allocation),
    liters: item.liters,
    unitPrice: item.unitPrice,
    exitNumber: item.exitNumber,
    status: status(item.status),
    hasDocument: item.hasDocument,
    enteredByUserId: item.enteredByUserId,
  };
}

function equipmentFromBackend(item: BackendEquipment): Equipment {
  return {
    id: item.id,
    designation: item.designation,
    type: equipmentType(item.type),
    owner: item.owner,
    chantierId: item.chantierId,
    billingMode: status(item.billingMode),
    hourlyRate: item.hourlyRate,
    dailyRate: item.dailyRate,
    usualDriver: item.usualDriver,
    status: status(item.status),
  };
}

function equipmentTimesheetFromBackend(item: BackendEquipmentTimesheet): EquipmentTimesheet {
  return {
    id: item.id,
    date: item.date,
    chantierId: item.chantierId,
    equipmentId: item.equipmentId,
    driver: item.driver,
    hoursWorked: item.hoursWorked,
    daysBilled: item.daysBilled,
    activityType: status(item.activityType),
    appliedBillingMode: status(item.appliedBillingMode),
    appliedHourlyRate: undefined,
    appliedDailyRate: undefined,
    status: status(item.status),
  };
}

function employeeFromBackend(item: BackendEmployee): Employee {
  return {
    id: item.id,
    firstName: item.firstName,
    lastName: item.lastName,
    position: item.position,
    chantierId: item.chantierId,
    remunerationType: status(item.remunerationType),
    monthlySalary: item.monthlySalary,
    dailySalary: item.dailySalary,
    hourlySalary: item.hourlySalary,
    active: item.active,
  };
}

function personnelTimesheetFromBackend(item: BackendPersonnelTimesheet): PersonnelTimesheet {
  return {
    id: item.id,
    date: item.date,
    chantierId: item.chantierId,
    employeeId: item.employeeId,
    hoursWorked: item.hoursWorked,
    dayType: status(item.dayType),
    appliedRemunerationType: status(item.appliedRemunerationType),
    status: status(item.status),
  };
}

function personnelAdvanceFromBackend(item: BackendPersonnelAdvance): PersonnelAdvance {
  return {
    id: item.id,
    date: item.date,
    chantierId: item.chantierId,
    employeeId: item.employeeId,
    amount: item.amount,
    transactionId: item.transactionId,
    status: status(item.status),
  };
}

function supplierFromBackend(item: BackendSupplier): Supplier {
  return {
    id: item.id,
    name: item.name,
    type: status(item.type),
    phone: item.phone,
    active: item.active,
  };
}

function documentFromBackend(item: BackendDocument): DocumentRecord {
  return {
    id: item.id,
    chantierId: item.chantierId,
    documentType: item.documentType,
    fileName: item.fileName,
    contentType: item.contentType,
    sizeBytes: item.sizeBytes,
    module: item.module,
    targetType: item.targetType,
    targetId: item.targetId,
  };
}

function upper(value: string) {
  return value.toUpperCase();
}

export const backendAuthService = {
  async login(email: string, password: string) {
    const payload = await apiFetch<{ token: string; user: BackendUser }>("/api/v1/auth/login", {
      method: "POST",
      auth: false,
      body: JSON.stringify({ email, password }),
    });

    return {
      token: payload.token,
      user: userFromBackend(payload.user),
    };
  },
  async getUsers() {
    const data = await apiFetch<BackendUser[]>("/api/v1/users");
    return data.map(userFromBackend);
  },
  async createUser(input: Pick<User, "name" | "email" | "role" | "chantierIds"> & { password: string }) {
    const data = await apiFetch<BackendUser>("/api/v1/users", {
      method: "POST",
      body: JSON.stringify({
        ...input,
        role: upper(input.role),
      }),
    });
    return userFromBackend(data);
  },
};

export const backendApi = {
  chantierService: {
    async list() {
      const data = await apiFetch<BackendChantier[]>("/api/v1/chantiers");
      return data.map(chantierFromBackend);
    },
    async getById(chantierId: string) {
      return chantierFromBackend(await apiFetch(`/api/v1/chantiers/${chantierId}`));
    },
    async create(input: Omit<Chantier, "id" | "status">) {
      return chantierFromBackend(await apiFetch<BackendChantier>("/api/v1/chantiers", {
        method: "POST",
        body: JSON.stringify(input),
      }));
    },
  },
  dashboardService: {
    async global() {
      const data = await apiFetch<{ activeChantiers: number; chantiers: BackendChantier[] }>("/api/v1/dashboard/global");
      return {
        activeChantiers: data.activeChantiers,
        totalExpenses: 0,
        cashBalance: 0,
        gasoilStock: 0,
        pendingValidations: 0,
        criticalAlerts: 0,
        chantiers: data.chantiers.map((chantier) => ({
          ...chantierFromBackend(chantier),
          expensesMonth: 0,
          gasoilStock: 0,
          alerts: 0,
          production: 0,
        })),
      };
    },
    async chantier(chantierId: string): Promise<DashboardSummary> {
      const data = await apiFetch<BackendDashboardSummary>(`/api/v1/dashboard/chantier/${chantierId}`);
      return {
        cashBalance: data.cashBalance,
        cashDebit: data.cashDebit,
        cashCredit: data.cashCredit,
        gasoilStockLiters: data.gasoilStockLiters,
        gasoilInputLiters: data.gasoilInputLiters,
        gasoilOutputLiters: data.gasoilOutputLiters,
        personnelDue: data.personnelDue,
        personnelAdvances: data.personnelAdvances,
        equipmentCost: data.equipmentCost,
        pendingValidations: data.pendingValidations,
        alerts: data.alerts.map((alert) => ({
          id: alert.id,
          severity: alert.severity.toLowerCase() as Alert["severity"],
          title: alert.title,
          description: alert.description,
          module: alert.module as Alert["module"],
          chantierId: alert.chantierId,
        })),
      };
    },
  },
  caisseService: {
    async listTransactions() {
      const data = await apiFetch<BackendTransaction[]>("/api/v1/caisse/transactions");
      return data.map(transactionFromBackend);
    },
    async createTransaction(input: Omit<CaisseTransaction, "id" | "status" | "hasDocument" | "enteredByUserId"> & { submit: boolean }) {
      return transactionFromBackend(await apiFetch<BackendTransaction>("/api/v1/caisse/transactions", {
        method: "POST",
        body: JSON.stringify({
          ...input,
          type: upper(input.type),
          paymentMode: upper(input.paymentMode),
          category: upper(input.category),
        }),
      }));
    },
  },
  gasoilService: {
    async overview(chantierId: string) {
      const data = await apiFetch<{
        entries: BackendGasoilEntry[];
        exits: BackendGasoilExit[];
        inputLiters: number;
        outputLiters: number;
        stockLiters: number;
      }>(`/api/v1/gasoil/overview?chantierId=${chantierId}`);
      return {
        entries: data.entries.map(gasoilEntryFromBackend),
        exits: data.exits.map(gasoilExitFromBackend),
        stock: {
          inputLiters: data.inputLiters,
          outputLiters: data.outputLiters,
          stockLiters: data.stockLiters,
        },
      };
    },
    async createSortie(input: Pick<GasoilExit, "equipmentId" | "liters" | "allocation" | "responsible">) {
      const payload = {
        date: new Date().toISOString().slice(0, 10),
        chantierId: getPersistedSelectedChantierId() ?? activeChantier.id,
        unitPrice: 11.8,
        submit: true,
        ...input,
      };
      return gasoilExitFromBackend(await apiFetch("/api/v1/gasoil/exits", {
        method: "POST",
        body: JSON.stringify({
          ...payload,
          allocation: upper(payload.allocation),
        }),
      }));
    },
    async createEntry(input: Omit<GasoilEntry, "id" | "status" | "hasDocument" | "enteredByUserId"> & { submit: boolean }) {
      return gasoilEntryFromBackend(await apiFetch<BackendGasoilEntry>("/api/v1/gasoil/entries", {
        method: "POST",
        body: JSON.stringify(input),
      }));
    },
  },
  personnelService: {
    async list() {
      const data = await apiFetch<{
        employees: BackendEmployee[];
        timesheets: BackendPersonnelTimesheet[];
        advances: BackendPersonnelAdvance[];
      }>("/api/v1/personnel");
      return {
        employees: data.employees.map(employeeFromBackend),
        timesheets: data.timesheets.map(personnelTimesheetFromBackend),
        advances: data.advances.map(personnelAdvanceFromBackend),
      };
    },
    async createEmployee(input: Omit<Employee, "id" | "active">) {
      return employeeFromBackend(await apiFetch<BackendEmployee>("/api/v1/personnel/employees", {
        method: "POST",
        body: JSON.stringify({
          ...input,
          remunerationType: upper(input.remunerationType),
        }),
      }));
    },
    async createTimesheet(input: Pick<PersonnelTimesheet, "date" | "chantierId" | "employeeId" | "hoursWorked" | "dayType"> & { submit: boolean }) {
      return personnelTimesheetFromBackend(await apiFetch<BackendPersonnelTimesheet>("/api/v1/personnel/timesheets", {
        method: "POST",
        body: JSON.stringify({
          ...input,
          dayType: upper(input.dayType),
        }),
      }));
    },
  },
  enginsService: {
    async list() {
      const data = await apiFetch<{
        equipment: BackendEquipment[];
        timesheets: BackendEquipmentTimesheet[];
      }>("/api/v1/engins");
      return {
        equipment: data.equipment.map(equipmentFromBackend),
        timesheets: data.timesheets.map(equipmentTimesheetFromBackend),
      };
    },
    async createEquipment(input: Omit<Equipment, "id" | "status">) {
      return equipmentFromBackend(await apiFetch<BackendEquipment>("/api/v1/engins", {
        method: "POST",
        body: JSON.stringify({
          ...input,
          billingMode: upper(input.billingMode),
        }),
      }));
    },
    async createTimesheet(input: Pick<EquipmentTimesheet, "date" | "chantierId" | "equipmentId" | "driver" | "hoursWorked" | "daysBilled" | "activityType"> & { submit: boolean }) {
      return equipmentTimesheetFromBackend(await apiFetch<BackendEquipmentTimesheet>("/api/v1/engins/timesheets", {
        method: "POST",
        body: JSON.stringify({
          ...input,
          activityType: upper(input.activityType),
        }),
      }));
    },
  },
  productionService: {
    async list() {
      return productions;
    },
    async create(input: Omit<Production, "id" | "status" | "date" | "chantierId">) {
      return {
        id: `production-local-${Date.now()}`,
        chantierId: getPersistedSelectedChantierId() ?? activeChantier.id,
        date: new Date().toISOString(),
        status: "soumis" as const,
        ...input,
      };
    },
  },
  fournisseurService: {
    async list() {
      const data = await apiFetch<BackendSupplier[]>("/api/v1/fournisseurs");
      return data.map(supplierFromBackend);
    },
    async create(input: Pick<Supplier, "name" | "type" | "phone">) {
      return supplierFromBackend(await apiFetch<BackendSupplier>("/api/v1/fournisseurs", {
        method: "POST",
        body: JSON.stringify({
          ...input,
          type: upper(input.type),
        }),
      }));
    },
  },
  validationService: {
    async listPending() {
      const data = await apiFetch<BackendValidationItem[]>("/api/v1/validations");
      return data.map((item) => ({
        ...item,
        status: status(item.status),
      }));
    },
    async validate(type: string, id: string) {
      await apiFetch<void>(`/api/v1/validations/${type}/${id}/validate`, { method: "POST" });
    },
    async reject(type: string, id: string, reason: string) {
      await apiFetch<void>(`/api/v1/validations/${type}/${id}/reject`, {
        method: "POST",
        body: JSON.stringify({ reason }),
      });
    },
  },
  alertService: {
    async list() {
      const chantier = await backendApi.chantierService.list().then((items) => items[0]);
      if (!chantier) return [];
      return backendApi.dashboardService.chantier(chantier.id).then((summary) => summary.alerts);
    },
  },
  documentService: {
    async list(chantierId: string) {
      const data = await apiFetch<BackendDocument[]>(`/api/v1/documents?chantierId=${chantierId}`);
      return data.map(documentFromBackend);
    },
    async upload(input: {
      chantierId: string;
      documentType: string;
      module: string;
      targetType: string;
      targetId: string;
      file: File;
    }) {
      const formData = new FormData();
      formData.set("chantierId", input.chantierId);
      formData.set("documentType", input.documentType);
      formData.set("module", input.module);
      formData.set("targetType", input.targetType);
      formData.set("targetId", input.targetId);
      formData.set("file", input.file);
      return documentFromBackend(await apiFetch<BackendDocument>("/api/v1/documents", {
        method: "POST",
        body: formData,
      }));
    },
    downloadUrl(id: string) {
      return `/api/v1/documents/${id}/download`;
    },
  },
  exportService: {
    async download(input: {
      type: "caisse" | "gasoil" | "personnel" | "engins" | "dashboard";
      chantierId: string;
      from?: string;
      to?: string;
      onlyValidated?: boolean;
    }) {
      const params = new URLSearchParams({ chantierId: input.chantierId });
      if (input.from) params.set("from", input.from);
      if (input.to) params.set("to", input.to);
      if (input.onlyValidated !== undefined) params.set("onlyValidated", String(input.onlyValidated));
      return apiDownload(`/api/v1/exports/${input.type}.xlsx?${params.toString()}`);
    },
  },
};
