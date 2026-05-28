import { useMutation, useQuery } from "@tanstack/react-query";
import type {
  Alert,
  CaisseTransaction,
  Chantier,
  DashboardSummary,
  GasoilExit,
  OperationStatus,
  Production,
} from "@/lib/domain/types";
import { dataSource } from "@/services/data-source";

export function useChantiers() {
  return useQuery<Chantier[]>({
    queryKey: ["chantiers"],
    queryFn: dataSource.chantierService.list,
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
  return useMutation<GasoilExit, Error, Pick<GasoilExit, "equipmentId" | "liters" | "allocation" | "responsible">>({
    mutationFn: dataSource.gasoilService.createSortie as (
      input: Pick<GasoilExit, "equipmentId" | "liters" | "allocation" | "responsible">,
    ) => Promise<GasoilExit>,
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

export function useEngins() {
  return useQuery<{
    equipment: import("@/lib/domain/types").Equipment[];
    timesheets: import("@/lib/domain/types").EquipmentTimesheet[];
  }>({
    queryKey: ["engins"],
    queryFn: dataSource.enginsService.list,
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

export function useAlerts() {
  return useQuery<Alert[]>({
    queryKey: ["alerts"],
    queryFn: dataSource.alertService.list,
  });
}
