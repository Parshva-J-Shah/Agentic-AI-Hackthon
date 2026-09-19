from fastapi import APIRouter, HTTPException

from app.services.itinerary_service import (
    create_empty_itinerary,
    get_current_itinerary,
)
from app.services.trip_store import get_trip

router = APIRouter(
    prefix="/api/itineraries",
    tags=["Itineraries"],
)


@router.post("/{trip_id}")
def create_itinerary_endpoint(trip_id: str):
    trip = get_trip(trip_id)

    if trip is None:
        raise HTTPException(
            status_code=404,
            detail="Trip not found",
        )

    itinerary = create_empty_itinerary(
        trip_id=trip.trip_id,
        currency=trip.currency,
    )

    return {
        "message": "Itinerary created successfully",
        "itinerary": itinerary,
    }


@router.get("/{trip_id}")
def get_itinerary_endpoint(trip_id: str):
    trip = get_trip(trip_id)

    if trip is None:
        raise HTTPException(
            status_code=404,
            detail="Trip not found",
        )

    itinerary = get_current_itinerary(trip_id)

    if itinerary is None:
        raise HTTPException(
            status_code=404,
            detail="Itinerary not found",
        )

    return {
        "message": "Itinerary retrieved successfully",
        "itinerary": itinerary,
    }
