from __future__ import annotations

from datetime import datetime, timezone
from typing import Any
from uuid import uuid4

# In-memory store mapping trip_id -> list of run records
_agent_runs: dict[str, list[dict[str, Any]]] = {}


def record_agent_run(
    trip_id: str,
    user_request: str,
    intent: dict[str, Any],
    plan: dict[str, Any],
    tool_results: list[dict[str, Any]],
    validation: dict[str, Any] | None = None,
    conflicts: dict[str, Any] | None = None,
    replanning: dict[str, Any] | None = None,
    persisted: bool = False,
    final_response: str = "",
    status: str = "completed",
    error: str | None = None,
) -> dict[str, Any]:
    run_id = f"run-{uuid4().hex[:12]}"
    now_iso = datetime.now(timezone.utc).isoformat()

    record = {
        "run_id": run_id,
        "trip_id": trip_id,
        "user_request": user_request,
        "intent": intent.get("intent") if isinstance(intent, dict) else str(intent),
        "intent_confidence": intent.get("confidence") if isinstance(intent, dict) else None,
        "intent_reason": intent.get("reason") if isinstance(intent, dict) else None,
        "entities": intent.get("entities", []) if isinstance(intent, dict) else [],
        "selected_tools": [
            act.get("tool")
            for act in plan.get("actions", [])
            if isinstance(act, dict) and act.get("tool") != "none"
        ],
        "plan": plan,
        "tool_results": tool_results,
        "validation": validation,
        "conflicts": conflicts,
        "replanning": replanning,
        "persisted": persisted,
        "final_response": final_response,
        "status": status,
        "error": error,
        "timestamp": now_iso,
    }

    if trip_id not in _agent_runs:
        _agent_runs[trip_id] = []
    _agent_runs[trip_id].append(record)

    return record


def get_agent_run(trip_id: str, run_id: str) -> dict[str, Any] | None:
    runs = _agent_runs.get(trip_id, [])
    for r in runs:
        if r.get("run_id") == run_id:
            return r
    return None


def get_trip_agent_runs(trip_id: str) -> list[dict[str, Any]]:
    return list(reversed(_agent_runs.get(trip_id, [])))
