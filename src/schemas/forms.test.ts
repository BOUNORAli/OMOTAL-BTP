import { describe, expect, it } from "vitest";
import { gasoilSortieSchema } from "./gasoil.schema";
import { productionSchema } from "./production.schema";

describe("form schemas", () => {
  it("validates the mobile gasoil sortie critical fields", () => {
    const result = gasoilSortieSchema.safeParse({
      equipmentId: "equipment-1",
      liters: "120",
      allocation: "production",
      responsible: "Said",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.liters).toBe(120);
    }
  });

  it("rejects a gasoil sortie without liters or responsible", () => {
    const result = gasoilSortieSchema.safeParse({
      equipmentId: "equipment-1",
      liters: "0",
      allocation: "production",
      responsible: "",
    });

    expect(result.success).toBe(false);
  });

  it("validates production dimensions before calculating quantities", () => {
    const result = productionSchema.safeParse({
      productionFamily: "DECAPAGE",
      voie: "V1",
      workType: "deblai",
      length: "40",
      width: "6",
      depth: "0.4",
      hours: "8",
    });

    expect(result.success).toBe(true);
  });

  it("rejects production with invalid dimensions", () => {
    const result = productionSchema.safeParse({
      voie: "V1",
      workType: "deblai",
      length: "-1",
      width: "0",
    });

    expect(result.success).toBe(false);
  });
});
