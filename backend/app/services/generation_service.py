from datetime import datetime, timedelta
from typing import Any

from app.models.itinerary import Itinerary, ItineraryDay, ItineraryActivity
from app.services.trip_store import get_trip
from app.services.itinerary_store import save_itinerary
from app.agent.gemini_client import generate_structured_itinerary


DESTINATION_TEMPLATES: dict[str, list[list[dict[str, Any]]]] = {
    "mumbai": [
        [
            {"name": "Gateway of India & Taj Mahal Palace", "location": "Apollo Bandar, Colaba, Mumbai", "category": "sightseeing", "start_time": "09:30", "end_time": "12:30", "cost_inr": 0},
            {"name": "Coastal Lunch at Britannia & Co", "location": "Ballard Estate, Fort, Mumbai", "category": "food", "start_time": "13:00", "end_time": "14:15", "cost_inr": 1200},
            {"name": "Marine Drive & Chowpatty Beach Stroll", "location": "Marine Drive, Mumbai", "category": "sightseeing", "start_time": "15:00", "end_time": "17:30", "cost_inr": 0},
        ],
        [
            {"name": "Chhatrapati Shivaji Maharaj Vastu Sangrahalaya (CSMVS)", "location": "Kala Ghoda, Fort, Mumbai", "category": "art", "start_time": "10:00", "end_time": "12:30", "cost_inr": 500},
            {"name": "Lunch at Cafe Mondegar", "location": "Colaba Causeway, Mumbai", "category": "food", "start_time": "13:00", "end_time": "14:00", "cost_inr": 850},
            {"name": "Colaba Causeway & Crawford Market Walk", "location": "South Mumbai", "category": "history", "start_time": "14:45", "end_time": "17:15", "cost_inr": 250},
        ],
        [
            {"name": "Elephanta Caves Excursion", "location": "Elephanta Island, Mumbai Harbour", "category": "history", "start_time": "09:00", "end_time": "13:00", "cost_inr": 750},
            {"name": "Seafood Lunch at Mahesh Lunch Home", "location": "Fort, Mumbai", "category": "food", "start_time": "13:30", "end_time": "14:45", "cost_inr": 1100},
            {"name": "Bandra Bandstand & Mount Mary Church", "location": "Bandra West, Mumbai", "category": "sightseeing", "start_time": "15:30", "end_time": "18:00", "cost_inr": 0},
        ],
        [
            {"name": "Kanheri Caves Heritage Walk", "location": "Sanjay Gandhi National Park, Mumbai", "category": "history", "start_time": "09:30", "end_time": "12:30", "cost_inr": 400},
            {"name": "Lunch at Gajalee Seafood", "location": "Vile Parle, Mumbai", "category": "food", "start_time": "13:15", "end_time": "14:30", "cost_inr": 950},
            {"name": "Juhu Beach Sunset & Street Food Walk", "location": "Juhu Beach, Mumbai", "category": "food", "start_time": "15:30", "end_time": "17:30", "cost_inr": 350},
        ],
        [
            {"name": "Siddhivinayak Temple & Shivaji Park", "location": "Dadar, Mumbai", "category": "history", "start_time": "10:00", "end_time": "12:30", "cost_inr": 0},
            {"name": "Authentic Maharashtrian Lunch at Aaswad", "location": "Dadar West, Mumbai", "category": "food", "start_time": "13:00", "end_time": "14:00", "cost_inr": 500},
            {"name": "Worli Sea Face & Sea Link Promenade", "location": "Worli, Mumbai", "category": "sightseeing", "start_time": "15:00", "end_time": "17:00", "cost_inr": 0},
        ],
    ],
    "paris": [
        [
            {"name": "Louvre Museum", "location": "Louvre Museum, Paris", "category": "art", "start_time": "10:00", "end_time": "13:00", "cost_eur": 22.0},
            {"name": "Lunch in Le Marais", "location": "Le Marais, Paris", "category": "food", "start_time": "13:30", "end_time": "14:30", "cost_eur": 30.0},
            {"name": "Seine River Walk", "location": "Seine River, Paris", "category": "sightseeing", "start_time": "15:00", "end_time": "17:00", "cost_eur": 0.0},
        ],
        [
            {"name": "Musée d'Orsay", "location": "Musée d'Orsay, Paris", "category": "art", "start_time": "10:00", "end_time": "12:30", "cost_eur": 16.0},
            {"name": "Lunch near Saint-Germain", "location": "Saint-Germain-des-Prés, Paris", "category": "food", "start_time": "13:00", "end_time": "14:00", "cost_eur": 28.0},
            {"name": "Notre-Dame Area", "location": "Île de la Cité, Paris", "category": "history", "start_time": "15:00", "end_time": "17:00", "cost_eur": 0.0},
        ],
        [
            {"name": "Versailles", "location": "Palace of Versailles", "category": "history", "start_time": "09:30", "end_time": "13:00", "cost_eur": 30.0},
            {"name": "Dinner in Paris", "location": "Latin Quarter, Paris", "category": "food", "start_time": "14:00", "end_time": "15:30", "cost_eur": 35.0},
            {"name": "Luxembourg Gardens Stroll", "location": "6th Arrondissement, Paris", "category": "sightseeing", "start_time": "16:00", "end_time": "17:30", "cost_eur": 0.0},
        ],
        [
            {"name": "Montmartre Walk", "location": "Montmartre, Paris", "category": "sightseeing", "start_time": "10:00", "end_time": "12:30", "cost_eur": 0.0},
            {"name": "Lunch at Place du Tertre", "location": "Montmartre, Paris", "category": "food", "start_time": "13:00", "end_time": "14:00", "cost_eur": 25.0},
            {"name": "Sacré-Cœur Basilica", "location": "Montmartre, Paris", "category": "history", "start_time": "14:30", "end_time": "16:30", "cost_eur": 0.0},
        ],
    ],
    "rome": [
        [
            {"name": "Colosseum & Roman Forum", "location": "Piazza del Colosseo, Rome", "category": "history", "start_time": "09:30", "end_time": "12:30", "cost_eur": 18.0},
            {"name": "Trastevere Historic Lunch", "location": "Trastevere, Rome", "category": "food", "start_time": "13:00", "end_time": "14:15", "cost_eur": 25.0},
            {"name": "Piazza Navona & Campo de' Fiori Walk", "location": "Rome Historic Center", "category": "sightseeing", "start_time": "15:00", "end_time": "17:00", "cost_eur": 0.0},
        ],
        [
            {"name": "Vatican Museums & Sistine Chapel", "location": "Vatican City, Rome", "category": "art", "start_time": "09:30", "end_time": "13:00", "cost_eur": 20.0},
            {"name": "Lunch near Borgo Pio", "location": "Borgo Pio, Rome", "category": "food", "start_time": "13:30", "end_time": "14:30", "cost_eur": 22.0},
            {"name": "Castel Sant'Angelo & Tiber River Walk", "location": "Tiber River, Rome", "category": "history", "start_time": "15:15", "end_time": "17:15", "cost_eur": 15.0},
        ],
        [
            {"name": "Pantheon & Trevi Fountain", "location": "Piazza della Rotonda, Rome", "category": "history", "start_time": "10:00", "end_time": "12:30", "cost_eur": 5.0},
            {"name": "Lunch at Armando al Pantheon", "location": "Centro Storico, Rome", "category": "food", "start_time": "13:00", "end_time": "14:15", "cost_eur": 28.0},
            {"name": "Spanish Steps & Villa Borghese Gardens", "location": "Piazza di Spagna, Rome", "category": "sightseeing", "start_time": "15:00", "end_time": "17:30", "cost_eur": 0.0},
        ],
        [
            {"name": "Borghese Gallery", "location": "Villa Borghese, Rome", "category": "art", "start_time": "10:00", "end_time": "12:00", "cost_eur": 15.0},
            {"name": "Lunch in Rione Monti", "location": "Monti, Rome", "category": "food", "start_time": "12:45", "end_time": "14:00", "cost_eur": 20.0},
            {"name": "Appian Way Scenic Stroll", "location": "Via Appia Antica, Rome", "category": "sightseeing", "start_time": "14:45", "end_time": "17:00", "cost_eur": 0.0},
        ],
    ],
    "tokyo": [
        [
            {"name": "Senso-ji Temple & Nakamise Street", "location": "Asakusa, Tokyo", "category": "history", "start_time": "09:30", "end_time": "12:00", "cost_usd": 0.0},
            {"name": "Ramen Lunch in Ueno", "location": "Ueno, Tokyo", "category": "food", "start_time": "12:30", "end_time": "13:45", "cost_usd": 12.0},
            {"name": "Akihabara Electric Town Walk", "location": "Akihabara, Tokyo", "category": "sightseeing", "start_time": "14:30", "end_time": "17:00", "cost_usd": 0.0},
        ],
        [
            {"name": "Meiji Shrine & Yoyogi Park", "location": "Shibuya, Tokyo", "category": "history", "start_time": "10:00", "end_time": "12:30", "cost_usd": 0.0},
            {"name": "Harajuku Street Food & Takeshita", "location": "Harajuku, Tokyo", "category": "food", "start_time": "12:45", "end_time": "14:00", "cost_usd": 15.0},
            {"name": "Shibuya Crossing & Shibuya Sky", "location": "Shibuya, Tokyo", "category": "sightseeing", "start_time": "14:45", "end_time": "17:30", "cost_usd": 18.0},
        ],
        [
            {"name": "Tsukiji Outer Market Food Exploration", "location": "Tsukiji, Tokyo", "category": "food", "start_time": "09:30", "end_time": "12:00", "cost_usd": 25.0},
            {"name": "TeamLab Planets Immersive Art", "location": "Toyosu, Tokyo", "category": "art", "start_time": "12:45", "end_time": "14:45", "cost_usd": 28.0},
            {"name": "Ginza Architecture & Stroll", "location": "Ginza, Tokyo", "category": "sightseeing", "start_time": "15:15", "end_time": "17:30", "cost_usd": 0.0},
        ],
        [
            {"name": "Shinjuku Gyoen National Garden", "location": "Shinjuku, Tokyo", "category": "sightseeing", "start_time": "10:00", "end_time": "12:30", "cost_usd": 4.0},
            {"name": "Lunch at Omoide Yokocho", "location": "Shinjuku, Tokyo", "category": "food", "start_time": "13:00", "end_time": "14:00", "cost_usd": 14.0},
            {"name": "Roppongi Hills Sunset Observation Deck", "location": "Roppongi, Tokyo", "category": "sightseeing", "start_time": "15:00", "end_time": "17:30", "cost_usd": 16.0},
        ],
    ],
    "kyoto": [
        [
            {"name": "Fushimi Inari Taisha Shrine", "location": "Fushimi, Kyoto", "category": "history", "start_time": "08:30", "end_time": "11:30", "cost_usd": 0.0},
            {"name": "Traditional Udon Lunch in Gion", "location": "Gion, Kyoto", "category": "food", "start_time": "12:15", "end_time": "13:30", "cost_usd": 12.0},
            {"name": "Gion Historic Preservation Quarter", "location": "Higashiyama, Kyoto", "category": "sightseeing", "start_time": "14:00", "end_time": "16:30", "cost_usd": 0.0},
        ],
        [
            {"name": "Kinkaku-ji (Golden Pavilion)", "location": "Kita Ward, Kyoto", "category": "history", "start_time": "09:30", "end_time": "11:30", "cost_usd": 4.0},
            {"name": "Arashiyama Bamboo Grove & Tenryu-ji", "location": "Arashiyama, Kyoto", "category": "sightseeing", "start_time": "12:30", "end_time": "15:00", "cost_usd": 5.0},
            {"name": "Matcha Tea Experience by the River", "location": "Arashiyama, Kyoto", "category": "food", "start_time": "15:30", "end_time": "16:45", "cost_usd": 10.0},
        ],
        [
            {"name": "Kiyomizu-dera Temple", "location": "Higashiyama, Kyoto", "category": "history", "start_time": "09:00", "end_time": "11:30", "cost_usd": 3.5},
            {"name": "Ninenzaka & Sannenzaka Slopes Walk", "location": "Higashiyama, Kyoto", "category": "sightseeing", "start_time": "11:45", "end_time": "13:00", "cost_usd": 0.0},
            {"name": "Nishiki Market Street Food Tour", "location": "Nakagyo Ward, Kyoto", "category": "food", "start_time": "13:30", "end_time": "16:00", "cost_usd": 18.0},
        ],
        [
            {"name": "Nijo Castle & Ninomaru Palace", "location": "Nakagyo Ward, Kyoto", "category": "history", "start_time": "10:00", "end_time": "12:30", "cost_usd": 7.0},
            {"name": "Kyoto Imperial Palace Gardens", "location": "Kamigyo Ward, Kyoto", "category": "sightseeing", "start_time": "13:30", "end_time": "15:00", "cost_usd": 0.0},
            {"name": "Pontocho Alley Evening Stroll", "location": "Pontocho, Kyoto", "category": "culture", "start_time": "15:30", "end_time": "17:30", "cost_usd": 0.0},
        ],
    ],
}


