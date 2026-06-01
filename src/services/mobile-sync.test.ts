import { beforeEach, describe, expect, it } from "vitest";
import { listLocalOperations, markLocalOperation, queueLocalOperation, removeLocalOperation } from "./mobile-sync";

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
});
