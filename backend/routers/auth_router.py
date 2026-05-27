"""Authentication router."""
from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime, timezone

from database import db
from models import LoginRequest, LoginResponse, UserOut, gen_id, now_iso
from auth import (
    verify_password,
    create_access_token,
    get_current_user,
    TokenData,
    ROLE_PERMISSIONS,
)
from utils_lib import serialize_doc

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/login", response_model=LoginResponse)
async def login(payload: LoginRequest):
    user = await db.users.find_one({"email": payload.email.lower()})
    if not user or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Email ou mot de passe incorrect")
    if not user.get("active", True):
        raise HTTPException(status_code=403, detail="Compte désactivé")

    token = create_access_token(user["id"], user["email"], user["role"], user["name"])
    await db.users.update_one({"id": user["id"]}, {"$set": {"last_login": now_iso()}})
    user_doc = serialize_doc(user)
    user_doc.pop("password_hash", None)
    return LoginResponse(access_token=token, user=UserOut(**user_doc))


@router.get("/me")
async def me(user: TokenData = Depends(get_current_user)):
    doc = await db.users.find_one({"id": user.user_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable")
    out = serialize_doc(doc)
    out.pop("password_hash", None)
    out["permissions"] = ROLE_PERMISSIONS.get(out["role"], [])
    return out


@router.get("/demo-users")
async def list_demo_users():
    """List demo users for the quick-select login (not exposing passwords)."""
    cursor = db.users.find({"active": True}, {"_id": 0, "password_hash": 0})
    users = await cursor.to_list(50)
    return {
        "users": [
            {
                "email": u["email"],
                "name": u["name"],
                "role": u["role"],
            }
            for u in users
        ],
        "default_password": "omotal123",
    }
