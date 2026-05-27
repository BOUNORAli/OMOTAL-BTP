"""Pydantic models for OMOTAL TRAVAUX domain."""
from __future__ import annotations

import uuid
from datetime import datetime, date, timezone
from typing import List, Optional, Literal

from pydantic import BaseModel, Field, ConfigDict, EmailStr


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def gen_id() -> str:
    return str(uuid.uuid4())


ValidationStatus = Literal[
    "BROUILLON", "SOUMIS", "VALIDE", "REJETE", "ANNULE", "VERROUILLE"
]

ChantierStatus = Literal["PREPARATION", "EN_COURS", "SUSPENDU", "TERMINE", "ARCHIVE"]

AffectationGasoil = Literal["PRODUCTION", "ETP", "PERSONNEL", "TRANSPORT", "AUTRE"]

PaymentMode = Literal["ESPECES_OMOTAL", "BANQUE_OMOTAL", "ESPECES_ETP", "AUTRE"]

TransactionType = Literal["DEBIT", "CREDIT"]


# ----------------------- USER -----------------------
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str
    chantier_ids: List[str] = Field(default_factory=list)
    phone: Optional[str] = None


class UserUpdate(BaseModel):
    name: Optional[str] = None
    role: Optional[str] = None
    chantier_ids: Optional[List[str]] = None
    phone: Optional[str] = None
    active: Optional[bool] = None
    password: Optional[str] = None


