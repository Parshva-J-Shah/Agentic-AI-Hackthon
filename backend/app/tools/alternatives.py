from typing import Any

from app.tools.search_web import search_web


def find_activity_alternatives_tool(
    activity_name: str,
    destination: str,
    date: str | None = None,
) -> dict[str, Any]:

    query_parts = [
        f"alternatives to {activity_name}",
        f"in {destination}",
    ]

    if date:
        query_parts.append(f"for {date}")

    query = " ".join(query_parts)

    search_result = search_web(
        query=query,
        max_results=5,
    )

    return {
        "success": True,
        "activity": activity_name,
        "destination": destination,
        "date": date,
        "search": search_result,
    }
