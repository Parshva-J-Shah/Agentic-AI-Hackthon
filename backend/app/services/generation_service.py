from app.models.itinerary import Itinerary, ItineraryDay, ItineraryActivity
from app.services.trip_store import get_trip
from app.services.itinerary_store import save_itinerary
from app.agent.gemini_client import generate_structured_itinerary


def generate_itinerary(trip_id: str) -> Itinerary | None:
    trip = get_trip(trip_id)

    if trip is None:
        return None

    generated = generate_structured_itinerary(
        destination=trip.destination,
        start_date=trip.start_date,
        end_date=trip.end_date,
        budget=trip.budget,
        currency=trip.currency,
        interests=trip.interests,
        preferences=trip.preferences,
    )

    days = []

    for day_index, generated_day in enumerate(generated.days):
        activities = []

        for activity_index, generated_activity in enumerate(
            generated_day.activities
        ):
            activity_id = (
                f"{trip_id}-day-{day_index + 1}"
                f"-activity-{activity_index + 1}"
            )

            activities.append(
                ItineraryActivity(
                    activity_id=activity_id,
                    name=generated_activity.name,
                    date=generated_activity.date,
                    start_time=generated_activity.start_time,
                    end_time=generated_activity.end_time,
                    location=generated_activity.location,
                    cost=generated_activity.cost,
                    currency=trip.currency,
                    category=generated_activity.category,
                )
            )

        days.append(
            ItineraryDay(
                date=generated_day.date,
                activities=activities,
            )
        )

    # Backend is authoritative for total cost.
    total_cost = sum(
        activity.cost
        for day in days
        for activity in day.activities
    )

    itinerary = Itinerary(
        trip_id=trip_id,
        days=days,
        total_cost=total_cost,
        currency=trip.currency,
    )

    return save_itinerary(itinerary)
