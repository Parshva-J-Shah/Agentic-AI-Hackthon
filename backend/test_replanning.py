from app.services.demo_seed import seed_demo_data, DEMO_TRIP_ID
from app.services.itinerary_service import get_current_itinerary
from app.services.replanning_service import replan_disruption


print("=" * 70)
print("TRAVELPILOT DISRUPTION + REPLANNING TEST")
print("=" * 70)

seed_demo_data()

before = get_current_itinerary(DEMO_TRIP_ID)

assert before is not None
assert any(
    activity.name == "Louvre Museum"
    for day in before.days
    for activity in day.activities
)

print()
print("STEP 1: Simulation test")

simulation = replan_disruption(
    trip_id=DEMO_TRIP_ID,
    message="Louvre booking is cancelled",
    simulate=True,
)

assert simulation["success"] is True
assert simulation["status"] == "simulated"
assert simulation["persisted"] is False
assert simulation["changes"]["removed"]["name"] == "Louvre Museum"

after_simulation = get_current_itinerary(DEMO_TRIP_ID)

assert after_simulation is not None
assert any(
    activity.name == "Louvre Museum"
    for day in after_simulation.days
    for activity in day.activities
)

print("Simulation: PASS")
print("Original itinerary preserved: PASS")
print(
    "Proposed replacement:",
    simulation["changes"]["added"]["name"],
)

print()
print("STEP 2: Real replanning test")

result = replan_disruption(
    trip_id=DEMO_TRIP_ID,
    message="Louvre booking is cancelled",
    simulate=False,
)

assert result["success"] is True
assert result["status"] == "replanned"
assert result["persisted"] is True
assert result["validation"]["valid"] is True
assert result["conflicts"]["valid"] is True

after = get_current_itinerary(DEMO_TRIP_ID)

assert after is not None

names = [
    activity.name
    for day in after.days
    for activity in day.activities
]

assert "Louvre Museum" not in names
assert result["changes"]["added"]["name"] in names

print("Real replanning: PASS")
print("Validation: PASS")
print("Conflict check: PASS")
print("Persistence: PASS")

print()
print("BEFORE:")
print(
    result["changes"]["removed"]["name"],
    "->",
    result["changes"]["removed"]["date"],
    result["changes"]["removed"]["start_time"],
)

print()
print("AFTER:")
print(
    result["changes"]["added"]["name"],
    "->",
    result["changes"]["added"]["date"],
    result["changes"]["added"]["start_time"],
)

print()
print(
    "Budget:",
    result["changes"]["budget"]["before"],
    "->",
    result["changes"]["budget"]["after"],
    result["changes"]["budget"]["currency"],
)

print()
print("=" * 70)
print("FINAL RESULT: DISRUPTION + REPLANNING TEST PASSED")
print("=" * 70)
