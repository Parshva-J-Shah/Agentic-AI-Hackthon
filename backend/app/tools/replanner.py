from typing import Any

from app.services.replanning_service import replan_disruption


def replan_itinerary_tool(
    trip_id: str,
    message: str,
    simulate: bool = False,
) -> dict[str, Any]:
    return replan_disruption(
        trip_id=trip_id,
        message=message,
        simulate=simulate,
    )
