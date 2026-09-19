from fastapi import APIRouter

from app.agent.agent import run_agent
from app.schemas.agent_run import (
    AgentPlanRequest,
    AgentPlanResponse,
)


router = APIRouter(
    prefix="/api",
    tags=["Agent"],
)


@router.post(
    "/agent/plan",
    response_model=AgentPlanResponse,
)
def create_agent_plan(
    request: AgentPlanRequest,
):
    return run_agent(
        message=request.message,
        trip_id=request.trip_id,
    )
