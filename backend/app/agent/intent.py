from app.schemas.agent import IntentResult

try:
    from google.genai import errors
except ImportError:
    errors = None

from app.agent.gemini_client import client, PRIMARY_MODEL, FALLBACK_MODELS


def _fallback_intent(message: str) -> IntentResult:
    """
    Deterministic fallback used when Gemini is temporarily unavailable.
    This keeps the API functional during provider 429/503/high-demand errors.
    """
    text = message.lower().strip()

    # Disruption must be checked before generic itinerary/activity queries.
    disruption_words = [
        "cancelled",
        "canceled",
        "cancellation",
        "closed",
        "closure",
        "disruption",
        "delayed",
        "delay",
        "unavailable",
        "booking was cancelled",
        "booking is cancelled",
        "flight cancelled",
        "flight canceled",
    ]

    if any(word in text for word in disruption_words):
        return IntentResult(
            intent="DISRUPTION",
            confidence=0.95,
            reason="Fallback rule detected disruption-related language.",
            entities=[],
        )

    replan_words = [
        "replan",
        "re-plan",
        "rearrange my trip",
        "rebuild my itinerary",
        "change my itinerary",
        "reorganize my itinerary",
        "reschedule my itinerary",
    ]

    if any(word in text for word in replan_words):
        return IntentResult(
            intent="REPLAN",
            confidence=0.90,
            reason="Fallback rule detected an explicit replanning request.",
            entities=[],
        )

    # Activity scheduling / fitting check (must precede generic itinerary checks)
    fit_words = [
        "fit",
        "can i add",
        "can we add",
        "is there time",
        "do i have time",
        "does this fit",
        "schedule this",
        "where can i fit",
        "fit into",
        "fit in my",
        "squeeze in",
    ]

    if any(word in text for word in fit_words):
        return IntentResult(
            intent="FIT_ACTIVITY",
            confidence=0.90,
            reason="Fallback rule detected an activity scheduling/fit question.",
            entities=[],
        )

    constraint_words = [
        "change my budget",
        "increase my budget",
        "decrease my budget",
        "my budget is",
        "budget to",
        "avoid",
        "i don't want",
        "i do not want",
        "prefer",
        "preference",
        "constraint",
        "no early morning",
        "no late night",
    ]

    if any(word in text for word in constraint_words):
        return IntentResult(
            intent="CHANGE_CONSTRAINT",
            confidence=0.88,
            reason="Fallback rule detected a trip constraint or preference change.",
            entities=[],
        )

    create_words = [
        "plan me a",
        "plan a trip",
        "plan my trip",
        "create an itinerary",
        "create a trip",
        "build an itinerary",
    ]

    if any(word in text for word in create_words):
        return IntentResult(
            intent="CREATE_ITINERARY",
            confidence=0.92,
            reason="Fallback rule detected trip creation request.",
            entities=[],
        )

    # Specific itinerary / schedule queries
    itinerary_words = [
        "what am i doing",
        "what is planned",
        "what's planned",
        "what is currently planned",
        "what should i do tomorrow",
        "what should i do today",
        "tomorrow morning",
        "tomorrow afternoon",
        "tomorrow evening",
        "second day",
        "first day",
        "third day",
        "day 1",
        "day 2",
        "day 3",
        "day 4",
        "my schedule",
        "show my itinerary",
        "view my itinerary",
        "what does my itinerary look like",
        "current itinerary",
        "current schedule",
    ]

    if any(word in text for word in itinerary_words):
        return IntentResult(
            intent="ITINERARY_QUERY",
            confidence=0.90,
            reason="Fallback rule detected an itinerary query.",
            entities=[],
        )

    # Activity, food, recommendations, attractions, and destination queries
    activity_words = [
        # Food / dining / dishes / culinary
        "vadapav",
        "vada pav",
        "food",
        "dish",
        "dishes",
        "eat",
        "eating",
        "dining",
        "eatery",
        "restaurant",
        "restaurants",
        "cafe",
        "cafes",
        "bistro",
        "snack",
        "snacks",
        "street food",
        "cuisine",
        "lunch",
        "dinner",
        "breakfast",
        "bakery",
        "dessert",
        "chaat",
        # Places / sights / attractions
        "spot",
        "spots",
        "place",
        "places",
        "attraction",
        "attractions",
        "sight",
        "sights",
        "monument",
        "monuments",
        "museum",
        "museums",
        "temple",
        "temples",
        "beach",
        "beaches",
        "park",
        "parks",
        "market",
        "markets",
        "bazaar",
        "landmark",
        "landmarks",
        "gateway of india",
        "louvre",
        "versailles",
        "montmartre",
        "eiffel",
        # Recommendations and activities
        "activity",
        "activities",
        "things to do",
        "places to visit",
        "what should i visit",
        "what can i do",
        "what to see",
        "where to go",
        "where to eat",
        "where can i",
        "suggest",
        "recommend",
        "recommendation",
        "recommendations",
        "famous",
        "popular",
        "best",
        "top",
        "must visit",
        "must-visit",
        "near my hotel",
        "nearby",
        "close to",
        "around",
        "open on",
        "opening hours",
        "ticket",
        "entry fee",
    ]

    if any(word in text for word in activity_words):
        return IntentResult(
            intent="ACTIVITY_QUERY",
            confidence=0.88,
            reason="Fallback rule detected an activity, food, recommendation, or destination inquiry.",
            entities=[],
        )

    # Informational or question phrasing defaulting to destination/activity query
    question_starters = ["which", "where", "what", "suggest", "recommend", "how", "is there", "are there", "any"]
    if any(text.startswith(q) or f" {q} " in text for q in question_starters):
        return IntentResult(
            intent="ACTIVITY_QUERY",
            confidence=0.75,
            reason="Fallback rule treated destination inquiry as ACTIVITY_QUERY.",
            entities=[],
        )

    return IntentResult(
        intent="ACTIVITY_QUERY",
        confidence=0.60,
        reason="Fallback rule defaulted unmatched general inquiry to ACTIVITY_QUERY.",
        entities=[],
    )


