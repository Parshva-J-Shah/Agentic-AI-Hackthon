import os
import requests
from fastapi import APIRouter, Query

router = APIRouter(
    prefix="/api/images",
    tags=["Images"],
)

TAVILY_API_KEY = os.getenv("TAVILY_API_KEY")
TAVILY_SEARCH_URL = "https://api.tavily.com/search"

# In-memory cache for dynamic image search results
_IMAGE_CACHE: dict[str, str | None] = {}


def _search_tavily_image(query: str) -> str | None:
    if not TAVILY_API_KEY:
        return None

    cleaned_query = query.strip()
    payload = {
        "api_key": TAVILY_API_KEY,
        "query": cleaned_query,
        "search_depth": "basic",
        "max_results": 5,
        "include_images": True,
        "include_answer": False,
        "include_raw_content": False,
    }

    try:
        response = requests.post(TAVILY_SEARCH_URL, json=payload, timeout=10)
        if response.ok:
            images = response.json().get("images", [])
            q_lower = cleaned_query.lower()
            bad_tokens = [
                ".svg", ".gif", "favicon", "avatar", "user-avatar", "logo",
                "icon", "1x1", "pixel", "tracking", "sprite", "placeholder",
                "ytimg", "youtube", "tiktok", "facebook.com/tr",
            ]

            scored_candidates: list[tuple[int, str]] = []

            # Generic tokenization of meaningful words from the query
            query_words = [
                w for w in q_lower.replace(",", " ").replace("-", " ").split()
                if len(w) >= 3 and w not in ["the", "and", "for", "with", "visit", "explore", "tour", "lunch", "dinner", "walk"]
            ]

            for img in images:
                if not isinstance(img, str) or not img.startswith("http"):
                    continue
                img_lower = img.lower()

                # Reject non-photo, tracking or icon artifacts
                if any(bad in img_lower for bad in bad_tokens):
                    continue

                score = 0
                # Prefer secure HTTPS
                if img.startswith("https://"):
                    score += 5

                # Generic relevance: reward URLs containing words from the activity/location query
                for word in query_words:
                    if word in img_lower:
                        score += 10

                # Prefer trusted photo platforms and high-resolution sources
                if any(host in img_lower for host in ["tripadvisor", "wikimedia", "wikipedia", "squarespace", "cloudinary", "travel"]):
                    score += 3

                scored_candidates.append((score, img))

            if scored_candidates:
                scored_candidates.sort(key=lambda x: x[0], reverse=True)
                return scored_candidates[0][1]
    except Exception:
        pass

    return None


def _search_wikipedia_image(query: str) -> str | None:
    try:
        url = "https://en.wikipedia.org/w/api.php"
        params = {
            "action": "query",
            "format": "json",
            "prop": "pageimages",
            "titles": query.strip(),
            "pithumbsize": 600,
            "origin": "*",
        }
        res = requests.get(url, params=params, timeout=5)
        if res.ok:
            data = res.json()
            pages = data.get("query", {}).get("pages", {})
            for page in pages.values():
                thumb = page.get("thumbnail", {}).get("source")
                if thumb and thumb.startswith("http"):
                    return thumb
    except Exception:
        pass

    return None


@router.get("/search")
def search_image(query: str = Query(..., description="Activity and location search query")):
    cleaned = query.strip()
    if not cleaned:
        return {"success": False, "image_url": None}

    cache_key = cleaned.lower()
    if cache_key in _IMAGE_CACHE:
        return {"success": True, "image_url": _IMAGE_CACHE[cache_key], "cached": True}

    # 1. Try Tavily Image Search
    image_url = _search_tavily_image(cleaned)

    # 2. Fallback to Wikipedia Image Search
    if not image_url:
        image_url = _search_wikipedia_image(cleaned)

    _IMAGE_CACHE[cache_key] = image_url

    return {
        "success": bool(image_url),
        "image_url": image_url,
        "query": cleaned,
    }
