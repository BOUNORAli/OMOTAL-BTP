"""Production router."""
from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional

from database import db
from models import gen_id, now_iso, StatusUpdate
from models_ext import (
    VoieCreate, VoieOut, ProductionCreate, ProductionUpdate, ProductionOut,
)
from auth import (
    get_current_user, require_roles, TokenData,
    ROLE_SUPER_ADMIN, ROLE_POINTEUR, ROLE_RESPONSABLE_CHANTIER, ROLE_COMPTABLE,
)
from utils_lib import serialize_doc

router = APIRouter(prefix="/api/production", tags=["production"])


def _compute_quantity(p: dict) -> float:
    """Compute quantity from dimensions if not provided manually."""
    if p.get("quantity") not in (None, 0, ""):
        return float(p["quantity"])
    unit = p.get("unit", "M3")
    L = p.get("length") or 0
    W = p.get("width") or 0
    D = p.get("depth") or 0
    if unit == "M3":
        return round(L * W * D, 2)
    if unit == "M2":
        return round(L * W, 2)
    if unit == "ML":
        return round(L, 2)
    return 0


# -------- VOIES --------
@router.get("/voies", response_model=List[VoieOut])
async def list_voies(
    chantier_id: Optional[str] = None, user: TokenData = Depends(get_current_user)
):
    flt = {"chantier_id": chantier_id} if chantier_id else {}
    docs = await db.voies.find(flt, {"_id": 0}).sort("name", 1).to_list(500)
    return [VoieOut(**d) for d in docs]


@router.post("/voies", response_model=VoieOut)
async def create_voie(
    payload: VoieCreate,
    user: TokenData = Depends(
        require_roles(ROLE_SUPER_ADMIN, ROLE_RESPONSABLE_CHANTIER, ROLE_POINTEUR)
    ),
):
    doc = payload.model_dump()
    doc["id"] = gen_id()
    doc["created_at"] = now_iso()
    await db.voies.insert_one(doc)
    return VoieOut(**serialize_doc(doc))


@router.delete("/voies/{voie_id}")
async def delete_voie(
    voie_id: str, user: TokenData = Depends(require_roles(ROLE_SUPER_ADMIN))
):
    await db.voies.delete_one({"id": voie_id})
    return {"message": "Voie supprimée"}


# -------- PRODUCTION --------
@router.get("", response_model=List[ProductionOut])
async def list_productions(
    chantier_id: Optional[str] = None,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    engin_id: Optional[str] = None,
    voie: Optional[str] = None,
    status_filter: Optional[str] = Query(None, alias="status"),
    user: TokenData = Depends(get_current_user),
):
    flt = {}
    if chantier_id: flt["chantier_id"] = chantier_id
    if engin_id: flt["engin_id"] = engin_id
    if voie: flt["voie"] = voie
    if status_filter: flt["status"] = status_filter
    if date_from or date_to:
        df = {}
        if date_from: df["$gte"] = date_from
        if date_to: df["$lte"] = date_to
        flt["date"] = df
    docs = await db.productions.find(flt, {"_id": 0}).sort("date", -1).to_list(5000)
    # enrich engin name
    engin_ids = list({d["engin_id"] for d in docs if d.get("engin_id")})
    engins = await db.engins.find({"id": {"$in": engin_ids}}, {"_id": 0}).to_list(500)
    name_map = {e["id"]: e["name"] for e in engins}
    for d in docs:
        d["engin_name"] = name_map.get(d.get("engin_id"))
        if d.get("hours") and d.get("quantity"):
            d["rendement"] = round(d["quantity"] / d["hours"], 2)
    return [ProductionOut(**d) for d in docs]


@router.post("", response_model=ProductionOut)
async def create_production(
    payload: ProductionCreate,
    user: TokenData = Depends(
        require_roles(
            ROLE_SUPER_ADMIN, ROLE_POINTEUR, ROLE_RESPONSABLE_CHANTIER
        )
    ),
):
    doc = payload.model_dump()
    doc["quantity"] = _compute_quantity(doc)
    doc["id"] = gen_id()
    doc["status"] = "SOUMIS"
    doc["created_by"] = user.user_id
    doc["created_by_name"] = user.name
    doc["created_at"] = now_iso()
    if doc.get("engin_id"):
        engin = await db.engins.find_one({"id": doc["engin_id"]}, {"_id": 0})
        if engin: doc["engin_name"] = engin["name"]
    if doc.get("chauffeur_id"):
        emp = await db.employees.find_one({"id": doc["chauffeur_id"]}, {"_id": 0})
        if emp: doc["chauffeur_name"] = emp["name"]
    if doc.get("hours") and doc["quantity"]:
        doc["rendement"] = round(doc["quantity"] / doc["hours"], 2)
    await db.productions.insert_one(doc)
    return ProductionOut(**serialize_doc(doc))


