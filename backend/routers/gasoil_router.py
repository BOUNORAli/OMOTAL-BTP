"""Gasoil router."""
from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional

from database import db
from models import (
    GasoilEntreeCreate,
    GasoilEntreeOut,
    GasoilSortieCreate,
    GasoilSortieOut,
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
    ROLE_POINTEUR,
    ROLE_RESPONSABLE_CHANTIER,
)
from utils_lib import serialize_doc, GASOIL_LOW_STOCK_THRESHOLD

router = APIRouter(prefix="/api/gasoil", tags=["gasoil"])


# ---------------- ENTREES ----------------
@router.get("/entrees", response_model=List[GasoilEntreeOut])
async def list_entrees(
    chantier_id: Optional[str] = None,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    user: TokenData = Depends(get_current_user),
):
    flt = {}
    if chantier_id:
        flt["chantier_id"] = chantier_id
    if date_from or date_to:
        df = {}
        if date_from:
            df["$gte"] = date_from
        if date_to:
            df["$lte"] = date_to
        flt["date"] = df
    docs = await db.gasoil_entrees.find(flt, {"_id": 0}).sort("date", -1).to_list(2000)
    return [GasoilEntreeOut(**d) for d in docs]


@router.post("/entrees", response_model=GasoilEntreeOut)
async def create_entree(
    payload: GasoilEntreeCreate,
    user: TokenData = Depends(require_roles(ROLE_SUPER_ADMIN, ROLE_COMPTABLE)),
):
    doc = payload.model_dump()
    doc["id"] = gen_id()
    doc["total_amount"] = round(payload.litres * payload.unit_price, 2)
    doc["status"] = "VALIDE"
    doc["created_by"] = user.user_id
    doc["created_by_name"] = user.name
    doc["created_at"] = now_iso()
    await db.gasoil_entrees.insert_one(doc)
    return GasoilEntreeOut(**serialize_doc(doc))