def detect_intent(message: str) -> IntentResult:
    prompt = f"""
You are the intent classifier for TravelPilot, an intelligent travel planning
and disruption management agent.

Classify the user's message into exactly one intent:

- CREATE_ITINERARY: Requests to create or plan a new trip from scratch (e.g. "Plan a 4-day trip to Paris").
- ITINERARY_QUERY: Questions specifically about the user's current scheduled itinerary, schedule for a day, or planned timeline (e.g. "What should I do tomorrow morning?", "What am I doing on day 2?", "Show my itinerary").
- ACTIVITY_QUERY: Questions about places to visit, sights, attractions, food, restaurants, dishes, famous spots, recommendations, or things to do at the destination (e.g. "Which is the famous vadapav spot in Mumbai?", "What are some famous food places in Mumbai?", "What is near my hotel?", "Suggest some good places to visit nearby", "Is the museum open on Monday?").
- FIT_ACTIVITY: Inquiries asking whether a specific activity or place can fit into the current itinerary/schedule (e.g. "Can I fit Gateway of India into my itinerary?", "Does this activity fit my budget and schedule?").
- CHANGE_CONSTRAINT: Requests to modify trip constraints like budget, travel dates, pacing, or preferences (e.g. "My budget is now 20000", "I don't want early mornings").
- DISRUPTION: Notifications that an activity, reservation, attraction, or flight has been cancelled, closed, delayed, or disrupted (e.g. "The Louvre booking was cancelled", "Flight delayed").
- REPLAN: Explicit requests to replan, rebuild, or reschedule the itinerary after a change (e.g. "Replan my itinerary", "Rearrange my trip").

User message:
{message}

Return structured JSON matching the IntentResult schema.
"""

    models_to_try = [PRIMARY_MODEL] + FALLBACK_MODELS

    for model in models_to_try:
        try:
            response = client.models.generate_content(
                model=model,
                contents=prompt,
                config={
                    "response_mime_type": "application/json",
                    "response_schema": IntentResult,
                },
            )

            if response.parsed is not None:
                return response.parsed

            if response.text:
                return IntentResult.model_validate_json(response.text)

        except Exception:
            continue

    print("[TravelPilot] All Gemini models unavailable for intent detection; using deterministic fallback.")
    return _fallback_intent(message)

