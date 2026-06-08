import { beforeEach, describe, expect, it } from "vitest";
import {
  listLocalOperations,
  markLocalOperation,
  queueLocalOperation,
  removeLocalOperation,
  syncLocalOperations,
} from "./mobile-sync";

function installLocalStorage() {
  const values = new Map<string, string>();
  // The sync helper only needs the localStorage subset below.
  globalThis.window = {
    localStorage: {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
      removeItem: (key: string) => values.delete(key),
      clear: () => values.clear(),
    },
  } as unknown as Window & typeof globalThis;
}

describe("mobile sync queue", () => {
  beforeEach(() => {
    installLocalStorage();
  });

  it("queues, marks, and removes local operations", () => {
    const operation = queueLocalOperation("production", { voie: "A" });

    expect(listLocalOperations()).toHaveLength(1);
    expect(listLocalOperations()[0]).toMatchObject({ id: operation.id, status: "local" });

    markLocalOperation(operation.id, "synced");
    expect(listLocalOperations()[0].status).toBe("synced");

    removeLocalOperation(operation.id);
    expect(listLocalOperations()).toEqual([]);
  });

  it("syncs local operations and removes successful drafts", async () => {
    queueLocalOperation("production", { voie: "A" });

    const results = await syncLocalOperations({
      production: async () => ({ ok: true }),
    });

    expect(results[0].status).toBe("synced");
    expect(listLocalOperations()).toEqual([]);
  });

  it("keeps failed operations with an error status", async () => {
    const operation = queueLocalOperation("gasoil_exit", { liters: 100 });

    const results = await syncLocalOperations({
      gasoil_exit: async () => {
        throw new Error("Reseau indisponible");
      },
    });

    expect(results[0]).toMatchObject({ id: operation.id, status: "error", error: "Reseau indisponible" });
    expect(listLocalOperations()[0]).toMatchObject({ id: operation.id, status: "error", error: "Reseau indisponible" });
  });
});
