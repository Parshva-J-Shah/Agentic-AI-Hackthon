from typing import Any


def calculate_budget_tool(
    itinerary: dict[str, Any],
) -> dict[str, Any]:

    total_cost = 0.0

    for day in itinerary.get("days", []):
        for activity in day.get("activities", []):
            cost = activity.get("cost", 0.0) or 0.0
            total_cost += float(cost)

    return {
        "success": True,
        "total_cost": round(total_cost, 2),
        "currency": itinerary.get("currency", "USD"),
    }
