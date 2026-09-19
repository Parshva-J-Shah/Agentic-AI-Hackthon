from pydantic import BaseModel, Field
from typing import List, Optional


class ActivityCreate(BaseModel):
    name: str
    date: str
    start_time: str
    end_time: str
    location: str
    cost: float = 0.0
    currency: str = "USD"
    category: Optional[str] = None


class DayItinerary(BaseModel):
    date: str
    activities: List[ActivityCreate] = Field(default_factory=list)


class ItineraryResponse(BaseModel):
    trip_id: str
    days: List[DayItinerary] = Field(default_factory=list)
    total_cost: float = 0.0
    currency: str = "USD"