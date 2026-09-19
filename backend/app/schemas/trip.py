from typing import Any, List, Union
from pydantic import BaseModel, Field


class TripCreate(BaseModel):
    destination: str
    start_date: str
    end_date: str
    budget: float = Field(ge=0)
    currency: str = "USD"
    interests: List[str] = []
    preferences: Union[List[str], dict[str, Any]] = Field(default_factory=list)