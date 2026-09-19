from app.models.trip import Trip
from app.models.itinerary import (
    Itinerary,
    ItineraryDay,
    ItineraryActivity,
)

from app.services.trip_store import save_trip
from app.services.itinerary_service import save_itinerary


DEMO_TRIP_ID = "e0d022a5-a88b-4c02-abac-342504579e1a"


def seed_demo_trip() -> None:
    trip = Trip(
        trip_id=DEMO_TRIP_ID,
        destination="Paris",
        start_date="2026-10-10",
        end_date="2026-10-13",
        budget=1000,
        currency="EUR",
        interests=[
            "art",
            "food",
            "history",
        ],
        preferences=[
            "avoid early mornings",
            "walkable activities",
        ],
    )

    save_trip(trip)

    itinerary = Itinerary(
        trip_id=DEMO_TRIP_ID,
        currency="EUR",
        total_cost=472,
        days=[
            ItineraryDay(
                date="2026-10-10",
                activities=[
                    ItineraryActivity(
                        activity_id="louvre-1",
                        name="Louvre Museum",
                        date="2026-10-10",
                        start_time="10:00",
                        end_time="13:00",
                        location="Louvre Museum, Paris",
                        cost=22,
                        currency="EUR",
                        category="art",
                    ),
                    ItineraryActivity(
                        activity_id="lunch-1",
                        name="Lunch in Le Marais",
                        date="2026-10-10",
                        start_time="13:30",
                        end_time="14:30",
                        location="Le Marais, Paris",
                        cost=30,
                        currency="EUR",
                        category="food",
                    ),
                    ItineraryActivity(
                        activity_id="seine-1",
                        name="Seine River Walk",
                        date="2026-10-10",
                        start_time="15:00",
                        end_time="17:00",
                        location="Seine River, Paris",
                        cost=0,
                        currency="EUR",
                        category="sightseeing",
                    ),
                ],
            ),
            ItineraryDay(
                date="2026-10-11",
                activities=[
                    ItineraryActivity(
                        activity_id="museum-1",
                        name="Musée d'Orsay",
                        date="2026-10-11",
                        start_time="10:00",
                        end_time="12:30",
                        location="Musée d'Orsay, Paris",
                        cost=16,
                        currency="EUR",
                        category="art",
                    ),
                    ItineraryActivity(
                        activity_id="lunch-2",
                        name="Lunch near Saint-Germain",
                        date="2026-10-11",
                        start_time="13:00",
                        end_time="14:00",
                        location="Saint-Germain-des-Prés, Paris",
                        cost=28,
                        currency="EUR",
                        category="food",
                    ),
                    ItineraryActivity(
                        activity_id="notredame-1",
                        name="Notre-Dame Area",
                        date="2026-10-11",
                        start_time="15:00",
                        end_time="17:00",
                        location="Île de la Cité, Paris",
                        cost=0,
                        currency="EUR",
                        category="history",
                    ),
                ],
            ),
            ItineraryDay(
                date="2026-10-12",
                activities=[
                    ItineraryActivity(
                        activity_id="versailles-1",
                        name="Versailles",
                        date="2026-10-12",
                        start_time="10:00",
                        end_time="15:00",
                        location="Palace of Versailles",
                        cost=25,
                        currency="EUR",
                        category="history",
                    ),
                    ItineraryActivity(
                        activity_id="dinner-1",
                        name="Dinner in Paris",
                        date="2026-10-12",
                        start_time="19:00",
                        end_time="21:00",
                        location="Paris",
                        cost=45,
                        currency="EUR",
                        category="food",
                    ),
                ],
            ),
            ItineraryDay(
                date="2026-10-13",
                activities=[
                    ItineraryActivity(
                        activity_id="montmartre-1",
                        name="Montmartre Walk",
                        date="2026-10-13",
                        start_time="10:30",
                        end_time="13:00",
                        location="Montmartre, Paris",
                        cost=0,
                        currency="EUR",
                        category="sightseeing",
                    ),
                ],
            ),
        ],
    )

    save_itinerary(itinerary)


def seed_demo_data() -> None:
    seed_demo_trip()
