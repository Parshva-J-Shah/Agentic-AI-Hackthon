from __future__ import annotations

from datetime import datetime
from typing import Any

from app.utils.travel_utils import estimate_travel_time


def _to_minutes(value: str) -> int:
    parsed = datetime.strptime(value, "%H:%M")
    return parsed.hour * 60 + parsed.minute


def detect_activity_conflicts(
    itinerary: dict[str, Any],
    budget: float | None = None,
) -> list[dict[str, Any]]:
    conflicts: list[dict[str, Any]] = []

    # 1. Budget check
    if budget is not None:
        effective_total = float(itinerary.get("total_cost", 0.0) or 0.0)
        if effective_total == 0.0:
            effective_total = sum(
                float(act.get("cost", 0.0) or 0.0)
                for day in itinerary.get("days", [])
                for act in day.get("activities", [])
            )
        if effective_total > budget:
            conflicts.append(
                {
                    "type": "BUDGET_EXCEEDED",
                    "budget": budget,
                    "total_cost": round(effective_total, 2),
                    "message": (
                        f"Total itinerary cost {effective_total:.2f} "
                        f"exceeds allocated trip budget of {budget:.2f}."
                    ),
                }
            )

    # 2. Daily schedule and travel checks
    for day in itinerary.get("days", []):
        activities = day.get("activities", [])

        normalized = []
        for activity in activities:
            try:
                start = _to_minutes(activity["start_time"])
                end = _to_minutes(activity["end_time"])
            except (KeyError, TypeError, ValueError):
                conflicts.append(
                    {
                        "type": "INVALID_TIME",
                        "date": day.get("date"),
                        "activity_id": activity.get("activity_id"),
                        "activity": activity.get("name"),
                        "message": "Activity has an invalid time format or range.",
                    }
                )
                continue

            if end <= start:
                conflicts.append(
                    {
                        "type": "INVALID_TIME",
                        "date": day.get("date"),
                        "activity_id": activity.get("activity_id"),
                        "activity": activity.get("name"),
                        "message": "Activity end time must be after start time.",
                    }
                )

            normalized.append(
                {
                    "activity": activity,
                    "start": start,
                    "end": end,
                }
            )

        normalized.sort(key=lambda item: item["start"])

        for previous, current in zip(normalized, normalized[1:]):
            prev_act = previous["activity"]
            curr_act = current["activity"]
            prev_end = previous["end"]
            curr_start = current["start"]

            # Direct time overlap
            if curr_start < prev_end:
                conflicts.append(
                    {
                        "type": "TIME_OVERLAP",
                        "date": day.get("date"),
                        "activity_ids": [
                            prev_act.get("activity_id"),
                            curr_act.get("activity_id"),
                        ],
                        "activities": [
                            prev_act.get("name"),
                            curr_act.get("name"),
                        ],
                        "message": (
                            f"'{prev_act.get('name')}' ({prev_act.get('start_time')}-{prev_act.get('end_time')}) "
                            f"overlaps with '{curr_act.get('name')}' ({curr_act.get('start_time')}-{curr_act.get('end_time')})."
                        ),
                    }
                )
                continue

            # Gap between activities
            gap_minutes = curr_start - prev_end
            prev_loc = prev_act.get("location", "")
            curr_loc = curr_act.get("location", "")

            # If locations differ, evaluate travel time feasibility
            if prev_loc and curr_loc and prev_loc.lower().strip() != curr_loc.lower().strip():
                travel_est = estimate_travel_time(prev_loc, curr_loc)
                needed_minutes = travel_est.get("estimated_minutes", 15)

                if gap_minutes < needed_minutes:
                    conflicts.append(
                        {
                            "type": "TRAVEL_TIME_CONFLICT",
                            "date": day.get("date"),
                            "activity_ids": [
                                prev_act.get("activity_id"),
                                curr_act.get("activity_id"),
                            ],
                            "activities": [
                                prev_act.get("name"),
                                curr_act.get("name"),
                            ],
                            "available_gap_minutes": gap_minutes,
                            "estimated_travel_minutes": needed_minutes,
                            "travel_mode": travel_est.get("mode"),
                            "message": (
                                f"Insufficient transit time between '{prev_act.get('name')}' and '{curr_act.get('name')}': "
                                f"{gap_minutes} min available, but estimated {needed_minutes} min required."
                            ),
                        }
                    )
                elif gap_minutes < 10:
                    conflicts.append(
                        {
                            "type": "INSUFFICIENT_TRANSITION_TIME",
                            "date": day.get("date"),
                            "activity_ids": [
                                prev_act.get("activity_id"),
                                curr_act.get("activity_id"),
                            ],
                            "activities": [
                                prev_act.get("name"),
                                curr_act.get("name"),
                            ],
                            "available_gap_minutes": gap_minutes,
                            "message": (
                                f"Transition buffer between '{prev_act.get('name')}' and '{curr_act.get('name')}' "
                                f"is only {gap_minutes} minutes, which is below the recommended 10-minute buffer."
                            ),
                        }
                    )

    return conflicts


def summarize_conflicts(
    itinerary: dict[str, Any],
    budget: float | None = None,
) -> dict[str, Any]:
    conflicts = detect_activity_conflicts(itinerary, budget=budget)

    # Overlaps, invalid times, travel time conflicts, and budget exceedances are hard errors
    blocking_types = {"TIME_OVERLAP", "INVALID_TIME", "TRAVEL_TIME_CONFLICT", "BUDGET_EXCEEDED"}
    blocking_conflicts = [c for c in conflicts if c.get("type") in blocking_types]

    return {
        "valid": len(blocking_conflicts) == 0,
        "conflict_count": len(conflicts),
        "blocking_count": len(blocking_conflicts),
        "conflicts": conflicts,
    }
