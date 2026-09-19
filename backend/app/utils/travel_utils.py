from __future__ import annotations

import math
from typing import Any

# Curated coordinates for common demo locations to enable deterministic estimation
LOCATION_COORDINATES: dict[str, tuple[float, float]] = {
    "louvre": (48.8606, 2.3376),
    "jardin des tuileries": (48.8634, 2.3275),
    "musée de l'orangerie": (48.8638, 2.3227),
    "musée d'orsay": (48.8599, 2.3265),
    "le marais": (48.8575, 2.3590),
    "seine river": (48.8566, 2.3522),
    "notre-dame": (48.8530, 2.3499),
    "saint-germain": (48.8539, 2.3333),
    "versailles": (48.8049, 2.1204),
    "montmartre": (48.8867, 2.3431),
    "eiffel tower": (48.8584, 2.2945),
    "gateway of india": (18.9220, 72.8347),
    "csmvs": (18.9269, 72.8327),
    "kala ghoda": (18.9280, 72.8320),
    "britannia": (18.9360, 72.8390),
    "marine drive": (18.9432, 72.8230),
    "colaba": (18.9154, 72.8258),
    "fort": (18.9322, 72.8335),
    "elephanta": (18.9633, 72.9315),
    "bandra": (19.0596, 72.8295),
    "crawford": (18.9472, 72.8342),
    "chowpatty": (18.9543, 72.8139),
    "trishna": (18.9288, 72.8328),
}


def _haversine_km(coord1: tuple[float, float], coord2: tuple[float, float]) -> float:
    lat1, lon1 = coord1
    lat2, lon2 = coord2
    r = 6371.0  # Earth radius in km

    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (
        math.sin(dlat / 2) ** 2
        + math.cos(math.radians(lat1))
        * math.cos(math.radians(lat2))
        * math.sin(dlon / 2) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return r * c


def _find_coord(loc_name: str) -> tuple[float, float] | None:
    text = (loc_name or "").lower()
    for key, coord in LOCATION_COORDINATES.items():
        if key in text:
            return coord
    return None


def estimate_travel_time(
    origin_name: str,
    dest_name: str,
) -> dict[str, Any]:
    """
    Estimates travel time in minutes between two locations.
    Returns clear 'estimated' status. Never claims to be verified live GPS routing.
    """
    origin_name = origin_name or "Unknown"
    dest_name = dest_name or "Unknown"

    if origin_name.lower().strip() == dest_name.lower().strip():
        return {
            "estimated_minutes": 0,
            "distance_km": 0.0,
            "mode": "same_location",
            "status": "estimated",
            "verified": False,
            "note": "Same location. No transit required.",
        }

    c1 = _find_coord(origin_name)
    c2 = _find_coord(dest_name)

    if c1 and c2:
        dist_km = _haversine_km(c1, c2)
        # Transit heuristic: 4 km/h walking if < 2km, else 25 km/h urban metro + 10 min overhead
        if dist_km <= 1.5:
            travel_mins = max(5, int((dist_km / 4.5) * 60))
            mode = "walking"
        else:
            travel_mins = max(15, int((dist_km / 25.0) * 60) + 10)
            mode = "metro/transit"

        return {
            "estimated_minutes": travel_mins,
            "distance_km": round(dist_km, 2),
            "mode": mode,
            "status": "estimated",
            "verified": False,
            "note": (
                f"Estimated {mode} time ({round(dist_km, 1)} km). "
                "Real-time transit schedules not verified."
            ),
        }

    # Default conservative urban buffer if coordinates unknown
    return {
        "estimated_minutes": 20,
        "distance_km": None,
        "mode": "urban_transit",
        "status": "estimated",
        "verified": False,
        "note": (
            "Estimated average city transit time. "
            "Real-time routing not verified."
        ),
    }
