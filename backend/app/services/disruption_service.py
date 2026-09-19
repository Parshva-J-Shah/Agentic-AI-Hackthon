from __future__ import annotations

import re
from typing import Any

from app.services.itinerary_service import get_current_itinerary
from app.services.trip_store import get_trip
from app.tools.search_web import search_web


DEMO_ALTERNATIVES = {
    "Louvre Museum": [
        {
            "name": "Musée de l'Orangerie",
            "location": "Jardin des Tuileries, Paris",
            "category": "art",
            "estimated_cost": 16.0,
            "estimated_duration_minutes": 120,
            "source": "TravelPilot demo alternative catalog",
            "availability_status": "not_verified",
            "cost_status": "estimated",
        },
        {
            "name": "Musée Rodin",
            "location": "Paris",
            "category": "art",
            "estimated_cost": 15.0,
            "estimated_duration_minutes": 120,
            "source": "TravelPilot demo alternative catalog",
            "availability_status": "not_verified",
            "cost_status": "estimated",
        },
        {
            "name": "Petit Palais",
            "location": "Paris",
            "category": "art",
            "estimated_cost": 0.0,
            "estimated_duration_minutes": 120,
            "source": "TravelPilot demo alternative catalog",
            "availability_status": "not_verified",
            "cost_status": "estimated",
        },
    ],
    "Musée d'Orsay": [
        {
            "name": "Centre Pompidou",
            "location": "Place Georges-Pompidou, Paris",
            "category": "art",
            "estimated_cost": 15.0,
            "estimated_duration_minutes": 120,
            "source": "TravelPilot demo alternative catalog",
            "availability_status": "not_verified",
            "cost_status": "estimated",
        },
        {
            "name": "Musée de Cluny",
            "location": "Latin Quarter, Paris",
            "category": "art",
            "estimated_cost": 12.0,
            "estimated_duration_minutes": 90,
            "source": "TravelPilot demo alternative catalog",
            "availability_status": "not_verified",
            "cost_status": "estimated",
        },
    ],
    "Versailles": [
        {
            "name": "Château de Vincennes",
            "location": "Vincennes, Paris",
            "category": "history",
            "estimated_cost": 11.5,
            "estimated_duration_minutes": 150,
            "source": "TravelPilot demo alternative catalog",
            "availability_status": "not_verified",
            "cost_status": "estimated",
        },
        {
            "name": "Panthéon",
            "location": "Latin Quarter, Paris",
            "category": "history",
            "estimated_cost": 11.5,
            "estimated_duration_minutes": 120,
            "source": "TravelPilot demo alternative catalog",
            "availability_status": "not_verified",
            "cost_status": "estimated",
        },
    ],
    "Lunch in Le Marais": [
        {
            "name": "Bistrot des Vosges",
            "location": "Place des Vosges, Paris",
            "category": "food",
            "estimated_cost": 26.0,
            "estimated_duration_minutes": 60,
            "source": "TravelPilot demo alternative catalog",
            "availability_status": "not_verified",
            "cost_status": "estimated",
        },
        {
            "name": "L'As du Fallafel",
            "location": "Rue des Rosiers, Paris",
            "category": "food",
            "estimated_cost": 15.0,
            "estimated_duration_minutes": 45,
            "source": "TravelPilot demo alternative catalog",
            "availability_status": "not_verified",
            "cost_status": "estimated",
        },
    ],
    "Notre-Dame Area": [
        {
            "name": "Sainte-Chapelle",
            "location": "Île de la Cité, Paris",
            "category": "history",
            "estimated_cost": 13.0,
            "estimated_duration_minutes": 90,
            "source": "TravelPilot demo alternative catalog",
            "availability_status": "not_verified",
            "cost_status": "estimated",
        },
    ],
}


