"""Validations router: aggregates pending validations across modules."""
from fastapi import APIRouter, Depends
from typing import List, Optional

from database import db
from auth import get_current_user, TokenData

router = APIRouter(prefix="/api/validations", tags=["validations"])


@router.get("/pending")
async def list_pending(
    chantier_id: Optional[str] = None,
    user: TokenData = Depends(get_current_user),
):
    flt_base = {}
    if chantier_id:
        flt_base["chantier_id"] = chantier_id

    # Sorties gasoil SOUMIS
    sorties = await db.gasoil_sorties.find(
        {**flt_base, "status": "SOUMIS"}, {"_id": 0}
    ).sort("date", -1).to_list(500)
    engin_ids = {s["engin_id"] for s in sorties}
    engins = await db.engins.find({"id": {"$in": list(engin_ids)}}, {"_id": 0}).to_list(500)
    engin_map = {e["id"]: e["name"] for e in engins}

    # Transactions SOUMIS (needs_approval)
    transactions = await db.transactions.find(
        {**flt_base, "status": "SOUMIS"}, {"_id": 0}
    ).sort("date", -1).to_list(500)

    # Engin pointages SOUMIS
    eng_p = await db.engin_pointage.find(
        {**flt_base, "status": "SOUMIS"}, {"_id": 0}
    ).to_list(500)

    # Personnel pointage SOUMIS
    pp = await db.pointage_personnel.find(
        {**flt_base, "status": "SOUMIS"}, {"_id": 0}
    ).to_list(500)

    # Chantier names
    chantier_ids_set = {x.get("chantier_id") for x in (sorties + transactions + eng_p + pp)}
    chantiers = await db.chantiers.find(
        {"id": {"$in": list(chantier_ids_set)}}, {"_id": 0}
    ).to_list(500)
    cname = {c["id"]: c["name"] for c in chantiers}

    items = []
    for s in sorties:
        items.append({
            "id": s["id"],
            "type": "GASOIL_SORTIE",
            "chantier_id": s["chantier_id"],
            "chantier_name": cname.get(s["chantier_id"]),
            "date": s["date"],
            "summary": f"Sortie gasoil {s['litres']}L → {engin_map.get(s['engin_id'], '?')}",
            "amount": s.get("total_amount"),
            "created_by_name": s.get("created_by_name"),
            "status": s["status"],
            "raw": s,
        })
    for t in transactions:
        items.append({
            "id": t["id"],
            "type": "TRANSACTION",
            "chantier_id": t["chantier_id"],
            "chantier_name": cname.get(t["chantier_id"]),
            "date": t["date"],
            "summary": f"{t['type']} • {t.get('category')} • {t.get('description','')[:60]}",
            "amount": t["amount"],
            "created_by_name": t.get("created_by_name"),
            "status": t["status"],
            "raw": t,
        })
    for e in eng_p:
        items.append({
            "id": e["id"],
            "type": "ENGIN_POINTAGE",
            "chantier_id": e["chantier_id"],
            "chantier_name": cname.get(e["chantier_id"]),
            "date": f"{e['year']}-{e['month']:02d}",
            "summary": f"Pointage engin {e.get('engin_name','?')} - {e.get('total_hours',0)}h / {e.get('total_days',0)}j",
            "amount": e.get("montant_du"),
            "status": e["status"],
            "raw": e,
        })
    for p in pp:
        items.append({
            "id": p["id"],
            "type": "PERSONNEL_POINTAGE",
            "chantier_id": p["chantier_id"],
            "chantier_name": cname.get(p["chantier_id"]),
            "date": f"{p['year']}-{p['month']:02d}",
            "summary": f"Paie {p.get('employee_name','?')} - {p.get('total_days',0)}j",
            "amount": p.get("salaire_du"),
            "status": p["status"],
            "raw": p,
        })

    return {"items": items, "total": len(items)}
