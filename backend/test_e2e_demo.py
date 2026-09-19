import sys

if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

from app.services.demo_seed import DEMO_TRIP_ID, seed_demo_data
from app.services.trip_store import get_trip
from app.services.itinerary_service import get_current_itinerary
from app.agent.intent import detect_intent
from app.agent.trip_chat import run_trip_chat
from app.services.disruption_service import inspect_disruption


def run_e2e_demo():
    print("=" * 80)
    print("✈️ TRAVELPILOT END-TO-END DEMO SCENARIO (20 STEPS)")
    print("=" * 80)

    # 1. Create / Load Paris trip
    print("\n[Step 1 & 2] Loading Paris Trip...")
    seed_demo_data()
    trip = get_trip(DEMO_TRIP_ID)
    assert trip is not None
    assert trip.destination == "Paris"
    assert trip.budget == 1000.0
    print(f"  ✓ Trip loaded: {trip.destination} | Budget: €{trip.budget:.2f} {trip.currency}")

    # 3. Show itinerary
    print("\n[Step 3] Inspecting Generated Itinerary...")
    itinerary = get_current_itinerary(DEMO_TRIP_ID)
    assert itinerary is not None
    assert len(itinerary.days) == 4
    print(f"  ✓ Itinerary has {len(itinerary.days)} days.")
    for idx, day in enumerate(itinerary.days, 1):
        names = [a.name for a in day.activities]
        print(f"    • Day {idx} ({day.date}): {', '.join(names)}")

    # 4. Show budget
    print("\n[Step 4] Checking Baseline Trip Budget...")
    assert itinerary.total_cost == 472.0
    print(f"  ✓ Current Total Cost: €{itinerary.total_cost:.2f} {itinerary.currency}")

    # 5. Ask itinerary question
    print("\n[Step 5] User asks: 'What is planned for my trip?'")
    chat_q1 = run_trip_chat(DEMO_TRIP_ID, "What is planned for my trip?", simulate=False)
    print("  Agent Reply:")
    for line in chat_q1["reply"].split("\n"):
        print(f"    {line}")
    assert chat_q1["status"] == "completed"

    # 6. Trigger Disruption
    disruption_msg = "Louvre booking is cancelled."
    print(f"\n[Step 6] Disruption Event Triggered: '{disruption_msg}'")

    # 7. Detect disruption intent
    print("\n[Step 7] Intent Detection...")
    intent_res = detect_intent(disruption_msg)
    assert intent_res.intent in {"DISRUPTION", "REPLAN"}
    print(f"  ✓ Detected Intent: {intent_res.intent} (confidence: {intent_res.confidence:.2f})")
    print(f"    Reason: {intent_res.reason}")

    # 8. Find alternatives
    print("\n[Step 8] Inspecting Disruption & Searching Alternatives...")
    inspection = inspect_disruption(DEMO_TRIP_ID, disruption_msg)
    assert inspection["success"] is True
    disrupted_act = inspection["disrupted_activity"]
    assert disrupted_act["name"] == "Louvre Museum"
    print(f"  ✓ Disrupted activity identified: {disrupted_act['name']} (€{disrupted_act['cost']})")

    # 9. Show candidate reasoning
    print("\n[Step 9] Candidate Evaluation and Ranking:")
    alts = inspection["alternatives"]["demo_alternatives"]
    for idx, alt in enumerate(alts, 1):
        print(f"    {idx}. {alt['name']} | Category: {alt['category']} | Est Cost: €{alt['estimated_cost']:.2f} | Score: {alt.get('ranking_score')} | Status: {alt.get('availability_status')}")
    top_cand = alts[0]
    assert top_cand["name"] == "Musée de l'Orangerie"
    print(f"  ✓ Top selected candidate: {top_cand['name']} (€{top_cand['estimated_cost']:.2f})")

    # 10. Run simulation
    print("\n[Step 10] Running Simulation Mode (Dry-Run)...")
    sim_res = run_trip_chat(DEMO_TRIP_ID, disruption_msg, simulate=True)
    assert sim_res["status"] == "simulated"
    assert sim_res["persisted"] is False
    print("  ✓ Simulation completed successfully.")
    print(f"    Agent explanation: {sim_res['reply']}")

    # 11. Verify simulation did not modify state
    print("\n[Step 11] Verifying State Preservation after Simulation...")
    itin_after_sim = get_current_itinerary(DEMO_TRIP_ID)
    assert itin_after_sim.total_cost == 472.0
    day1_names_sim = [a.name for a in itin_after_sim.days[0].activities]
    assert "Louvre Museum" in day1_names_sim
    assert "Musée de l'Orangerie" not in day1_names_sim
    print(f"  ✓ Stored itinerary total is still €{itin_after_sim.total_cost:.2f}. Louvre Museum remains intact.")

    # 12. Run real replan
    print("\n[Step 12] Executing Real Replan (Persistence Enabled)...")
    real_res = run_trip_chat(DEMO_TRIP_ID, disruption_msg, simulate=False)
    assert real_res["status"] == "completed"
    assert real_res["persisted"] is True

    # 13 & 14. Verify Louvre removed and replacement inserted
    print("\n[Step 13 & 14] Verifying Activity Replacement...")
    day1_names_real = [a["name"] for a in real_res["after"]["days"][0]["activities"]]
    assert "Louvre Museum" not in day1_names_real
    assert "Musée de l'Orangerie" in day1_names_real
    print("  ✓ 'Louvre Museum' was removed.")
    print(f"  ✓ 'Musée de l'Orangerie' was successfully scheduled.")

    # 15. Verify before / after summary
    print("\n[Step 15] Reviewing Before/After Diff:")
    changes = real_res["changes"]
    print(f"    - Removed: {changes['removed']['name']} (was €{changes['removed']['cost']:.2f})")
    print(f"    + Added  : {changes['added']['name']} (€{changes['added']['cost']:.2f}, status: {changes['added']['availability_status']})")
    print(f"    Reason   : {changes['reason_for_change']}")

    # 16. Verify budget: 472 -> 466 EUR (NOT 160)
    print("\n[Step 16] Verifying Budget Calculation:")
    b_info = changes["budget"]
    print(f"    Budget Before: €{b_info['before']:.2f}")
    print(f"    Budget After : €{b_info['after']:.2f}")
    print(f"    Budget Delta : €{b_info['delta']:.2f}")
    assert b_info["before"] == 472.0
    assert b_info["after"] == 466.0, f"Expected 466.0 EUR, got {b_info['after']}"
    assert b_info["delta"] == -6.0
    assert b_info["after"] != 160.0, "FATAL: Budget incorrectly recalculated as 160.0 EUR!"
    print("  ✓ Budget correctly preserved baseline and applied replacement delta: €472.00 - €22.00 + €16.00 = €466.00")

    # 17. Verify conflicts
    print("\n[Step 17] Verifying Conflict Checks...")
    assert real_res["conflicts"]["valid"] is True
    print("  ✓ Zero scheduling or transit conflicts detected.")

    # 18. Verify persistence in storage
    print("\n[Step 18] Verifying Database / In-Memory Persistence...")
    persisted_itin = get_current_itinerary(DEMO_TRIP_ID)
    assert persisted_itin.total_cost == 466.0
    persisted_act_names = [a.name for d in persisted_itin.days for a in d.activities]
    assert "Musée de l'Orangerie" in persisted_act_names
    assert "Louvre Museum" not in persisted_act_names
    print(f"  ✓ Persisted total cost in store: €{persisted_itin.total_cost:.2f}")

    # 19 & 20. Ask followup question and verify it uses updated state
    print("\n[Step 19 & 20] Asking Follow-up Query: 'What is planned for my trip now?'")
    followup_res = run_trip_chat(DEMO_TRIP_ID, "What is planned for my trip now?", simulate=False)
    print("  Agent Reply:")
    for line in followup_res["reply"].split("\n"):
        print(f"    {line}")
    assert "Musée de l'Orangerie" in followup_res["reply"]
    assert "466" in followup_res["reply"]
    print("  ✓ Follow-up response accurately reflects the replanned state (Musée de l'Orangerie, €466 total).")

    print("\n" + "=" * 80)
    print("🎉 ALL 20/20 END-TO-END DEMO SCENARIO STEPS PASSED PERFECTLY!")
    print("=" * 80)


if __name__ == "__main__":
    run_e2e_demo()
