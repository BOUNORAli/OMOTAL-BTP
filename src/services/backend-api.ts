import { activeChantier, productions } from "@/lib/domain/mock-data";
import type {
  Alert,
  CaisseTransaction,
  Chantier,
  DashboardSummary,
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
import { apiFetch, getPersistedSelectedChantierId, normalizeRole } from "./api-client";

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
        body: JSON.stringify(payload),
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
  },
  validationService: {
    async listPending() {
      const data = await apiFetch<BackendValidationItem[]>("/api/v1/validations");
      return data.map((item) => ({
        ...item,
        status: status(item.status),
      }));
    },
  },
  alertService: {
    async list() {
      const chantier = await backendApi.chantierService.list().then((items) => items[0]);
      if (!chantier) return [];
      return backendApi.dashboardService.chantier(chantier.id).then((summary) => summary.alerts);
    },
  },
};
