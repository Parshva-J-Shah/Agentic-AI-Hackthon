from app.models.activity import Activity
from app.schemas.activity import ActivityCreate


def create_activity(activity_data: ActivityCreate) -> Activity:
    return Activity(
        name=activity_data.name,
        date=activity_data.date,
        start_time=activity_data.start_time,
        end_time=activity_data.end_time,
        location=activity_data.location,
        cost=activity_data.cost,
        currency=activity_data.currency,
        category=activity_data.category,
        description=activity_data.description,
    )