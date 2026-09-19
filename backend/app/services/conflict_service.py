from __future__ import annotations

from datetime import datetime
from typing import Any


def _to_minutes(value: str) -> int:
    return datetime.strptime(value, "%H:%M").hour * 60 + datetime.strptime(
        value, "%H:%M"
    ).minute


def detect_activity_conflicts(itinerary: dict[str, Any]) -> list[dict[str, Any]]:
    conflicts: list[dict[str, Any]] = []

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
                        "type": "invalid_time",
                        "date": day.get("date"),
                        "activity_id": activity.get("activity_id"),
                        "activity": activity.get("name"),
                        "message": "Activity has an invalid time range.",
                    }
                )
                continue

            if end <= start:
                conflicts.append(
                    {
                        "type": "invalid_time_range",
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
            if current["start"] < previous["end"]:
                conflicts.append(
                    {
                        "type": "overlap",
                        "date": day.get("date"),
                        "activity_ids": [
                            previous["activity"].get("activity_id"),
                            current["activity"].get("activity_id"),
                        ],
                        "activities": [
                            previous["activity"].get("name"),
                            current["activity"].get("name"),
                        ],
                        "message": (
                            f'{previous["activity"].get("name")} overlaps with '
                            f'{current["activity"].get("name")}.'
                        ),
                    }
                )

    return conflicts


def summarize_conflicts(itinerary: dict[str, Any]) -> dict[str, Any]:
    conflicts = detect_activity_conflicts(itinerary)

    return {
        "valid": len(conflicts) == 0,
        "conflict_count": len(conflicts),
        "conflicts": conflicts,
    }
