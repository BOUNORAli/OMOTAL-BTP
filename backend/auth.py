"""Authentication utilities: JWT, password hashing, role-based access control."""
import os
from datetime import datetime, timedelta, timezone
from typing import Optional, List

import bcrypt
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel

JWT_SECRET = os.environ.get("JWT_SECRET", "omotal-secret-key-change-in-production-2026")
JWT_ALGORITHM = "HS256"
JWT_EXPIRE_HOURS = 24 * 7  # 7 days

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)


class TokenData(BaseModel):
    user_id: str
    email: str
    role: str
    name: str


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(password: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(password.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False


def create_access_token(user_id: str, email: str, role: str, name: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRE_HOURS)
    payload = {
        "sub": user_id,
        "email": email,
        "role": role,
        "name": name,
        "exp": expire,
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def decode_token(token: str) -> Optional[TokenData]:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return TokenData(
            user_id=payload["sub"],
            email=payload["email"],
            role=payload["role"],
            name=payload["name"],
        )
    except jwt.PyJWTError:
        return None


async def get_current_user(token: Optional[str] = Depends(oauth2_scheme)) -> TokenData:
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Non authentifié")
    data = decode_token(token)
    if not data:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token invalide")
    return data


def require_roles(*roles: str):
    """Dependency factory: ensures current user has one of the allowed roles."""

    async def _checker(user: TokenData = Depends(get_current_user)) -> TokenData:
        if user.role not in roles:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Accès refusé")
        return user

    return _checker


# Role constants
ROLE_SUPER_ADMIN = "SUPER_ADMIN"
ROLE_DIRECTEUR = "DIRECTEUR"
ROLE_RESPONSABLE_CHANTIER = "RESPONSABLE_CHANTIER"
ROLE_POINTEUR = "POINTEUR"
ROLE_COMPTABLE = "COMPTABLE"
ROLE_MATERIEL = "MATERIEL"
ROLE_LECTURE_SEULE = "LECTURE_SEULE"

ALL_ROLES = [
    ROLE_SUPER_ADMIN,
    ROLE_DIRECTEUR,
    ROLE_RESPONSABLE_CHANTIER,
    ROLE_POINTEUR,
    ROLE_COMPTABLE,
    ROLE_MATERIEL,
    ROLE_LECTURE_SEULE,
]

# Default permissions per role
ROLE_PERMISSIONS = {
    ROLE_SUPER_ADMIN: ["*"],
    ROLE_DIRECTEUR: [
        "dashboard.global", "chantier.read", "caisse.read", "caisse.validate_high",
        "gasoil.read", "personnel.read", "personnel.read_salary", "engins.read",
        "rentabilite.read", "reports.export", "validations.high", "alertes.read",
    ],
    ROLE_RESPONSABLE_CHANTIER: [
        "dashboard.chantier", "chantier.read", "gasoil.read", "gasoil.validate",
        "personnel.read", "personnel.create", "engins.read", "engins.validate",
        "production.read", "production.create", "production.validate",
        "validations.operational", "alertes.read",
    ],
    ROLE_POINTEUR: [
        "dashboard.chantier", "chantier.read", "gasoil.create_sortie", "gasoil.read_own",
        "engins.read", "engins.pointage", "production.create",
    ],
    ROLE_COMPTABLE: [
        "dashboard.global", "chantier.read", "caisse.read", "caisse.create",
        "gasoil.read", "gasoil.create_entree", "personnel.read", "personnel.create",
        "personnel.read_salary", "engins.read", "engins.pay", "fournisseurs.read",
        "fournisseurs.create", "reports.export", "alertes.read",
    ],
    ROLE_MATERIEL: [
        "chantier.read", "engins.read", "entretien.create", "entretien.read",
    ],
    ROLE_LECTURE_SEULE: [
        "dashboard.global", "chantier.read", "reports.export",
    ],
}
