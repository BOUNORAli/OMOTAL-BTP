"""BQ & Rentabilité router."""
from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional

from database import db
from models import gen_id, now_iso
from models_ext import BQArticleCreate, BQArticleUpdate, BQArticleOut
from auth import (
    get_current_user, require_roles, TokenData,
    ROLE_SUPER_ADMIN, ROLE_DIRECTEUR, ROLE_COMPTABLE,
)
from utils_lib import serialize_doc

router = APIRouter(prefix="/api/bq", tags=["bq"])


def _compute_bq(doc: dict) -> dict:
    qty_m = doc.get("quantity_marche", 0) or 0
    pu = doc.get("pu_marche_ht", 0) or 0
    doc["montant_marche_ht"] = round(qty_m * pu, 2)
    pr_total = (
        (doc.get("pr_main_oeuvre", 0) or 0)
        + (doc.get("pr_materiaux", 0) or 0)
        + (doc.get("pr_engins", 0) or 0)
        + (doc.get("pr_sous_traitance", 0) or 0)
        + (doc.get("frais_generaux", 0) or 0)
    )
    doc["pr_total"] = round(pr_total, 2)
    doc["marge_prevue"] = round(doc["montant_marche_ht"] - pr_total, 2)

    qty_r = doc.get("quantity_realisee", 0) or 0
    doc["avancement"] = round((qty_r / qty_m * 100) if qty_m else 0, 2)
    doc["montant_realise"] = round(qty_r * pu, 2)
    cout_reel = doc.get("cout_reel", 0) or 0
    doc["marge_reelle"] = round(doc["montant_realise"] - cout_reel, 2)
    doc["taux_marge_reel"] = round(
        (doc["marge_reelle"] / doc["montant_realise"] * 100) if doc["montant_realise"] else 0, 2
    )
    return doc


@router.get("/articles", response_model=List[BQArticleOut])
async def list_articles(
    chantier_id: Optional[str] = None,
    user: TokenData = Depends(get_current_user),
):
    flt = {}
    if chantier_id: flt["chantier_id"] = chantier_id
    docs = await db.bq_articles.find(flt, {"_id": 0}).sort("numero", 1).to_list(5000)
    # Auto-update quantity_realisee from production aggregated
    for d in docs:
        agg = await db.productions.aggregate([
            {"$match": {"article_bq_id": d["id"], "status": "VALIDE"}},
            {"$group": {"_id": None, "qty": {"$sum": "$quantity"}}},
        ]).to_list(5)
        auto_qty = agg[0]["qty"] if agg else 0
        if d.get("quantity_realisee", 0) == 0 and auto_qty > 0:
            d["quantity_realisee"] = round(auto_qty, 2)
        _compute_bq(d)
    return [BQArticleOut(**d) for d in docs]


@router.post("/articles", response_model=BQArticleOut)
async def create_article(
    payload: BQArticleCreate,
    user: TokenData = Depends(
        require_roles(ROLE_SUPER_ADMIN, ROLE_DIRECTEUR, ROLE_COMPTABLE)
    ),
):
    doc = payload.model_dump()
    doc["id"] = gen_id()
    doc["quantity_realisee"] = 0
    doc["cout_reel"] = 0
    doc = _compute_bq(doc)
    doc["created_at"] = now_iso()
    await db.bq_articles.insert_one(doc)
    return BQArticleOut(**serialize_doc(doc))


@router.patch("/articles/{article_id}", response_model=BQArticleOut)
async def update_article(
    article_id: str,
    payload: BQArticleUpdate,
    user: TokenData = Depends(
        require_roles(ROLE_SUPER_ADMIN, ROLE_DIRECTEUR, ROLE_COMPTABLE)
    ),
):
    existing = await db.bq_articles.find_one({"id": article_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Article introuvable")
    upd = {k: v for k, v in payload.model_dump(exclude_unset=True).items() if v is not None}
    merged = {**existing, **upd}
    merged = _compute_bq(merged)
    update_fields = {**upd,
                     "montant_marche_ht": merged["montant_marche_ht"],
                     "pr_total": merged["pr_total"],
                     "marge_prevue": merged["marge_prevue"],
                     "avancement": merged["avancement"],
                     "montant_realise": merged["montant_realise"],
                     "marge_reelle": merged["marge_reelle"],
                     "taux_marge_reel": merged["taux_marge_reel"]}
    await db.bq_articles.update_one({"id": article_id}, {"$set": update_fields})
    doc = await db.bq_articles.find_one({"id": article_id}, {"_id": 0})
    return BQArticleOut(**doc)


@router.delete("/articles/{article_id}")
async def delete_article(
    article_id: str, user: TokenData = Depends(require_roles(ROLE_SUPER_ADMIN))
):
    res = await db.bq_articles.delete_one({"id": article_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Article introuvable")
    return {"message": "Article supprimé"}


@router.get("/summary")
async def bq_summary(
    chantier_id: Optional[str] = None,
    user: TokenData = Depends(get_current_user),
):
    """BQ summary: only available for super admin and directeur."""
    flt = {}
    if chantier_id: flt["chantier_id"] = chantier_id
    articles = await db.bq_articles.find(flt, {"_id": 0}).to_list(5000)
    for a in articles:
        _compute_bq(a)
    total_marche = sum(a["montant_marche_ht"] for a in articles)
    total_realise = sum(a["montant_realise"] for a in articles)
    total_pr = sum(a["pr_total"] for a in articles)
    total_cout_reel = sum(a.get("cout_reel", 0) for a in articles)
    marge_prevue = total_marche - total_pr
    marge_reelle = total_realise - total_cout_reel
    avancement_global = round((total_realise / total_marche * 100) if total_marche else 0, 2)

    can_see_marge = user.role in (ROLE_SUPER_ADMIN, ROLE_DIRECTEUR)
    payload = {
        "count_articles": len(articles),
        "total_marche_ht": round(total_marche, 2),
        "total_realise_ht": round(total_realise, 2),
        "avancement_global": avancement_global,
    }
    if can_see_marge:
        payload.update({
            "total_pr_prevu": round(total_pr, 2),
            "total_cout_reel": round(total_cout_reel, 2),
            "marge_prevue": round(marge_prevue, 2),
            "marge_reelle": round(marge_reelle, 2),
            "taux_marge_prevu": round((marge_prevue / total_marche * 100) if total_marche else 0, 2),
            "taux_marge_reel": round((marge_reelle / total_realise * 100) if total_realise else 0, 2),
        })
    return payload
