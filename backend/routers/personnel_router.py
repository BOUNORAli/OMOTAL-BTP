"""Personnel router."""
from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional

from database import db
from models import (
    EmployeeCreate,
    EmployeeUpdate,
    EmployeeOut,
    PointagePersonnelUpsert,
    PointagePersonnelOut,
    PointageDayEntry,
    AvanceCreate,
    AvanceOut,
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
)
from utils_lib import serialize_doc, compute_salary_due

router = APIRouter(prefix="/api/personnel", tags=["personnel"])


# ---------------- EMPLOYEES ----------------
@router.get("/employees", response_model=List[EmployeeOut])
async def list_employees(
    chantier_id: Optional[str] = None,
    active_only: bool = True,
    user: TokenData = Depends(get_current_user),
):
    flt = {}
    if chantier_id:
        flt["chantier_id"] = chantier_id
    if active_only:
        flt["active"] = True
    docs = await db.employees.find(flt, {"_id": 0}).sort("name", 1).to_list(2000)
    return [EmployeeOut(**d) for d in docs]


@router.post("/employees", response_model=EmployeeOut)
async def create_employee(
    payload: EmployeeCreate,
    user: TokenData = Depends(
        require_roles(ROLE_SUPER_ADMIN, ROLE_COMPTABLE, ROLE_RESPONSABLE_CHANTIER)
    ),
):
    doc = payload.model_dump()
    doc["id"] = gen_id()
    doc["created_at"] = now_iso()
    await db.employees.insert_one(doc)
    return EmployeeOut(**serialize_doc(doc))


@router.patch("/employees/{employee_id}", response_model=EmployeeOut)
async def update_employee(
    employee_id: str,
    payload: EmployeeUpdate,
    user: TokenData = Depends(
        require_roles(ROLE_SUPER_ADMIN, ROLE_COMPTABLE, ROLE_RESPONSABLE_CHANTIER)
    ),
):
    update = {k: v for k, v in payload.model_dump(exclude_unset=True).items() if v is not None}
    if not update:
        raise HTTPException(status_code=400, detail="Aucune donnée à mettre à jour")
    res = await db.employees.update_one({"id": employee_id}, {"$set": update})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Employé introuvable")
    doc = await db.employees.find_one({"id": employee_id}, {"_id": 0})
    return EmployeeOut(**doc)


@router.delete("/employees/{employee_id}")
async def delete_employee(
    employee_id: str, user: TokenData = Depends(require_roles(ROLE_SUPER_ADMIN))
):
    await db.employees.update_one({"id": employee_id}, {"$set": {"active": False}})
    return {"message": "Employé désactivé"}


# ---------------- POINTAGE ----------------
async def _compute_pointage(doc: dict) -> dict:
    """Compute totals + salary using current employee tariff."""
    emp = await db.employees.find_one({"id": doc["employee_id"]}, {"_id": 0})
    if not emp:
        emp = {"remuneration_type": "JOUR"}
    total_hours = 0.0
    total_days = 0.0
    for e in doc.get("entries", []):
        h = e.get("hours", 0) or 0
        total_hours += h
        dt = e.get("day_type", "NORMAL")
        if dt == "NORMAL":
            total_days += 1 if h > 0 else 0
        elif dt == "DEMI":
            total_days += 0.5
    doc["total_hours"] = round(total_hours, 2)
    doc["total_days"] = total_days
    doc["salaire_du"] = compute_salary_due(
        emp.get("remuneration_type", "JOUR"),
        emp.get("salaire_mensuel"),
        emp.get("salaire_journalier"),
        emp.get("salaire_horaire"),
        total_hours,
        total_days,
    )
    # Sum avances for this employee/month
    year = doc["year"]
    month = doc["month"]
    month_prefix = f"{year:04d}-{month:02d}"
    avances_cursor = db.avances.find(
        {"employee_id": doc["employee_id"], "date": {"$regex": f"^{month_prefix}"}},
        {"_id": 0},
    )
    avances_docs = await avances_cursor.to_list(500)
    total_avances = sum(a.get("amount", 0) for a in avances_docs)
    doc["avances"] = round(total_avances, 2)

    # Reliquat precedent: salaire_du - avances of previous month if positive remaining
    prev_year, prev_month = (year, month - 1) if month > 1 else (year - 1, 12)
    prev = await db.pointage_personnel.find_one(
        {"employee_id": doc["employee_id"], "year": prev_year, "month": prev_month},
        {"_id": 0},
    )
    doc["reliquat_precedent"] = round((prev or {}).get("reliquat_final", 0), 2) if prev else 0

    montant_a_payer = doc["salaire_du"] - doc["avances"] + doc["reliquat_precedent"]
    # Reliquat final is what remains owed (can be carried over). For MVP, reliquat = montant_a_payer if >0
    doc["reliquat_final"] = round(max(montant_a_payer, 0), 2)
    doc["montant_a_payer"] = round(montant_a_payer, 2)
    doc["employee_name"] = emp.get("name")
    return doc


