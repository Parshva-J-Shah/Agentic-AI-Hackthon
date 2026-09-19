from typing import Any
from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    message: str = Field(min_length=1)
    simulate: bool = False


class ChatResponse(BaseModel):
    trip_id: str
    message: str
    reply: str | None = None
    intent: dict[str, Any]
    plan: dict[str, Any]
    tool_results: list[dict[str, Any]]
    validation: dict[str, Any] | None = None
    conflicts: dict[str, Any] | None = None
    changes: dict[str, Any] | None = None
    before: dict[str, Any] | None = None
    after: dict[str, Any] | None = None
    persisted: bool = False
    run_id: str | None = None
    status: str
