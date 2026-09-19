from __future__ import annotations

from copy import deepcopy
from typing import Any

from app.services.conflict_service import summarize_conflicts
from app.services.disruption_service import inspect_disruption
from app.services.itinerary_service import get_current_itinerary, save_itinerary
from app.services.trip_store import get_trip
from app.models.itinerary import (
    Itinerary,
    ItineraryActivity,
    ItineraryDay,
)
from app.tools.validator import validate_itinerary_tool


def _build_candidate(
    original_activity: dict[str, Any],
    alternative: dict[str, Any],
) -> dict[str, Any]:
    return {
        "activity_id": (
            f'replacement-{original_activity.get("activity_id", "activity")}'
        ),
        "name": alternative["name"],
        "date": original_activity.get("date"),
        "start_time": original_activity.get("start_time"),
        "end_time": original_activity.get("end_time"),
        "location": alternative.get("location", ""),
        "cost": float(alternative.get("estimated_cost", 0.0)),
        "currency": original_activity.get("currency", "EUR"),
        "category": alternative.get(
            "category",
            original_activity.get("category", "sightseeing"),
        ),
        "source": alternative.get("source"),
        "cost_status": "estimated",
        "availability_status": "not_verified",
    }


def _replace_activity(
    itinerary: dict[str, Any],
    activity_id: str,
    replacement: dict[str, Any],
) -> tuple[dict[str, Any], dict[str, Any]]:
    updated = deepcopy(itinerary)

    removed = None
    inserted = False

    for day in updated.get("days", []):
        activities = day.get("activities", [])

        for index, activity in enumerate(activities):
            if activity.get("activity_id") == activity_id:
                removed = deepcopy(activity)
                activities[index] = replacement
                inserted = True
                break

        if inserted:
            break

    if not inserted:
        raise ValueError(
            f"Activity '{activity_id}' was not found in itinerary."
        )

    total = 0.0

    for day in updated.get("days", []):
        for activity in day.get("activities", []):
            total += float(activity.get("cost", 0.0) or 0.0)

    updated["total_cost"] = round(total, 2)

    return updated, removed


def _model_from_dict(data: dict[str, Any]) -> Itinerary:
    days = []

    for day in data.get("days", []):
        activities = []

        for activity in day.get("activities", []):
            clean = {
                key: value
                for key, value in activity.items()
                if key in {
                    "activity_id",
                    "name",
                    "date",
                    "start_time",
                    "end_time",
                    "location",
                    "cost",
                    "currency",
                    "category",
                }
            }

            activities.append(
                ItineraryActivity(**clean)
            )

        days.append(
            ItineraryDay(
                date=day.get("date"),
                activities=activities,
            )
        )

    return Itinerary(
        trip_id=data["trip_id"],
        days=days,
        total_cost=float(data.get("total_cost", 0.0)),
        currency=data.get("currency", "EUR"),
    )


def build_before_after(
    before: dict[str, Any],
    after: dict[str, Any],
    removed: dict[str, Any],
    replacement: dict[str, Any],
) -> dict[str, Any]:
    return {
        "removed": {
            "activity_id": removed.get("activity_id"),
            "name": removed.get("name"),
            "date": removed.get("date"),
            "start_time": removed.get("start_time"),
            "end_time": removed.get("end_time"),
            "location": removed.get("location"),
            "cost": removed.get("cost"),
        },
        "added": {
            "activity_id": replacement.get("activity_id"),
            "name": replacement.get("name"),
            "date": replacement.get("date"),
            "start_time": replacement.get("start_time"),
            "end_time": replacement.get("end_time"),
            "location": replacement.get("location"),
            "cost": replacement.get("cost"),
            "cost_status": replacement.get("cost_status"),
            "availability_status": replacement.get(
                "availability_status"
            ),
        },
        "budget": {
            "before": before.get("total_cost", 0.0),
            "after": after.get("total_cost", 0.0),
            "delta": round(
                float(after.get("total_cost", 0.0))
                - float(before.get("total_cost", 0.0)),
                2,
            ),
            "currency": after.get("currency", "EUR"),
        },
    }


def replan_disruption(
    trip_id: str,
    message: str,
    simulate: bool = False,
) -> dict[str, Any]:
    trip = get_trip(trip_id)

    if trip is None:
        return {
            "success": False,
            "error": "Trip not found",
        }

    current = get_current_itinerary(trip_id)

    if current is None:
        return {
            "success": False,
            "error": "Itinerary not found",
        }

    before = current.model_dump()

    inspection = inspect_disruption(
        trip_id=trip_id,
        message=message,
    )

    if not inspection.get("success"):
        return inspection

    disrupted = inspection["disrupted_activity"]
    alternatives_data = inspection["alternatives"]

    demo_alternatives = alternatives_data.get(
        "demo_alternatives",
        [],
    )

    if not demo_alternatives:
        return {
            "success": False,
            "error": (
                "No controlled replacement candidate is available "
                "for this disruption."
            ),
            "inspection": inspection,
        }

    # First candidate is deterministic for the hackathon demo.
    selected = demo_alternatives[0]

    replacement = _build_candidate(
        original_activity=disrupted,
        alternative=selected,
    )

    proposed, removed = _replace_activity(
        itinerary=before,
        activity_id=disrupted.get("activity_id"),
        replacement=replacement,
    )

    # Validate proposed itinerary before anything can be persisted.
    validation = validate_itinerary_tool(
        itinerary=proposed,
        budget=trip.budget,
    )

    conflicts = summarize_conflicts(proposed)

    if not validation.get("valid") or not conflicts.get("valid"):
        return {
            "success": False,
            "error": "Proposed replanning failed deterministic validation.",
            "validation": validation,
            "conflicts": conflicts,
            "inspection": inspection,
        }

    changes = build_before_after(
        before=before,
        after=proposed,
        removed=removed,
        replacement=replacement,
    )

    if simulate:
        return {
            "success": True,
            "status": "simulated",
            "persisted": False,
            "trip_id": trip_id,
            "message": message,
            "disrupted_activity": disrupted,
            "selected_alternative": selected,
            "validation": validation,
            "conflicts": conflicts,
            "before": before,
            "after": proposed,
            "changes": changes,
            "source_note": (
                "This is a simulated replanning preview. "
                "No itinerary data was persisted."
            ),
        }

    updated_model = _model_from_dict(proposed)
    save_itinerary(updated_model)

    return {
        "success": True,
        "status": "replanned",
        "persisted": True,
        "trip_id": trip_id,
        "message": message,
        "disrupted_activity": disrupted,
        "selected_alternative": selected,
        "validation": validation,
        "conflicts": conflicts,
        "before": before,
        "after": proposed,
        "changes": changes,
        "source_note": (
            "Replacement selected from controlled demo alternatives. "
            "Real-time availability and booking status are not verified."
        ),
    }
