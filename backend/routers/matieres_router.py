"""Matières & Fournisseurs router."""
from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional

from database import db
from models import gen_id, now_iso
from models_ext import (
    FournisseurCreate, FournisseurUpdate, FournisseurOut,
    AchatMatiereCreate, AchatMatiereOut,
    PaiementFournisseurCreate, PaiementFournisseurOut,
)
from auth import (
    get_current_user, require_roles, TokenData,
    ROLE_SUPER_ADMIN, ROLE_COMPTABLE,
)
from utils_lib import serialize_doc

router = APIRouter(prefix="/api/matieres", tags=["matieres"])


# -------- FOURNISSEURS --------
@router.get("/fournisseurs", response_model=List[FournisseurOut])
async def list_fournisseurs(
    type_filter: Optional[str] = Query(None, alias="type"),
    user: TokenData = Depends(get_current_user),
):
    flt = {}
    if type_filter: flt["type"] = type_filter
    docs = await db.fournisseurs.find(flt, {"_id": 0}).sort("name", 1).to_list(1000)
    return [FournisseurOut(**d) for d in docs]


@router.post("/fournisseurs", response_model=FournisseurOut)
async def create_fournisseur(
    payload: FournisseurCreate,
    user: TokenData = Depends(require_roles(ROLE_SUPER_ADMIN, ROLE_COMPTABLE)),
):
    doc = payload.model_dump()
    doc["id"] = gen_id()
    doc["created_at"] = now_iso()
    await db.fournisseurs.insert_one(doc)
    return FournisseurOut(**serialize_doc(doc))


@router.patch("/fournisseurs/{f_id}", response_model=FournisseurOut)
async def update_fournisseur(
    f_id: str,
    payload: FournisseurUpdate,
    user: TokenData = Depends(require_roles(ROLE_SUPER_ADMIN, ROLE_COMPTABLE)),
):
    upd = {k: v for k, v in payload.model_dump(exclude_unset=True).items() if v is not None}
    if not upd:
        raise HTTPException(status_code=400, detail="Rien à mettre à jour")
    res = await db.fournisseurs.update_one({"id": f_id}, {"$set": upd})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Fournisseur introuvable")
    doc = await db.fournisseurs.find_one({"id": f_id}, {"_id": 0})
    return FournisseurOut(**doc)


@router.delete("/fournisseurs/{f_id}")
async def delete_fournisseur(
    f_id: str, user: TokenData = Depends(require_roles(ROLE_SUPER_ADMIN))
):
    await db.fournisseurs.update_one({"id": f_id}, {"$set": {"active": False}})
    return {"message": "Fournisseur désactivé"}


# -------- ACHATS --------
def _compute_totals(doc: dict) -> dict:
    qty = doc.get("quantity", 0) or 0
    pu = doc.get("unit_price", 0) or 0
    transport = doc.get("transport_ht", 0) or 0
    tva_rate = doc.get("tva_rate", 0) or 0
    total_ht = round(qty * pu + transport, 2)
    total_tva = round(total_ht * tva_rate / 100, 2)
    total_ttc = round(total_ht + total_tva, 2)
    doc["total_ht"] = total_ht
    doc["total_tva"] = total_tva
    doc["total_ttc"] = total_ttc
    return doc


async def _refresh_payment_status(achat_id: str):
    achat = await db.achats_matieres.find_one({"id": achat_id})
    if not achat:
        return
    paiements = await db.paiements_fournisseur.aggregate([
        {"$match": {"achat_id": achat_id}},
        {"$group": {"_id": None, "total": {"$sum": "$amount"}}},
    ]).to_list(5)
    paye = paiements[0]["total"] if paiements else 0
    restant = round(achat["total_ttc"] - paye, 2)
    status = "PAYE" if restant <= 0.01 else ("PARTIEL" if paye > 0 else "NON_PAYE")
    await db.achats_matieres.update_one(
        {"id": achat_id},
        {"$set": {"montant_paye": round(paye, 2), "montant_restant": max(restant, 0),
                  "payment_status": status}},
    )


