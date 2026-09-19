from pydantic import BaseModel, Field
from typing import List

class GeminiActivity(BaseModel):
    name: str
    date: str
    start_time: str
    end_time: str
    location: str
    cost: float = Field(ge=0)
    category: str


class GeminiDay(BaseModel):
    date: str
    activities: List[GeminiActivity] = Field(default_factory=list)


class GeminiItinerary(BaseModel):
    days: List[GeminiDay] = Field(default_factory=list)
