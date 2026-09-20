import os
import requests
from dotenv import load_dotenv
from fastapi import APIRouter, Query

load_dotenv()

router = APIRouter(
    prefix="/api/images",
    tags=["Images"],
)

TAVILY_API_KEY = os.getenv("TAVILY_API_KEY")
TAVILY_SEARCH_URL = "https://api.tavily.com/search"

# In-memory cache for dynamic image search results
_IMAGE_CACHE: dict[str, list[str]] = {}


def _search_tavily_images(query: str) -> list[str]:
    api_key = os.getenv("TAVILY_API_KEY") or TAVILY_API_KEY
    if not api_key:
        return []

    cleaned_query = query.strip()
    payload = {
        "api_key": api_key,
        "query": cleaned_query,
        "search_depth": "basic",
        "max_results": 8,
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
                "ytimg", "youtube", "tiktok", "facebook.com/tr", "analytics",
                "doubleclick",
            ]

            scored_candidates: list[tuple[int, str]] = []
            seen_urls = set()

            # Generic tokenization of meaningful words from the query
            query_words = [
                w for w in q_lower.replace(",", " ").replace("-", " ").split()
                if len(w) >= 3 and w not in ["the", "and", "for", "with", "visit", "explore", "tour", "lunch", "dinner", "walk"]
            ]

            for img in images:
                if not isinstance(img, str) or not img.startswith("http"):
                    continue
                norm_img = img.strip()
                if norm_img in seen_urls:
                    continue

                img_lower = norm_img.lower()

                # Reject non-photo, tracking or icon artifacts
                if any(bad in img_lower for bad in bad_tokens):
                    continue

                seen_urls.add(norm_img)

                score = 0
                # Prefer secure HTTPS
                if norm_img.startswith("https://"):
                    score += 5

                # Generic relevance: reward URLs containing words from the activity/location query
                for word in query_words:
                    if word in img_lower:
                        score += 10

                # Prefer trusted photo platforms and high-resolution sources
                if any(host in img_lower for host in ["tripadvisor", "wikimedia", "wikipedia", "squarespace", "cloudinary", "travel", "unsplash", "pexels"]):
                    score += 3

                scored_candidates.append((score, norm_img))

            if scored_candidates:
                scored_candidates.sort(key=lambda x: x[0], reverse=True)
                return [c[1] for c in scored_candidates[:5]]
    except Exception:
        pass

    return []


def _search_wikipedia_images(query: str) -> list[str]:
    headers = {"User-Agent": "TravelPilot/1.0 (travelpilot@example.com)"}
    # 1. Search generator query
    try:
        url = "https://en.wikipedia.org/w/api.php"
        params = {
            "action": "query",
            "format": "json",
            "generator": "search",
            "gsrsearch": query.strip(),
            "gsrlimit": 3,
            "prop": "pageimages",
            "pithumbsize": 600,
            "origin": "*",
        }
        res = requests.get(url, params=params, headers=headers, timeout=5)
        if res.ok:
            data = res.json()
            pages = data.get("query", {}).get("pages", {})
            results: list[str] = []
            for page in pages.values():
                thumb = page.get("thumbnail", {}).get("source")
                if thumb and thumb.startswith("http"):
                    results.append(thumb)
            if results:
                return results
    except Exception:
        pass

    # 2. Direct title lookup
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
        res = requests.get(url, params=params, headers=headers, timeout=5)
        if res.ok:
            data = res.json()
            pages = data.get("query", {}).get("pages", {})
            results = []
            for page in pages.values():
                thumb = page.get("thumbnail", {}).get("source")
                if thumb and thumb.startswith("http"):
                    results.append(thumb)
            return results
    except Exception:
        pass

    return []


@router.get("/search")
def search_image(query: str = Query(..., description="Activity and location search query")):
    cleaned = query.strip()
    if not cleaned:
        return {"success": False, "image_url": None, "image_urls": []}

    cache_key = cleaned.lower()
    if cache_key in _IMAGE_CACHE:
        cached_urls = _IMAGE_CACHE[cache_key]
        return {
            "success": bool(cached_urls),
            "image_url": cached_urls[0] if cached_urls else None,
            "image_urls": cached_urls,
            "query": cleaned,
            "cached": True,
        }

    # 1. Try Tavily Image Search
    candidates = _search_tavily_images(cleaned)

    # 2. Fallback to Wikipedia Image Search if needed
    if not candidates:
        wiki_candidates = _search_wikipedia_images(cleaned)
        if wiki_candidates:
            candidates.extend(wiki_candidates)
    elif len(candidates) < 3:
        wiki_candidates = _search_wikipedia_images(cleaned)
        for w in wiki_candidates:
            if w not in candidates:
                candidates.append(w)

    _IMAGE_CACHE[cache_key] = candidates

    return {
        "success": bool(candidates),
        "image_url": candidates[0] if candidates else None,
        "image_urls": candidates,
        "query": cleaned,
    }
