import sys
from copy import deepcopy

if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

from app.services.demo_seed import DEMO_TRIP_ID, seed_demo_data
from app.services.trip_store import get_trip, save_trip
from app.services.trip_service import create_trip
from app.schemas.trip import TripCreate
from app.services.itinerary_service import get_current_itinerary
from app.agent.intent import _fallback_intent
from app.agent.planner import build_plan
from app.agent.trip_chat import run_trip_chat
from app.services.disruption_service import (
    identify_disrupted_activity,
    rank_alternatives,
    DEMO_ALTERNATIVES,
)
from app.services.replanning_service import replan_disruption, _replace_activity
from app.services.conflict_service import detect_activity_conflicts, summarize_conflicts
from app.utils.travel_utils import estimate_travel_time
from app.services.agent_run_store import get_agent_run, get_trip_agent_runs
from app.api.alternatives import apply_alternative_endpoint, ApplyAlternativeRequest
from app.api.constraints import update_trip_constraints, TripConstraintsUpdate

print("=" * 80)
print("TRAVELPILOT COMPREHENSIVE TEST SUITE (PHASES 1 - 10)")
print("=" * 80)

passed = 0
total_tests = 0


def run_test(name, test_func):
    global passed, total_tests
    total_tests += 1
    print(f"\n[TEST {total_tests}] {name}")
    try:
        test_func()
        passed += 1
        print("-> PASS")
    except Exception as exc:
        print(f"-> FAIL: {exc}")
        raise exc


# 1. Trip Creation and Retrieval
def test_trip_creation():
    tc = TripCreate(
        destination="Rome",
        start_date="2026-11-01",
        end_date="2026-11-05",
        budget=1200,
        currency="EUR",
        interests=["history", "food"],
    )
    trip = create_trip(tc)
    assert trip.destination == "Rome"
    fetched = get_trip(trip.trip_id)
    assert fetched is not None
    assert fetched.budget == 1200


run_test("Trip Creation and Retrieval", test_trip_creation)


# 2. Intent Detection Fallback Rules
def test_intent_fallback():
    assert _fallback_intent("Louvre booking was cancelled").intent == "DISRUPTION"
    assert _fallback_intent("Move Louvre and replan my trip").intent == "REPLAN"
    assert _fallback_intent("What is planned on day 2?").intent == "ITINERARY_QUERY"
    assert _fallback_intent("Can I fit Eiffel Tower?").intent == "FIT_ACTIVITY"
    assert _fallback_intent("I want to change my budget to 500").intent == "CHANGE_CONSTRAINT"


run_test("Deterministic Intent Detection Fallback", test_intent_fallback)


# 3. Planner Routing for all intents
def test_planner_routing():
    p_disruption = build_plan("DISRUPTION")
    assert [a.tool for a in p_disruption.actions] == ["handle_disruption", "replan_itinerary"]

    p_replan = build_plan("REPLAN")
    assert [a.tool for a in p_replan.actions] == ["replan_itinerary"]

    p_query = build_plan("ITINERARY_QUERY")
    assert [a.tool for a in p_query.actions] == ["get_current_itinerary"]


run_test("Planner Routing Actions", test_planner_routing)


# 4. Budget Calculation: Proof of 472 - 22 + 16 = 466 (NOT 160)
def test_budget_preservation():
    seed_demo_data()
    itin = get_current_itinerary(DEMO_TRIP_ID)
    assert itin.total_cost == 472.0

    res = replan_disruption(DEMO_TRIP_ID, "Louvre booking is cancelled", simulate=True)
    b_before = res["changes"]["budget"]["before"]
    b_after = res["changes"]["budget"]["after"]
    b_delta = res["changes"]["budget"]["delta"]

    assert b_before == 472.0, f"Expected before 472.0, got {b_before}"
    assert b_after == 466.0, f"Expected after 466.0, got {b_after}"
    assert b_delta == -6.0, f"Expected delta -6.0, got {b_delta}"
    assert b_after != 160.0, "Regression detected: budget incorrectly recalculated as 160.0!"


run_test("Budget Formula (472 - 22 + 16 = 466 EUR)", test_budget_preservation)


# 5. Simulation Mode: Non-mutating
def test_simulation_non_mutating():
    seed_demo_data()
    sim_res = replan_disruption(DEMO_TRIP_ID, "Louvre booking is cancelled", simulate=True)
    assert sim_res["persisted"] is False
    assert sim_res["status"] == "simulated"

    stored = get_current_itinerary(DEMO_TRIP_ID)
    assert stored.total_cost == 472.0
    act_names = [a.name for d in stored.days for a in d.activities]
    assert "Louvre Museum" in act_names
    assert "Musée de l'Orangerie" not in act_names


