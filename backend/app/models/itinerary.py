from pydantic import BaseModel, Field
from typing import List, Optional


class ItineraryActivity(BaseModel):
    activity_id: Optional[str] = None
    name: str
    date: str
    start_time: str
    end_time: str
    location: str
    cost: float = 0.0
    currency: str = "USD"
    category: Optional[str] = None


class ItineraryDay(BaseModel):
    date: str
    activities: List[ItineraryActivity] = Field(default_factory=list)


class Itinerary(BaseModel):
    trip_id: str
    days: List[ItineraryDay] = Field(default_factory=list)
    total_cost: float = 0.0
    currency: str = "USD"