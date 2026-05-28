import { useMutation, useQuery } from "@tanstack/react-query";
import {
  alertService,
  caisseService,
  chantierService,
  dashboardService,
  enginsService,
  gasoilService,
  personnelService,
  productionService,
  validationService,
} from "@/services/mock-api";

export function useChantiers() {
  return useQuery({
    queryKey: ["chantiers"],
    queryFn: chantierService.list,
  });
}

export function useChantier(chantierId: string) {
  return useQuery({
    queryKey: ["chantier", chantierId],
    queryFn: () => chantierService.getById(chantierId),
  });
}

export function useGlobalDashboard() {
  return useQuery({
    queryKey: ["dashboard", "global"],
    queryFn: dashboardService.global,
  });
}

export function useChantierDashboard(chantierId: string) {
  return useQuery({
    queryKey: ["dashboard", "chantier", chantierId],
    queryFn: () => dashboardService.chantier(chantierId),
  });
}

export function useTransactions() {
  return useQuery({
    queryKey: ["transactions"],
    queryFn: caisseService.listTransactions,
  });
}

export function useGasoilOverview(chantierId: string) {
  return useQuery({
    queryKey: ["gasoil", chantierId],
    queryFn: () => gasoilService.overview(chantierId),
  });
}

export function useCreateGasoilSortie() {
  return useMutation({
    mutationFn: gasoilService.createSortie,
  });
}

export function usePersonnel() {
  return useQuery({
    queryKey: ["personnel"],
    queryFn: personnelService.list,
  });
}

export function useEngins() {
  return useQuery({
    queryKey: ["engins"],
    queryFn: enginsService.list,
  });
}

export function useProductions() {
  return useQuery({
    queryKey: ["productions"],
    queryFn: productionService.list,
  });
}

export function useCreateProduction() {
  return useMutation({
    mutationFn: productionService.create,
  });
}

export function usePendingValidations() {
  return useQuery({
    queryKey: ["validations", "pending"],
    queryFn: validationService.listPending,
  });
}

export function useAlerts() {
  return useQuery({
    queryKey: ["alerts"],
    queryFn: alertService.list,
  });
}
