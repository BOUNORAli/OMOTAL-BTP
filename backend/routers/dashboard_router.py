"""Dashboards router: global + per-chantier KPIs."""
from fastapi import APIRouter, Depends
from typing import Optional
from datetime import datetime, timedelta

from database import db
from auth import get_current_user, TokenData
from utils_lib import GASOIL_LOW_STOCK_THRESHOLD

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/global")
async def dashboard_global(
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    user: TokenData = Depends(get_current_user),
):
    # Compute high-level KPIs across all visible chantiers
    chantiers = await db.chantiers.find(
        {"status": {"$ne": "ARCHIVE"}}, {"_id": 0}
    ).to_list(500)

    date_flt = {}
    if date_from:
        date_flt["$gte"] = date_from
    if date_to:
        date_flt["$lte"] = date_to

    base_flt = {"status": "VALIDE"}
    if date_flt:
        base_flt["date"] = date_flt

    # Total entrées/sorties
    txn_pipe = [
        {"$match": base_flt},
        {"$group": {"_id": "$type", "total": {"$sum": "$amount"}}},
    ]
    rows = await db.transactions.aggregate(txn_pipe).to_list(10)
    entrees = sum(r["total"] for r in rows if r["_id"] == "CREDIT")
    sorties = sum(r["total"] for r in rows if r["_id"] == "DEBIT")

    # Gasoil total
    ent_l = await db.gasoil_entrees.aggregate([
        {"$match": {"status": "VALIDE"}},
        {"$group": {"_id": None, "l": {"$sum": "$litres"}}},
    ]).to_list(5)
    sor_l = await db.gasoil_sorties.aggregate([
        {"$match": {"status": "VALIDE"}},
        {"$group": {"_id": None, "l": {"$sum": "$litres"}}},
    ]).to_list(5)
    stock_total = (ent_l[0]["l"] if ent_l else 0) - (sor_l[0]["l"] if sor_l else 0)

    # Per-chantier KPIs
    chantier_cards = []
    for c in chantiers:
        t_pipe = [
            {"$match": {"chantier_id": c["id"], "status": "VALIDE"}},
            {"$group": {"_id": "$type", "total": {"$sum": "$amount"}}},
        ]
        tr = await db.transactions.aggregate(t_pipe).to_list(10)
        c_entrees = sum(x["total"] for x in tr if x["_id"] == "CREDIT")
        c_sorties = sum(x["total"] for x in tr if x["_id"] == "DEBIT")
        c_ent_l = await db.gasoil_entrees.aggregate([
            {"$match": {"chantier_id": c["id"], "status": "VALIDE"}},
            {"$group": {"_id": None, "l": {"$sum": "$litres"}}},
        ]).to_list(5)
        c_sor_l = await db.gasoil_sorties.aggregate([
            {"$match": {"chantier_id": c["id"], "status": "VALIDE"}},
            {"$group": {"_id": None, "l": {"$sum": "$litres"}}},
        ]).to_list(5)
        c_stock = (c_ent_l[0]["l"] if c_ent_l else 0) - (c_sor_l[0]["l"] if c_sor_l else 0)
        alerts_count = await db.alerts.count_documents({"chantier_id": c["id"], "status": "NEW"})
        chantier_cards.append({
            "id": c["id"],
            "name": c["name"],
            "code": c["code"],
            "status": c.get("status"),
            "sorties": round(c_sorties, 2),
            "entrees": round(c_entrees, 2),
            "solde": round(c_entrees - c_sorties, 2),
            "stock_gasoil": round(c_stock, 2),
            "low_stock": c_stock <= GASOIL_LOW_STOCK_THRESHOLD,
            "alerts": alerts_count,
            "montant_marche_ht": c.get("montant_marche_ht"),
        })

    # Top categories
    cat_pipe = [
        {"$match": {"type": "DEBIT", "status": "VALIDE"}},
        {"$group": {"_id": "$category", "total": {"$sum": "$amount"}}},
        {"$sort": {"total": -1}},
        {"$limit": 10},
    ]
    cats = await db.transactions.aggregate(cat_pipe).to_list(20)

    # Alerts critical count
    critical = await db.alerts.count_documents({"severity": {"$in": ["CRITICAL", "HIGH"]}, "status": "NEW"})
    pending_validations = (
        await db.transactions.count_documents({"status": "SOUMIS"})
        + await db.gasoil_sorties.count_documents({"status": "SOUMIS"})
        + await db.engin_pointage.count_documents({"status": "SOUMIS"})
        + await db.pointage_personnel.count_documents({"status": "SOUMIS"})
    )

    return {
        "kpis": {
            "active_chantiers": len([c for c in chantiers if c.get("status") == "EN_COURS"]),
            "total_chantiers": len(chantiers),
            "entrees": round(entrees, 2),
            "sorties": round(sorties, 2),
            "solde": round(entrees - sorties, 2),
            "stock_gasoil_total": round(stock_total, 2),
            "alerts_critical": critical,
            "pending_validations": pending_validations,
        },
        "chantier_cards": chantier_cards,
        "categories": [{"category": c["_id"], "total": round(c["total"], 2)} for c in cats],
    }


