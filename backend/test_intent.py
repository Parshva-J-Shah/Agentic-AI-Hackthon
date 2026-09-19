from app.agent.intent import detect_intent


TEST_MESSAGES = [
    (
        "CREATE_ITINERARY",
        "Plan me a 4 day trip to Paris with museums and good food.",
    ),
    (
        "ITINERARY_QUERY",
        "What am I doing on the second day?",
    ),
    (
        "ACTIVITY_QUERY",
        "Is the Louvre open on Monday?",
    ),
    (
        "FIT_ACTIVITY",
        "Does this activity fit my budget and schedule?",
    ),
    (
        "CHANGE_CONSTRAINT",
        "I don't want early mornings anymore.",
    ),
    (
        "DISRUPTION",
        "The Louvre booking was cancelled.",
    ),
    (
        "REPLAN",
        "Move the Louvre visit to another day and rebuild my itinerary.",
    ),
]


print("=" * 80)
print("TRAVELPILOT INTENT DETECTION TEST")
print("=" * 80)

passed = 0

for index, (expected, message) in enumerate(TEST_MESSAGES, start=1):

    print(f"\nTEST {index}")
    print(f"Expected  : {expected}")
    print(f"User      : {message}")

    try:
        result = detect_intent(message)

        print(f"Detected  : {result.intent}")
        print(f"Confidence: {result.confidence:.2f}")
        print(f"Reason    : {result.reason}")

        if result.entities:
            print("Entities  :")
            for entity in result.entities:
                print(f"  - {entity.key}: {entity.value}")
        else:
            print("Entities  : none")

        if result.intent == expected:
            print("STATUS    : PASS")
            passed += 1
        else:
            print("STATUS    : FAIL")

    except Exception as exc:
        print(f"ERROR     : {exc}")
        print("STATUS    : FAIL")

    print("-" * 80)


print()
print("=" * 80)
print(f"FINAL RESULT: {passed}/{len(TEST_MESSAGES)} TESTS PASSED")
print("=" * 80)
