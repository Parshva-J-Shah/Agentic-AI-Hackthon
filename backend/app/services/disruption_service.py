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
        },
        {
            "name": "Musée Rodin",
            "location": "Paris",
            "category": "art",
            "estimated_cost": 15.0,
            "estimated_duration_minutes": 120,
            "source": "TravelPilot demo alternative catalog",
        },
        {
            "name": "Petit Palais",
            "location": "Paris",
            "category": "art",
            "estimated_cost": 0.0,
            "estimated_duration_minutes": 120,
            "source": "TravelPilot demo alternative catalog",
        },
    ]
}


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

    return {
        "success": True,
        "trip_id": trip_id,
        "message": message,
        "disrupted_activity": activity,
        "alternatives": alternatives,
    }

