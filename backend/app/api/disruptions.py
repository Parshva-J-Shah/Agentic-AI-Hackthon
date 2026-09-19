from fastapi import APIRouter

from app.schemas.chat import ChatRequest, ChatResponse
from app.agent.trip_chat import run_trip_chat


router = APIRouter(
    prefix="/api/trips",
    tags=["Disruptions"],
)


@router.post("/{trip_id}/disruptions")
def create_disruption(
    trip_id: str,
    request: ChatRequest,
):
    return run_trip_chat(
        trip_id=trip_id,
        message=request.message,
        simulate=request.simulate,
    )
