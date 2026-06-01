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

export type SyncStatus = "local" | "syncing" | "synced" | "error" | "conflict";

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
  syncStatus?: SyncStatus;
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
  syncStatus?: SyncStatus;
}

export interface Alert {
  id: string;
  severity: "info" | "warning" | "critical";
  title: string;
  description: string;
  module: "caisse" | "gasoil" | "personnel" | "engins" | "production" | "fournisseurs" | "etp" | "transport" | "entretien" | "bq";
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
  rendement?: number;
  syncStatus?: SyncStatus;
}

export interface MaterialPurchase {
  id: string;
  date: string;
  chantierId: string;
  supplierId: string;
  designation: string;
  unit: string;
  quantity: number;
  unitPriceHt: number;
  transportHt: number;
  totalHt: number;
  vatRate: number;
  totalTtc: number;
  receiptNumber?: string;
  supplierDocumentNumber?: string;
  dueDate?: string;
  paidAmount: number;
  remainingAmount: number;
  status: OperationStatus;
  hasDocument: boolean;
}

export interface SupplierPayment {
  id: string;
  date: string;
  chantierId: string;
  supplierId: string;
  amount: number;
  paymentMode: PaymentMode;
  status: OperationStatus;
  note?: string;
}

export interface EtpPrestation {
  id: string;
  date: string;
  chantierId: string;
  supplierId: string;
  designation: string;
  quantity: number;
  unitPrice: number;
  amountHt: number;
  vatRate: number;
  amountTtc: number;
  status: OperationStatus;
}

export interface EtpImputation {
  id: string;
  date: string;
  chantierId: string;
  supplierId: string;
  imputationType: string;
  amount: number;
  note?: string;
  status: OperationStatus;
}

export interface EtpOverview {
  prestations: EtpPrestation[];
  imputations: EtpImputation[];
  totalPrestations: number;
  totalImputations: number;
  remainingAmount: number;
}

export interface TransportRecord {
  id: string;
  date: string;
  chantierId: string;
  supplierId: string;
  designation: string;
  departure?: string;
  arrival?: string;
  trips: number;
  unitPrice: number;
  totalAmount: number;
  receiptNumber?: string;
  allocation?: string;
  status: OperationStatus;
  hasDocument: boolean;
}

export interface MaintenanceRecord {
  id: string;
  date: string;
  chantierId: string;
  equipmentId: string;
  supplierId?: string;
  interventionType: string;
  designation: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  immobilized: boolean;
  downtimeDays?: number;
  status: OperationStatus;
  hasDocument: boolean;
}

export interface BqArticle {
  id: string;
  chantierId: string;
  articleNumber: string;
  designation: string;
  unit: string;
  marketQuantity: number;
  marketUnitPriceHt: number;
  marketAmountHt: number;
  plannedCostTotal: number;
  realisedQuantity: number;
  realisedAmountHt: number;
  progressRate: number;
  realMargin: number;
  active: boolean;
}

export interface BqRealisation {
  id: string;
  date: string;
  chantierId: string;
  bqArticleId: string;
  quantity: number;
  source: string;
  status: OperationStatus;
}

export interface BqOverview {
  articles: BqArticle[];
  realisations: BqRealisation[];
}

export interface ImportPreview {
  fileName: string;
  sheetName: string;
  headers: string[];
  sampleRows: string[][];
  errors: string[];
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
