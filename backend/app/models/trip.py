from pydantic import BaseModel, Field
from typing import List, Optional


class Trip(BaseModel):
    destination: str
    start_date: str
    end_date: str
    budget: float = Field(ge=0)
    currency: str = "USD"
    interests: List[str] = []
    preferences: List[str] = []
    trip_id: Optional[str] = None