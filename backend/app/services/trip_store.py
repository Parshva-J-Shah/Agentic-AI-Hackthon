from typing import Dict
from app.models.trip import Trip

_trips: Dict[str, Trip] = {}


def save_trip(trip: Trip) -> Trip:
    if not trip.trip_id:
        raise ValueError("Trip must have a trip_id before saving")

    _trips[trip.trip_id] = trip
    return trip


def get_trip(trip_id: str) -> Trip | None:
    return _trips.get(trip_id)