def rank_alternatives(
    candidates: list[dict[str, Any]],
    trip_interests: list[str] | None = None,
    original_activity: dict[str, Any] | None = None,
    budget_limit: float | None = None,
    current_total_cost: float = 0.0,
) -> list[dict[str, Any]]:
    """
    Ranks alternative candidates deterministically using schedule compatibility,
    interest match, and budget impact.
    """
    trip_interests = trip_interests or []
    original_activity = original_activity or {}
    original_cat = (original_activity.get("category") or "").lower()
    original_cost = float(original_activity.get("cost", 0.0) or 0.0)
    interests_set = {str(i).lower() for i in trip_interests}

    scored = []
    for cand in candidates:
        cand_copy = dict(cand)
        cand_cat = (cand_copy.get("category") or "").lower()
        cand_cost = float(cand_copy.get("estimated_cost", 0.0) or 0.0)

        score = 50.0
        if cand_cat and cand_cat == original_cat:
            score += 25.0
        elif cand_cat and cand_cat in interests_set:
            score += 15.0

        if cand_cost <= original_cost:
            score += 15.0
        else:
            score -= (cand_cost - original_cost) * 0.5

        if budget_limit is not None:
            projected_total = current_total_cost - original_cost + cand_cost
            if projected_total > budget_limit:
                score -= 100.0
                cand_copy["budget_warning"] = "Exceeds trip budget limit"

        cand_copy["ranking_score"] = round(score, 1)
        cand_copy["availability_status"] = cand_copy.get(
            "availability_status", "not_verified"
        )
        cand_copy["cost_status"] = cand_copy.get("cost_status", "estimated")
        scored.append((score, cand_copy))

    scored.sort(key=lambda item: item[0], reverse=True)
    return [item[1] for item in scored]


def _normalize(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", " ", value.lower()).strip()


def identify_disrupted_activity(
    itinerary: dict[str, Any],
    message: str,
) -> dict[str, Any] | None:
    text = _normalize(message)

    activities = []

    for day in itinerary.get("days", []):
        for activity in day.get("activities", []):
            activities.append(activity)

    # Exact/substring activity-name matching.
    ranked = []

    for activity in activities:
        name = activity.get("name", "")
        normalized_name = _normalize(name)

        if normalized_name and normalized_name in text:
            ranked.append((3, activity))

        else:
            tokens = [
                token
                for token in normalized_name.split()
                if len(token) >= 4
            ]

            score = sum(1 for token in tokens if token in text)

            if score:
                ranked.append((score, activity))

    if not ranked:
        return None

    ranked.sort(key=lambda item: item[0], reverse=True)
    return ranked[0][1]


def search_disruption_alternatives(
    activity: dict[str, Any],
    destination: str,
) -> dict[str, Any]:
    activity_name = activity.get("name", "")

    demo = DEMO_ALTERNATIVES.get(activity_name, [])

    try:
        search_result = search_web(
            query=(
                f"best alternatives to {activity_name} "
                f"in {destination} museums attractions"
            ),
            max_results=5,
        )
    except Exception as exc:
        search_result = {
            "success": False,
            "error": str(exc),
            "results": [],
        }

    return {
        "success": True,
        "activity": activity_name,
        "destination": destination,
        "demo_alternatives": demo,
        "web_search": search_result,
        "note": (
            "Web search results are informational and do not prove "
            "real-time booking availability. Demo alternatives are "
            "controlled data for the hackathon simulation."
        ),
    }


def inspect_disruption(
    trip_id: str,
    message: str,
) -> dict[str, Any]:
    trip = get_trip(trip_id)

    if trip is None:
        return {
            "success": False,
            "error": "Trip not found",
        }

    itinerary = get_current_itinerary(trip_id)

    if itinerary is None:
        return {
            "success": False,
            "error": "Itinerary not found",
        }

    itinerary_data = itinerary.model_dump()

    activity = identify_disrupted_activity(
        itinerary_data,
        message,
    )

    if activity is None:
        return {
            "success": False,
            "error": (
                "Could not identify the disrupted activity from the "
                "current itinerary."
            ),
            "trip_id": trip_id,
            "message": message,
        }

    alternatives = search_disruption_alternatives(
        activity=activity,
        destination=trip.destination,
    )

    ranked_demo = rank_alternatives(
        candidates=alternatives.get("demo_alternatives", []),
        trip_interests=trip.interests,
        original_activity=activity,
        budget_limit=trip.budget,
        current_total_cost=itinerary.total_cost,
    )
    alternatives["demo_alternatives"] = ranked_demo

    return {
        "success": True,
        "trip_id": trip_id,
        "message": message,
        "disrupted_activity": activity,
        "alternatives": alternatives,
    }