@router.patch("/{prod_id}", response_model=ProductionOut)
async def update_production(
    prod_id: str,
    payload: ProductionUpdate,
    user: TokenData = Depends(
        require_roles(ROLE_SUPER_ADMIN, ROLE_POINTEUR, ROLE_RESPONSABLE_CHANTIER)
    ),
):
    existing = await db.productions.find_one({"id": prod_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Production introuvable")
    update = {k: v for k, v in payload.model_dump(exclude_unset=True).items() if v is not None}
    merged = {**existing, **update}
    merged["quantity"] = _compute_quantity(merged)
    if merged.get("hours") and merged.get("quantity"):
        merged["rendement"] = round(merged["quantity"] / merged["hours"], 2)
    update["quantity"] = merged["quantity"]
    update["rendement"] = merged.get("rendement")
    await db.productions.update_one({"id": prod_id}, {"$set": update})
    doc = await db.productions.find_one({"id": prod_id}, {"_id": 0})
    return ProductionOut(**doc)


@router.post("/{prod_id}/status", response_model=ProductionOut)
async def update_status(
    prod_id: str,
    payload: StatusUpdate,
    user: TokenData = Depends(
        require_roles(ROLE_SUPER_ADMIN, ROLE_RESPONSABLE_CHANTIER)
    ),
):
    res = await db.productions.update_one(
        {"id": prod_id},
        {"$set": {
            "status": payload.status,
            "validated_by": user.user_id,
            "validated_by_name": user.name,
            "validation_motif": payload.motif,
            "validated_at": now_iso(),
        }},
    )
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Production introuvable")
    doc = await db.productions.find_one({"id": prod_id}, {"_id": 0})
    return ProductionOut(**doc)


@router.delete("/{prod_id}")
async def delete_production(
    prod_id: str, user: TokenData = Depends(require_roles(ROLE_SUPER_ADMIN))
):
    await db.productions.delete_one({"id": prod_id})
    return {"message": "Production supprimée"}


@router.get("/summary")
async def production_summary(
    chantier_id: Optional[str] = None,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    user: TokenData = Depends(get_current_user),
):
    flt = {"status": "VALIDE"}
    if chantier_id: flt["chantier_id"] = chantier_id
    if date_from or date_to:
        df = {}
        if date_from: df["$gte"] = date_from
        if date_to: df["$lte"] = date_to
        flt["date"] = df

    # By unit
    by_unit = await db.productions.aggregate([
        {"$match": flt},
        {"$group": {"_id": "$unit", "total": {"$sum": "$quantity"}, "count": {"$sum": 1}}},
    ]).to_list(20)

    # By engin
    by_engin = await db.productions.aggregate([
        {"$match": flt},
        {"$group": {"_id": "$engin_id", "qty": {"$sum": "$quantity"}, "hours": {"$sum": "$hours"}, "count": {"$sum": 1}}},
        {"$sort": {"qty": -1}},
        {"$limit": 20},
    ]).to_list(50)
    engin_ids = [r["_id"] for r in by_engin if r["_id"]]
    engins = await db.engins.find({"id": {"$in": engin_ids}}, {"_id": 0}).to_list(200)
    name_map = {e["id"]: e["name"] for e in engins}

    # By work_type
    by_work = await db.productions.aggregate([
        {"$match": flt},
        {"$group": {"_id": "$work_type", "qty": {"$sum": "$quantity"}, "count": {"$sum": 1}}},
        {"$sort": {"qty": -1}},
    ]).to_list(20)

    # By voie
    by_voie = await db.productions.aggregate([
        {"$match": flt},
        {"$group": {"_id": "$voie", "qty": {"$sum": "$quantity"}, "count": {"$sum": 1}}},
        {"$sort": {"qty": -1}},
        {"$limit": 20},
    ]).to_list(50)

    return {
        "by_unit": [{"unit": r["_id"], "total": round(r["total"] or 0, 2), "count": r["count"]} for r in by_unit],
        "by_engin": [{
            "engin_id": r["_id"], "engin_name": name_map.get(r["_id"], "?"),
            "quantity": round(r["qty"] or 0, 2), "hours": round(r["hours"] or 0, 2),
            "rendement": round((r["qty"] or 0) / r["hours"], 2) if r["hours"] else 0,
            "count": r["count"],
        } for r in by_engin],
        "by_work_type": [{"work_type": r["_id"], "quantity": round(r["qty"] or 0, 2), "count": r["count"]} for r in by_work],
        "by_voie": [{"voie": r["_id"] or "—", "quantity": round(r["qty"] or 0, 2), "count": r["count"]} for r in by_voie],
    }
