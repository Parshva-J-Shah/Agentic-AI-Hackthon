from copy import deepcopy
from typing import Any
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.trip_store import get_trip, save_trip
from app.services.itinerary_service import get_current_itinerary, save_itinerary
from app.services.replanning_service import _model_from_dict, _to_minutes_val, _to_time_str
from app.tools.validator import validate_itinerary_tool
from app.services.conflict_service import summarize_conflicts

router = APIRouter(
    prefix="/api/trips",
    tags=["Constraints"],
)


class TripConstraintsUpdate(BaseModel):
    budget: float | None = Field(default=None, ge=0)
    preferred_start_time: str | None = None
    preferred_end_time: str | None = None
    interests: list[str] | None = None
    preferences: list[str] | None = None
    simulate: bool = False


@router.patch("/{trip_id}/constraints")
def update_trip_constraints(
    trip_id: str,
    update_data: TripConstraintsUpdate,
):
    trip = get_trip(trip_id)
    if trip is None:
        raise HTTPException(status_code=404, detail="Trip not found")

    itinerary = get_current_itinerary(trip_id)
    if itinerary is None:
        raise HTTPException(status_code=404, detail="Itinerary not found")

    orig_trip_dict = trip.model_dump()
    orig_itin_dict = itinerary.model_dump()

    # Stage updated trip
    new_trip = deepcopy(trip)
    applied_constraints: dict[str, Any] = {}

    if update_data.budget is not None:
        new_trip.budget = update_data.budget
        applied_constraints["budget"] = update_data.budget

    if update_data.interests is not None:
        new_trip.interests = update_data.interests
        applied_constraints["interests"] = update_data.interests

    if update_data.preferences is not None:
        new_trip.preferences = update_data.preferences
        applied_constraints["preferences"] = update_data.preferences

    if update_data.preferred_start_time is not None:
        pref_note = f"avoid activities before {update_data.preferred_start_time}"
        if pref_note not in new_trip.preferences:
            new_trip.preferences.append(pref_note)
        applied_constraints["preferred_start_time"] = update_data.preferred_start_time

    if update_data.preferred_end_time is not None:
        pref_note = f"end activities by {update_data.preferred_end_time}"
        if pref_note not in new_trip.preferences:
            new_trip.preferences.append(pref_note)
        applied_constraints["preferred_end_time"] = update_data.preferred_end_time

    # Evaluate itinerary against new constraints
    proposed_itin = deepcopy(orig_itin_dict)
    moved_activities = []
    changed_times = []

    # Handle preferred_start_time shift
    if update_data.preferred_start_time:
        min_start_min = _to_minutes_val(update_data.preferred_start_time)
        for day in proposed_itin.get("days", []):
            acts = day.get("activities", [])
            curr_cursor = min_start_min
            for idx, act in enumerate(acts):
                act_start = _to_minutes_val(act.get("start_time", "00:00"))
                act_end = _to_minutes_val(act.get("end_time", "00:00"))
                duration = max(30, act_end - act_start)
                act_loc = act.get("location", "")

                if act_start < curr_cursor:
                    old_s = act["start_time"]
                    old_e = act["end_time"]
                    new_s_min = curr_cursor
                    new_e_min = new_s_min + duration
                    act["start_time"] = _to_time_str(new_s_min)
                    act["end_time"] = _to_time_str(new_e_min)

                    moved_activities.append(deepcopy(act))
                    changed_times.append({
                        "activity_id": act.get("activity_id"),
                        "name": act.get("name"),
                        "old_start": old_s,
                        "old_end": old_e,
                        "new_start": act["start_time"],
                        "new_end": act["end_time"],
                        "reason": f"Shifted to respect preferred start time {update_data.preferred_start_time} and transit buffer",
                    })
                    curr_finish = new_e_min
                else:
                    curr_finish = act_end

                # Calculate transit buffer to next activity
                next_buffer = 15
                if idx + 1 < len(acts):
                    next_loc = acts[idx + 1].get("location", "")
                    if act_loc and next_loc and act_loc.lower().strip() != next_loc.lower().strip():
                        from app.utils.travel_utils import estimate_travel_time
                        tt = estimate_travel_time(act_loc, next_loc)
                        next_buffer = max(15, tt.get("estimated_minutes", 15))

                curr_cursor = curr_finish + next_buffer

    # Validate proposed itinerary against new trip budget and schedule
    validation = validate_itinerary_tool(
        itinerary=proposed_itin,
        budget=new_trip.budget,
    )
    conflicts = summarize_conflicts(proposed_itin)

    if not validation.get("valid") or not conflicts.get("valid"):
        return {
            "success": False,
            "status": "validation_failed",
            "error": "Itinerary cannot satisfy updated constraints without replanning",
            "validation": validation,
            "conflicts": conflicts,
            "applied_constraints": applied_constraints,
        }

    changes = {
        "moved": moved_activities,
        "changed_times": changed_times,
        "budget": {
            "before": orig_itin_dict.get("total_cost", 0.0),
            "after": proposed_itin.get("total_cost", 0.0),
            "delta": round(
                float(proposed_itin.get("total_cost", 0.0))
                - float(orig_itin_dict.get("total_cost", 0.0)),
                2,
            ),
            "currency": proposed_itin.get("currency", "EUR"),
        },
        "updated_constraints": applied_constraints,
    }

    if update_data.simulate:
        return {
            "success": True,
            "status": "simulated",
            "persisted": False,
            "trip_id": trip_id,
            "constraints": applied_constraints,
            "validation": validation,
            "conflicts": conflicts,
            "before": orig_itin_dict,
            "after": proposed_itin,
            "changes": changes,
        }

    # Persist changes only after validation passes
    save_trip(new_trip)
    save_itinerary(_model_from_dict(proposed_itin))

    return {
        "success": True,
        "status": "applied",
        "persisted": True,
        "trip_id": trip_id,
        "constraints": applied_constraints,
        "validation": validation,
        "conflicts": conflicts,
        "before": orig_itin_dict,
        "after": proposed_itin,
        "changes": changes,
    }