class UserOut(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    name: str
    email: str
    role: str
    chantier_ids: List[str] = Field(default_factory=list)
    phone: Optional[str] = None
    active: bool = True
    last_login: Optional[str] = None
    created_at: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# ----------------------- CHANTIER -----------------------
class ChantierCreate(BaseModel):
    name: str
    code: str
    ref_ao: Optional[str] = None
    maitre_ouvrage: Optional[str] = None
    localisation: Optional[str] = None
    start_date: Optional[str] = None
    expected_end_date: Optional[str] = None
    montant_marche_ht: Optional[float] = None
    tva: Optional[float] = 20.0
    status: ChantierStatus = "EN_COURS"
    responsable_id: Optional[str] = None
    description: Optional[str] = None


class ChantierUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    ref_ao: Optional[str] = None
    maitre_ouvrage: Optional[str] = None
    localisation: Optional[str] = None
    start_date: Optional[str] = None
    expected_end_date: Optional[str] = None
    montant_marche_ht: Optional[float] = None
    tva: Optional[float] = None
    status: Optional[ChantierStatus] = None
    responsable_id: Optional[str] = None
    description: Optional[str] = None


class ChantierOut(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    name: str
    code: str
    ref_ao: Optional[str] = None
    maitre_ouvrage: Optional[str] = None
    localisation: Optional[str] = None
    start_date: Optional[str] = None
    expected_end_date: Optional[str] = None
    montant_marche_ht: Optional[float] = None
    tva: Optional[float] = 20.0
    status: ChantierStatus = "EN_COURS"
    responsable_id: Optional[str] = None
    description: Optional[str] = None
    created_at: str


# ----------------------- CAISSE -----------------------
class TransactionCreate(BaseModel):
    chantier_id: str
    date: str
    type: TransactionType
    amount: float
    payment_mode: PaymentMode
    category: str  # personnel, gasoil, matieres, location_engins, etc.
    sub_category: Optional[str] = None
    description: str = ""
    fournisseur: Optional[str] = None
    related_operation: Optional[str] = None
    document_url: Optional[str] = None


class TransactionUpdate(BaseModel):
    date: Optional[str] = None
    type: Optional[TransactionType] = None
    amount: Optional[float] = None
    payment_mode: Optional[PaymentMode] = None
    category: Optional[str] = None
    sub_category: Optional[str] = None
    description: Optional[str] = None
    fournisseur: Optional[str] = None
    document_url: Optional[str] = None
    status: Optional[ValidationStatus] = None


class TransactionOut(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    chantier_id: str
    date: str
    type: TransactionType
    amount: float
    payment_mode: PaymentMode
    category: str
    sub_category: Optional[str] = None
    description: str = ""
    fournisseur: Optional[str] = None
    document_url: Optional[str] = None
    status: ValidationStatus = "VALIDE"
    needs_approval: bool = False
    created_by: Optional[str] = None
    created_by_name: Optional[str] = None
    validated_by: Optional[str] = None
    validated_by_name: Optional[str] = None
    created_at: str


# ----------------------- GASOIL -----------------------
class GasoilEntreeCreate(BaseModel):
    chantier_id: str
    date: str
    fournisseur: Optional[str] = None
    litres: float
    unit_price: float
    br_number: Optional[str] = None
    bon_fournisseur: Optional[str] = None
    payment_mode: Optional[PaymentMode] = None
    document_url: Optional[str] = None
    observation: Optional[str] = None


class GasoilEntreeOut(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    chantier_id: str
    date: str
    fournisseur: Optional[str] = None
    litres: float
    unit_price: float
    total_amount: float
    br_number: Optional[str] = None
    bon_fournisseur: Optional[str] = None
    payment_mode: Optional[PaymentMode] = None
    document_url: Optional[str] = None
    observation: Optional[str] = None
    status: ValidationStatus = "VALIDE"
    created_by: Optional[str] = None
    created_by_name: Optional[str] = None
    created_at: str


class GasoilSortieCreate(BaseModel):
    chantier_id: str
    date: str
    bs_number: Optional[str] = None
    engin_id: str
    chauffeur_id: Optional[str] = None
    affectation: AffectationGasoil = "PRODUCTION"
    litres: float
    unit_price: Optional[float] = None
    jauge_debut: Optional[float] = None
    jauge_fin: Optional[float] = None
    km_debut: Optional[float] = None
    km_fin: Optional[float] = None
    document_url: Optional[str] = None
    observation: Optional[str] = None


class GasoilSortieOut(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    chantier_id: str
    date: str
    bs_number: Optional[str] = None
    engin_id: str
    engin_name: Optional[str] = None
    chauffeur_id: Optional[str] = None
    chauffeur_name: Optional[str] = None
    affectation: AffectationGasoil = "PRODUCTION"
    litres: float
    unit_price: Optional[float] = None
    total_amount: Optional[float] = None
    jauge_debut: Optional[float] = None
    jauge_fin: Optional[float] = None
    km_debut: Optional[float] = None
    km_fin: Optional[float] = None
    document_url: Optional[str] = None
    observation: Optional[str] = None
    status: ValidationStatus = "SOUMIS"
    created_by: Optional[str] = None
    created_by_name: Optional[str] = None
    validated_by: Optional[str] = None
    validated_by_name: Optional[str] = None
    created_at: str


# ----------------------- PERSONNEL -----------------------
class EmployeeCreate(BaseModel):
    name: str
    poste: Optional[str] = None
    chantier_id: Optional[str] = None
    remuneration_type: Literal["HEURE", "JOUR", "MOIS"] = "JOUR"
    salaire_mensuel: Optional[float] = None
    salaire_journalier: Optional[float] = None
    salaire_horaire: Optional[float] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    phone: Optional[str] = None
    cin: Optional[str] = None
    active: bool = True


class EmployeeUpdate(BaseModel):
    name: Optional[str] = None
    poste: Optional[str] = None
    chantier_id: Optional[str] = None
    remuneration_type: Optional[Literal["HEURE", "JOUR", "MOIS"]] = None
    salaire_mensuel: Optional[float] = None
    salaire_journalier: Optional[float] = None
    salaire_horaire: Optional[float] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    phone: Optional[str] = None
    cin: Optional[str] = None
    active: Optional[bool] = None


class EmployeeOut(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    name: str
    poste: Optional[str] = None
    chantier_id: Optional[str] = None
    remuneration_type: str = "JOUR"
    salaire_mensuel: Optional[float] = None
    salaire_journalier: Optional[float] = None
    salaire_horaire: Optional[float] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    phone: Optional[str] = None
    cin: Optional[str] = None
    active: bool = True
    created_at: str


class PointageDayEntry(BaseModel):
    day: int  # 1..31
    hours: float = 0  # heures travaillées
    day_type: Literal["NORMAL", "ABSENT", "CONGE", "ARRET", "DEMI", "REPOS"] = "NORMAL"
    observation: Optional[str] = None


class PointagePersonnelUpsert(BaseModel):
    employee_id: str
    chantier_id: str
    year: int
    month: int  # 1..12
    entries: List[PointageDayEntry] = Field(default_factory=list)


class PointagePersonnelOut(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    employee_id: str
    employee_name: Optional[str] = None
    chantier_id: str
    year: int
    month: int
    entries: List[PointageDayEntry] = Field(default_factory=list)
    total_hours: float = 0
    total_days: float = 0
    salaire_du: float = 0
    avances: float = 0
    reliquat_precedent: float = 0
    reliquat_final: float = 0
    montant_a_payer: float = 0
    status: ValidationStatus = "BROUILLON"
    updated_at: str


class AvanceCreate(BaseModel):
    employee_id: str
    chantier_id: str
    date: str
    amount: float
    payment_mode: PaymentMode = "ESPECES_OMOTAL"
    motif: Optional[str] = None
    document_url: Optional[str] = None


class AvanceOut(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    employee_id: str
    employee_name: Optional[str] = None
    chantier_id: str
    date: str
    amount: float
    payment_mode: PaymentMode = "ESPECES_OMOTAL"
    motif: Optional[str] = None
    document_url: Optional[str] = None
    created_at: str
    created_by: Optional[str] = None


# ----------------------- ENGINS -----------------------
EnginType = Literal[
    "PELLE", "NIVELEUSE", "TRACTOPELLE", "CAMION", "TOMBEREAU",
    "VEHICULE", "COMPACTEUR", "BULLDOZER", "AUTRE",
]
EnginStatus = Literal["MOBILISE", "DEMOBILISE", "EN_PANNE", "ARRETE", "ARCHIVE"]
FacturationMode = Literal["HEURE", "JOUR", "FORFAIT", "INTERNE"]


class EnginCreate(BaseModel):
    name: str
    type: EnginType = "AUTRE"
    proprietaire: Optional[str] = None
    chantier_id: Optional[str] = None
    facturation_mode: FacturationMode = "HEURE"
    tarif_horaire: Optional[float] = None
    tarif_journalier: Optional[float] = None
    chauffeur_id: Optional[str] = None
    matricule: Optional[str] = None
    status: EnginStatus = "MOBILISE"


class EnginUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[EnginType] = None
    proprietaire: Optional[str] = None
    chantier_id: Optional[str] = None
    facturation_mode: Optional[FacturationMode] = None
    tarif_horaire: Optional[float] = None
    tarif_journalier: Optional[float] = None
    chauffeur_id: Optional[str] = None
    matricule: Optional[str] = None
    status: Optional[EnginStatus] = None


class EnginOut(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    name: str
    type: EnginType = "AUTRE"
    proprietaire: Optional[str] = None
    chantier_id: Optional[str] = None
    facturation_mode: FacturationMode = "HEURE"
    tarif_horaire: Optional[float] = None
    tarif_journalier: Optional[float] = None
    chauffeur_id: Optional[str] = None
    chauffeur_name: Optional[str] = None
    matricule: Optional[str] = None
    status: EnginStatus = "MOBILISE"
    created_at: str


class EnginPointageEntry(BaseModel):
    day: int
    hours: float = 0
    days_count: float = 0  # for JOUR mode
    activity: Optional[str] = None  # PRODUCTION, REGLAGE, ATTENTE, PANNE, etc.
    observation: Optional[str] = None


class EnginPointageUpsert(BaseModel):
    engin_id: str
    chantier_id: str
    year: int
    month: int
    entries: List[EnginPointageEntry] = Field(default_factory=list)


class EnginPointageOut(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    engin_id: str
    engin_name: Optional[str] = None
    chantier_id: str
    year: int
    month: int
    entries: List[EnginPointageEntry] = Field(default_factory=list)
    total_hours: float = 0
    total_days: float = 0
    montant_du: float = 0
    montant_paye: float = 0
    montant_restant: float = 0
    status: ValidationStatus = "BROUILLON"
    updated_at: str


class EnginPaiementCreate(BaseModel):
    engin_id: str
    chantier_id: str
    date: str
    amount: float
    payment_mode: PaymentMode = "ESPECES_OMOTAL"
    period_ref: Optional[str] = None  # ex: 2026-05
    observation: Optional[str] = None
    document_url: Optional[str] = None


class EnginPaiementOut(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    engin_id: str
    engin_name: Optional[str] = None
    chantier_id: str
    date: str
    amount: float
    payment_mode: PaymentMode = "ESPECES_OMOTAL"
    period_ref: Optional[str] = None
    observation: Optional[str] = None
    document_url: Optional[str] = None
    created_at: str


# ----------------------- ALERTS -----------------------
AlertSeverity = Literal["INFO", "WARN", "HIGH", "CRITICAL"]
AlertModule = Literal[
    "GASOIL", "CAISSE", "PERSONNEL", "ENGINS", "FOURNISSEURS", "BQ", "PRODUCTION"
]


class AlertOut(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    chantier_id: Optional[str] = None
    chantier_name: Optional[str] = None
    module: AlertModule
    severity: AlertSeverity
    title: str
    message: str
    related_id: Optional[str] = None
    status: Literal["NEW", "SEEN", "RESOLVED", "IGNORED"] = "NEW"
    created_at: str


# ----------------------- COMMON -----------------------
class StatusUpdate(BaseModel):
    status: ValidationStatus
    motif: Optional[str] = None


class GenericMessage(BaseModel):
    message: str
    detail: Optional[str] = None
