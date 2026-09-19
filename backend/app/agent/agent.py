from typing import Any

from app.agent.planner import build_plan
from app.agent.intent import detect_intent
from app.tools.registry import execute_tool


def run_agent(
    message: str,
    trip_id: str | None = None,
) -> dict[str, Any]:

    # -----------------------------------------------------
    # 1. Understand user intent
    # -----------------------------------------------------

    intent_result = detect_intent(message)

    # -----------------------------------------------------
    # 2. Build deterministic tool plan
    # -----------------------------------------------------

    plan = build_plan(intent_result.intent)

    # -----------------------------------------------------
    # 3. Execute tools
    # -----------------------------------------------------

    tool_results = []

    for action in plan.actions:

        if action.tool == "none":
            tool_results.append(
                {
                    "tool": action.tool,
                    "reason": action.reason,
                    "skipped": True,
                }
            )
            continue

        arguments: dict[str, Any] = {}

        if action.tool == "get_current_itinerary":
            if not trip_id:
                tool_results.append(
                    {
                        "tool": action.tool,
                        "success": False,
                        "error": "trip_id is required for itinerary access",
                    }
                )
                continue

            arguments = {
                "trip_id": trip_id,
            }

        elif action.tool == "validate_itinerary":
            if not trip_id:
                tool_results.append(
                    {
                        "tool": action.tool,
                        "success": False,
                        "error": "trip_id is required for validation",
                    }
                )
                continue

            itinerary_result = execute_tool(
                "get_current_itinerary",
                {
                    "trip_id": trip_id,
                },
            )

            if not itinerary_result.get("success"):
                tool_results.append(
                    {
                        "tool": action.tool,
                        "success": False,
                        "error": itinerary_result.get(
                            "error",
                            "Unable to load itinerary",
                        ),
                    }
                )
                continue

            arguments = {
                "itinerary": itinerary_result["itinerary"],
            }

        elif action.tool == "search_web":
            arguments = {
                "query": message,
                "max_results": 5,
            }

        else:
            # Some tools need additional structured arguments
            # that the full replanning agent will provide later.
            tool_results.append(
                {
                    "tool": action.tool,
                    "success": False,
                    "error": (
                        "Tool requires structured arguments "
                        "from the replanning workflow."
                    ),
                }
            )
            continue

        result = execute_tool(
            action.tool,
            arguments,
        )

        tool_results.append(
            {
                "tool": action.tool,
                "reason": action.reason,
                "result": result,
            }
        )

    return {
        "message": message,
        "intent": intent_result.model_dump(),
        "plan": plan.model_dump(),
        "tool_results": tool_results,
    }
