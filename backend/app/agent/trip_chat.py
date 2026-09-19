from __future__ import annotations

from typing import Any

from app.agent.intent import detect_intent
from app.agent.planner import build_plan
from app.tools.registry import execute_tool
from app.services.trip_store import get_trip
from app.services.agent_run_store import record_agent_run
from app.agent.gemini_client import generate_text


def _synthesize_reply(
    intent: str,
    tool_results: list[dict[str, Any]],
    simulate: bool = False,
    trip: Any = None,
    message: str = "",
) -> str:
    """Deterministic, high-quality reply synthesis for all travel assistant intents."""
    if intent in {"DISRUPTION", "REPLAN"}:
        replan_tool = next(
            (r["result"] for r in tool_results if r.get("tool") == "replan_itinerary"),
            None,
        )
        if not replan_tool:
            return "Unable to process disruption replanning."

        if not replan_tool.get("success"):
            return f"Replanning could not be completed: {replan_tool.get('error', 'Unknown validation issue')}."

        changes = replan_tool.get("changes", {})
        removed_name = changes.get("removed", {}).get("name", "disrupted activity")
        added_name = changes.get("added", {}).get("name", "alternative activity")
        added_cost = changes.get("added", {}).get("cost", 0.0)
        budget = changes.get("budget", {})
        b_before = budget.get("before", 0.0)
        b_after = budget.get("after", 0.0)
        b_delta = budget.get("delta", 0.0)

        curr = getattr(trip, "currency", "EUR") if trip else "EUR"
        curr_sym = "₹" if curr == "INR" else ("$" if curr == "USD" else ("¥" if curr == "JPY" else "€"))

        delta_text = (
            f"saving {curr_sym}{abs(b_delta):.2f}"
            if b_delta < 0
            else (f"adding {curr_sym}{b_delta:.2f}" if b_delta > 0 else "no change in cost")
        )
        sim_note = "[SIMULATION PREVIEW] " if simulate else ""

        reply = (
            f"{sim_note}I detected the disruption regarding '{removed_name}'. "
            f"I analyzed your schedule and selected '{added_name}' ({curr_sym}{added_cost:.2f}) as the optimal replacement. "
            f"All timing constraints and conflict checks passed. "
            f"Your trip budget has been updated from {curr_sym}{b_before:.2f} to {curr_sym}{b_after:.2f} ({delta_text})."
        )
        if simulate:
            reply += " Stored itinerary was NOT modified."
        return reply

    if intent == "ITINERARY_QUERY":
        itin_tool = next(
            (r["result"] for r in tool_results if r.get("tool") == "get_current_itinerary"),
            None,
        )
        if itin_tool and itin_tool.get("success"):
            itin = itin_tool.get("itinerary", {})
            days = itin.get("days", [])
            if not days:
                return "Your itinerary is currently empty or being planned."

            # If user asked a specific temporal question, synthesize a direct answer
            is_specific_query = any(
                w in message.lower()
                for w in ["tomorrow", "morning", "afternoon", "evening", "today", "day", "next", "what should i do", "what am i doing"]
            )
            if is_specific_query and message:
                try:
                    itin_summary = []
                    for idx, d in enumerate(days, 1):
                        day_acts = [
                            f"  - {a.get('start_time', '')}-{a.get('end_time', '')}: {a.get('name', '')} ({a.get('description', '')})"
                            for a in d.get("activities", [])
                        ]
                        itin_summary.append(f"Day {idx} ({d.get('date', '')}):\n" + "\n".join(day_acts))
                    prompt = f"""
You are TravelPilot, an intelligent travel assistant.
The user is asking about their scheduled itinerary.
Current itinerary:
{chr(10).join(itin_summary)}

User question: "{message}"

Answer the user's specific question directly based on their scheduled itinerary. If they ask about tomorrow or tomorrow morning, refer to the activities scheduled for that time. Be concise, accurate, and friendly.
"""
                    ai_reply = generate_text(prompt)
                    if ai_reply and len(ai_reply.strip()) > 20:
                        return ai_reply.strip()
                except Exception as exc:
                    print(f"[TravelPilot] Gemini synthesis error for ITINERARY_QUERY: {exc}")

            # Deterministic presentation of full itinerary
            curr = itin.get("currency", "EUR")
            curr_sym = "₹" if curr == "INR" else ("$" if curr == "USD" else ("¥" if curr == "JPY" else "€"))
            lines = [f"Here is your current itinerary ({curr_sym}{itin.get('total_cost', 0.0):.2f} total):"]
            for idx, d in enumerate(days, 1):
                act_names = [a.get("name") for a in d.get("activities", []) if a.get("name")]
                lines.append(f"• Day {idx} ({d.get('date', '')}): {', '.join(act_names) if act_names else 'Free day'}")
            return "\n".join(lines)
        return "Your itinerary is currently being planned."

    if intent == "ACTIVITY_QUERY":
        search_tool = next(
            (r["result"] for r in tool_results if r.get("tool") == "search_web"),
            None,
        )
        destination = getattr(trip, "destination", "") if trip else ""
        results = (search_tool.get("results") or []) if (search_tool and search_tool.get("success")) else []

        if results:
            context_text = "\n\n".join(
                f"Title: {r.get('title')}\nDetails: {r.get('content')}"
                for r in results[:4]
            )
            prompt = f"""
You are TravelPilot, a helpful AI travel agent.
The user is traveling to {destination}.
User question: "{message}"

Here is current travel search information from Tavily:
{context_text}

Instructions:
- Answer the user's question directly, accurately, and naturally based on the search results.
- If asking about famous food spots, dishes, or attractions, highlight the top recognized options and provide brief helpful context (e.g. location or what makes them notable).
- Do not claim a single place is definitively or universally "the most famous" if multiple popular spots are known; present the top options fairly.
- Keep the response concise, engaging, and well-structured with bullet points.
- Conclude with a brief reminder that web recommendations are informational.
"""
            try:
                ai_reply = generate_text(prompt)
                if ai_reply and len(ai_reply.strip()) > 30:
                    return ai_reply.strip()
            except Exception as exc:
                print(f"[TravelPilot] Gemini synthesis error for ACTIVITY_QUERY: {exc}")

            # Deterministic clean fallback formatting of Tavily search results
            lines = [f"Here are notable recommendations for **{destination or 'your trip'}**:"]
            for r in results[:3]:
                title = r.get("title", "Recommendation")
                content = r.get("content", "").strip()
                if len(content) > 180:
                    content = content[:180].rsplit(" ", 1)[0] + "..."
                lines.append(f"• **{title}**: {content}")
            lines.append("\n*(Note: Web search results are informational and do not guarantee real-time booking availability.)*")
            return "\n\n".join(lines)
        else:
            try:
                prompt = f"""
You are TravelPilot, a helpful AI travel agent.
The user is traveling to {destination}.
User question: "{message}"

Answer the user's travel question concisely, accurately, and helpfully.
"""
                ai_reply = generate_text(prompt)
                if ai_reply and len(ai_reply.strip()) > 20:
                    return ai_reply.strip()
            except Exception:
                pass
            return f"I checked travel information for {destination or 'your destination'}, but could not find specific details for that query. Please try asking about another activity or place!"

    if intent == "FIT_ACTIVITY":
        val_tool = next(
            (r["result"] for r in tool_results if r.get("tool") == "validate_itinerary"),
            None,
        )
        destination = getattr(trip, "destination", "") if trip else ""

        try:
            val_status = "Valid / Fits cleanly" if (val_tool and val_tool.get("valid")) else f"Conflicts: {val_tool.get('errors') if val_tool else 'None'}"
            prompt = f"""
You are TravelPilot travel agent.
The user is asking: "{message}"
Trip destination: {destination}
Schedule validation: {val_status}

Explain whether the activity can fit into the traveler's itinerary, suggest how or when it could fit if feasible, and keep your answer concise and helpful.
"""
            ai_reply = generate_text(prompt)
            if ai_reply and len(ai_reply.strip()) > 20:
                return ai_reply.strip()
        except Exception:
            pass

        if val_tool and val_tool.get("valid"):
            return "The activity fits within your schedule and budget without creating conflicts."
        elif val_tool:
            errs = "; ".join(val_tool.get("errors", ["Scheduling conflict"]))
            return f"The activity does not fit cleanly: {errs}."
        return "Evaluated schedule fit for the requested activity."

    return "I processed your request using the TravelPilot agent."


