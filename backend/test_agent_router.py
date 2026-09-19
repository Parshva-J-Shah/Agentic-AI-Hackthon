from app.agent.planner import build_plan


TEST_CASES = [
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
        "handle_disruption",
    ),
    (
        "REPLAN",
        "replan_itinerary",
    ),
]


print("=" * 80)
print("TRAVELPILOT AGENT ROUTER TEST")
print("=" * 80)

passed = 0

for index, (intent, expected_first_tool) in enumerate(TEST_CASES, start=1):

    plan = build_plan(intent)

    first_tool = (
        plan.actions[0].tool
        if plan.actions
        else None
    )

    print(f"\nTEST {index}")
    print(f"Intent       : {intent}")
    print(f"First tool   : {first_tool}")
    print("Full actions :")

    for action in plan.actions:
        print(
            f"  -> {action.tool}: {action.reason}"
        )

    if first_tool == expected_first_tool:
        print("STATUS       : PASS")
        passed += 1
    else:
        print("STATUS       : FAIL")

    print("-" * 80)


print()
print("=" * 80)
print(f"FINAL RESULT: {passed}/{len(TEST_CASES)} ROUTING TESTS PASSED")
print("=" * 80)
