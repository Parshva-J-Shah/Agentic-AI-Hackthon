from typing import Any

from app.services.itinerary_service import get_current_itinerary
from app.services.trip_store import get_trip


def get_current_itinerary_tool(trip_id: str) -> dict[str, Any]:
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

    return {
        "success": True,
        "trip_id": trip_id,
        "itinerary": itinerary.model_dump(),
    }