def run_trip_chat(
    trip_id: str,
    message: str,
    simulate: bool = False,
) -> dict[str, Any]:
    trip = get_trip(trip_id)

    if trip is None:
        return {
            "trip_id": trip_id,
            "message": message,
            "reply": "Trip not found.",
            "intent": {},
            "plan": {},
            "tool_results": [],
            "status": "error: Trip not found",
        }

    intent_result = detect_intent(message)
    plan = build_plan(intent_result.intent)

    tool_results = []
    validation = None
    conflicts = None
    changes = None
    before_itin = None
    after_itin = None
    persisted = False

    # --------------------------------------------------------
    # Special disruption/replanning workflow.
    # --------------------------------------------------------
    if intent_result.intent in {"DISRUPTION", "REPLAN"}:
        result = execute_tool(
            "replan_itinerary",
            {
                "trip_id": trip_id,
                "message": message,
                "simulate": simulate,
            },
        )

        tool_results.append(
            {
                "tool": "replan_itinerary",
                "reason": (
                    "Disruption/replanning workflow executed through "
                    "the deterministic backend service."
                ),
                "result": result,
            }
        )

        if result.get("success"):
            validation = result.get("validation")
            conflicts = result.get("conflicts")
            changes = result.get("changes")
            before_itin = result.get("before")
            after_itin = result.get("after")
            persisted = result.get("persisted", False)
            status = "simulated" if simulate else "completed"
        else:
            status = "error"

        reply = _synthesize_reply(
            intent=intent_result.intent,
            tool_results=tool_results,
            simulate=simulate,
            trip=trip,
            message=message,
        )

        run_record = record_agent_run(
            trip_id=trip_id,
            user_request=message,
            intent=intent_result.model_dump(),
            plan=plan.model_dump(),
            tool_results=tool_results,
            validation=validation,
            conflicts=conflicts,
            replanning=changes,
            persisted=persisted,
            final_response=reply,
            status=status,
        )

        return {
            "trip_id": trip_id,
            "message": message,
            "reply": reply,
            "intent": intent_result.model_dump(),
            "plan": plan.model_dump(),
            "tool_results": tool_results,
            "validation": validation,
            "conflicts": conflicts,
            "changes": changes,
            "before": before_itin,
            "after": after_itin,
            "persisted": persisted,
            "run_id": run_record["run_id"],
            "status": status,
        }

    # --------------------------------------------------------
    # Standard tool execution for other queries
    # --------------------------------------------------------
    for action in plan.actions:
        tool_name = action.tool

        if tool_name == "none":
            tool_results.append(
                {
                    "tool": tool_name,
                    "reason": action.reason,
                    "skipped": True,
                }
            )
            continue

        if tool_name == "get_current_itinerary":
            result = execute_tool(
                "get_current_itinerary",
                {"trip_id": trip_id},
            )
            if result.get("success"):
                before_itin = result.get("itinerary")

        elif tool_name == "search_web":
            destination = getattr(trip, "destination", "") or ""
            query_str = message.strip()
            if destination:
                city_part = destination.split(",")[0].strip().lower()
                if city_part and city_part not in query_str.lower():
                    query_str = f"{query_str} in {destination}"

            result = execute_tool(
                "search_web",
                {
                    "query": query_str,
                    "max_results": 5,
                },
            )

        elif tool_name == "validate_itinerary":
            itinerary_result = execute_tool(
                "get_current_itinerary",
                {"trip_id": trip_id},
            )

            if not itinerary_result.get("success"):
                result = itinerary_result
            else:
                result = execute_tool(
                    "validate_itinerary",
                    {
                        "itinerary": itinerary_result["itinerary"],
                        "budget": trip.budget,
                    },
                )
                validation = result

        elif tool_name == "calculate_budget":
            itinerary_result = execute_tool(
                "get_current_itinerary",
                {"trip_id": trip_id},
            )

            if not itinerary_result.get("success"):
                result = itinerary_result
            else:
                result = execute_tool(
                    "calculate_budget",
                    {
                        "itinerary": itinerary_result["itinerary"],
                    },
                )

        else:
            result = execute_tool(
                tool_name,
                {
                    "trip_id": trip_id,
                    "message": message,
                },
            )

        tool_results.append(
            {
                "tool": tool_name,
                "reason": action.reason,
                "result": result,
            }
        )

    reply = _synthesize_reply(
        intent=intent_result.intent,
        tool_results=tool_results,
        simulate=simulate,
        trip=trip,
        message=message,
    )

    run_record = record_agent_run(
        trip_id=trip_id,
        user_request=message,
        intent=intent_result.model_dump(),
        plan=plan.model_dump(),
        tool_results=tool_results,
        validation=validation,
        conflicts=conflicts,
        replanning=changes,
        persisted=persisted,
        final_response=reply,
        status="completed",
    )

    return {
        "trip_id": trip_id,
        "message": message,
        "reply": reply,
        "intent": intent_result.model_dump(),
        "plan": plan.model_dump(),
        "tool_results": tool_results,
        "validation": validation,
        "conflicts": conflicts,
        "changes": changes,
        "before": before_itin,
        "after": after_itin,
        "persisted": persisted,
        "run_id": run_record["run_id"],
        "status": "completed",
    }
