from uuid import uuid4

from app.models.trip import Trip
from app.schemas.trip import TripCreate
from app.services.trip_store import save_trip


def create_trip(trip_data: TripCreate) -> Trip:
    trip = Trip(
        destination=trip_data.destination,
        start_date=trip_data.start_date,
        end_date=trip_data.end_date,
        budget=trip_data.budget,
        currency=trip_data.currency,
        interests=trip_data.interests,
        preferences=trip_data.preferences,
        trip_id=str(uuid4()),
    )

    return save_trip(trip)
