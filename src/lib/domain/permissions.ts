import type { Role, User } from "./types";

export type Permission =
  | "chantier.read"
  | "chantier.create"
  | "chantier.update"
  | "dashboard.global.read"
  | "dashboard.chantier.read"
  | "admin.users.manage"
  | "caisse.read"
  | "caisse.create"
  | "caisse.validate"
  | "gasoil.read"
  | "gasoil.create_entree"
  | "gasoil.create_sortie"
  | "gasoil.validate"
  | "personnel.read"
  | "personnel.read_salary"
  | "personnel.create_pointage"
  | "engins.read"
  | "engins.create_pointage"
  | "engins.validate"
  | "production.read"
  | "production.create"
  | "production.validate"
  | "fournisseurs.read"
  | "rentabilite.read"
  | "validations.read"
  | "alertes.read"
  | "rapports.export";

export const rolePermissions: Record<Role, Permission[]> = {
  super_admin: [
    "chantier.read",
    "chantier.create",
    "chantier.update",
    "dashboard.global.read",
    "dashboard.chantier.read",
    "admin.users.manage",
    "caisse.read",
    "caisse.create",
    "caisse.validate",
    "gasoil.read",
    "gasoil.create_entree",
    "gasoil.create_sortie",
    "gasoil.validate",
    "personnel.read",
    "personnel.read_salary",
    "personnel.create_pointage",
    "engins.read",
    "engins.create_pointage",
    "engins.validate",
    "production.read",
    "production.create",
    "production.validate",
    "fournisseurs.read",
    "rentabilite.read",
    "validations.read",
    "alertes.read",
    "rapports.export",
  ],
  directeur: [
    "chantier.read",
    "dashboard.global.read",
    "dashboard.chantier.read",
    "caisse.read",
    "caisse.validate",
    "gasoil.read",
    "personnel.read_salary",
    "engins.read",
    "production.read",
    "rentabilite.read",
    "validations.read",
    "alertes.read",
    "rapports.export",
  ],
  responsable_chantier: [
    "chantier.read",
    "dashboard.chantier.read",
    "gasoil.read",
    "gasoil.create_sortie",
    "gasoil.validate",
    "personnel.create_pointage",
    "engins.read",
    "engins.create_pointage",
    "engins.validate",
    "production.read",
    "production.create",
    "production.validate",
    "validations.read",
    "alertes.read",
  ],
  pointeur: [
    "gasoil.create_sortie",
    "engins.create_pointage",
    "production.create",
    "alertes.read",
  ],
  comptable: [
    "chantier.read",
    "dashboard.chantier.read",
    "caisse.read",
    "caisse.create",
    "gasoil.read",
    "gasoil.create_entree",
    "personnel.read",
    "personnel.read_salary",
    "personnel.create_pointage",
    "engins.read",
    "fournisseurs.read",
    "alertes.read",
    "rapports.export",
  ],
  materiel: ["chantier.read", "dashboard.chantier.read", "engins.read", "alertes.read"],
  lecture_seule: ["chantier.read", "dashboard.chantier.read", "alertes.read"],
};

export function can(userOrRole: Role | Pick<User, "role">, permission: Permission): boolean {
  const role = typeof userOrRole === "string" ? userOrRole : userOrRole.role;

  return rolePermissions[role].includes(permission);
}

export function canAccessChantier(role: Role, userChantierIds: string[], chantierId: string): boolean {
  if (role === "super_admin" || role === "directeur") {
    return true;
  }

  return userChantierIds.includes(chantierId);
}
