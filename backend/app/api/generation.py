from fastapi import APIRouter, HTTPException

from app.services.generation_service import generate_itinerary

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

    return {
        "message": "Itinerary generated successfully",
        "itinerary": itinerary,
    }