def _compute_dates(start_date: str, end_date: str) -> list[str]:
    try:
        d1 = datetime.strptime(start_date, "%Y-%m-%d")
        d2 = datetime.strptime(end_date, "%Y-%m-%d")
        diff = (d2 - d1).days
        num_days = max(1, diff)
        return [(d1 + timedelta(days=i)).strftime("%Y-%m-%d") for i in range(num_days)]
    except Exception:
        return [start_date, end_date]


def _build_curated_itinerary(trip) -> Itinerary:
    destination_lower = trip.destination.lower()
    dates = _compute_dates(trip.start_date, trip.end_date)
    num_days = len(dates)

    # Match template by city
    template_key = "paris"
    if "mumbai" in destination_lower or "bombay" in destination_lower:
        template_key = "mumbai"
    elif "rome" in destination_lower or "roma" in destination_lower:
        template_key = "rome"
    elif "tokyo" in destination_lower:
        template_key = "tokyo"
    elif "kyoto" in destination_lower:
        template_key = "kyoto"
    elif "paris" in destination_lower:
        template_key = "paris"

    template_days = DESTINATION_TEMPLATES.get(template_key, DESTINATION_TEMPLATES["paris"])
    days: list[ItineraryDay] = []

    for day_idx, date_str in enumerate(dates):
        # Pick template day with cycle wrap
        tpl_day = template_days[day_idx % len(template_days)]
        activities: list[ItineraryActivity] = []

        for act_idx, item in enumerate(tpl_day):
            act_id = f"{trip.trip_id}-day-{day_idx + 1}-activity-{act_idx + 1}"
            raw_cost = 0.0

            if trip.currency == "INR":
                raw_cost = float(item.get("cost_inr", item.get("cost_eur", item.get("cost_usd", 10.0)) * 90.0))
            elif trip.currency == "EUR":
                raw_cost = float(item.get("cost_eur", item.get("cost_usd", item.get("cost_inr", 900.0) / 90.0)))
            else:
                raw_cost = float(item.get("cost_usd", item.get("cost_eur", item.get("cost_inr", 900.0) / 85.0)))

            activities.append(
                ItineraryActivity(
                    activity_id=act_id,
                    name=item["name"],
                    date=date_str,
                    start_time=item["start_time"],
                    end_time=item["end_time"],
                    location=item["location"],
                    cost=round(raw_cost, 2),
                    currency=trip.currency,
                    category=item.get("category", "sightseeing"),
                )
            )

        days.append(
            ItineraryDay(
                date=date_str,
                activities=activities,
            )
        )

    total_cost = sum(a.cost for d in days for a in d.activities)

    return Itinerary(
        trip_id=trip.trip_id,
        days=days,
        total_cost=round(total_cost, 2),
        currency=trip.currency,
    )


def generate_itinerary(trip_id: str) -> Itinerary | None:
    trip = get_trip(trip_id)

    if trip is None:
        return None

    # First attempt LLM generation via Gemini
    try:
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
            for activity_index, generated_activity in enumerate(generated_day.activities):
                activity_id = f"{trip_id}-day-{day_index + 1}-activity-{activity_index + 1}"
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

        total_cost = sum(activity.cost for day in days for activity in day.activities)
        itinerary = Itinerary(
            trip_id=trip_id,
            days=days,
            total_cost=round(total_cost, 2),
            currency=trip.currency,
        )
        return save_itinerary(itinerary)

    except Exception as exc:
        print(f"[TravelPilot] Gemini itinerary generation fallback triggered: {exc}")
        curated = _build_curated_itinerary(trip)
        return save_itinerary(curated)
