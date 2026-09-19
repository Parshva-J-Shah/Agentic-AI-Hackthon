from typing import Any
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services.trip_store import get_trip
from app.services.itinerary_service import get_current_itinerary, save_itinerary
from app.services.disruption_service import search_disruption_alternatives, rank_alternatives
from app.services.replanning_service import (
    _build_candidate,
    _replace_activity,
    _model_from_dict,
    build_before_after,
)
from app.tools.validator import validate_itinerary_tool
from app.services.conflict_service import summarize_conflicts

router = APIRouter(
    prefix="/api/trips",
    tags=["Alternatives"],
)


class ApplyAlternativeRequest(BaseModel):
    candidate_name: str | None = None
    candidate_index: int = 0
    candidate_data: dict[str, Any] | None = None
    simulate: bool = False


@router.post("/{trip_id}/alternatives/{activity_id}/apply")
def apply_alternative_endpoint(
    trip_id: str,
    activity_id: str,
    request: ApplyAlternativeRequest,
):
    trip = get_trip(trip_id)
    if trip is None:
        raise HTTPException(status_code=404, detail="Trip not found")

    itinerary = get_current_itinerary(trip_id)
    if itinerary is None:
        raise HTTPException(status_code=404, detail="Itinerary not found")

    itinerary_data = itinerary.model_dump()

    # Find the target activity
    target_activity = None
    for day in itinerary_data.get("days", []):
        for act in day.get("activities", []):
            if act.get("activity_id") == activity_id:
                target_activity = act
                break
        if target_activity:
            break

    if target_activity is None:
        raise HTTPException(
            status_code=404,
            detail=f"Activity '{activity_id}' not found in itinerary",
        )

    # Resolve candidate
    selected = None
    if request.candidate_data:
        selected = request.candidate_data
    else:
        alt_info = search_disruption_alternatives(target_activity, trip.destination)
        demo_alts = alt_info.get("demo_alternatives", [])
        if not demo_alts:
            raise HTTPException(
                status_code=400,
                detail=f"No alternatives available for '{target_activity.get('name')}'",
            )
        ranked = rank_alternatives(
            candidates=demo_alts,
            trip_interests=trip.interests,
            original_activity=target_activity,
            budget_limit=trip.budget,
            current_total_cost=itinerary.total_cost,
        )
        if request.candidate_name:
            for cand in ranked:
                if cand.get("name", "").lower() == request.candidate_name.lower():
                    selected = cand
                    break
        if selected is None:
            idx = max(0, min(request.candidate_index, len(ranked) - 1))
            selected = ranked[idx]

    replacement = _build_candidate(
        original_activity=target_activity,
        alternative=selected,
    )

    try:
        proposed, removed = _replace_activity(
            itinerary=itinerary_data,
            activity_id=activity_id,
            replacement=replacement,
        )
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    meta = proposed.pop("_changes", {})
    moved = meta.get("moved", [])
    changed_times = meta.get("changed_times", [])

    validation = validate_itinerary_tool(
        itinerary=proposed,
        budget=trip.budget,
    )
    conflicts = summarize_conflicts(proposed)

    if not validation.get("valid") or not conflicts.get("valid"):
        return {
            "success": False,
            "status": "validation_failed",
            "error": "Proposed replacement failed validation or creates conflicts",
            "validation": validation,
            "conflicts": conflicts,
            "candidate": selected,
        }

    changes = build_before_after(
        before=itinerary_data,
        after=proposed,
        removed=removed,
        replacement=replacement,
        moved=moved,
        changed_times=changed_times,
        reason=f"User applied alternative for '{target_activity.get('name')}'",
    )

    if request.simulate:
        return {
            "success": True,
            "status": "simulated",
            "persisted": False,
            "trip_id": trip_id,
            "activity_id": activity_id,
            "selected_alternative": selected,
            "validation": validation,
            "conflicts": conflicts,
            "before": itinerary_data,
            "after": proposed,
            "changes": changes,
        }

    updated_model = _model_from_dict(proposed)
    save_itinerary(updated_model)

    return {
        "success": True,
        "status": "applied",
        "persisted": True,
        "trip_id": trip_id,
        "activity_id": activity_id,
        "selected_alternative": selected,
        "validation": validation,
        "conflicts": conflicts,
        "before": itinerary_data,
        "after": proposed,
        "changes": changes,
    }