@router.delete("/entrees/{entree_id}")
async def delete_entree(
    entree_id: str, user: TokenData = Depends(require_roles(ROLE_SUPER_ADMIN, ROLE_COMPTABLE))
):
    res = await db.gasoil_entrees.delete_one({"id": entree_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Entrée introuvable")
    return {"message": "Entrée supprimée"}


# ---------------- SORTIES ----------------
@router.get("/sorties", response_model=List[GasoilSortieOut])
async def list_sorties(
    chantier_id: Optional[str] = None,
    engin_id: Optional[str] = None,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    status_filter: Optional[str] = Query(None, alias="status"),
    user: TokenData = Depends(get_current_user),
):
    flt = {}
    if chantier_id:
        flt["chantier_id"] = chantier_id
    if engin_id:
        flt["engin_id"] = engin_id
    if status_filter:
        flt["status"] = status_filter
    if date_from or date_to:
        df = {}
        if date_from:
            df["$gte"] = date_from
        if date_to:
            df["$lte"] = date_to
        flt["date"] = df
    docs = await db.gasoil_sorties.find(flt, {"_id": 0}).sort("date", -1).to_list(2000)
    # enrich with engin name
    engin_ids = {d["engin_id"] for d in docs if d.get("engin_id")}
    engins = await db.engins.find({"id": {"$in": list(engin_ids)}}, {"_id": 0}).to_list(500)
    name_map = {e["id"]: e["name"] for e in engins}
    for d in docs:
        d["engin_name"] = name_map.get(d.get("engin_id"))
    return [GasoilSortieOut(**d) for d in docs]


@router.post("/sorties", response_model=GasoilSortieOut)
async def create_sortie(
    payload: GasoilSortieCreate,
    user: TokenData = Depends(
        require_roles(
            ROLE_SUPER_ADMIN,
            ROLE_POINTEUR,
            ROLE_RESPONSABLE_CHANTIER,
        )
    ),
):
    # Auto-fill unit price from latest entree if not provided
    unit_price = payload.unit_price
    if not unit_price:
        latest = await db.gasoil_entrees.find_one(
            {"chantier_id": payload.chantier_id}, {"_id": 0}, sort=[("date", -1)]
        )
        unit_price = (latest or {}).get("unit_price")

    doc = payload.model_dump()
    doc["id"] = gen_id()
    doc["unit_price"] = unit_price
    doc["total_amount"] = round(payload.litres * (unit_price or 0), 2)
    doc["status"] = "SOUMIS"
    doc["created_by"] = user.user_id
    doc["created_by_name"] = user.name
    doc["created_at"] = now_iso()
    # Lookup engin name and chauffeur
    engin = await db.engins.find_one({"id": payload.engin_id}, {"_id": 0})
    if engin:
        doc["engin_name"] = engin["name"]
    if payload.chauffeur_id:
        emp = await db.employees.find_one({"id": payload.chauffeur_id}, {"_id": 0})
        if emp:
            doc["chauffeur_name"] = emp["name"]
    await db.gasoil_sorties.insert_one(doc)
    return GasoilSortieOut(**serialize_doc(doc))


@router.post("/sorties/{sortie_id}/status", response_model=GasoilSortieOut)
async def update_sortie_status(
    sortie_id: str,
    payload: StatusUpdate,
    user: TokenData = Depends(
        require_roles(ROLE_SUPER_ADMIN, ROLE_RESPONSABLE_CHANTIER)
    ),
):
    res = await db.gasoil_sorties.update_one(
        {"id": sortie_id},
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
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Sortie introuvable")
    doc = await db.gasoil_sorties.find_one({"id": sortie_id}, {"_id": 0})
    return GasoilSortieOut(**doc)


@router.delete("/sorties/{sortie_id}")
async def delete_sortie(
    sortie_id: str, user: TokenData = Depends(require_roles(ROLE_SUPER_ADMIN))
):
    res = await db.gasoil_sorties.delete_one({"id": sortie_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Sortie introuvable")
    return {"message": "Sortie supprimée"}


# ---------------- STOCK ----------------
@router.get("/stock")
async def get_stock(
    chantier_id: Optional[str] = None, user: TokenData = Depends(get_current_user)
):
    flt = {}
    if chantier_id:
        flt["chantier_id"] = chantier_id

    # Entrees (only VALIDE)
    ent_pipeline = [
        {"$match": {**flt, "status": "VALIDE"}},
        {"$group": {"_id": None, "total_l": {"$sum": "$litres"}, "total_amt": {"$sum": "$total_amount"}}},
    ]
    ent = await db.gasoil_entrees.aggregate(ent_pipeline).to_list(10)
    entrees_l = ent[0]["total_l"] if ent else 0
    entrees_amt = ent[0]["total_amt"] if ent else 0

    # Sorties (only VALIDE counted for stock)
    sor_pipeline = [
        {"$match": {**flt, "status": "VALIDE"}},
        {"$group": {"_id": None, "total_l": {"$sum": "$litres"}, "total_amt": {"$sum": "$total_amount"}}},
    ]
    sor = await db.gasoil_sorties.aggregate(sor_pipeline).to_list(10)
    sorties_l = sor[0]["total_l"] if sor else 0
    sorties_amt = sor[0]["total_amt"] if sor else 0

    stock = round((entrees_l or 0) - (sorties_l or 0), 2)
    avg_price = round(entrees_amt / entrees_l, 2) if entrees_l else 0
    pending_sorties = await db.gasoil_sorties.count_documents({**flt, "status": "SOUMIS"})

    # Sorties par engin
    by_engin_pipe = [
        {"$match": {**flt, "status": "VALIDE"}},
        {"$group": {"_id": "$engin_id", "litres": {"$sum": "$litres"}, "amount": {"$sum": "$total_amount"}}},
        {"$sort": {"litres": -1}},
        {"$limit": 20},
    ]
    by_engin = await db.gasoil_sorties.aggregate(by_engin_pipe).to_list(50)
    engin_ids = [r["_id"] for r in by_engin if r["_id"]]
    engins = await db.engins.find({"id": {"$in": engin_ids}}, {"_id": 0}).to_list(200)
    name_map = {e["id"]: e["name"] for e in engins}

    return {
        "entrees_litres": entrees_l or 0,
        "sorties_litres": sorties_l or 0,
        "stock_theorique": stock,
        "entrees_amount": round(entrees_amt or 0, 2),
        "sorties_amount": round(sorties_amt or 0, 2),
        "average_price": avg_price,
        "pending_sorties": pending_sorties,
        "low_stock": stock <= GASOIL_LOW_STOCK_THRESHOLD,
        "by_engin": [
            {"engin_id": r["_id"], "engin_name": name_map.get(r["_id"], "?"),
             "litres": r["litres"], "amount": r["amount"]}
            for r in by_engin
        ],
    }