@router.get("/achats", response_model=List[AchatMatiereOut])
async def list_achats(
    chantier_id: Optional[str] = None,
    fournisseur_id: Optional[str] = None,
    payment_status: Optional[str] = None,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    user: TokenData = Depends(get_current_user),
):
    flt = {}
    if chantier_id: flt["chantier_id"] = chantier_id
    if fournisseur_id: flt["fournisseur_id"] = fournisseur_id
    if payment_status: flt["payment_status"] = payment_status
    if date_from or date_to:
        df = {}
        if date_from: df["$gte"] = date_from
        if date_to: df["$lte"] = date_to
        flt["date"] = df
    docs = await db.achats_matieres.find(flt, {"_id": 0}).sort("date", -1).to_list(5000)
    # enrich fournisseur name
    f_ids = list({d["fournisseur_id"] for d in docs if d.get("fournisseur_id")})
    fournisseurs = await db.fournisseurs.find({"id": {"$in": f_ids}}, {"_id": 0}).to_list(500)
    fmap = {f["id"]: f["name"] for f in fournisseurs}
    for d in docs:
        d["fournisseur_name"] = fmap.get(d.get("fournisseur_id"))
    return [AchatMatiereOut(**d) for d in docs]


@router.post("/achats", response_model=AchatMatiereOut)
async def create_achat(
    payload: AchatMatiereCreate,
    user: TokenData = Depends(require_roles(ROLE_SUPER_ADMIN, ROLE_COMPTABLE)),
):
    fournisseur = await db.fournisseurs.find_one({"id": payload.fournisseur_id}, {"_id": 0})
    if not fournisseur:
        raise HTTPException(status_code=404, detail="Fournisseur introuvable")
    doc = payload.model_dump()
    doc["id"] = gen_id()
    doc["fournisseur_name"] = fournisseur["name"]
    doc = _compute_totals(doc)
    doc["montant_paye"] = 0
    doc["montant_restant"] = doc["total_ttc"]
    doc["payment_status"] = "NON_PAYE"
    doc["created_by"] = user.user_id
    doc["created_at"] = now_iso()
    await db.achats_matieres.insert_one(doc)
    return AchatMatiereOut(**serialize_doc(doc))


