from pydantic import BaseModel, Field
from typing import List


class TripCreate(BaseModel):
    destination: str
    start_date: str
    end_date: str
    budget: float = Field(ge=0)
    currency: str = "USD"
    interests: List[str] = []
    preferences: List[str] = []