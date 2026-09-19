from pydantic import BaseModel
from typing import Optional


class Activity(BaseModel):
    activity_id: Optional[str] = None
    name: str
    date: str
    start_time: str
    end_time: str
    location: str
    cost: float = 0.0
    currency: str = "USD"
    category: Optional[str] = None
    description: Optional[str] = None