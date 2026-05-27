"""OMOTAL TRAVAUX - Application web de gestion de chantiers.

Main FastAPI application file. Wires all routers.
"""
import os
import logging
from pathlib import Path

from fastapi import FastAPI, APIRouter
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

from database import db, ensure_indexes, seed_initial_data  # noqa: E402
from routers.auth_router import router as auth_router  # noqa: E402
from routers.users_router import router as users_router  # noqa: E402
from routers.chantiers_router import router as chantiers_router  # noqa: E402
from routers.caisse_router import router as caisse_router  # noqa: E402
from routers.gasoil_router import router as gasoil_router  # noqa: E402
from routers.personnel_router import router as personnel_router  # noqa: E402
from routers.engins_router import router as engins_router  # noqa: E402
from routers.validations_router import router as validations_router  # noqa: E402
from routers.alerts_router import router as alerts_router  # noqa: E402
from routers.dashboard_router import router as dashboard_router  # noqa: E402
from routers.excel_router import router as excel_router  # noqa: E402

app = FastAPI(title="OMOTAL TRAVAUX - Gestion de Chantiers", version="1.0.0")

api_router = APIRouter(prefix="/api")


@api_router.get("/")
async def root():
    return {"message": "OMOTAL TRAVAUX API", "version": "1.0.0"}


@api_router.get("/health")
async def health():
    return {"status": "ok"}


# Register all routers (each one has /api prefix already)
app.include_router(api_router)
app.include_router(auth_router)
app.include_router(users_router)
app.include_router(chantiers_router)
app.include_router(caisse_router)
app.include_router(gasoil_router)
app.include_router(personnel_router)
app.include_router(engins_router)
app.include_router(validations_router)
app.include_router(alerts_router)
app.include_router(dashboard_router)
app.include_router(excel_router)


app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


@app.on_event("startup")
async def startup_event():
    await ensure_indexes()
    await seed_initial_data()
    logger.info("OMOTAL TRAVAUX backend ready.")


@app.on_event("shutdown")
async def shutdown_event():
    from database import client as mongo_client
    mongo_client.close()
