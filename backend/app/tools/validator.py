from datetime import datetime
from typing import Any


def _to_minutes(value: str) -> int:
    parsed = datetime.strptime(value, "%H:%M")
    return parsed.hour * 60 + parsed.minute


def validate_itinerary_tool(
    itinerary: dict[str, Any],
    budget: float | None = None,
) -> dict[str, Any]:

    errors = []
    warnings = []

    total_cost = 0.0

    for day in itinerary.get("days", []):

        activities = day.get("activities", [])

        parsed_activities = []

        for activity in activities:

            try:
                start = _to_minutes(activity["start_time"])
                end = _to_minutes(activity["end_time"])

                if end <= start:
                    errors.append(
                        f"Invalid time range for '{activity.get('name')}'."
                    )

                parsed_activities.append(
                    (
                        start,
                        end,
                        activity.get("name", "Unnamed activity"),
                    )
                )

            except (KeyError, ValueError):
                errors.append(
                    f"Invalid time format for '{activity.get('name')}'."
                )

            cost = activity.get("cost", 0.0) or 0.0
            total_cost += float(cost)

        parsed_activities.sort(key=lambda item: item[0])

        for current_index in range(
            1,
            len(parsed_activities),
        ):
            previous = parsed_activities[current_index - 1]
            current = parsed_activities[current_index]

            if current[0] < previous[1]:
                errors.append(
                    f"Time conflict between "
                    f"'{previous[2]}' and '{current[2]}'."
                )

    itinerary_total = itinerary.get("total_cost")
    effective_total = (
        float(itinerary_total)
        if itinerary_total is not None and float(itinerary_total) > 0
        else total_cost
    )

    if budget is not None and effective_total > budget:
        errors.append(
            f"Total itinerary cost {effective_total:.2f} "
            f"exceeds budget {budget:.2f}."
        )

    if not errors:
        warnings.append(
            "Opening hours, travel time, and real-time availability "
            "require external verification when applicable."
        )

    return {
        "valid": len(errors) == 0,
        "errors": errors,
        "warnings": warnings,
        "total_cost": round(effective_total, 2),
    }
