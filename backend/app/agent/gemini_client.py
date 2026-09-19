import os
import time

from dotenv import load_dotenv
from google import genai
from google.genai import types
from google.genai import errors

from app.schemas.gemini_itinerary import GeminiItinerary


load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    raise RuntimeError("GEMINI_API_KEY is missing from backend/.env")


client = genai.Client(api_key=api_key)


PRIMARY_MODEL = "gemini-3.8-flash"
FALLBACK_MODELS = [
    "gemini-3.7-flash",
    "gemini-3.5-flash",
]


def generate_text(prompt: str) -> str:
    response = client.models.generate_content(
        model=PRIMARY_MODEL,
        contents=prompt,
    )

    if not response.text:
        raise RuntimeError("Gemini returned an empty response")

    return response.text


def _generate_structured_with_model(
    model: str,
    prompt: str,
) -> GeminiItinerary:

    response = client.models.generate_content(
        model=model,
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=GeminiItinerary,
        ),
    )

    if not response.text:
        raise RuntimeError(
            f"{model} returned an empty structured response"
        )

    return GeminiItinerary.model_validate_json(response.text)


def generate_structured_itinerary(
    destination: str,
    start_date: str,
    end_date: str,
    budget: float,
    currency: str,
    interests: list[str],
    preferences: list[str],
) -> GeminiItinerary:

    prompt = f"""
You are TravelPilot, an intelligent travel planning agent.

Create a realistic day-by-day travel itinerary.

Destination: {destination}
Start date: {start_date}
End date: {end_date}
Total budget: {budget} {currency}
Interests: {", ".join(interests) if interests else "none specified"}
Preferences: {", ".join(preferences) if preferences else "none specified"}

Rules:
- Only create activities between the requested dates.
- Respect interests and preferences.
- Group geographically sensible activities.
- Avoid unnecessary backtracking.
- Do not create overlapping activities.
- Use practical activity durations.
- Activity costs must be non-negative.
- Keep activity costs reasonably within the stated budget.
- Do not include flights or hotels.
- Return only data matching the requested schema.
"""

    models_to_try = [PRIMARY_MODEL] + FALLBACK_MODELS

    last_error = None

    for model in models_to_try:

        for attempt in range(2):

            try:
                print(
                    f"TravelPilot: requesting itinerary from "
                    f"{model} (attempt {attempt + 1}/2)"
                )

                return _generate_structured_with_model(
                    model=model,
                    prompt=prompt,
                )

            except errors.ServerError as exc:
                last_error = exc

                print(
                    f"TravelPilot: {model} unavailable: {exc}"
                )

                if attempt == 0:
                    time.sleep(2)

            except errors.APIError as exc:
                last_error = exc

                print(
                    f"TravelPilot: API error from {model}: {exc}"
                )

                break

            except Exception as exc:
                last_error = exc

                print(
                    f"TravelPilot: unexpected error from {model}: {exc}"
                )

                break

    raise RuntimeError(
        "All Gemini itinerary generation models failed. "
        f"Last error: {last_error}"
    )
