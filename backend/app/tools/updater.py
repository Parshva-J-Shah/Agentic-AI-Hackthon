from typing import Any


def update_itinerary_tool(
    itinerary: dict[str, Any],
    changes: list[dict[str, Any]],
) -> dict[str, Any]:

    updated = itinerary.copy()

    updated_days = []

    for day in itinerary.get("days", []):
        updated_days.append(
            {
                **day,
                "activities": [
                    dict(activity)
                    for activity in day.get("activities", [])
                ],
            }
        )

    updated["days"] = updated_days

    applied = []

    for change in changes:

        change_type = change.get("type")

        if change_type == "remove_activity":

            activity_id = change.get("activity_id")

            for day in updated["days"]:
                original_count = len(day["activities"])

                day["activities"] = [
                    activity
                    for activity in day["activities"]
                    if activity.get("activity_id") != activity_id
                ]

                if len(day["activities"]) < original_count:
                    applied.append(change)

        elif change_type == "add_activity":

            target_date = change.get("date")
            activity = change.get("activity")

            if not target_date or not activity:
                continue

            for day in updated["days"]:
                if day.get("date") == target_date:
                    day["activities"].append(activity)
                    applied.append(change)
                    break

        elif change_type == "move_activity":

            activity_id = change.get("activity_id")
            target_date = change.get("target_date")

            if not activity_id or not target_date:
                continue

            moving_activity = None

            for day in updated["days"]:
                for activity in day["activities"]:
                    if activity.get("activity_id") == activity_id:
                        moving_activity = activity
                        break

                if moving_activity:
                    break

            if moving_activity:

                for day in updated["days"]:
                    day["activities"] = [
                        activity
                        for activity in day["activities"]
                        if activity.get("activity_id") != activity_id
                    ]

                moving_activity["date"] = target_date

                for day in updated["days"]:
                    if day.get("date") == target_date:
                        day["activities"].append(moving_activity)
                        applied.append(change)
                        break

    total_cost = sum(
        float(activity.get("cost", 0.0) or 0.0)
        for day in updated["days"]
        for activity in day["activities"]
    )

    updated["total_cost"] = round(total_cost, 2)

    return {
        "success": True,
        "itinerary": updated,
        "applied_changes": applied,
    }
