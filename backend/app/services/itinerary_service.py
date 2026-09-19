from app.models.itinerary import Itinerary
from app.services.itinerary_store import save_itinerary, get_itinerary


def create_empty_itinerary(
    trip_id: str,
    currency: str = "USD",
) -> Itinerary:
    itinerary = Itinerary(
        trip_id=trip_id,
        days=[],
        total_cost=0.0,
        currency=currency,
    )

    return save_itinerary(itinerary)


def get_current_itinerary(trip_id: str) -> Itinerary | None:
    return get_itinerary(trip_id)