run_test("Simulation Mode Is Non-Mutating", test_simulation_non_mutating)


# 6. Real Replanning Persistence
def test_real_replan_persistence():
    seed_demo_data()
    real_res = replan_disruption(DEMO_TRIP_ID, "Louvre booking is cancelled", simulate=False)
    assert real_res["persisted"] is True
    assert real_res["status"] == "replanned"

    stored = get_current_itinerary(DEMO_TRIP_ID)
    assert stored.total_cost == 466.0
    act_names = [a.name for d in stored.days for a in d.activities]
    assert "Louvre Museum" not in act_names
    assert "Musée de l'Orangerie" in act_names


run_test("Real Replan Persists After Validation", test_real_replan_persistence)


# 7. Extended Conflict Engine: TIME_OVERLAP & INVALID_TIME
def test_conflict_engine_time():
    bad_overlap = {
        "days": [{
            "date": "2026-10-10",
            "activities": [
                {"name": "Act 1", "start_time": "10:00", "end_time": "12:00", "cost": 10},
                {"name": "Act 2", "start_time": "11:30", "end_time": "13:00", "cost": 10},
            ]
        }]
    }
    conflicts = detect_activity_conflicts(bad_overlap)
    assert any(c["type"] == "TIME_OVERLAP" for c in conflicts)

    invalid_time = {
        "days": [{
            "date": "2026-10-10",
            "activities": [
                {"name": "Act 1", "start_time": "14:00", "end_time": "12:00", "cost": 10},
            ]
        }]
    }
    conflicts_inv = detect_activity_conflicts(invalid_time)
    assert any(c["type"] == "INVALID_TIME" for c in conflicts_inv)


run_test("Conflict Engine: TIME_OVERLAP and INVALID_TIME", test_conflict_engine_time)


# 8. Extended Conflict Engine: TRAVEL_TIME_CONFLICT & Distance
def test_conflict_engine_travel():
    # Versailles is ~20km outside Paris center; 15 min gap is impossible
    far_itinerary = {
        "days": [{
            "date": "2026-10-10",
            "activities": [
                {
                    "name": "Louvre Tour",
                    "location": "Louvre Museum, Paris",
                    "start_time": "10:00",
                    "end_time": "12:00",
                    "cost": 10,
                },
                {
                    "name": "Versailles Visit",
                    "location": "Palace of Versailles",
                    "start_time": "12:15",
                    "end_time": "15:00",
                    "cost": 25,
                },
            ]
        }]
    }
    conflicts = detect_activity_conflicts(far_itinerary)
    assert any(c["type"] == "TRAVEL_TIME_CONFLICT" for c in conflicts)
    summary = summarize_conflicts(far_itinerary)
    assert summary["valid"] is False


run_test("Conflict Engine: TRAVEL_TIME_CONFLICT", test_conflict_engine_travel)


# 9. Extended Conflict Engine: BUDGET_EXCEEDED
def test_conflict_engine_budget():
    seed_demo_data()
    itin = get_current_itinerary(DEMO_TRIP_ID).model_dump()
    conflicts = detect_activity_conflicts(itin, budget=300.0)
    assert any(c["type"] == "BUDGET_EXCEEDED" for c in conflicts)


run_test("Conflict Engine: BUDGET_EXCEEDED", test_conflict_engine_budget)


# 10. Travel Time Utility
def test_travel_utils():
    tt = estimate_travel_time("Louvre Museum, Paris", "Jardin des Tuileries, Paris")
    assert tt["status"] == "estimated"
    assert tt["verified"] is False
    assert tt["estimated_minutes"] > 0


run_test("Travel Time Estimator with Verified Flag", test_travel_utils)


# 11. Disruption Identification
def test_disruption_identification():
    seed_demo_data()
    itin = get_current_itinerary(DEMO_TRIP_ID).model_dump()
    found = identify_disrupted_activity(itin, "My Louvre booking was cancelled")
    assert found is not None
    assert found["name"] == "Louvre Museum"


run_test("Disruption Activity Identification", test_disruption_identification)


# 12. Alternative Ranking
def test_alternative_ranking():
    candidates = DEMO_ALTERNATIVES["Louvre Museum"]
    ranked = rank_alternatives(
        candidates=candidates,
        trip_interests=["art"],
        original_activity={"category": "art", "cost": 22.0},
        budget_limit=1000.0,
        current_total_cost=472.0,
    )
    assert len(ranked) == 3
    # Top alternative is Musée de l'Orangerie (art category, saves money)
    assert ranked[0]["name"] == "Musée de l'Orangerie"
    assert ranked[0]["availability_status"] == "not_verified"


