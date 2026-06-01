import type { SyncStatus } from "@/lib/domain/types";

export type LocalOperationType = "gasoil_exit" | "equipment_timesheet" | "production";

export type LocalOperation = {
  id: string;
  type: LocalOperationType;
  payload: unknown;
  status: SyncStatus;
  error?: string;
  createdAt: string;
  updatedAt: string;
};

const STORAGE_KEY = "omotal-mobile-sync-queue";

export function listLocalOperations(): LocalOperation[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as LocalOperation[];
  } catch {
    return [];
  }
}

export function queueLocalOperation(type: LocalOperationType, payload: unknown): LocalOperation {
  const now = new Date().toISOString();
  const operation: LocalOperation = {
    id: `local-${type}-${Date.now()}`,
    type,
    payload,
    status: "local",
    createdAt: now,
    updatedAt: now,
  };
  saveLocalOperations([...listLocalOperations(), operation]);
  return operation;
}

export function markLocalOperation(id: string, status: SyncStatus, error?: string) {
  const now = new Date().toISOString();
  const next = listLocalOperations().map((operation) =>
    operation.id === id ? { ...operation, status, error, updatedAt: now } : operation,
  );
  saveLocalOperations(next);
}

export function removeLocalOperation(id: string) {
  saveLocalOperations(listLocalOperations().filter((operation) => operation.id !== id));
}

function saveLocalOperations(items: LocalOperation[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}
