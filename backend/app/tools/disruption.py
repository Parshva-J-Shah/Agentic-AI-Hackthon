from typing import Any

from app.services.disruption_service import inspect_disruption


def handle_disruption_tool(
    trip_id: str,
    message: str,
) -> dict[str, Any]:
    return inspect_disruption(
        trip_id=trip_id,
        message=message,
    )
