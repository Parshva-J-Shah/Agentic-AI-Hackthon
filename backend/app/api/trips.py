from fastapi import APIRouter, HTTPException

from app.schemas.trip import TripCreate
from app.services.trip_service import create_trip
from app.services.trip_store import get_trip
from app.services.itinerary_service import get_current_itinerary

router = APIRouter(
    prefix="/api/trips",
    tags=["Trips"],
)


@router.post("")
def create_trip_endpoint(trip_data: TripCreate):
    trip = create_trip(trip_data)

    return {
        "message": "Trip created successfully",
        "trip_id": trip.trip_id,
        "status": "created",
        "trip": trip,
        "itinerary": [],
    }


@router.get("/{trip_id}")
def get_trip_endpoint(trip_id: str):
    trip = get_trip(trip_id)

    if trip is None:
        raise HTTPException(
            status_code=404,
            detail="Trip not found",
        )

    itinerary = get_current_itinerary(trip_id)
    itin_data = itinerary.model_dump() if itinerary else {"days": [], "total_cost": 0.0, "currency": trip.currency}
    total_cost = itin_data.get("total_cost", 0.0)

    budget_dict = {
        "target_cap": trip.budget,
        "estimated_total": total_cost,
        "remaining": max(0.0, trip.budget - total_cost),
        "currency": trip.currency,
        "breakdown": [
            {"category": "Activities & Entry", "amount": round(total_cost * 0.45, 2), "percentage": 45, "color": "bg-primary"},
            {"category": "Dining & Cafes", "amount": round(total_cost * 0.35, 2), "percentage": 35, "color": "bg-secondary"},
            {"category": "Local Transit", "amount": round(total_cost * 0.12, 2), "percentage": 12, "color": "bg-amber-500"},
            {"category": "Contingency Buffer", "amount": round(total_cost * 0.08, 2), "percentage": 8, "color": "bg-emerald-500"},
        ],
    }

    return {
        "message": "Trip retrieved successfully",
        "trip_id": trip.trip_id,
        "destination": trip.destination,
        "dates": {
            "start": trip.start_date,
            "end": trip.end_date,
        },
        "budget": budget_dict,
        "itinerary": itin_data,
        "trip": trip,
        "transportation": [],
        "accommodation": {
            "name": f"{trip.destination.split(',')[0]} Signature Hotel",
            "address": f"Historic & Cultural District, {trip.destination}",
            "check_in": "15:00",
            "check_out": "11:00",
        },
        "disruptions": [],
        "backups": [],
    }
