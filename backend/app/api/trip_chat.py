from fastapi import APIRouter

from app.agent.trip_chat import run_trip_chat
from app.schemas.chat import ChatRequest, ChatResponse


router = APIRouter(
    prefix="/api/trips",
    tags=["Trip Agent"],
)


@router.post(
    "/{trip_id}/chat",
    response_model=ChatResponse,
)
def trip_chat(
    trip_id: str,
    request: ChatRequest,
):
    return run_trip_chat(
        trip_id=trip_id,
        message=request.message,
        simulate=request.simulate,
    )
