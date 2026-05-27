"""Helpers: doc serialization, filters, calculations."""
from typing import Any, Dict, List, Optional
from datetime import datetime, timezone
import calendar


def serialize_doc(doc: Optional[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
    if not doc:
        return None
    out = {}
    for k, v in doc.items():
        if k == "_id":
            continue
        if isinstance(v, datetime):
            out[k] = v.isoformat()
        else:
            out[k] = v
    return out


def serialize_list(docs: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    return [serialize_doc(d) for d in docs if d]


def days_in_month(year: int, month: int) -> int:
    return calendar.monthrange(year, month)[1]


DEFAULT_HEURES_PAR_JOUR = 9
DEFAULT_JOURS_PAR_MOIS = 26


def compute_salary_due(
    remuneration_type: str,
    salaire_mensuel: Optional[float],
    salaire_journalier: Optional[float],
    salaire_horaire: Optional[float],
    total_hours: float,
    total_days: float,
) -> float:
    if remuneration_type == "HEURE":
        rate = salaire_horaire or (
            (salaire_mensuel or 0) / DEFAULT_JOURS_PAR_MOIS / DEFAULT_HEURES_PAR_JOUR
        )
        return round(rate * total_hours, 2)
    elif remuneration_type == "JOUR":
        rate = salaire_journalier or (
            (salaire_mensuel or 0) / DEFAULT_JOURS_PAR_MOIS
        )
        return round(rate * total_days, 2)
    elif remuneration_type == "MOIS":
        # Pro-rated by attendance: ratio = total_days/DEFAULT_JOURS_PAR_MOIS
        if total_days <= 0 and total_hours <= 0:
            return 0.0
        ratio = min(total_days / DEFAULT_JOURS_PAR_MOIS, 1.0) if total_days > 0 else 0.0
        # If only hours provided, derive days
        if total_days == 0 and total_hours > 0:
            ratio = min(
                total_hours / (DEFAULT_JOURS_PAR_MOIS * DEFAULT_HEURES_PAR_JOUR), 1.0
            )
        return round((salaire_mensuel or 0) * ratio, 2)
    return 0.0


HIGH_PAYMENT_THRESHOLD = 10000.0  # MAD
GASOIL_LOW_STOCK_THRESHOLD = 200.0  # litres
