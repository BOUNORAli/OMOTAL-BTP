"""Database connection + initial seed (demo users, chantiers, etc.)."""
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get("DB_NAME", "omotal_db")]

from auth import (  # noqa: E402
    hash_password,
    ROLE_SUPER_ADMIN,
    ROLE_DIRECTEUR,
    ROLE_RESPONSABLE_CHANTIER,
    ROLE_POINTEUR,
    ROLE_COMPTABLE,
    ROLE_MATERIEL,
)
from models import gen_id, now_iso

DEFAULT_PASSWORD = "omotal123"


async def ensure_indexes():
    await db.users.create_index("email", unique=True)
    await db.chantiers.create_index("code", unique=True)
    await db.transactions.create_index([("chantier_id", 1), ("date", -1)])
    await db.gasoil_entrees.create_index([("chantier_id", 1), ("date", -1)])
    await db.gasoil_sorties.create_index([("chantier_id", 1), ("date", -1)])
    await db.employees.create_index("name")
    await db.pointage_personnel.create_index(
        [("employee_id", 1), ("year", 1), ("month", 1)], unique=True
    )
    await db.engins.create_index("name")
    await db.engin_pointage.create_index(
        [("engin_id", 1), ("year", 1), ("month", 1)], unique=True
    )
    await db.alerts.create_index([("created_at", -1)])
    await db.productions.create_index([("chantier_id", 1), ("date", -1)])
    await db.voies.create_index([("chantier_id", 1), ("name", 1)])
    await db.fournisseurs.create_index("name")
    await db.achats_matieres.create_index([("chantier_id", 1), ("date", -1)])
    await db.paiements_fournisseur.create_index([("achat_id", 1), ("date", -1)])
    await db.bq_articles.create_index([("chantier_id", 1), ("numero", 1)])


