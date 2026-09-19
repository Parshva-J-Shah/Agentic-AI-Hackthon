from fastapi import APIRouter, HTTPException

from app.schemas.trip import TripCreate
from app.services.trip_service import create_trip
from app.services.trip_store import get_trip

router = APIRouter(
    prefix="/api/trips",
    tags=["Trips"],
)


@router.post("")
def create_trip_endpoint(trip_data: TripCreate):
    trip = create_trip(trip_data)

    return {
        "message": "Trip created successfully",
        "trip": trip,
    }


@router.get("/{trip_id}")
def get_trip_endpoint(trip_id: str):
    trip = get_trip(trip_id)

    if trip is None:
        raise HTTPException(
            status_code=404,
            detail="Trip not found",
        )

    return {
        "message": "Trip retrieved successfully",
        "trip": trip,
    }