run_test("Deterministic Alternative Ranking", test_alternative_ranking)


# 13. Rich Before/After Change Tracking
def test_rich_before_after():
    seed_demo_data()
    res = replan_disruption(DEMO_TRIP_ID, "Louvre booking is cancelled", simulate=True)
    changes = res["changes"]
    assert "removed" in changes
    assert "added" in changes
    assert "moved" in changes
    assert "changed_times" in changes
    assert "changed_locations" in changes
    assert "budget" in changes
    assert "reason_for_change" in changes


run_test("Rich Before/After Change Metrics", test_rich_before_after)


# 14. Alternatives Apply Endpoint
def test_alternatives_apply_endpoint():
    seed_demo_data()
    # Apply Musée Rodin instead of Louvre
    req = ApplyAlternativeRequest(
        candidate_name="Musée Rodin",
        simulate=False,
    )
    apply_res = apply_alternative_endpoint(
        trip_id=DEMO_TRIP_ID,
        activity_id="louvre-1",
        request=req,
    )
    assert apply_res["success"] is True
    assert apply_res["status"] == "applied"
    assert apply_res["changes"]["added"]["name"] == "Musée Rodin"
    # Louvre 22 -> Rodin 15 = 472 - 22 + 15 = 465 EUR
    assert apply_res["changes"]["budget"]["after"] == 465.0

    stored = get_current_itinerary(DEMO_TRIP_ID)
    assert stored.total_cost == 465.0


run_test("Alternatives Apply Endpoint (POST /apply)", test_alternatives_apply_endpoint)


# 15. Constraints PATCH Endpoint: Preferred Start Time Shift
def test_constraints_patch_endpoint():
    seed_demo_data()
    # Set preferred start time to 11:00
    update_req = TripConstraintsUpdate(
        preferred_start_time="11:00",
        simulate=False,
    )
    patch_res = update_trip_constraints(DEMO_TRIP_ID, update_req)
    assert patch_res["success"] is True
    assert patch_res["status"] == "applied"
    # Verify activities shifted
    stored = get_current_itinerary(DEMO_TRIP_ID)
    day1_acts = stored.days[0].activities
    assert day1_acts[0].start_time == "11:00"


run_test("Constraints Endpoint (PATCH /constraints)", test_constraints_patch_endpoint)


# 16. Agent Execution Trace Tracking
def test_agent_run_trace():
    seed_demo_data()
    chat_res = run_trip_chat(DEMO_TRIP_ID, "Louvre booking is cancelled", simulate=True)
    run_id = chat_res.get("run_id")
    assert run_id is not None

    trace = get_agent_run(DEMO_TRIP_ID, run_id)
    assert trace is not None
    assert trace["trip_id"] == DEMO_TRIP_ID
    assert trace["intent"] == "DISRUPTION"
    assert len(trace["tool_results"]) >= 1
    assert trace["final_response"] is not None

    all_runs = get_trip_agent_runs(DEMO_TRIP_ID)
    assert len(all_runs) >= 1


run_test("Agent Execution Trace Storage and Retrieval", test_agent_run_trace)


# 17. Trip Chat Quality and Disruption Resolution
def test_trip_chat_quality():
    seed_demo_data()
    chat_res = run_trip_chat(DEMO_TRIP_ID, "Louvre booking is cancelled", simulate=False)
    assert chat_res["status"] == "completed"
    assert "reply" in chat_res
    assert "Musée de l'Orangerie" in chat_res["reply"]
    assert "466" in chat_res["reply"]
    assert chat_res["changes"]["budget"]["after"] == 466.0


run_test("Trip Chat Quality and Reply Synthesis", test_trip_chat_quality)


# 18. Error Handling: Invalid Trip and Invalid Activity
def test_error_handling():
    seed_demo_data()
    bad_trip_res = replan_disruption("non-existent-trip-id", "Louvre cancelled")
    assert bad_trip_res["success"] is False
    assert "Trip not found" in bad_trip_res["error"]

    bad_act_req = ApplyAlternativeRequest(candidate_index=0)
    try:
        apply_alternative_endpoint(DEMO_TRIP_ID, "non-existent-act-id", bad_act_req)
        assert False, "Should have raised 404"
    except Exception as exc:
        assert "404" in str(exc) or "not found" in str(exc).lower()


run_test("Error Handling for Invalid Trip and Activity", test_error_handling)


print("\n" + "=" * 80)
print(f"FINAL RESULT: {passed}/{total_tests} COMPREHENSIVE TESTS PASSED!")
print("=" * 80)
