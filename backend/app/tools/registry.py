from typing import Any

from app.tools.alternatives import find_activity_alternatives_tool
from app.tools.budget import calculate_budget_tool
from app.tools.disruption import handle_disruption_tool
from app.tools.itinerary import get_current_itinerary_tool
from app.tools.replanner import replan_itinerary_tool
from app.tools.search_web import search_web
from app.tools.updater import update_itinerary_tool
from app.tools.validator import validate_itinerary_tool


def execute_tool(
    tool_name: str,
    arguments: dict[str, Any],
) -> dict[str, Any]:
    registry = {
        "search_web": search_web,
        "get_current_itinerary": get_current_itinerary_tool,
        "calculate_budget": calculate_budget_tool,
        "validate_itinerary": validate_itinerary_tool,
        "find_activity_alternatives": find_activity_alternatives_tool,
        "update_itinerary": update_itinerary_tool,
        "handle_disruption": handle_disruption_tool,
        "replan_itinerary": replan_itinerary_tool,
    }

    tool = registry.get(tool_name)

    if tool is None:
        return {
            "success": False,
            "error": f"Unknown tool: {tool_name}",
        }

    try:
        return tool(**arguments)
    except Exception as exc:
        return {
            "success": False,
            "error": str(exc),
        }
