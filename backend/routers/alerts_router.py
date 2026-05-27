"""Alerts router: generates and lists alerts."""
from fastapi import APIRouter, Depends
from typing import List, Optional

from database import db
from models import gen_id, now_iso
from auth import get_current_user, TokenData
from utils_lib import GASOIL_LOW_STOCK_THRESHOLD, HIGH_PAYMENT_THRESHOLD

router = APIRouter(prefix="/api/alertes", tags=["alertes"])


async def _generate_alerts():
    """Recompute and persist current alerts."""
    # Clear NEW alerts to recompute
    await db.alerts.delete_many({"status": "NEW"})

    alerts = []
    chantiers = await db.chantiers.find(
        {"status": {"$ne": "ARCHIVE"}}, {"_id": 0}
    ).to_list(500)
    cname = {c["id"]: c["name"] for c in chantiers}

    # 1. Stock gasoil bas per chantier
    for c in chantiers:
        ent = await db.gasoil_entrees.aggregate([
            {"$match": {"chantier_id": c["id"], "status": "VALIDE"}},
            {"$group": {"_id": None, "l": {"$sum": "$litres"}}},
        ]).to_list(5)
        sor = await db.gasoil_sorties.aggregate([
            {"$match": {"chantier_id": c["id"], "status": "VALIDE"}},
            {"$group": {"_id": None, "l": {"$sum": "$litres"}}},
        ]).to_list(5)
        e_l = ent[0]["l"] if ent else 0
        s_l = sor[0]["l"] if sor else 0
        stock = e_l - s_l
        if stock <= 0 and (e_l > 0 or s_l > 0):
            alerts.append({
                "id": gen_id(), "chantier_id": c["id"], "chantier_name": c["name"],
                "module": "GASOIL", "severity": "CRITICAL",
                "title": "Stock gasoil négatif ou nul",
                "message": f"Stock théorique ≤ 0 ({stock} L). Vérifier les saisies.",
                "status": "NEW", "created_at": now_iso(),
            })
        elif 0 < stock <= GASOIL_LOW_STOCK_THRESHOLD:
            alerts.append({
                "id": gen_id(), "chantier_id": c["id"], "chantier_name": c["name"],
                "module": "GASOIL", "severity": "HIGH",
                "title": "Stock gasoil bas",
                "message": f"Stock théorique faible: {stock} L (seuil {GASOIL_LOW_STOCK_THRESHOLD} L)",
                "status": "NEW", "created_at": now_iso(),
            })

    # 2. Transactions en attente validation élevées
    pending_txns = await db.transactions.find(
        {"status": "SOUMIS", "needs_approval": True}, {"_id": 0}
    ).to_list(500)
    for t in pending_txns:
        alerts.append({
            "id": gen_id(),
            "chantier_id": t["chantier_id"],
            "chantier_name": cname.get(t["chantier_id"]),
            "module": "CAISSE", "severity": "HIGH",
            "title": "Paiement élevé en attente",
            "message": f"Transaction {t['amount']:.0f} MAD - {t.get('description','')[:60]}",
            "related_id": t["id"],
            "status": "NEW", "created_at": now_iso(),
        })

    # 3. Sorties gasoil en attente
    pending_sorties = await db.gasoil_sorties.count_documents({"status": "SOUMIS"})
    if pending_sorties > 0:
        alerts.append({
            "id": gen_id(), "module": "GASOIL", "severity": "WARN",
            "title": "Sorties gasoil en attente de validation",
            "message": f"{pending_sorties} sortie(s) en attente. À valider rapidement.",
            "status": "NEW", "created_at": now_iso(),
        })

    # 4. Sorties sans engin (data quality)
    bad_sorties = await db.gasoil_sorties.count_documents({"engin_id": {"$in": [None, ""]}})
    if bad_sorties > 0:
        alerts.append({
            "id": gen_id(), "module": "GASOIL", "severity": "WARN",
            "title": "Sorties gasoil sans engin",
            "message": f"{bad_sorties} sortie(s) sans engin associé.",
            "status": "NEW", "created_at": now_iso(),
        })

    if alerts:
        await db.alerts.insert_many(alerts)
    return alerts


@router.get("")
async def list_alerts(
    chantier_id: Optional[str] = None,
    module: Optional[str] = None,
    severity: Optional[str] = None,
    user: TokenData = Depends(get_current_user),
):
    # Always regenerate fresh alerts when listing
    await _generate_alerts()
    flt = {}
    if chantier_id:
        flt["chantier_id"] = chantier_id
    if module:
        flt["module"] = module
    if severity:
        flt["severity"] = severity
    docs = await db.alerts.find(flt, {"_id": 0}).sort("created_at", -1).to_list(500)
    # severity order
    sev_order = {"CRITICAL": 0, "HIGH": 1, "WARN": 2, "INFO": 3}
    docs.sort(key=lambda x: sev_order.get(x.get("severity", "INFO"), 99))
    return {"items": docs, "total": len(docs)}


@router.post("/{alert_id}/resolve")
async def resolve_alert(alert_id: str, user: TokenData = Depends(get_current_user)):
    await db.alerts.update_one({"id": alert_id}, {"$set": {"status": "RESOLVED"}})
    return {"message": "Alerte résolue"}


@router.post("/{alert_id}/ignore")
async def ignore_alert(alert_id: str, user: TokenData = Depends(get_current_user)):
    await db.alerts.update_one({"id": alert_id}, {"$set": {"status": "IGNORED"}})
    return {"message": "Alerte ignorée"}
