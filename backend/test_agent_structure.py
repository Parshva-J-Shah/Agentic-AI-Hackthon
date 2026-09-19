from app.agent.planner import build_plan


print("=" * 80)
print("TRAVELPILOT AGENT EXECUTION STRUCTURE TEST")
print("=" * 80)


test_cases = [
    (
        "ITINERARY_QUERY",
        "get_current_itinerary",
    ),
    (
        "ACTIVITY_QUERY",
        "search_web",
    ),
    (
        "FIT_ACTIVITY",
        "get_current_itinerary",
    ),
    (
        "CHANGE_CONSTRAINT",
        "get_current_itinerary",
    ),
    (
        "DISRUPTION",
        "get_current_itinerary",
    ),
    (
        "REPLAN",
        "get_current_itinerary",
    ),
]


passed = 0


for intent, expected_tool in test_cases:

    plan = build_plan(intent)

    first_tool = plan.actions[0].tool

    print()
    print(f"Intent: {intent}")
    print(f"First tool: {first_tool}")

    assert first_tool == expected_tool

    passed += 1

    print("STATUS: PASS")


print()
print("=" * 80)
print(f"FINAL RESULT: {passed}/{len(test_cases)} AGENT STRUCTURE TESTS PASSED")
print("=" * 80)

assert passed == len(test_cases)
