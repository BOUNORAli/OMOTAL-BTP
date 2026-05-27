"""Chantiers router."""
from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional

from database import db
from models import ChantierCreate, ChantierUpdate, ChantierOut, gen_id, now_iso
from auth import get_current_user, require_roles, ROLE_SUPER_ADMIN, TokenData
from utils_lib import serialize_doc

router = APIRouter(prefix="/api/chantiers", tags=["chantiers"])


async def _filter_visible_for_user(user: TokenData):
    """Return mongo filter dict based on user's chantier access."""
    if user.role == ROLE_SUPER_ADMIN:
        return {}
    u = await db.users.find_one({"id": user.user_id}, {"_id": 0})
    chantier_ids = (u or {}).get("chantier_ids", []) or []
    return {"id": {"$in": chantier_ids}}


@router.get("", response_model=List[ChantierOut])
async def list_chantiers(user: TokenData = Depends(get_current_user)):
    flt = await _filter_visible_for_user(user)
    docs = await db.chantiers.find(flt, {"_id": 0}).sort("created_at", -1).to_list(500)
    return [ChantierOut(**d) for d in docs]


@router.get("/{chantier_id}", response_model=ChantierOut)
async def get_chantier(chantier_id: str, user: TokenData = Depends(get_current_user)):
    doc = await db.chantiers.find_one({"id": chantier_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Chantier introuvable")
    return ChantierOut(**doc)


@router.post("", response_model=ChantierOut)
async def create_chantier(
    payload: ChantierCreate, user: TokenData = Depends(require_roles(ROLE_SUPER_ADMIN))
):
    existing = await db.chantiers.find_one({"code": payload.code})
    if existing:
        raise HTTPException(status_code=400, detail="Code chantier déjà utilisé")
    doc = payload.model_dump()
    doc["id"] = gen_id()
    doc["created_at"] = now_iso()
    await db.chantiers.insert_one(doc)
    # auto-grant access to creator
    await db.users.update_one(
        {"id": user.user_id}, {"$addToSet": {"chantier_ids": doc["id"]}}
    )
    return ChantierOut(**serialize_doc(doc))


@router.patch("/{chantier_id}", response_model=ChantierOut)
async def update_chantier(
    chantier_id: str,
    payload: ChantierUpdate,
    user: TokenData = Depends(require_roles(ROLE_SUPER_ADMIN)),
):
    update = {k: v for k, v in payload.model_dump(exclude_unset=True).items() if v is not None}
    if not update:
        raise HTTPException(status_code=400, detail="Aucune donnée à mettre à jour")
    res = await db.chantiers.update_one({"id": chantier_id}, {"$set": update})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Chantier introuvable")
    doc = await db.chantiers.find_one({"id": chantier_id}, {"_id": 0})
    return ChantierOut(**doc)


@router.delete("/{chantier_id}")
async def delete_chantier(
    chantier_id: str, user: TokenData = Depends(require_roles(ROLE_SUPER_ADMIN))
):
    # Soft delete -> archive
    res = await db.chantiers.update_one(
        {"id": chantier_id}, {"$set": {"status": "ARCHIVE"}}
    )
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Chantier introuvable")
    return {"message": "Chantier archivé"}


@router.post("/{chantier_id}/assign-user")
async def assign_user(
    chantier_id: str,
    user_id: str = Query(...),
    current: TokenData = Depends(require_roles(ROLE_SUPER_ADMIN)),
):
    chantier = await db.chantiers.find_one({"id": chantier_id})
    if not chantier:
        raise HTTPException(status_code=404, detail="Chantier introuvable")
    await db.users.update_one(
        {"id": user_id}, {"$addToSet": {"chantier_ids": chantier_id}}
    )
    return {"message": "Utilisateur affecté au chantier"}


@router.post("/{chantier_id}/unassign-user")
async def unassign_user(
    chantier_id: str,
    user_id: str = Query(...),
    current: TokenData = Depends(require_roles(ROLE_SUPER_ADMIN)),
):
    await db.users.update_one(
        {"id": user_id}, {"$pull": {"chantier_ids": chantier_id}}
    )
    return {"message": "Utilisateur retiré du chantier"}
