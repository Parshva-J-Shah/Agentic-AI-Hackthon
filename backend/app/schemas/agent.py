from typing import Literal
from pydantic import BaseModel, Field


IntentType = Literal[
    "CREATE_ITINERARY",
    "ITINERARY_QUERY",
    "ACTIVITY_QUERY",
    "FIT_ACTIVITY",
    "CHANGE_CONSTRAINT",
    "DISRUPTION",
    "REPLAN",
]


class IntentEntity(BaseModel):
    key: str
    value: str


class IntentResult(BaseModel):
    intent: IntentType
    confidence: float = Field(ge=0, le=1)
    reason: str
    entities: list[IntentEntity] = Field(default_factory=list)


AgentTool = Literal[
    "search_web",
    "get_current_itinerary",
    "calculate_budget",
    "validate_itinerary",
    "find_activity_alternatives",
    "update_itinerary",
    "handle_disruption",
    "replan_itinerary",
    "none",
]


class AgentAction(BaseModel):
    tool: AgentTool
    reason: str


class AgentPlan(BaseModel):
    intent: str
    actions: list[AgentAction] = Field(default_factory=list)
