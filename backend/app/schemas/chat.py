from typing import Any

from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    message: str = Field(min_length=1)
    simulate: bool = False


class ChatResponse(BaseModel):
    trip_id: str
    message: str
    intent: dict[str, Any]
    plan: dict[str, Any]
    tool_results: list[dict[str, Any]]
    status: str
