from copy import deepcopy
from app.services.demo_seed import DEMO_TRIP_ID, seed_demo_data
from app.services.itinerary_service import get_current_itinerary
from app.services.trip_store import get_trip
from app.services.replanning_service import replan_disruption, _replace_activity
from app.tools.validator import validate_itinerary_tool

print("=" * 80)
print("TRAVELPILOT BUDGET REGRESSION & VALIDATION TEST SUITE")
print("=" * 80)

# --------------------------------------------------------------------------
# 1. Setup baseline
# --------------------------------------------------------------------------
seed_demo_data()
initial_itinerary = get_current_itinerary(DEMO_TRIP_ID)
trip = get_trip(DEMO_TRIP_ID)

assert initial_itinerary is not None
assert trip is not None
assert initial_itinerary.total_cost == 472.0
assert trip.budget == 1000.0

initial_activities = [
    (day.date, act.activity_id, act.name, act.cost)
    for day in initial_itinerary.days
    for act in day.activities
]
print(f"Initial baseline: total={initial_itinerary.total_cost} {initial_itinerary.currency}")

# --------------------------------------------------------------------------
# 2. Test: Replacement decreases total correctly (472 - 22 + 16 = 466)
# --------------------------------------------------------------------------
print("\nTEST 1: Replacement decreases total correctly")
sim_res = replan_disruption(DEMO_TRIP_ID, "Louvre booking is cancelled", simulate=True)
assert sim_res["success"] is True
budget_info = sim_res["changes"]["budget"]
assert budget_info["before"] == 472.0, f"Expected 472.0, got {budget_info['before']}"
assert budget_info["after"] == 466.0, f"Expected 466.0, got {budget_info['after']}"
assert budget_info["delta"] == -6.0, f"Expected -6.0, got {budget_info['delta']}"
print(f"PASS: 472.0 - 22.0 + 16.0 = {budget_info['after']} (delta: {budget_info['delta']})")

# --------------------------------------------------------------------------
# 3. Test: Replacement increases total correctly (472 - 22 + 30 = 480)
# --------------------------------------------------------------------------
print("\nTEST 2: Replacement increases total correctly")
itin_dict = initial_itinerary.model_dump()
expensive_replacement = {
    "activity_id": "replacement-louvre-expensive",
    "name": "Exclusive Private Louvre Tour",
    "date": "2026-10-10",
    "start_time": "10:00",
    "end_time": "13:00",
    "location": "Louvre, Paris",
    "cost": 30.0,
    "currency": "EUR",
    "category": "art",
}
updated_expensive, removed = _replace_activity(itin_dict, "louvre-1", expensive_replacement)
assert removed["cost"] == 22.0
assert updated_expensive["total_cost"] == 480.0, f"Expected 480.0, got {updated_expensive['total_cost']}"
print(f"PASS: 472.0 - 22.0 + 30.0 = {updated_expensive['total_cost']}")

# --------------------------------------------------------------------------
# 4. Test: Unchanged activities remain unchanged
# --------------------------------------------------------------------------
print("\nTEST 3: Unchanged activities remain unchanged")
after_activities = [
    (day["date"], act.get("activity_id"), act.get("name"), act.get("cost"))
    for day in sim_res["after"]["days"]
    for act in day["activities"]
]
# Exclude the first activity (which was replaced) and verify the rest are identical
assert len(initial_activities) == len(after_activities)
for orig, new in zip(initial_activities[1:], after_activities[1:]):
    assert orig == new, f"Mismatch: original {orig} != after {new}"
print("PASS: All other activities preserved with exact dates, times, and costs")

# --------------------------------------------------------------------------
# 5. Test: Simulation does not persist
# --------------------------------------------------------------------------
print("\nTEST 4: Simulation does not persist to database/store")
current_after_sim = get_current_itinerary(DEMO_TRIP_ID)
assert current_after_sim.total_cost == 472.0
names_after_sim = [
    act.name for day in current_after_sim.days for act in day.activities
]
assert "Louvre Museum" in names_after_sim
assert "Musée de l'Orangerie" not in names_after_sim
print("PASS: Stored itinerary remains unchanged after simulation")

# --------------------------------------------------------------------------
# 6. Test: Real replan persists only after validation
# --------------------------------------------------------------------------
print("\nTEST 5: Real replan persists correctly")
real_res = replan_disruption(DEMO_TRIP_ID, "Louvre booking is cancelled", simulate=False)
assert real_res["success"] is True
assert real_res["persisted"] is True
assert real_res["validation"]["valid"] is True
assert real_res["conflicts"]["valid"] is True

persisted = get_current_itinerary(DEMO_TRIP_ID)
assert persisted.total_cost == 466.0
persisted_names = [act.name for day in persisted.days for act in day.activities]
assert "Louvre Museum" not in persisted_names
assert "Musée de l'Orangerie" in persisted_names
print("PASS: Real replan persisted with total 466.0 EUR and replacement verified")

# --------------------------------------------------------------------------
# 7. Test: Budget limit is enforced
# --------------------------------------------------------------------------
print("\nTEST 6: Budget limit is enforced during validation")
# Test validator tool with budget lower than total cost
low_budget_val = validate_itinerary_tool(persisted.model_dump(), budget=400.0)
assert low_budget_val["valid"] is False
assert any("exceeds budget" in err for err in low_budget_val["errors"])

# Replan with low budget trip should fail validation
seed_demo_data()
low_budget_trip = get_trip(DEMO_TRIP_ID)
low_budget_trip.budget = 400.0  # Total cost is 472 -> proposed 466, both > 400

failed_replan = replan_disruption(DEMO_TRIP_ID, "Louvre booking is cancelled", simulate=False)
assert failed_replan["success"] is False
assert "validation" in failed_replan["error"].lower() or failed_replan.get("validation", {}).get("valid") is False
# Verify no write occurred
stored_after_fail = get_current_itinerary(DEMO_TRIP_ID)
assert stored_after_fail.total_cost == 472.0
assert any(act.name == "Louvre Museum" for day in stored_after_fail.days for act in day.activities)
print("PASS: Over-budget replanning rejected, no partial write persisted")

print("\n" + "=" * 80)
print("ALL 6 BUDGET REGRESSION TESTS PASSED SUCCESSFULLY!")
print("=" * 80)
