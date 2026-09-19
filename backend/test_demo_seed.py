from app.services.demo_seed import DEMO_TRIP_ID, seed_demo_data
from app.services.trip_store import get_trip
from app.services.itinerary_service import get_current_itinerary


print("=" * 80)
print("TRAVELPILOT DEMO DATA TEST")
print("=" * 80)


seed_demo_data()


trip = get_trip(DEMO_TRIP_ID)
itinerary = get_current_itinerary(DEMO_TRIP_ID)


print()
print("Trip exists:", trip is not None)
print("Itinerary exists:", itinerary is not None)


assert trip is not None
assert itinerary is not None


print("Destination:", trip.destination)
print("Budget:", trip.budget, trip.currency)
print("Itinerary total:", itinerary.total_cost, itinerary.currency)
print("Days:", len(itinerary.days))


assert trip.destination == "Paris"
assert trip.budget == 1000
assert itinerary.total_cost == 472
assert len(itinerary.days) == 4


print()
print("=" * 80)
print("FINAL RESULT: DEMO DATA TEST PASSED")
print("=" * 80)