@router.get("/chantier/{chantier_id}")
async def dashboard_chantier(
    chantier_id: str, user: TokenData = Depends(get_current_user)
):
    c = await db.chantiers.find_one({"id": chantier_id}, {"_id": 0})
    if not c:
        return {"error": "Chantier introuvable"}
    # Caisse
    t_pipe = [
        {"$match": {"chantier_id": chantier_id, "status": "VALIDE"}},
        {"$group": {"_id": "$type", "total": {"$sum": "$amount"}}},
    ]
    rows = await db.transactions.aggregate(t_pipe).to_list(10)
    entrees = sum(r["total"] for r in rows if r["_id"] == "CREDIT")
    sorties = sum(r["total"] for r in rows if r["_id"] == "DEBIT")

    # Gasoil
    ent = await db.gasoil_entrees.aggregate([
        {"$match": {"chantier_id": chantier_id, "status": "VALIDE"}},
        {"$group": {"_id": None, "l": {"$sum": "$litres"}, "amt": {"$sum": "$total_amount"}}},
    ]).to_list(5)
    sor = await db.gasoil_sorties.aggregate([
        {"$match": {"chantier_id": chantier_id, "status": "VALIDE"}},
        {"$group": {"_id": None, "l": {"$sum": "$litres"}, "amt": {"$sum": "$total_amount"}}},
    ]).to_list(5)
    e_l = ent[0]["l"] if ent else 0
    s_l = sor[0]["l"] if sor else 0
    stock = e_l - s_l

    # Engins
    eng_count = await db.engins.count_documents({"chantier_id": chantier_id, "status": "MOBILISE"})
    eng_du = await db.engin_pointage.aggregate([
        {"$match": {"chantier_id": chantier_id}},
        {"$group": {"_id": None, "total": {"$sum": "$montant_du"}}},
    ]).to_list(5)
    eng_paye = await db.engin_paiements.aggregate([
        {"$match": {"chantier_id": chantier_id}},
        {"$group": {"_id": None, "total": {"$sum": "$amount"}}},
    ]).to_list(5)
    eng_du_amt = eng_du[0]["total"] if eng_du else 0
    eng_paye_amt = eng_paye[0]["total"] if eng_paye else 0

    # Personnel
    emp_count = await db.employees.count_documents({"chantier_id": chantier_id, "active": True})
    salaire_pipe = [
        {"$match": {"chantier_id": chantier_id}},
        {"$group": {"_id": None, "du": {"$sum": "$salaire_du"}, "paid": {"$sum": "$avances"}}},
    ]
    sal = await db.pointage_personnel.aggregate(salaire_pipe).to_list(5)
    salaire_du = sal[0]["du"] if sal else 0
    salaire_paye = sal[0]["paid"] if sal else 0

    # Trend: monthly sorties last 6 months
    today = datetime.now()
    months = []
    for i in range(5, -1, -1):
        y = today.year
        m = today.month - i
        while m <= 0:
            m += 12
            y -= 1
        months.append((y, m))
    monthly_data = []
    for (y, m) in months:
        prefix = f"{y:04d}-{m:02d}"
        tot = await db.transactions.aggregate([
            {"$match": {"chantier_id": chantier_id, "type": "DEBIT", "status": "VALIDE",
                        "date": {"$regex": f"^{prefix}"}}},
            {"$group": {"_id": None, "t": {"$sum": "$amount"}}},
        ]).to_list(5)
        monthly_data.append({
            "month": prefix,
            "sorties": round(tot[0]["t"] if tot else 0, 2),
        })

    # Alerts for chantier
    alerts = await db.alerts.find(
        {"chantier_id": chantier_id, "status": "NEW"}, {"_id": 0}
    ).sort("created_at", -1).to_list(50)

    return {
        "chantier": c,
        "caisse": {
            "entrees": round(entrees, 2),
            "sorties": round(sorties, 2),
            "solde": round(entrees - sorties, 2),
        },
        "gasoil": {
            "entrees_l": e_l,
            "sorties_l": s_l,
            "stock": round(stock, 2),
            "low_stock": stock <= GASOIL_LOW_STOCK_THRESHOLD,
            "prix_moyen": round(ent[0]["amt"] / e_l, 2) if e_l else 0,
        },
        "engins": {
            "count": eng_count,
            "du": round(eng_du_amt, 2),
            "paye": round(eng_paye_amt, 2),
            "restant": round(eng_du_amt - eng_paye_amt, 2),
        },
        "personnel": {
            "count": emp_count,
            "salaire_du": round(salaire_du, 2),
            "avances": round(salaire_paye, 2),
            "restant": round(salaire_du - salaire_paye, 2),
        },
        "monthly_trend": monthly_data,
        "alerts": alerts,
    }
