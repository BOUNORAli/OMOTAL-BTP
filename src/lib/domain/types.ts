export type Role =
  | "super_admin"
  | "directeur"
  | "responsable_chantier"
  | "pointeur"
  | "comptable"
  | "materiel"
  | "lecture_seule";

export type ChantierStatus =
  | "preparation"
  | "en_cours"
  | "suspendu"
  | "termine"
  | "archive";

export type OperationStatus =
  | "brouillon"
  | "soumis"
  | "valide"
  | "rejete"
  | "annule"
  | "verrouille";

export type PaymentMode =
  | "especes_omotal"
  | "banque_omotal"
  | "especes_etp"
  | "autre";

export type TransactionCategory =
  | "personnel"
  | "gasoil"
  | "matieres"
  | "location_engins"
  | "entretien"
  | "transport"
  | "etp"
  | "frais_generaux"
  | "financement"
  | "divers";

export type TransactionType = "debit" | "credit";

export type BillingMode = "heure" | "jour" | "forfait" | "interne";

export type EquipmentStatus =
  | "mobilise"
  | "demobilise"
  | "en_panne"
  | "arrete"
  | "archive";

export type RemunerationType = "heure" | "jour" | "mois";

export type DayType = "normal" | "absence" | "conge" | "arret" | "demi_journee";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  chantierIds: string[];
  active: boolean;
}

export interface Chantier {
  id: string;
  name: string;
  code: string;
  client: string;
  location: string;
  startedAt: string;
  expectedEndAt?: string;
  marketAmountHt?: number;
  status: ChantierStatus;
  managerUserId: string;
}

export interface Supplier {
  id: string;
  name: string;
  type: "station" | "matiere" | "transport" | "entretien" | "sous_traitant" | "loueur" | "autre";
  phone?: string;
  active: boolean;
}

export interface Equipment {
  id: string;
  designation: string;
  type: "pelle" | "niveleuse" | "tractopelle" | "camion" | "tombereau" | "vehicule" | "compacteur" | "autre";
  owner: string;
  chantierId: string;
  billingMode: BillingMode;
  hourlyRate?: number;
  dailyRate?: number;
  usualDriver?: string;
  status: EquipmentStatus;
}

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  position: string;
  chantierId: string;
  remunerationType: RemunerationType;
  monthlySalary?: number;
  dailySalary?: number;
  hourlySalary?: number;
  active: boolean;
}

export interface CaisseTransaction {
  id: string;
  date: string;
  chantierId: string;
  type: TransactionType;
  amount: number;
  paymentMode: PaymentMode;
  category: TransactionCategory;
  description: string;
  personOrSupplier?: string;
  status: OperationStatus;
  hasDocument: boolean;
  enteredByUserId: string;
}

export interface GasoilEntry {
  id: string;
  date: string;
  chantierId: string;
  supplierId: string;
  liters: number;
  unitPrice: number;
  receiptNumber?: string;
  status: OperationStatus;
  hasDocument: boolean;
  enteredByUserId: string;
}

export interface GasoilExit {
  id: string;
  date: string;
  chantierId: string;
  equipmentId?: string;
  responsible: string;
  allocation: "production" | "etp" | "personnel" | "transport" | "autre";
  liters: number;
  unitPrice: number;
  exitNumber?: string;
  status: OperationStatus;
  hasDocument: boolean;
  enteredByUserId: string;
}

export interface PersonnelTimesheet {
  id: string;
  date: string;
  chantierId: string;
  employeeId: string;
  hoursWorked: number;
  dayType: DayType;
  appliedRemunerationType: RemunerationType;
  appliedHourlyRate?: number;
  appliedDailyRate?: number;
  appliedMonthlySalary?: number;
  status: OperationStatus;
}

export interface PersonnelAdvance {
  id: string;
  date: string;
  chantierId: string;
  employeeId: string;
  amount: number;
  transactionId?: string;
  status: OperationStatus;
}

export interface EquipmentTimesheet {
  id: string;
  date: string;
  chantierId: string;
  equipmentId: string;
  driver: string;
  hoursWorked?: number;
  daysBilled?: number;
  activityType: "production" | "reglage" | "attente" | "panne" | "transport" | "autre";
  appliedBillingMode: BillingMode;
  appliedHourlyRate?: number;
  appliedDailyRate?: number;
  status: OperationStatus;
}

export interface Alert {
  id: string;
  severity: "info" | "warning" | "critical";
  title: string;
  description: string;
  module: "caisse" | "gasoil" | "personnel" | "engins";
  chantierId: string;
}

export interface Production {
  id: string;
  chantierId: string;
  date: string;
  voie: string;
  tranche?: string;
  troncon?: string;
  workType: string;
  equipmentId?: string;
  driver?: string;
  length?: number;
  width?: number;
  depth?: number;
  quantity: number;
  unit: "m3" | "m2" | "ml" | "u" | "t";
  hours?: number;
  status: OperationStatus;
}

export interface DashboardSummary {
  cashBalance: number;
  cashDebit: number;
  cashCredit: number;
  gasoilStockLiters: number;
  gasoilInputLiters: number;
  gasoilOutputLiters: number;
  personnelDue: number;
  personnelAdvances: number;
  equipmentCost: number;
  pendingValidations: number;
  alerts: Alert[];
}

export interface DocumentRecord {
  id: string;
  chantierId: string;
  documentType: string;
  fileName: string;
  contentType: string;
  sizeBytes: number;
  module: string;
  targetType: string;
  targetId: string;
}
