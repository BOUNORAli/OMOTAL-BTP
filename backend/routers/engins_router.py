"""Engins router."""
from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional

from database import db
from models import (
    EnginCreate,
    EnginUpdate,
    EnginOut,
    EnginPointageUpsert,
    EnginPointageOut,
    EnginPaiementCreate,
    EnginPaiementOut,
    StatusUpdate,
    gen_id,
    now_iso,
)
from auth import (
    get_current_user,
    require_roles,
    TokenData,
    ROLE_SUPER_ADMIN,
    ROLE_COMPTABLE,
    ROLE_RESPONSABLE_CHANTIER,
    ROLE_POINTEUR,
    ROLE_MATERIEL,
)
from utils_lib import serialize_doc

router = APIRouter(prefix="/api/engins", tags=["engins"])


@router.get("", response_model=List[EnginOut])
async def list_engins(
    chantier_id: Optional[str] = None,
    user: TokenData = Depends(get_current_user),
):
    flt = {}
    if chantier_id:
        flt["chantier_id"] = chantier_id
    docs = await db.engins.find(flt, {"_id": 0}).sort("name", 1).to_list(1000)
    # enrich chauffeur name
    chauffeur_ids = {d["chauffeur_id"] for d in docs if d.get("chauffeur_id")}
    chauffeurs = await db.employees.find(
        {"id": {"$in": list(chauffeur_ids)}}, {"_id": 0}
    ).to_list(500)
    name_map = {c["id"]: c["name"] for c in chauffeurs}
    for d in docs:
        d["chauffeur_name"] = name_map.get(d.get("chauffeur_id"))
    return [EnginOut(**d) for d in docs]


@router.post("", response_model=EnginOut)
async def create_engin(
    payload: EnginCreate,
    user: TokenData = Depends(require_roles(ROLE_SUPER_ADMIN, ROLE_RESPONSABLE_CHANTIER)),
):
    doc = payload.model_dump()
    doc["id"] = gen_id()
    doc["created_at"] = now_iso()
    await db.engins.insert_one(doc)
    return EnginOut(**serialize_doc(doc))


@router.patch("/{engin_id}", response_model=EnginOut)
async def update_engin(
    engin_id: str,
    payload: EnginUpdate,
    user: TokenData = Depends(require_roles(ROLE_SUPER_ADMIN, ROLE_RESPONSABLE_CHANTIER, ROLE_MATERIEL)),
):
    update = {k: v for k, v in payload.model_dump(exclude_unset=True).items() if v is not None}
    if not update:
        raise HTTPException(status_code=400, detail="Aucune donnée à mettre à jour")
    res = await db.engins.update_one({"id": engin_id}, {"$set": update})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Engin introuvable")
    doc = await db.engins.find_one({"id": engin_id}, {"_id": 0})
    return EnginOut(**doc)


@router.delete("/{engin_id}")
async def delete_engin(
    engin_id: str, user: TokenData = Depends(require_roles(ROLE_SUPER_ADMIN))
):
    await db.engins.update_one({"id": engin_id}, {"$set": {"status": "ARCHIVE"}})
    return {"message": "Engin archivé"}


# ---------------- POINTAGE ----------------
async def _compute_engin_pointage(doc: dict) -> dict:
    engin = await db.engins.find_one({"id": doc["engin_id"]}, {"_id": 0})
    if not engin:
        engin = {}
    total_hours = 0.0
    total_days = 0.0
    for e in doc.get("entries", []):
        total_hours += e.get("hours", 0) or 0
        total_days += e.get("days_count", 0) or 0
    doc["total_hours"] = round(total_hours, 2)
    doc["total_days"] = total_days
    mode = engin.get("facturation_mode", "HEURE")
    if mode == "HEURE":
        doc["montant_du"] = round(total_hours * (engin.get("tarif_horaire") or 0), 2)
    elif mode == "JOUR":
        doc["montant_du"] = round(total_days * (engin.get("tarif_journalier") or 0), 2)
    else:
        doc["montant_du"] = 0.0

    # Sum payments for engin (lifetime)
    paye_pipe = [
        {"$match": {"engin_id": doc["engin_id"]}},
        {"$group": {"_id": None, "total": {"$sum": "$amount"}}},
    ]
    paye = await db.engin_paiements.aggregate(paye_pipe).to_list(5)
    doc["montant_paye"] = round(paye[0]["total"] if paye else 0, 2)

    # Sum total dus across all months
    du_pipe = [
        {"$match": {"engin_id": doc["engin_id"]}},
        {"$group": {"_id": None, "total": {"$sum": "$montant_du"}}},
    ]
    dus = await db.engin_pointage.aggregate(du_pipe).to_list(5)
    total_du = (dus[0]["total"] if dus else 0) + doc["montant_du"]
    # subtract current doc's existing montant_du if already exists
    existing = await db.engin_pointage.find_one(
        {"engin_id": doc["engin_id"], "year": doc["year"], "month": doc["month"]}
    )
    if existing:
        total_du -= existing.get("montant_du", 0)

    doc["montant_restant"] = round(total_du - doc["montant_paye"], 2)
    doc["engin_name"] = engin.get("name")
    return doc


