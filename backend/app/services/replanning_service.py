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


def _to_minutes_val(time_str: str) -> int:
    try:
        h, m = map(int, time_str.split(":"))
        return h * 60 + m
    except Exception:
        return 0


def _to_time_str(minutes: int) -> str:
    h = (minutes // 60) % 24
    m = minutes % 60
    return f"{h:02d}:{m:02d}"


def _replace_activity(
    itinerary: dict[str, Any],
    activity_id: str,
    replacement: dict[str, Any],
    allow_cascade: bool = True,
) -> tuple[dict[str, Any], dict[str, Any]]:
    updated = deepcopy(itinerary)

    removed = None
    inserted = False
    target_day_index = None
    inserted_index = None

    for d_idx, day in enumerate(updated.get("days", [])):
        activities = day.get("activities", [])

        for index, activity in enumerate(activities):
            act_id = activity.get("activity_id") or activity.get("id") or ""
            act_name = str(activity.get("name", "")).lower()
            target_str = str(activity_id or "").lower()
            if (
                act_id == activity_id
                or (activity_id and act_id and activity_id in act_id)
                or (target_str and target_str == act_name)
                or (target_str and len(target_str) > 4 and target_str in act_name)
                or activity.get("status") == "disrupted"
            ):
                removed = deepcopy(activity)
                activities[index] = replacement
                inserted = True
                target_day_index = d_idx
                inserted_index = index
                break

        if inserted:
            break

    if not inserted:
        # Fallback to the first activity in day 1 if available
        if updated.get("days") and updated["days"][0].get("activities"):
            removed = deepcopy(updated["days"][0]["activities"][0])
            updated["days"][0]["activities"][0] = replacement
            inserted = True
            target_day_index = 0
            inserted_index = 0
        else:
            raise ValueError(
                f"Activity '{activity_id}' was not found in itinerary."
            )

    moved = []
    changed_times = []

    # Cascading schedule shift: if replacement duration extends beyond the start of next activity
    if allow_cascade and target_day_index is not None and inserted_index is not None:
        day_acts = updated["days"][target_day_index].get("activities", [])
        try:
            curr_end = _to_minutes_val(replacement.get("end_time", "00:00"))
            for next_idx in range(inserted_index + 1, len(day_acts)):
                next_act = day_acts[next_idx]
                next_start = _to_minutes_val(next_act.get("start_time", "00:00"))
                next_end = _to_minutes_val(next_act.get("end_time", "00:00"))
                duration = max(30, next_end - next_start)

                if next_start < curr_end:
                    new_start_min = curr_end + 15
                    new_end_min = new_start_min + duration
                    old_s = next_act.get("start_time")
                    old_e = next_act.get("end_time")

                    next_act["start_time"] = _to_time_str(new_start_min)
                    next_act["end_time"] = _to_time_str(new_end_min)

                    moved.append(deepcopy(next_act))
                    changed_times.append({
                        "activity_id": next_act.get("activity_id"),
                        "name": next_act.get("name"),
                        "old_start": old_s,
                        "old_end": old_e,
                        "new_start": next_act["start_time"],
                        "new_end": next_act["end_time"],
                        "reason": f"Cascaded to avoid overlap with {replacement.get('name')}",
                    })
                    curr_end = new_end_min
                else:
                    curr_end = max(curr_end, next_end)
        except Exception:
            pass

    updated["_changes"] = {
        "moved": moved,
        "changed_times": changed_times,
    }

    # Preserve any non-activity / baseline budget represented in the original itinerary:
    # new_total = old_total - removed_activity_cost + replacement_activity_cost
    old_total = float(itinerary.get("total_cost", 0.0) or 0.0)
    removed_cost = float(removed.get("cost", 0.0) or 0.0) if removed else 0.0
    replacement_cost = float(replacement.get("cost", 0.0) or 0.0)

    if old_total > 0:
        new_total = old_total - removed_cost + replacement_cost
    else:
        new_total = sum(
            float(activity.get("cost", 0.0) or 0.0)
            for day in updated.get("days", [])
            for activity in day.get("activities", [])
        )

    updated["total_cost"] = round(max(0.0, new_total), 2)

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
    moved: list[dict[str, Any]] | None = None,
    changed_times: list[dict[str, Any]] | None = None,
    reason: str = "Replacement for disrupted activity",
) -> dict[str, Any]:
    moved = moved or []
    changed_times = changed_times or []

    changed_locations = []
    if removed.get("location") and replacement.get("location") and removed.get("location") != replacement.get("location"):
        changed_locations.append({
            "activity_id": replacement.get("activity_id"),
            "name": replacement.get("name"),
            "from_location": removed.get("location"),
            "to_location": replacement.get("location"),
        })

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
            "cost_status": replacement.get("cost_status", "estimated"),
            "availability_status": replacement.get(
                "availability_status", "not_verified"
            ),
        },
        "moved": moved,
        "changed_times": changed_times,
        "changed_locations": changed_locations,
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
        "reason_for_change": reason,
    }


def replan_disruption(
    trip_id: str,
    message: str,
    simulate: bool = False,
    candidate_name: str | None = None,
    candidate_index: int = 0,
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

    # Candidate selection
    selected = None
    if candidate_name:
        for alt in demo_alternatives:
            if alt.get("name", "").lower() == candidate_name.lower():
                selected = alt
                break

    if selected is None:
        idx = max(0, min(candidate_index, len(demo_alternatives) - 1))
        selected = demo_alternatives[idx]

    replacement = _build_candidate(
        original_activity=disrupted,
        alternative=selected,
    )

    proposed, removed = _replace_activity(
        itinerary=before,
        activity_id=disrupted.get("activity_id"),
        replacement=replacement,
    )

    meta = proposed.pop("_changes", {})
    moved = meta.get("moved", [])
    changed_times = meta.get("changed_times", [])

    # Validate proposed itinerary before anything can be persisted.
    validation = validate_itinerary_tool(
        itinerary=proposed,
        budget=trip.budget,
    )

    conflicts = summarize_conflicts(proposed)
    replacement_id = replacement.get("activity_id")
    blocking_conflicts_replacement = [
        c for c in conflicts.get("conflicts", [])
        if c.get("type") in {"TIME_OVERLAP", "INVALID_TIME", "BUDGET_EXCEEDED"}
        or (replacement_id and replacement_id in c.get("activity_ids", []))
    ]

    if not validation.get("valid") or len(blocking_conflicts_replacement) > 0:
        return {
            "success": False,
            "error": "Proposed replanning failed deterministic validation.",
            "validation": validation,
            "conflicts": conflicts,
            "inspection": inspection,
        }

    reason_text = f"Alternative activity selected for disrupted '{disrupted.get('name')}'"
    changes = build_before_after(
        before=before,
        after=proposed,
        removed=removed,
        replacement=replacement,
        moved=moved,
        changed_times=changed_times,
        reason=reason_text,
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
            "all_alternatives": demo_alternatives,
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
        "all_alternatives": demo_alternatives,
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
