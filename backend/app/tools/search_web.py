from typing import Any

import os
import requests
from dotenv import load_dotenv


load_dotenv()


TAVILY_API_KEY = os.getenv("TAVILY_API_KEY")
TAVILY_SEARCH_URL = "https://api.tavily.com/search"


class TavilySearchError(RuntimeError):
    """Raised when Tavily search fails."""


def search_web(
    query: str,
    max_results: int = 5,
) -> dict[str, Any]:
    """
    Search the web using Tavily and return normalized results.

    TravelPilot uses this tool for current external information such as:
    - attractions
    - opening hours
    - closures
    - travel information
    - activity alternatives
    - disruption-related information

    The API key is never returned to the caller.
    """

    if not TAVILY_API_KEY:
        raise TavilySearchError(
            "TAVILY_API_KEY is missing from backend/.env"
        )

    if not query or not query.strip():
        raise TavilySearchError(
            "Search query cannot be empty"
        )

    max_results = max(1, min(max_results, 10))

    payload = {
        "api_key": TAVILY_API_KEY,
        "query": query.strip(),
        "search_depth": "basic",
        "max_results": max_results,
        "include_answer": False,
        "include_raw_content": False,
    }

    try:
        response = requests.post(
            TAVILY_SEARCH_URL,
            json=payload,
            timeout=30,
        )

        response.raise_for_status()

    except requests.RequestException as exc:
        raise TavilySearchError(
            f"Tavily search request failed: {exc}"
        ) from exc

    try:
        data = response.json()
    except ValueError as exc:
        raise TavilySearchError(
            "Tavily returned invalid JSON"
        ) from exc

    results = []

    for item in data.get("results", []):
        results.append(
            {
                "title": item.get("title"),
                "url": item.get("url"),
                "content": item.get("content"),
                "score": item.get("score"),
            }
        )

    return {
        "query": query.strip(),
        "result_count": len(results),
        "results": results,
    }