@router.get("/pointage", response_model=List[EnginPointageOut])
async def list_engin_pointages(
    chantier_id: Optional[str] = None,
    year: Optional[int] = None,
    month: Optional[int] = None,
    user: TokenData = Depends(get_current_user),
):
    flt = {}
    if chantier_id:
        flt["chantier_id"] = chantier_id
    if year:
        flt["year"] = year
    if month:
        flt["month"] = month
    docs = await db.engin_pointage.find(flt, {"_id": 0}).to_list(5000)
    return [EnginPointageOut(**d) for d in docs]


@router.post("/pointage", response_model=EnginPointageOut)
async def upsert_engin_pointage(
    payload: EnginPointageUpsert,
    user: TokenData = Depends(
        require_roles(
            ROLE_SUPER_ADMIN,
            ROLE_COMPTABLE,
            ROLE_RESPONSABLE_CHANTIER,
            ROLE_POINTEUR,
        )
    ),
):
    existing = await db.engin_pointage.find_one(
        {"engin_id": payload.engin_id, "year": payload.year, "month": payload.month}
    )
    doc = payload.model_dump()
    doc["updated_at"] = now_iso()
    if existing:
        doc["id"] = existing["id"]
        doc["status"] = existing.get("status", "BROUILLON")
    else:
        doc["id"] = gen_id()
        doc["status"] = "BROUILLON"
    doc = await _compute_engin_pointage(doc)
    await db.engin_pointage.update_one({"id": doc["id"]}, {"$set": doc}, upsert=True)
    return EnginPointageOut(**doc)


@router.post("/pointage/{pointage_id}/status", response_model=EnginPointageOut)
async def update_engin_pointage_status(
    pointage_id: str,
    payload: StatusUpdate,
    user: TokenData = Depends(
        require_roles(ROLE_SUPER_ADMIN, ROLE_RESPONSABLE_CHANTIER, ROLE_COMPTABLE)
    ),
):
    res = await db.engin_pointage.update_one(
        {"id": pointage_id},
        {
            "$set": {
                "status": payload.status,
                "validated_at": now_iso(),
                "validated_by": user.user_id,
                "validated_by_name": user.name,
            }
        },
    )
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Pointage introuvable")
    doc = await db.engin_pointage.find_one({"id": pointage_id}, {"_id": 0})
    return EnginPointageOut(**doc)


# ---------------- PAIEMENTS ----------------
@router.get("/paiements", response_model=List[EnginPaiementOut])
async def list_engin_paiements(
    engin_id: Optional[str] = None,
    chantier_id: Optional[str] = None,
    user: TokenData = Depends(get_current_user),
):
    flt = {}
    if engin_id:
        flt["engin_id"] = engin_id
    if chantier_id:
        flt["chantier_id"] = chantier_id
    docs = await db.engin_paiements.find(flt, {"_id": 0}).sort("date", -1).to_list(2000)
    return [EnginPaiementOut(**d) for d in docs]


@router.post("/paiements", response_model=EnginPaiementOut)
async def create_engin_paiement(
    payload: EnginPaiementCreate,
    user: TokenData = Depends(require_roles(ROLE_SUPER_ADMIN, ROLE_COMPTABLE)),
):
    engin = await db.engins.find_one({"id": payload.engin_id}, {"_id": 0})
    if not engin:
        raise HTTPException(status_code=404, detail="Engin introuvable")
    doc = payload.model_dump()
    doc["id"] = gen_id()
    doc["engin_name"] = engin["name"]
    doc["created_at"] = now_iso()
    await db.engin_paiements.insert_one(doc)

    # Auto-create transaction
    txn = {
        "id": gen_id(),
        "chantier_id": payload.chantier_id,
        "date": payload.date,
        "type": "DEBIT",
        "amount": payload.amount,
        "payment_mode": payload.payment_mode,
        "category": "location_engins",
        "description": f"Paiement {engin['name']}" + (f" ({payload.period_ref})" if payload.period_ref else ""),
        "related_operation": doc["id"],
        "status": "VALIDE",
        "needs_approval": False,
        "created_by": user.user_id,
        "created_by_name": user.name,
        "created_at": now_iso(),
    }
    await db.transactions.insert_one(txn)
    return EnginPaiementOut(**serialize_doc(doc))


@router.delete("/paiements/{paiement_id}")
async def delete_engin_paiement(
    paiement_id: str,
    user: TokenData = Depends(require_roles(ROLE_SUPER_ADMIN, ROLE_COMPTABLE)),
):
    res = await db.engin_paiements.delete_one({"id": paiement_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Paiement introuvable")
    await db.transactions.delete_many({"related_operation": paiement_id})
    return {"message": "Paiement supprimé"}
