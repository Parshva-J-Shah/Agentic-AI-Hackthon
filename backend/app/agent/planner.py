from app.schemas.agent import AgentAction, AgentPlan


def build_plan(intent: str) -> AgentPlan:
    plans = {
        "CREATE_ITINERARY": [
            AgentAction(
                tool="none",
                reason=(
                    "Trip creation and itinerary generation are handled "
                    "by the trip generation workflow."
                ),
            )
        ],
        "ITINERARY_QUERY": [
            AgentAction(
                tool="get_current_itinerary",
                reason="The user is asking about the current trip itinerary.",
            )
        ],
        "ACTIVITY_QUERY": [
            AgentAction(
                tool="search_web",
                reason="Current external activity information may be required.",
            )
        ],
        "FIT_ACTIVITY": [
            AgentAction(
                tool="get_current_itinerary",
                reason=(
                    "The current itinerary is required to evaluate "
                    "schedule fit."
                ),
            ),
            AgentAction(
                tool="validate_itinerary",
                reason=(
                    "The backend must validate timing and "
                    "constraint feasibility."
                ),
            ),
        ],
        "CHANGE_CONSTRAINT": [
            AgentAction(
                tool="get_current_itinerary",
                reason=(
                    "The current itinerary must be inspected before "
                    "applying a changed constraint."
                ),
            ),
            AgentAction(
                tool="validate_itinerary",
                reason=(
                    "The modified constraints must be validated "
                    "against the itinerary."
                ),
            ),
        ],
        "DISRUPTION": [
            AgentAction(
                tool="handle_disruption",
                reason=(
                    "The disruption must be inspected and the affected "
                    "activity identified."
                ),
            ),
            AgentAction(
                tool="replan_itinerary",
                reason=(
                    "A validated replacement schedule should be prepared "
                    "for the disrupted activity."
                ),
            ),
        ],
        "REPLAN": [
            AgentAction(
                tool="replan_itinerary",
                reason=(
                    "The itinerary must be rebuilt around the changed "
                    "travel condition."
                ),
            ),
        ],
    }

    actions = plans.get(
        intent,
        [
            AgentAction(
                tool="none",
                reason="No supported tool plan exists for this intent.",
            )
        ],
    )

    return AgentPlan(
        intent=intent,
        actions=actions,
    )
