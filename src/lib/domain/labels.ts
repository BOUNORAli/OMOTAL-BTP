import type { OperationStatus, PaymentMode, Role } from "./types";

export const roleLabels: Record<Role, string> = {
  super_admin: "Super Admin",
  directeur: "Directeur",
  responsable_chantier: "Responsable chantier",
  pointeur: "Pointeur chantier",
  comptable: "Comptable",
  materiel: "Responsable materiel",
  lecture_seule: "Lecture seule",
};

export const statusLabels: Record<OperationStatus, string> = {
  brouillon: "Brouillon",
  soumis: "Soumis",
  valide: "Valide",
  rejete: "Rejete",
  annule: "Annule",
  verrouille: "Verrouille",
};

export const paymentModeLabels: Record<PaymentMode, string> = {
  especes_omotal: "Especes OMOTAL",
  banque_omotal: "Banque OMOTAL",
  especes_etp: "Especes ETP",
  autre: "Autre",
};
