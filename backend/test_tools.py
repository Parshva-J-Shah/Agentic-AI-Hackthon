from app.tools.registry import execute_tool


print("=" * 80)
print("TRAVELPILOT TOOL EXECUTION TEST")
print("=" * 80)


# ---------------------------------------------------------
# TEST 1: Budget calculation
# ---------------------------------------------------------

sample_itinerary = {
    "currency": "EUR",
    "days": [
        {
            "date": "2026-10-10",
            "activities": [
                {
                    "name": "Louvre Museum",
                    "start_time": "10:00",
                    "end_time": "13:00",
                    "cost": 22,
                },
                {
                    "name": "Lunch",
                    "start_time": "13:30",
                    "end_time": "14:30",
                    "cost": 30,
                },
            ],
        },
        {
            "date": "2026-10-11",
            "activities": [
                {
                    "name": "Museum",
                    "start_time": "10:00",
                    "end_time": "12:00",
                    "cost": 20,
                },
            ],
        },
    ],
}


budget_result = execute_tool(
    "calculate_budget",
    {
        "itinerary": sample_itinerary,
    },
)

print("\nTEST 1 - Budget")
print(budget_result)

assert budget_result["success"] is True
assert budget_result["total_cost"] == 72.0

print("STATUS: PASS")


# ---------------------------------------------------------
# TEST 2: Valid itinerary
# ---------------------------------------------------------

validation_result = execute_tool(
    "validate_itinerary",
    {
        "itinerary": sample_itinerary,
        "budget": 100,
    },
)

print("\nTEST 2 - Validation")
print(validation_result)

assert validation_result["valid"] is True
assert validation_result["total_cost"] == 72.0

print("STATUS: PASS")


# ---------------------------------------------------------
# TEST 3: Detect time conflict
# ---------------------------------------------------------

conflict_itinerary = {
    "currency": "EUR",
    "days": [
        {
            "date": "2026-10-10",
            "activities": [
                {
                    "name": "Louvre",
                    "start_time": "10:00",
                    "end_time": "13:00",
                    "cost": 20,
                },
                {
                    "name": "Lunch",
                    "start_time": "12:00",
                    "end_time": "14:00",
                    "cost": 20,
                },
            ],
        },
    ],
}

conflict_result = execute_tool(
    "validate_itinerary",
    {
        "itinerary": conflict_itinerary,
        "budget": 100,
    },
)

print("\nTEST 3 - Conflict Detection")
print(conflict_result)

assert conflict_result["valid"] is False
assert len(conflict_result["errors"]) >= 1

print("STATUS: PASS")


# ---------------------------------------------------------
# TEST 4: Update itinerary
# ---------------------------------------------------------

update_itinerary = {
    "currency": "EUR",
    "days": [
        {
            "date": "2026-10-10",
            "activities": [
                {
                    "activity_id": "louvre-1",
                    "name": "Louvre",
                    "date": "2026-10-10",
                    "start_time": "10:00",
                    "end_time": "13:00",
                    "cost": 22,
                },
            ],
        },
        {
            "date": "2026-10-11",
            "activities": [],
        },
    ],
}

update_result = execute_tool(
    "update_itinerary",
    {
        "itinerary": update_itinerary,
        "changes": [
            {
                "type": "move_activity",
                "activity_id": "louvre-1",
                "target_date": "2026-10-11",
            }
        ],
    },
)

print("\nTEST 4 - Update")
print(update_result)

assert update_result["success"] is True
assert len(update_result["applied_changes"]) == 1

print("STATUS: PASS")


# ---------------------------------------------------------
# TEST 5: Unknown tool protection
# ---------------------------------------------------------

unknown_result = execute_tool(
    "random_unknown_tool",
    {},
)

print("\nTEST 5 - Unknown Tool")
print(unknown_result)

assert unknown_result["success"] is False

print("STATUS: PASS")


print()
print("=" * 80)
print("FINAL RESULT: 5/5 TOOL TESTS PASSED")
print("=" * 80)
