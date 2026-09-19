from fastapi import APIRouter
from app.schemas.activity import ActivityCreate
from app.services.activity_service import create_activity

router = APIRouter(
    prefix="/api/activities",
    tags=["Activities"],
)


@router.post("")
def create_activity_endpoint(activity_data: ActivityCreate):
    activity = create_activity(activity_data)

    return {
        "message": "Activity created successfully",
        "activity": activity,
    }