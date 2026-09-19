from fastapi import APIRouter, HTTPException

from app.services.trip_store import get_trip
from app.services.agent_run_store import get_agent_run, get_trip_agent_runs

router = APIRouter(
    prefix="/api/trips",
    tags=["Agent Execution Trace"],
)


@router.get("/{trip_id}/agent-runs")
def list_agent_runs_endpoint(trip_id: str):
    trip = get_trip(trip_id)
    if trip is None:
        raise HTTPException(status_code=404, detail="Trip not found")

    runs = get_trip_agent_runs(trip_id)
    return {
        "trip_id": trip_id,
        "count": len(runs),
        "runs": runs,
    }


@router.get("/{trip_id}/agent-runs/{run_id}")
def get_agent_run_endpoint(trip_id: str, run_id: str):
    trip = get_trip(trip_id)
    if trip is None:
        raise HTTPException(status_code=404, detail="Trip not found")

    run = get_agent_run(trip_id, run_id)
    if run is None:
        raise HTTPException(
            status_code=404,
            detail=f"Agent run '{run_id}' not found for trip '{trip_id}'",
        )

    return {
        "trip_id": trip_id,
        "run": run,
    }