@router.get("/pointage", response_model=List[PointagePersonnelOut])
async def list_pointages(
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
    docs = await db.pointage_personnel.find(flt, {"_id": 0}).to_list(5000)
    # ensure computed fields are present (compute on the fly if missing)
    for d in docs:
        if d.get("salaire_du") is None or "montant_a_payer" not in d:
            await _compute_pointage(d)
    return [PointagePersonnelOut(**d) for d in docs]


@router.post("/pointage", response_model=PointagePersonnelOut)
async def upsert_pointage(
    payload: PointagePersonnelUpsert,
    user: TokenData = Depends(
        require_roles(
            ROLE_SUPER_ADMIN,
            ROLE_COMPTABLE,
            ROLE_RESPONSABLE_CHANTIER,
            ROLE_POINTEUR,
        )
    ),
):
    existing = await db.pointage_personnel.find_one(
        {
            "employee_id": payload.employee_id,
            "year": payload.year,
            "month": payload.month,
        }
    )
    doc = payload.model_dump()
    doc["updated_at"] = now_iso()
    if existing:
        doc["id"] = existing["id"]
        doc["status"] = existing.get("status", "BROUILLON")
    else:
        doc["id"] = gen_id()
        doc["status"] = "BROUILLON"

    doc = await _compute_pointage(doc)
    await db.pointage_personnel.update_one(
        {"id": doc["id"]}, {"$set": doc}, upsert=True
    )
    return PointagePersonnelOut(**doc)


@router.post("/pointage/{pointage_id}/status", response_model=PointagePersonnelOut)
async def update_pointage_status(
    pointage_id: str,
    payload: StatusUpdate,
    user: TokenData = Depends(require_roles(ROLE_SUPER_ADMIN, ROLE_COMPTABLE)),
):
    res = await db.pointage_personnel.update_one(
        {"id": pointage_id},
        {"$set": {"status": payload.status, "validated_at": now_iso(),
                  "validated_by": user.user_id, "validated_by_name": user.name}},
    )
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Pointage introuvable")
    doc = await db.pointage_personnel.find_one({"id": pointage_id}, {"_id": 0})
    return PointagePersonnelOut(**doc)


# ---------------- AVANCES ----------------
@router.get("/avances", response_model=List[AvanceOut])
async def list_avances(
    chantier_id: Optional[str] = None,
    employee_id: Optional[str] = None,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    user: TokenData = Depends(get_current_user),
):
    flt = {}
    if chantier_id:
        flt["chantier_id"] = chantier_id
    if employee_id:
        flt["employee_id"] = employee_id
    if date_from or date_to:
        df = {}
        if date_from:
            df["$gte"] = date_from
        if date_to:
            df["$lte"] = date_to
        flt["date"] = df
    docs = await db.avances.find(flt, {"_id": 0}).sort("date", -1).to_list(2000)
    return [AvanceOut(**d) for d in docs]


@router.post("/avances", response_model=AvanceOut)
async def create_avance(
    payload: AvanceCreate,
    user: TokenData = Depends(require_roles(ROLE_SUPER_ADMIN, ROLE_COMPTABLE)),
):
    emp = await db.employees.find_one({"id": payload.employee_id}, {"_id": 0})
    if not emp:
        raise HTTPException(status_code=404, detail="Employé introuvable")
    doc = payload.model_dump()
    doc["id"] = gen_id()
    doc["employee_name"] = emp.get("name")
    doc["created_by"] = user.user_id
    doc["created_at"] = now_iso()
    await db.avances.insert_one(doc)

    # Auto-create transaction in caisse
    txn = {
        "id": gen_id(),
        "chantier_id": payload.chantier_id,
        "date": payload.date,
        "type": "DEBIT",
        "amount": payload.amount,
        "payment_mode": payload.payment_mode,
        "category": "personnel",
        "sub_category": "avance",
        "description": f"Avance {emp.get('name')}" + (f" - {payload.motif}" if payload.motif else ""),
        "related_operation": doc["id"],
        "status": "VALIDE",
        "needs_approval": False,
        "created_by": user.user_id,
        "created_by_name": user.name,
        "created_at": now_iso(),
    }
    await db.transactions.insert_one(txn)
    return AvanceOut(**serialize_doc(doc))


@router.delete("/avances/{avance_id}")
async def delete_avance(
    avance_id: str, user: TokenData = Depends(require_roles(ROLE_SUPER_ADMIN, ROLE_COMPTABLE))
):
    res = await db.avances.delete_one({"id": avance_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Avance introuvable")
    # Optionally delete related transaction
    await db.transactions.delete_many({"related_operation": avance_id})
    return {"message": "Avance supprimée"}
