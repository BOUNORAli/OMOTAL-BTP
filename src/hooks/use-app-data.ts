import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  Alert,
  CaisseTransaction,
  Chantier,
  DashboardSummary,
  DocumentRecord,
  Employee,
  Equipment,
  EquipmentTimesheet,
  GasoilExit,
  GasoilEntry,
  OperationStatus,
  PersonnelTimesheet,
  Production,
  Supplier,
  User,
} from "@/lib/domain/types";
import { dataSource } from "@/services/data-source";

export function useChantiers() {
  return useQuery<Chantier[]>({
    queryKey: ["chantiers"],
    queryFn: dataSource.chantierService.list,
  });
}

export function useCreateChantier() {
  const queryClient = useQueryClient();
  return useMutation<Chantier, Error, Omit<Chantier, "id" | "status">>({
    mutationFn: dataSource.chantierService.create as (input: Omit<Chantier, "id" | "status">) => Promise<Chantier>,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["chantiers"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useChantier(chantierId: string) {
  return useQuery<Chantier>({
    queryKey: ["chantier", chantierId],
    queryFn: () => dataSource.chantierService.getById(chantierId),
  });
}

export function useGlobalDashboard() {
  return useQuery<{
    activeChantiers: number;
    totalExpenses: number;
    cashBalance: number;
    gasoilStock: number;
    pendingValidations: number;
    criticalAlerts: number;
    chantiers: Array<Chantier & { expensesMonth: number; gasoilStock: number; alerts: number; production: number }>;
  }>({
    queryKey: ["dashboard", "global"],
    queryFn: dataSource.dashboardService.global,
  });
}

export function useChantierDashboard(chantierId: string) {
  return useQuery<DashboardSummary>({
    queryKey: ["dashboard", "chantier", chantierId],
    queryFn: () => dataSource.dashboardService.chantier(chantierId),
  });
}

export function useTransactions() {
  return useQuery<CaisseTransaction[]>({
    queryKey: ["transactions"],
    queryFn: dataSource.caisseService.listTransactions,
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();
  return useMutation<CaisseTransaction, Error, Omit<CaisseTransaction, "id" | "status" | "hasDocument" | "enteredByUserId"> & { submit: boolean }>({
    mutationFn: dataSource.caisseService.createTransaction as (
      input: Omit<CaisseTransaction, "id" | "status" | "hasDocument" | "enteredByUserId"> & { submit: boolean },
    ) => Promise<CaisseTransaction>,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["transactions"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      void queryClient.invalidateQueries({ queryKey: ["validations"] });
    },
  });
}

export function useGasoilOverview(chantierId: string) {
  return useQuery<{
    entries: import("@/lib/domain/types").GasoilEntry[];
    exits: GasoilExit[];
    stock: { inputLiters: number; outputLiters: number; stockLiters: number };
  }>({
    queryKey: ["gasoil", chantierId],
    queryFn: () => dataSource.gasoilService.overview(chantierId),
  });
}

export function useCreateGasoilSortie() {
  const queryClient = useQueryClient();
  return useMutation<GasoilExit, Error, Pick<GasoilExit, "equipmentId" | "liters" | "allocation" | "responsible">>({
    mutationFn: dataSource.gasoilService.createSortie as (
      input: Pick<GasoilExit, "equipmentId" | "liters" | "allocation" | "responsible">,
    ) => Promise<GasoilExit>,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["gasoil"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      void queryClient.invalidateQueries({ queryKey: ["validations"] });
    },
  });
}

export function useCreateGasoilEntry() {
  const queryClient = useQueryClient();
  return useMutation<GasoilEntry, Error, Omit<GasoilEntry, "id" | "status" | "hasDocument" | "enteredByUserId"> & { submit: boolean }>({
    mutationFn: dataSource.gasoilService.createEntry as (
      input: Omit<GasoilEntry, "id" | "status" | "hasDocument" | "enteredByUserId"> & { submit: boolean },
    ) => Promise<GasoilEntry>,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["gasoil"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function usePersonnel() {
  return useQuery<{
    employees: import("@/lib/domain/types").Employee[];
    timesheets: import("@/lib/domain/types").PersonnelTimesheet[];
    advances: import("@/lib/domain/types").PersonnelAdvance[];
  }>({
    queryKey: ["personnel"],
    queryFn: dataSource.personnelService.list,
  });
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();
  return useMutation<Employee, Error, Omit<Employee, "id" | "active">>({
    mutationFn: dataSource.personnelService.createEmployee as (input: Omit<Employee, "id" | "active">) => Promise<Employee>,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["personnel"] });
    },
  });
}

export function useCreatePersonnelTimesheet() {
  const queryClient = useQueryClient();
  return useMutation<PersonnelTimesheet, Error, Pick<PersonnelTimesheet, "date" | "chantierId" | "employeeId" | "hoursWorked" | "dayType"> & { submit: boolean }>({
    mutationFn: dataSource.personnelService.createTimesheet as (
      input: Pick<PersonnelTimesheet, "date" | "chantierId" | "employeeId" | "hoursWorked" | "dayType"> & { submit: boolean },
    ) => Promise<PersonnelTimesheet>,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["personnel"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useEngins() {
  return useQuery<{
    equipment: import("@/lib/domain/types").Equipment[];
    timesheets: import("@/lib/domain/types").EquipmentTimesheet[];
  }>({
    queryKey: ["engins"],
    queryFn: dataSource.enginsService.list,
  });
}

export function useCreateEquipment() {
  const queryClient = useQueryClient();
  return useMutation<Equipment, Error, Omit<Equipment, "id" | "status">>({
    mutationFn: dataSource.enginsService.createEquipment as (input: Omit<Equipment, "id" | "status">) => Promise<Equipment>,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["engins"] });
    },
  });
}

export function useCreateEquipmentTimesheet() {
  const queryClient = useQueryClient();
  return useMutation<EquipmentTimesheet, Error, Pick<EquipmentTimesheet, "date" | "chantierId" | "equipmentId" | "driver" | "hoursWorked" | "daysBilled" | "activityType"> & { submit: boolean }>({
    mutationFn: dataSource.enginsService.createTimesheet as (
      input: Pick<EquipmentTimesheet, "date" | "chantierId" | "equipmentId" | "driver" | "hoursWorked" | "daysBilled" | "activityType"> & { submit: boolean },
    ) => Promise<EquipmentTimesheet>,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["engins"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      void queryClient.invalidateQueries({ queryKey: ["validations"] });
    },
  });
}

export function useProductions() {
  return useQuery<Production[]>({
    queryKey: ["productions"],
    queryFn: dataSource.productionService.list,
  });
}

export function useCreateProduction() {
  return useMutation<Production, Error, Omit<Production, "id" | "status" | "date" | "chantierId">>({
    mutationFn: dataSource.productionService.create as (
      input: Omit<Production, "id" | "status" | "date" | "chantierId">,
    ) => Promise<Production>,
  });
}

export function usePendingValidations() {
  return useQuery<Array<{
    id: string;
    type: string;
    chantierId: string;
    date: string;
    summary: string;
    amountOrQuantity: string;
    status: OperationStatus;
    hasDocument: boolean;
  }>>({
    queryKey: ["validations", "pending"],
    queryFn: dataSource.validationService.listPending,
  });
}

export function useValidateOperation() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, { type: string; id: string }>({
    mutationFn: ({ type, id }) => dataSource.validationService.validate(type, id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["validations"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      void queryClient.invalidateQueries({ queryKey: ["gasoil"] });
      void queryClient.invalidateQueries({ queryKey: ["engins"] });
      void queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
}

export function useRejectOperation() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, { type: string; id: string; reason: string }>({
    mutationFn: ({ type, id, reason }) => dataSource.validationService.reject(type, id, reason),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["validations"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useAlerts() {
  return useQuery<Alert[]>({
    queryKey: ["alerts"],
    queryFn: dataSource.alertService.list,
  });
}

export function useUsers() {
  return useQuery<User[]>({
    queryKey: ["users"],
    queryFn: dataSource.authService.getUsers,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation<User, Error, Pick<User, "name" | "email" | "role" | "chantierIds"> & { password: string }>({
    mutationFn: dataSource.authService.createUser as (
      input: Pick<User, "name" | "email" | "role" | "chantierIds"> & { password: string },
    ) => Promise<User>,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useFournisseurs() {
  return useQuery<Supplier[]>({
    queryKey: ["fournisseurs"],
    queryFn: dataSource.fournisseurService.list,
  });
}

export function useCreateFournisseur() {
  const queryClient = useQueryClient();
  return useMutation<Supplier, Error, Pick<Supplier, "name" | "type" | "phone">>({
    mutationFn: dataSource.fournisseurService.create as (input: Pick<Supplier, "name" | "type" | "phone">) => Promise<Supplier>,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["fournisseurs"] });
    },
  });
}

export function useDocuments(chantierId: string) {
  return useQuery<DocumentRecord[]>({
    queryKey: ["documents", chantierId],
    queryFn: () => dataSource.documentService.list(chantierId),
  });
}

export function useUploadDocument() {
  const queryClient = useQueryClient();
  return useMutation<DocumentRecord, Error, {
    chantierId: string;
    documentType: string;
    module: string;
    targetType: string;
    targetId: string;
    file: File;
  }>({
    mutationFn: dataSource.documentService.upload,
    onSuccess: (_document, variables) => {
      void queryClient.invalidateQueries({ queryKey: ["documents", variables.chantierId] });
      void queryClient.invalidateQueries({ queryKey: ["transactions"] });
      void queryClient.invalidateQueries({ queryKey: ["gasoil"] });
      void queryClient.invalidateQueries({ queryKey: ["validations"] });
    },
  });
}