async def seed_initial_data():
    """Seed demo users, chantiers, engins, employees if DB empty."""
    count = await db.users.count_documents({})
    if count > 0:
        return

    # ---- Chantiers ----
    chantiers = [
        {
            "id": gen_id(),
            "name": "Chantier Génie Meknès",
            "code": "AO-62/2026",
            "ref_ao": "62/2026",
            "maitre_ouvrage": "Ministère de l'Équipement",
            "localisation": "Meknès, Maroc",
            "start_date": "2026-01-15",
            "expected_end_date": "2026-12-31",
            "montant_marche_ht": 8_500_000,
            "tva": 20.0,
            "status": "EN_COURS",
            "description": "Réhabilitation route régionale - tronçon Meknès",
            "created_at": now_iso(),
        },
        {
            "id": gen_id(),
            "name": "Chantier Zaitoune",
            "code": "ZTN-2026-001",
            "ref_ao": "ZTN/001",
            "maitre_ouvrage": "Commune Urbaine",
            "localisation": "Fès, Maroc",
            "start_date": "2026-03-01",
            "expected_end_date": "2026-11-30",
            "montant_marche_ht": 4_200_000,
            "tva": 20.0,
            "status": "EN_COURS",
            "description": "Aménagement voirie quartier Zaitoune",
            "created_at": now_iso(),
        },
        {
            "id": gen_id(),
            "name": "Chantier Berkane",
            "code": "BRK-2026",
            "ref_ao": "BRK/02/2026",
            "maitre_ouvrage": "Région Oriental",
            "localisation": "Berkane, Maroc",
            "start_date": "2026-04-10",
            "expected_end_date": "2027-02-28",
            "montant_marche_ht": 6_300_000,
            "tva": 20.0,
            "status": "PREPARATION",
            "description": "Construction piste rurale",
            "created_at": now_iso(),
        },
    ]
    await db.chantiers.insert_many(chantiers)
    all_chantier_ids = [c["id"] for c in chantiers]

    # ---- Users ----
    users = [
        {
            "id": gen_id(),
            "name": "Ali Bounor",
            "email": "ali@omotal.ma",
            "role": ROLE_SUPER_ADMIN,
            "password_hash": hash_password(DEFAULT_PASSWORD),
            "chantier_ids": all_chantier_ids,
            "phone": "+212 661 000001",
            "active": True,
            "created_at": now_iso(),
        },
        {
            "id": gen_id(),
            "name": "Boubker Directeur",
            "email": "boubker@omotal.ma",
            "role": ROLE_DIRECTEUR,
            "password_hash": hash_password(DEFAULT_PASSWORD),
            "chantier_ids": all_chantier_ids,
            "phone": "+212 661 000002",
            "active": True,
            "created_at": now_iso(),
        },
        {
            "id": gen_id(),
            "name": "Ayoub Pointeur",
            "email": "ayoub@omotal.ma",
            "role": ROLE_POINTEUR,
            "password_hash": hash_password(DEFAULT_PASSWORD),
            "chantier_ids": [all_chantier_ids[0]],
            "phone": "+212 661 000003",
            "active": True,
            "created_at": now_iso(),
        },
        {
            "id": gen_id(),
            "name": "Karim Comptable",
            "email": "comptable@omotal.ma",
            "role": ROLE_COMPTABLE,
            "password_hash": hash_password(DEFAULT_PASSWORD),
            "chantier_ids": all_chantier_ids,
            "phone": "+212 661 000004",
            "active": True,
            "created_at": now_iso(),
        },
        {
            "id": gen_id(),
            "name": "Younes Chef Chantier",
            "email": "chef@omotal.ma",
            "role": ROLE_RESPONSABLE_CHANTIER,
            "password_hash": hash_password(DEFAULT_PASSWORD),
            "chantier_ids": [all_chantier_ids[0], all_chantier_ids[1]],
            "phone": "+212 661 000005",
            "active": True,
            "created_at": now_iso(),
        },
        {
            "id": gen_id(),
            "name": "Hassan Mécano",
            "email": "mecano@omotal.ma",
            "role": ROLE_MATERIEL,
            "password_hash": hash_password(DEFAULT_PASSWORD),
            "chantier_ids": all_chantier_ids,
            "phone": "+212 661 000006",
            "active": True,
            "created_at": now_iso(),
        },
    ]
    await db.users.insert_many(users)

    # Set responsable_id for chantier 1 to chef
    chef = next(u for u in users if u["role"] == ROLE_RESPONSABLE_CHANTIER)
    await db.chantiers.update_one(
        {"id": all_chantier_ids[0]}, {"$set": {"responsable_id": chef["id"]}}
    )
    await db.chantiers.update_one(
        {"id": all_chantier_ids[1]}, {"$set": {"responsable_id": chef["id"]}}
    )

    # ---- Employees ----
    employees = [
        {"id": gen_id(), "name": "Mohamed Ouvrier", "poste": "Maçon", "chantier_id": all_chantier_ids[0],
         "remuneration_type": "JOUR", "salaire_journalier": 180.0, "active": True, "created_at": now_iso()},
        {"id": gen_id(), "name": "Ahmed Chauffeur", "poste": "Chauffeur", "chantier_id": all_chantier_ids[0],
         "remuneration_type": "MOIS", "salaire_mensuel": 5200.0, "active": True, "created_at": now_iso()},
        {"id": gen_id(), "name": "Said Manoeuvre", "poste": "Manoeuvre", "chantier_id": all_chantier_ids[0],
         "remuneration_type": "JOUR", "salaire_journalier": 150.0, "active": True, "created_at": now_iso()},
        {"id": gen_id(), "name": "Rachid Chef d'équipe", "poste": "Chef d'équipe", "chantier_id": all_chantier_ids[0],
         "remuneration_type": "MOIS", "salaire_mensuel": 7800.0, "active": True, "created_at": now_iso()},
        {"id": gen_id(), "name": "Khalid Mounaim", "poste": "Opérateur niveleuse", "chantier_id": all_chantier_ids[1],
         "remuneration_type": "MOIS", "salaire_mensuel": 6500.0, "active": True, "created_at": now_iso()},
        {"id": gen_id(), "name": "Driss Soudeur", "poste": "Soudeur", "chantier_id": all_chantier_ids[1],
         "remuneration_type": "JOUR", "salaire_journalier": 220.0, "active": True, "created_at": now_iso()},
    ]
    await db.employees.insert_many(employees)

    # ---- Engins ----
    engins = [
        {"id": gen_id(), "name": "Pelle CAT 320", "type": "PELLE", "proprietaire": "OMOTAL",
         "chantier_id": all_chantier_ids[0], "facturation_mode": "HEURE", "tarif_horaire": 350.0,
         "matricule": "M-CAT320-001", "status": "MOBILISE", "created_at": now_iso()},
        {"id": gen_id(), "name": "Niveleuse Mounaim", "type": "NIVELEUSE", "proprietaire": "Loueur ext.",
         "chantier_id": all_chantier_ids[0], "facturation_mode": "JOUR", "tarif_journalier": 2800.0,
         "matricule": "NV-MOU-002", "status": "MOBILISE", "created_at": now_iso()},
        {"id": gen_id(), "name": "Tractopelle Ayoub", "type": "TRACTOPELLE", "proprietaire": "OMOTAL",
         "chantier_id": all_chantier_ids[0], "facturation_mode": "HEURE", "tarif_horaire": 220.0,
         "matricule": "TRC-AY-003", "status": "MOBILISE", "created_at": now_iso()},
        {"id": gen_id(), "name": "Camion Renault 6T", "type": "CAMION", "proprietaire": "OMOTAL",
         "chantier_id": all_chantier_ids[1], "facturation_mode": "JOUR", "tarif_journalier": 1500.0,
         "matricule": "CMN-RE-004", "status": "MOBILISE", "created_at": now_iso()},
        {"id": gen_id(), "name": "Compacteur Bomag", "type": "COMPACTEUR", "proprietaire": "OMOTAL",
         "chantier_id": all_chantier_ids[1], "facturation_mode": "HEURE", "tarif_horaire": 180.0,
         "matricule": "CMP-BO-005", "status": "MOBILISE", "created_at": now_iso()},
    ]
    await db.engins.insert_many(engins)

    # ---- Sample gasoil entries ----
    from datetime import datetime, timedelta
    today = datetime.now().date()
    gasoil_entries = []
    for i in range(5):
        d = (today - timedelta(days=i * 3)).isoformat()
        gasoil_entries.append({
            "id": gen_id(),
            "chantier_id": all_chantier_ids[0],
            "date": d,
            "fournisseur": "Station Total Meknès",
            "litres": 500 + i * 50,
            "unit_price": 13.5,
            "total_amount": (500 + i * 50) * 13.5,
            "br_number": f"BR-{1000 + i}",
            "bon_fournisseur": f"BF-{2000 + i}",
            "payment_mode": "BANQUE_OMOTAL",
            "status": "VALIDE",
            "created_at": now_iso(),
        })
    await db.gasoil_entrees.insert_many(gasoil_entries)

    # ---- Sample transactions ----
    sample_txns = []
    cats = [
        ("DEBIT", "gasoil", "Achat gasoil station", 6750),
        ("DEBIT", "personnel", "Avance Mohamed Ouvrier", 800),
        ("DEBIT", "matieres", "Ciment 50 sacs", 4500),
        ("CREDIT", "financement", "Financement direction", 50000),
        ("DEBIT", "location_engins", "Paiement Niveleuse Mounaim", 14000),
        ("DEBIT", "frais_generaux", "Carburant véhicule chef", 350),
    ]
    for i, (ttype, cat, desc, amt) in enumerate(cats):
        d = (today - timedelta(days=i)).isoformat()
        sample_txns.append({
            "id": gen_id(),
            "chantier_id": all_chantier_ids[0],
            "date": d,
            "type": ttype,
            "amount": amt,
            "payment_mode": "BANQUE_OMOTAL" if amt > 5000 else "ESPECES_OMOTAL",
            "category": cat,
            "description": desc,
            "status": "VALIDE",
            "needs_approval": False,
            "created_at": now_iso(),
        })
    await db.transactions.insert_many(sample_txns)
