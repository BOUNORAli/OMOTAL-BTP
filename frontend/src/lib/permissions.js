// Permissions, role labels, role colors
export const ROLES = {
  SUPER_ADMIN: "Super Admin",
  DIRECTEUR: "Directeur",
  RESPONSABLE_CHANTIER: "Responsable Chantier",
  POINTEUR: "Pointeur Chantier",
  COMPTABLE: "Comptable",
  MATERIEL: "Responsable Matériel",
  LECTURE_SEULE: "Lecture seule",
};

export const ROLE_BADGES = {
  SUPER_ADMIN: "bg-violet-100 text-violet-700 border-violet-200",
  DIRECTEUR: "bg-blue-100 text-blue-700 border-blue-200",
  RESPONSABLE_CHANTIER: "bg-emerald-100 text-emerald-700 border-emerald-200",
  POINTEUR: "bg-orange-100 text-orange-700 border-orange-200",
  COMPTABLE: "bg-amber-100 text-amber-700 border-amber-200",
  MATERIEL: "bg-slate-100 text-slate-700 border-slate-200",
  LECTURE_SEULE: "bg-gray-100 text-gray-700 border-gray-200",
};

// permission flags per role (mirror backend)
export const ROLE_PERMS = {
  SUPER_ADMIN: ["*"],
  DIRECTEUR: [
    "dashboard.global", "chantier.read", "caisse.read", "caisse.validate_high",
    "gasoil.read", "personnel.read", "personnel.read_salary", "engins.read",
    "reports.export", "validations.high", "alertes.read",
  ],
  RESPONSABLE_CHANTIER: [
    "dashboard.chantier", "chantier.read", "gasoil.read", "gasoil.validate",
    "personnel.read", "personnel.create", "engins.read", "engins.validate",
    "validations.operational", "alertes.read",
  ],
  POINTEUR: [
    "dashboard.chantier", "chantier.read", "gasoil.create_sortie", "engins.read",
    "engins.pointage",
  ],
  COMPTABLE: [
    "dashboard.global", "chantier.read", "caisse.read", "caisse.create",
    "gasoil.read", "gasoil.create_entree", "personnel.read", "personnel.create",
    "personnel.read_salary", "engins.read", "engins.pay", "reports.export",
    "alertes.read",
  ],
  MATERIEL: ["chantier.read", "engins.read", "entretien.create"],
  LECTURE_SEULE: ["dashboard.global", "chantier.read", "reports.export"],
};

export function can(user, perm) {
  if (!user) return false;
  const perms = ROLE_PERMS[user.role] || [];
  if (perms.includes("*")) return true;
  return perms.includes(perm);
}

export function canAny(user, perms) {
  return perms.some((p) => can(user, p));
}
