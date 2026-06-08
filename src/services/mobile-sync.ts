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

export type SyncHandlers = {
  gasoil_exit?: (payload: unknown) => Promise<unknown>;
  equipment_timesheet?: (payload: unknown) => Promise<unknown>;
  production?: (payload: unknown) => Promise<unknown>;
};

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

export async function syncLocalOperations(handlers: SyncHandlers) {
  const operations = listLocalOperations().filter((operation) => operation.status === "local" || operation.status === "error");
  const results: LocalOperation[] = [];

  for (const operation of operations) {
    const handler = handlers[operation.type];
    if (!handler) {
      markLocalOperation(operation.id, "conflict", "Aucun connecteur de synchronisation pour ce type de saisie.");
      results.push({ ...operation, status: "conflict", error: "Aucun connecteur de synchronisation pour ce type de saisie." });
      continue;
    }

    markLocalOperation(operation.id, "syncing");
    try {
      await handler(operation.payload);
      removeLocalOperation(operation.id);
      results.push({ ...operation, status: "synced" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Synchronisation impossible.";
      const status: SyncStatus = message.toLowerCase().includes("conflict") ? "conflict" : "error";
      markLocalOperation(operation.id, status, message);
      results.push({ ...operation, status, error: message });
    }
  }

  return results;
}

function saveLocalOperations(items: LocalOperation[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}
