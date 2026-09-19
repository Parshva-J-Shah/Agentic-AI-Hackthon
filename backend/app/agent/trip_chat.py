from typing import Any

from app.agent.intent import detect_intent
from app.agent.planner import build_plan
from app.tools.registry import execute_tool
from app.services.trip_store import get_trip


def run_trip_chat(
    trip_id: str,
    message: str,
    simulate: bool = False,
) -> dict[str, Any]:
    trip = get_trip(trip_id)

    if trip is None:
        return {
            "trip_id": trip_id,
            "message": message,
            "intent": {},
            "plan": {},
            "tool_results": [],
            "status": "error: Trip not found",
        }

    intent_result = detect_intent(message)
    plan = build_plan(intent_result.intent)

    tool_results = []

    # --------------------------------------------------------
    # Special disruption/replanning workflow.
    # This guarantees the same underlying service is used by
    # chat and dedicated endpoints.
    # --------------------------------------------------------

    if intent_result.intent in {"DISRUPTION", "REPLAN"}:
        result = execute_tool(
            "replan_itinerary",
            {
                "trip_id": trip_id,
                "message": message,
                "simulate": simulate,
            },
        )

        tool_results.append(
            {
                "tool": "replan_itinerary",
                "reason": (
                    "Disruption/replanning workflow executed through "
                    "the deterministic backend service."
                ),
                "result": result,
            }
        )

        return {
            "trip_id": trip_id,
            "message": message,
            "intent": intent_result.model_dump(),
            "plan": plan.model_dump(),
            "tool_results": tool_results,
            "status": (
                "simulated"
                if simulate
                else (
                    "completed"
                    if result.get("success")
                    else "error"
                )
            ),
        }

    # --------------------------------------------------------
    # Existing normal tool execution.
    # --------------------------------------------------------

    for action in plan.actions:
        tool_name = action.tool

        if tool_name == "none":
            tool_results.append(
                {
                    "tool": tool_name,
                    "reason": action.reason,
                    "skipped": True,
                }
            )
            continue

        if tool_name == "get_current_itinerary":
            result = execute_tool(
                "get_current_itinerary",
                {"trip_id": trip_id},
            )

        elif tool_name == "search_web":
            result = execute_tool(
                "search_web",
                {
                    "query": message,
                    "max_results": 5,
                },
            )

        elif tool_name == "validate_itinerary":
            itinerary_result = execute_tool(
                "get_current_itinerary",
                {"trip_id": trip_id},
            )

            if not itinerary_result.get("success"):
                result = itinerary_result
            else:
                result = execute_tool(
                    "validate_itinerary",
                    {
                        "itinerary": itinerary_result["itinerary"],
                        "budget": trip.budget,
                    },
                )

        elif tool_name == "calculate_budget":
            itinerary_result = execute_tool(
                "get_current_itinerary",
                {"trip_id": trip_id},
            )

            if not itinerary_result.get("success"):
                result = itinerary_result
            else:
                result = execute_tool(
                    "calculate_budget",
                    {
                        "itinerary": itinerary_result["itinerary"],
                    },
                )

        else:
            result = execute_tool(
                tool_name,
                {
                    "trip_id": trip_id,
                    "message": message,
                },
            )

        tool_results.append(
            {
                "tool": tool_name,
                "reason": action.reason,
                "result": result,
            }
        )

    return {
        "trip_id": trip_id,
        "message": message,
        "intent": intent_result.model_dump(),
        "plan": plan.model_dump(),
        "tool_results": tool_results,
        "status": "completed",
    }
