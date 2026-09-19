from fastapi import APIRouter, HTTPException

from app.services.generation_service import generate_itinerary
from app.services.trip_store import get_trip

router = APIRouter(
    prefix="/api/trips",
    tags=["Trip Generation"],
)


@router.post("/{trip_id}/generate")
def generate_itinerary_endpoint(trip_id: str):
    itinerary = generate_itinerary(trip_id)

    if itinerary is None:
        raise HTTPException(
            status_code=404,
            detail="Trip not found",
        )

    trip = get_trip(trip_id)
    budget_cap = trip.budget if trip else 1000.0
    total_cost = itinerary.total_cost if itinerary else 0.0

    return {
        "message": "Itinerary generated successfully",
        "trip_id": trip_id,
        "status": "success",
        "itinerary": itinerary,
        "budget": {
            "target_cap": budget_cap,
            "estimated_total": total_cost,
            "currency": itinerary.currency if itinerary else (trip.currency if trip else "EUR"),
            "remaining": max(0.0, budget_cap - total_cost),
        },
    }
