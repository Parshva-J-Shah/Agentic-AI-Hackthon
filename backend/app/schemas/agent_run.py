from typing import Any

from pydantic import BaseModel, Field


class AgentPlanRequest(BaseModel):
    message: str = Field(min_length=1)
    trip_id: str | None = None


class AgentPlanResponse(BaseModel):
    message: str
    intent: dict[str, Any]
    plan: dict[str, Any]
    tool_results: list[dict[str, Any]]
