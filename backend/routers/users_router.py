"""Users (admin) router."""
from fastapi import APIRouter, Depends, HTTPException
from typing import List

from database import db
from models import UserCreate, UserUpdate, UserOut, gen_id, now_iso
from auth import (
    get_current_user,
    require_roles,
    hash_password,
    ROLE_SUPER_ADMIN,
    ALL_ROLES,
    TokenData,
)
from utils_lib import serialize_doc, serialize_list

router = APIRouter(prefix="/api/users", tags=["users"])


@router.get("", response_model=List[UserOut])
async def list_users(user: TokenData = Depends(get_current_user)):
    docs = await db.users.find({}, {"_id": 0, "password_hash": 0}).to_list(500)
    return [UserOut(**d) for d in docs]


@router.post("", response_model=UserOut)
async def create_user(
    payload: UserCreate, user: TokenData = Depends(require_roles(ROLE_SUPER_ADMIN))
):
    if payload.role not in ALL_ROLES:
        raise HTTPException(status_code=400, detail="Rôle invalide")
    existing = await db.users.find_one({"email": payload.email.lower()})
    if existing:
        raise HTTPException(status_code=400, detail="Email déjà utilisé")
    doc = {
        "id": gen_id(),
        "name": payload.name,
        "email": payload.email.lower(),
        "role": payload.role,
        "password_hash": hash_password(payload.password),
        "chantier_ids": payload.chantier_ids,
        "phone": payload.phone,
        "active": True,
        "created_at": now_iso(),
    }
    await db.users.insert_one(doc)
    doc.pop("password_hash", None)
    return UserOut(**serialize_doc(doc))


@router.patch("/{user_id}", response_model=UserOut)
async def update_user(
    user_id: str,
    payload: UserUpdate,
    user: TokenData = Depends(require_roles(ROLE_SUPER_ADMIN)),
):
    update = {k: v for k, v in payload.model_dump(exclude_unset=True).items() if v is not None}
    if "password" in update:
        update["password_hash"] = hash_password(update.pop("password"))
    if not update:
        raise HTTPException(status_code=400, detail="Aucune donnée à mettre à jour")
    res = await db.users.update_one({"id": user_id}, {"$set": update})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable")
    doc = await db.users.find_one({"id": user_id}, {"_id": 0, "password_hash": 0})
    return UserOut(**doc)


@router.delete("/{user_id}")
async def delete_user(
    user_id: str, user: TokenData = Depends(require_roles(ROLE_SUPER_ADMIN))
):
    if user.user_id == user_id:
        raise HTTPException(status_code=400, detail="Impossible de supprimer son propre compte")
    res = await db.users.delete_one({"id": user_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable")
    return {"message": "Utilisateur supprimé"}
