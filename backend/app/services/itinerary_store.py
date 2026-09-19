from typing import Dict

from app.models.itinerary import Itinerary

_itineraries: Dict[str, Itinerary] = {}


def save_itinerary(itinerary: Itinerary) -> Itinerary:
    _itineraries[itinerary.trip_id] = itinerary
    return itinerary


def get_itinerary(trip_id: str) -> Itinerary | None:
    return _itineraries.get(trip_id)
