"""Production, Matières, BQ models (extension)."""
from __future__ import annotations
from typing import List, Optional, Literal
from pydantic import BaseModel, Field, ConfigDict

from models import gen_id, now_iso, ValidationStatus, PaymentMode

Unit = Literal["M3", "M2", "ML", "U", "T"]
WorkType = Literal[
    "DECAPAGE", "REGLAGE", "DEBLAI", "REMBLAI",
    "COMPACTAGE", "TRANSPORT", "AUTRE",
]


# ----------------------- VOIES -----------------------
class VoieCreate(BaseModel):
    chantier_id: str
    name: str
    description: Optional[str] = None


class VoieOut(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    chantier_id: str
    name: str
    description: Optional[str] = None
    created_at: str


# ----------------------- PRODUCTION -----------------------
class ProductionCreate(BaseModel):
    chantier_id: str
    date: str
    voie: Optional[str] = None
    tranche: Optional[str] = None
    troncon: Optional[str] = None
    work_type: WorkType = "DECAPAGE"
    engin_id: Optional[str] = None
    chauffeur_id: Optional[str] = None
    length: Optional[float] = None
    width: Optional[float] = None
    depth: Optional[float] = None
    quantity: Optional[float] = None
    unit: Unit = "M3"
    hours: Optional[float] = None
    article_bq_id: Optional[str] = None
    observation: Optional[str] = None


class ProductionUpdate(BaseModel):
    voie: Optional[str] = None
    tranche: Optional[str] = None
    troncon: Optional[str] = None
    work_type: Optional[WorkType] = None
    engin_id: Optional[str] = None
    length: Optional[float] = None
    width: Optional[float] = None
    depth: Optional[float] = None
    quantity: Optional[float] = None
    unit: Optional[Unit] = None
    hours: Optional[float] = None
    article_bq_id: Optional[str] = None
    observation: Optional[str] = None
    status: Optional[ValidationStatus] = None


class ProductionOut(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    chantier_id: str
    date: str
    voie: Optional[str] = None
    tranche: Optional[str] = None
    troncon: Optional[str] = None
    work_type: WorkType = "DECAPAGE"
    engin_id: Optional[str] = None
    engin_name: Optional[str] = None
    chauffeur_id: Optional[str] = None
    chauffeur_name: Optional[str] = None
    length: Optional[float] = None
    width: Optional[float] = None
    depth: Optional[float] = None
    quantity: float = 0
    unit: Unit = "M3"
    hours: Optional[float] = None
    rendement: Optional[float] = None  # qte / hours
    article_bq_id: Optional[str] = None
    observation: Optional[str] = None
    status: ValidationStatus = "SOUMIS"
    created_by: Optional[str] = None
    created_by_name: Optional[str] = None
    validated_by: Optional[str] = None
    validated_by_name: Optional[str] = None
    created_at: str


# ----------------------- FOURNISSEURS -----------------------
FournisseurType = Literal[
    "STATION", "MATIERE", "TRANSPORT", "ENTRETIEN",
    "SOUS_TRAITANT", "LOUEUR", "AUTRE",
]


class FournisseurCreate(BaseModel):
    name: str
    type: FournisseurType = "MATIERE"
    contact: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    payment_conditions: Optional[str] = None
    ice: Optional[str] = None  # Identifiant Commun Entreprise
    active: bool = True


class FournisseurUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[FournisseurType] = None
    contact: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    payment_conditions: Optional[str] = None
    ice: Optional[str] = None
    active: Optional[bool] = None


class FournisseurOut(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    name: str
    type: FournisseurType = "MATIERE"
    contact: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    payment_conditions: Optional[str] = None
    ice: Optional[str] = None
    active: bool = True
    created_at: str


# ----------------------- ACHATS MATIERES -----------------------
class AchatMatiereCreate(BaseModel):
    chantier_id: str
    date: str
    fournisseur_id: str
    designation: str
    unit: Optional[str] = "U"
    quantity: float = 1
    unit_price: float = 0
    transport_ht: float = 0
    tva_rate: float = 20.0
    br_number: Optional[str] = None
    bon_fournisseur: Optional[str] = None
    affectation: Optional[str] = None  # production, ETP, etc.
    article_bq_id: Optional[str] = None
    echeance: Optional[str] = None
    document_url: Optional[str] = None
    observation: Optional[str] = None


class AchatMatiereOut(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    chantier_id: str
    date: str
    fournisseur_id: str
    fournisseur_name: Optional[str] = None
    designation: str
    unit: Optional[str] = "U"
    quantity: float = 1
    unit_price: float = 0
    transport_ht: float = 0
    total_ht: float = 0
    tva_rate: float = 20.0
    total_tva: float = 0
    total_ttc: float = 0
    br_number: Optional[str] = None
    bon_fournisseur: Optional[str] = None
    affectation: Optional[str] = None
    article_bq_id: Optional[str] = None
    echeance: Optional[str] = None
    montant_paye: float = 0
    montant_restant: float = 0
    payment_status: Literal["NON_PAYE", "PARTIEL", "PAYE"] = "NON_PAYE"
    document_url: Optional[str] = None
    observation: Optional[str] = None
    created_by: Optional[str] = None
    created_at: str


class PaiementFournisseurCreate(BaseModel):
    achat_id: str
    date: str
    amount: float
    payment_mode: PaymentMode = "BANQUE_OMOTAL"
    reference: Optional[str] = None
    observation: Optional[str] = None


class PaiementFournisseurOut(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    achat_id: str
    chantier_id: Optional[str] = None
    fournisseur_id: Optional[str] = None
    fournisseur_name: Optional[str] = None
    date: str
    amount: float
    payment_mode: PaymentMode = "BANQUE_OMOTAL"
    reference: Optional[str] = None
    observation: Optional[str] = None
    created_by: Optional[str] = None
    created_at: str


# ----------------------- BQ -----------------------
class BQArticleCreate(BaseModel):
    chantier_id: str
    numero: str
    designation: str
    unit: str = "M3"
    quantity_marche: float
    pu_marche_ht: float
    pr_main_oeuvre: float = 0
    pr_materiaux: float = 0
    pr_engins: float = 0
    pr_sous_traitance: float = 0
    frais_generaux: float = 0


class BQArticleUpdate(BaseModel):
    numero: Optional[str] = None
    designation: Optional[str] = None
    unit: Optional[str] = None
    quantity_marche: Optional[float] = None
    pu_marche_ht: Optional[float] = None
    pr_main_oeuvre: Optional[float] = None
    pr_materiaux: Optional[float] = None
    pr_engins: Optional[float] = None
    pr_sous_traitance: Optional[float] = None
    frais_generaux: Optional[float] = None
    quantity_realisee: Optional[float] = None
    cout_reel: Optional[float] = None


class BQArticleOut(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    chantier_id: str
    numero: str
    designation: str
    unit: str = "M3"
    quantity_marche: float
    pu_marche_ht: float
    montant_marche_ht: float = 0
    pr_main_oeuvre: float = 0
    pr_materiaux: float = 0
    pr_engins: float = 0
    pr_sous_traitance: float = 0
    frais_generaux: float = 0
    pr_total: float = 0
    marge_prevue: float = 0
    quantity_realisee: float = 0
    avancement: float = 0  # %
    montant_realise: float = 0
    cout_reel: float = 0
    marge_reelle: float = 0
    taux_marge_reel: float = 0
    created_at: str
