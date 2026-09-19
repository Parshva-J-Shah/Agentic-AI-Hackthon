from typing import Any, Optional
from fastapi import APIRouter
from pydantic import BaseModel

from app.agent.trip_chat import run_trip_chat


router = APIRouter(
    prefix="/api/trips",
    tags=["Disruptions"],
)


class DisruptionRequest(BaseModel):
    activity_id: Optional[str] = None
    type: Optional[str] = None
    message: Optional[str] = None
    simulate: bool = False


@router.post("/{trip_id}/disruptions")
def create_disruption(
    trip_id: str,
    request: DisruptionRequest,
):
    disruption_msg = request.message or (
        f"{request.activity_id or 'Activity'} is {request.type or 'cancelled'}."
    )
    res = run_trip_chat(
        trip_id=trip_id,
        message=disruption_msg,
        simulate=request.simulate,
    )

    replan_res = next(
        (
            r.get("result", {})
            for r in res.get("tool_results", [])
            if r.get("tool") == "replan_itinerary"
        ),
        {},
    )

    affected_id = (
        request.activity_id
        or replan_res.get("disrupted_activity", {}).get("activity_id")
        or "act_001"
    )

    alternatives = replan_res.get("all_alternatives", [])
    changes = res.get("changes") or replan_res.get("changes", {})
    after_itin = res.get("after") or replan_res.get("after", {})
    budget_info = changes.get("budget", {})

    return {
        "status": "replanned" if not request.simulate else "simulated",
        "simulated": request.simulate,
        "affected_activities": [affected_id],
        "alternatives": alternatives,
        "changes": changes,
        "itinerary": after_itin,
        "budget": budget_info,
        "chat_response": res,
        "message": res.get("reply", disruption_msg),
        "run_id": res.get("run_id"),
    }
