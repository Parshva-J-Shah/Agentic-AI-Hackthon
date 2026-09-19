from app.agent.gemini_client import generate_text


def test_gemini() -> str:
    prompt = """
You are TravelPilot.

Reply with exactly:
TravelPilot Gemini connection successful.
"""

    return generate_text(prompt)
