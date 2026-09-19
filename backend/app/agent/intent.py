from app.schemas.agent import IntentResult

try:
    from google.genai import errors
except ImportError:
    errors = None

from app.agent.gemini_client import client


INTENT_MODEL = "gemini-3.5-flash"


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
    ]

    if any(word in text for word in replan_words):
        return IntentResult(
            intent="REPLAN",
            confidence=0.90,
            reason="Fallback rule detected an explicit replanning request.",
            entities=[],
        )

    constraint_words = [
        "change my budget",
        "increase my budget",
        "decrease my budget",
        "my budget is",
        "avoid",
        "i don't want",
        "i do not want",
        "prefer",
        "preference",
        "constraint",
    ]

    if any(word in text for word in constraint_words):
        return IntentResult(
            intent="CHANGE_CONSTRAINT",
            confidence=0.88,
            reason="Fallback rule detected a trip constraint or preference change.",
            entities=[],
        )

    fit_words = [
        "fit",
        "can i add",
        "can we add",
        "is there time",
        "do i have time",
        "does this fit",
        "schedule this",
        "where can i fit",
    ]

    if any(word in text for word in fit_words):
        return IntentResult(
            intent="FIT_ACTIVITY",
            confidence=0.88,
            reason="Fallback rule detected an activity scheduling/fit question.",
            entities=[],
        )

    activity_words = [
        "activity",
        "restaurant",
        "museum",
        "attraction",
        "things to do",
        "places to visit",
        "what should i visit",
        "what can i do",
        "louvre",
        "versailles",
        "montmartre",
    ]

    if any(word in text for word in activity_words):
        return IntentResult(
            intent="ACTIVITY_QUERY",
            confidence=0.82,
            reason="Fallback rule detected an activity or destination-information question.",
            entities=[],
        )

    itinerary_words = [
        "itinerary",
        "planned",
        "plan",
        "schedule",
        "trip",
        "what am i doing",
        "what is planned",
        "what's planned",
        "what is currently planned",
    ]

    if any(word in text for word in itinerary_words):
        return IntentResult(
            intent="ITINERARY_QUERY",
            confidence=0.90,
            reason="Fallback rule detected an itinerary query.",
            entities=[],
        )

    return IntentResult(
        intent="ITINERARY_QUERY",
        confidence=0.55,
        reason="Gemini was unavailable and no stronger intent signal was detected; defaulting to itinerary query.",
        entities=[],
    )


def detect_intent(message: str) -> IntentResult:
    prompt = f"""
You are the intent classifier for TravelPilot, an intelligent travel planning
and disruption management agent.

Classify the user's message into exactly one intent:

CREATE_ITINERARY
ITINERARY_QUERY
ACTIVITY_QUERY
FIT_ACTIVITY
CHANGE_CONSTRAINT
DISRUPTION
REPLAN

Return structured JSON matching the IntentResult schema.

User message:
{message}
"""

    try:
        response = client.models.generate_content(
            model=INTENT_MODEL,
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

        return _fallback_intent(message)

    except Exception as exc:
        # Gemini provider errors such as 429/503 should never crash /chat.
        print(
            f"[TravelPilot] Gemini intent detection unavailable: "
            f"{type(exc).__name__}: {exc}"
        )
        print("[TravelPilot] Using deterministic fallback intent detection.")

        return _fallback_intent(message)
