import { describe, expect, it } from "vitest";
import { getMobileVisibleNavItems } from "./mobile-app-nav";

describe("mobile app navigation", () => {
  it("gives the pointeur direct access to terrain pages", () => {
    const labels = getMobileVisibleNavItems("pointeur").map((item) => item.label);

    expect(labels).toEqual(expect.arrayContaining([
      "Accueil terrain",
      "Sortie gasoil",
      "Pointage engins",
      "Production mobile",
      "Historique mobile",
    ]));
    expect(labels).not.toContain("Alertes");
  });

  it("keeps sensitive finance, salary and margin pages away from the pointeur", () => {
    const labels = getMobileVisibleNavItems("pointeur").map((item) => item.label);

    expect(labels).not.toContain("Caisse");
    expect(labels).not.toContain("Personnel");
    expect(labels).not.toContain("BQ / Rentabilite");
    expect(labels).not.toContain("Rapports");
  });

  it("keeps administration and export navigation visible for the super admin", () => {
    const labels = getMobileVisibleNavItems("super_admin").map((item) => item.label);

    expect(labels).toEqual(expect.arrayContaining([
      "Cockpit global",
      "Caisse",
      "Rapports",
      "Utilisateurs & parametres",
      "Sortie gasoil",
    ]));
  });
});