@router.delete("/achats/{achat_id}")
async def delete_achat(
    achat_id: str, user: TokenData = Depends(require_roles(ROLE_SUPER_ADMIN, ROLE_COMPTABLE))
):
    res = await db.achats_matieres.delete_one({"id": achat_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Achat introuvable")
    await db.paiements_fournisseur.delete_many({"achat_id": achat_id})
    return {"message": "Achat supprimé"}


# -------- PAIEMENTS --------
@router.get("/paiements", response_model=List[PaiementFournisseurOut])
async def list_paiements(
    achat_id: Optional[str] = None,
    fournisseur_id: Optional[str] = None,
    chantier_id: Optional[str] = None,
    user: TokenData = Depends(get_current_user),
):
    flt = {}
    if achat_id: flt["achat_id"] = achat_id
    if fournisseur_id: flt["fournisseur_id"] = fournisseur_id
    if chantier_id: flt["chantier_id"] = chantier_id
    docs = await db.paiements_fournisseur.find(flt, {"_id": 0}).sort("date", -1).to_list(5000)
    return [PaiementFournisseurOut(**d) for d in docs]


@router.post("/paiements", response_model=PaiementFournisseurOut)
async def create_paiement(
    payload: PaiementFournisseurCreate,
    user: TokenData = Depends(require_roles(ROLE_SUPER_ADMIN, ROLE_COMPTABLE)),
):
    achat = await db.achats_matieres.find_one({"id": payload.achat_id}, {"_id": 0})
    if not achat:
        raise HTTPException(status_code=404, detail="Achat introuvable")
    if payload.amount <= 0:
        raise HTTPException(status_code=400, detail="Montant invalide")

    doc = payload.model_dump()
    doc["id"] = gen_id()
    doc["chantier_id"] = achat["chantier_id"]
    doc["fournisseur_id"] = achat["fournisseur_id"]
    doc["fournisseur_name"] = achat.get("fournisseur_name")
    doc["created_by"] = user.user_id
    doc["created_at"] = now_iso()
    await db.paiements_fournisseur.insert_one(doc)

    # Auto-create transaction
    txn = {
        "id": gen_id(),
        "chantier_id": achat["chantier_id"],
        "date": payload.date,
        "type": "DEBIT",
        "amount": payload.amount,
        "payment_mode": payload.payment_mode,
        "category": "matieres",
        "description": f"Paiement {achat.get('fournisseur_name', '')} - {achat.get('designation', '')[:50]}",
        "fournisseur": achat.get("fournisseur_name"),
        "related_operation": doc["id"],
        "status": "VALIDE",
        "needs_approval": False,
        "created_by": user.user_id,
        "created_by_name": user.name,
        "created_at": now_iso(),
    }
    await db.transactions.insert_one(txn)

    await _refresh_payment_status(payload.achat_id)
    return PaiementFournisseurOut(**serialize_doc(doc))


@router.delete("/paiements/{paiement_id}")
async def delete_paiement(
    paiement_id: str, user: TokenData = Depends(require_roles(ROLE_SUPER_ADMIN, ROLE_COMPTABLE))
):
    pay = await db.paiements_fournisseur.find_one({"id": paiement_id})
    if not pay:
        raise HTTPException(status_code=404, detail="Paiement introuvable")
    await db.paiements_fournisseur.delete_one({"id": paiement_id})
    await db.transactions.delete_many({"related_operation": paiement_id})
    await _refresh_payment_status(pay["achat_id"])
    return {"message": "Paiement supprimé"}


# -------- SITUATION FOURNISSEUR --------
@router.get("/situation/{fournisseur_id}")
async def situation_fournisseur(
    fournisseur_id: str, user: TokenData = Depends(get_current_user)
):
    f = await db.fournisseurs.find_one({"id": fournisseur_id}, {"_id": 0})
    if not f:
        raise HTTPException(status_code=404, detail="Fournisseur introuvable")
    achats = await db.achats_matieres.find({"fournisseur_id": fournisseur_id}, {"_id": 0}).sort("date", -1).to_list(2000)
    paiements = await db.paiements_fournisseur.find({"fournisseur_id": fournisseur_id}, {"_id": 0}).sort("date", -1).to_list(2000)
    total_ttc = sum(a["total_ttc"] for a in achats)
    total_paye = sum(p["amount"] for p in paiements)
    return {
        "fournisseur": f,
        "total_ttc": round(total_ttc, 2),
        "total_paye": round(total_paye, 2),
        "total_restant": round(total_ttc - total_paye, 2),
        "achats": achats,
        "paiements": paiements,
    }


@router.get("/situations")
async def situations_all(
    chantier_id: Optional[str] = None, user: TokenData = Depends(get_current_user)
):
    """Aggregated situation per fournisseur."""
    flt = {}
    if chantier_id: flt["chantier_id"] = chantier_id
    achats_pipe = [
        {"$match": flt},
        {"$group": {
            "_id": "$fournisseur_id",
            "total_ttc": {"$sum": "$total_ttc"},
            "total_paye": {"$sum": "$montant_paye"},
            "count": {"$sum": 1},
        }},
    ]
    rows = await db.achats_matieres.aggregate(achats_pipe).to_list(500)
    f_ids = [r["_id"] for r in rows if r["_id"]]
    fournisseurs = await db.fournisseurs.find({"id": {"$in": f_ids}}, {"_id": 0}).to_list(500)
    fmap = {f["id"]: f for f in fournisseurs}
    return [{
        "fournisseur_id": r["_id"],
        "fournisseur_name": fmap.get(r["_id"], {}).get("name", "?"),
        "type": fmap.get(r["_id"], {}).get("type"),
        "count": r["count"],
        "total_ttc": round(r["total_ttc"] or 0, 2),
        "total_paye": round(r["total_paye"] or 0, 2),
        "total_restant": round((r["total_ttc"] or 0) - (r["total_paye"] or 0), 2),
    } for r in sorted(rows, key=lambda x: x.get("total_ttc", 0), reverse=True)]
