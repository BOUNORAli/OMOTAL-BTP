"""Caisse / Transactions router."""
from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from datetime import datetime

from database import db
from models import (
    TransactionCreate,
    TransactionUpdate,
    TransactionOut,
    StatusUpdate,
    gen_id,
    now_iso,
)
from auth import (
    get_current_user,
    require_roles,
    TokenData,
    ROLE_SUPER_ADMIN,
    ROLE_DIRECTEUR,
    ROLE_COMPTABLE,
)
from utils_lib import serialize_doc, HIGH_PAYMENT_THRESHOLD

router = APIRouter(prefix="/api/caisse", tags=["caisse"])

CATEGORIES = [
    "personnel",
    "gasoil",
    "matieres",
    "location_engins",
    "entretien",
    "transport",
    "etp",
    "frais_generaux",
    "financement",
    "divers",
]


@router.get("/categories")
async def get_categories():
    return {"categories": CATEGORIES}


@router.get("", response_model=List[TransactionOut])
async def list_transactions(
    chantier_id: Optional[str] = None,
    type_filter: Optional[str] = Query(None, alias="type"),
    category: Optional[str] = None,
    payment_mode: Optional[str] = None,
    status_filter: Optional[str] = Query(None, alias="status"),
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    q: Optional[str] = None,
    user: TokenData = Depends(get_current_user),
):
    flt = {}
    if chantier_id:
        flt["chantier_id"] = chantier_id
    if type_filter:
        flt["type"] = type_filter
    if category:
        flt["category"] = category
    if payment_mode:
        flt["payment_mode"] = payment_mode
    if status_filter:
        flt["status"] = status_filter
    if date_from or date_to:
        date_flt = {}
        if date_from:
            date_flt["$gte"] = date_from
        if date_to:
            date_flt["$lte"] = date_to
        flt["date"] = date_flt
    if q:
        flt["$or"] = [
            {"description": {"$regex": q, "$options": "i"}},
            {"fournisseur": {"$regex": q, "$options": "i"}},
        ]
    docs = await db.transactions.find(flt, {"_id": 0}).sort("date", -1).to_list(2000)
    return [TransactionOut(**d) for d in docs]


@router.post("", response_model=TransactionOut)
async def create_transaction(
    payload: TransactionCreate,
    user: TokenData = Depends(
        require_roles(ROLE_SUPER_ADMIN, ROLE_COMPTABLE)
    ),
):
    needs_approval = payload.amount >= HIGH_PAYMENT_THRESHOLD and payload.type == "DEBIT"
    doc = payload.model_dump()
    doc["id"] = gen_id()
    doc["status"] = "SOUMIS" if needs_approval else "VALIDE"
    doc["needs_approval"] = needs_approval
    doc["created_by"] = user.user_id
    doc["created_by_name"] = user.name
    if not needs_approval:
        doc["validated_by"] = user.user_id
        doc["validated_by_name"] = user.name
    doc["created_at"] = now_iso()
    await db.transactions.insert_one(doc)
    return TransactionOut(**serialize_doc(doc))


@router.patch("/{txn_id}", response_model=TransactionOut)
async def update_transaction(
    txn_id: str,
    payload: TransactionUpdate,
    user: TokenData = Depends(require_roles(ROLE_SUPER_ADMIN, ROLE_COMPTABLE)),
):
    existing = await db.transactions.find_one({"id": txn_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Transaction introuvable")
    if existing.get("status") == "VALIDE" and user.role != ROLE_SUPER_ADMIN:
        raise HTTPException(
            status_code=400,
            detail="Transaction déjà validée : seul l'admin peut la modifier",
        )
    update = {k: v for k, v in payload.model_dump(exclude_unset=True).items() if v is not None}
    if not update:
        raise HTTPException(status_code=400, detail="Aucune donnée à mettre à jour")
    await db.transactions.update_one({"id": txn_id}, {"$set": update})
    doc = await db.transactions.find_one({"id": txn_id}, {"_id": 0})
    return TransactionOut(**doc)


@router.post("/{txn_id}/status", response_model=TransactionOut)
async def update_status(
    txn_id: str,
    payload: StatusUpdate,
    user: TokenData = Depends(
        require_roles(ROLE_SUPER_ADMIN, ROLE_DIRECTEUR, ROLE_COMPTABLE)
    ),
):
    existing = await db.transactions.find_one({"id": txn_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Transaction introuvable")
    if payload.status == "VALIDE":
        if existing.get("needs_approval") and user.role not in (
            ROLE_SUPER_ADMIN,
            ROLE_DIRECTEUR,
        ):
            raise HTTPException(
                status_code=403,
                detail="Paiement élevé : validation réservée au directeur",
            )
    await db.transactions.update_one(
        {"id": txn_id},
        {
            "$set": {
                "status": payload.status,
                "validated_by": user.user_id,
                "validated_by_name": user.name,
                "validation_motif": payload.motif,
                "validated_at": now_iso(),
            }
        },
    )
    doc = await db.transactions.find_one({"id": txn_id}, {"_id": 0})
    return TransactionOut(**doc)


@router.delete("/{txn_id}")
async def delete_transaction(
    txn_id: str, user: TokenData = Depends(require_roles(ROLE_SUPER_ADMIN))
):
    res = await db.transactions.delete_one({"id": txn_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Transaction introuvable")
    return {"message": "Transaction supprimée"}


@router.get("/summary")
async def caisse_summary(
    chantier_id: Optional[str] = None,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    user: TokenData = Depends(get_current_user),
):
    flt = {}
    if chantier_id:
        flt["chantier_id"] = chantier_id
    if date_from or date_to:
        date_flt = {}
        if date_from:
            date_flt["$gte"] = date_from
        if date_to:
            date_flt["$lte"] = date_to
        flt["date"] = date_flt

    # Only validated transactions count toward solde
    pipeline = [
        {"$match": {**flt, "status": "VALIDE"}},
        {"$group": {
            "_id": {"type": "$type", "payment_mode": "$payment_mode"},
            "total": {"$sum": "$amount"},
            "count": {"$sum": 1},
        }},
    ]
    rows = await db.transactions.aggregate(pipeline).to_list(200)
    entrees = 0
    sorties = 0
    by_mode = {}
    for r in rows:
        t = r["_id"]["type"]
        mode = r["_id"]["payment_mode"]
        amt = r["total"]
        if t == "CREDIT":
            entrees += amt
            by_mode.setdefault(mode, 0)
            by_mode[mode] += amt
        else:
            sorties += amt
            by_mode.setdefault(mode, 0)
            by_mode[mode] -= amt

    # Category breakdown for debits
    cat_pipeline = [
        {"$match": {**flt, "status": "VALIDE", "type": "DEBIT"}},
        {"$group": {"_id": "$category", "total": {"$sum": "$amount"}}},
        {"$sort": {"total": -1}},
    ]
    cat_rows = await db.transactions.aggregate(cat_pipeline).to_list(200)
    categories = [{"category": r["_id"], "total": r["total"]} for r in cat_rows]

    # Pending count
    pending = await db.transactions.count_documents({**flt, "status": "SOUMIS"})

    return {
        "entrees": round(entrees, 2),
        "sorties": round(sorties, 2),
        "solde": round(entrees - sorties, 2),
        "by_mode": [{"mode": k, "solde": round(v, 2)} for k, v in by_mode.items()],
        "categories": categories,
        "pending_validation": pending,
    }
