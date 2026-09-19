/**
 * TravelPilot API Service Layer — Conforming to 04_API_CONTRACT.md
 * Communicates ONLY with the FastAPI backend at VITE_API_URL.
 * Includes intelligent mock-fallback if backend server is not reachable.
 */

import {
  Trip,
  TripConstraints,
  Itinerary,
  Budget,
  Alternative,
  ChangeSummary,
  Currency,
  DisruptionResponse,
  ApplyAlternativeResponse,
  AgentRun,
} from '../types/trip';
import {
  INITIAL_MOCK_TRIP,
  MOCK_DISRUPTED_ALTERNATIVES,
  MOCK_REPLANNED_CHANGES,
  MOCK_AGENT_STEPS_GENERATION,
  MOCK_AGENT_STEPS_DISRUPTION,
} from './mockData';
import { resolveActivityImage } from '../utils/imageUtils';

const RAW_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const API_BASE = RAW_URL.endsWith('/api') ? RAW_URL : `${RAW_URL.replace(/\/+$/, '')}/api`;

// In-memory state for fallback & cache
let currentTripState: Trip = JSON.parse(JSON.stringify(INITIAL_MOCK_TRIP));

/**
 * Maps backend Itinerary schema to frontend Itinerary format
 */
function mapBackendItinerary(
  backendItin: any,
  tripBudget: number = 50000,
  tripCurrency: Currency = 'INR',
  destination: string = ''
): Itinerary {
  if (!backendItin || !Array.isArray(backendItin.days) || backendItin.days.length === 0) {
    return currentTripState.itinerary;
  }

  const defaultLoc = destination || currentTripState.destination || 'Local Area';

  return {
    days: backendItin.days.map((day: any, idx: number) => {
      const dayNum = day.day_number ?? idx + 1;
      const activities = (day.activities || []).map((act: any, actIdx: number) => {
        const actId = act.activity_id || act.id || `act_${dayNum}_${actIdx}`;
        const costVal = Number(act.cost ?? act.estimated_cost ?? 0);

        return {
          id: actId,
          name: act.name || 'Scheduled Activity',
          type: (act.category || act.type || 'sightseeing').toLowerCase() as any,
          location: act.location || defaultLoc,
          start_time: act.start_time || '09:00',
          end_time: act.end_time || '11:00',
          duration_minutes: act.duration_minutes || 120,
          estimated_cost: costVal,
          currency: (act.currency || tripCurrency) as Currency,
          description: act.description || act.name,
          status: act.status || 'planned',
          status_label: act.status_label || (costVal === 0 ? 'Free Entry' : 'Verified'),
          tags: act.tags || [act.category || 'Sightseeing'],
          image_url: resolveActivityImage(
            act.name || 'Scheduled Activity',
            act.location || defaultLoc,
            act.category || act.type,
            act.image_url
          ),
          transit_after: act.transit_after,
          disruption_reason: act.disruption_reason,
        };
      });

      const dailyCost =
        day.daily_cost ??
        activities.reduce((sum: number, a: any) => sum + a.estimated_cost, 0);

      return {
        day_number: dayNum,
        date: day.date || `2026-10-${10 + idx}`,
        title: day.title || `Day ${dayNum}: ${activities[0]?.name || 'Exploration'}`,
        theme: day.theme || 'Curated Exploration & Culture',
        activities,
        daily_cost: dailyCost,
        currency: (day.currency || tripCurrency) as Currency,
        walking_distance_km: day.walking_distance_km ?? 3.4,
        walking_duration_minutes: day.walking_duration_minutes ?? 42,
        conflicts_count: day.conflicts_count ?? 0,
      };
    }),
  };
}

/**
 * Maps backend Budget schema to frontend Budget format
 */
function mapBackendBudget(
  budget: any,
  targetCap: number = 50000,
  currency: Currency = 'INR'
): Budget {
  const cap = Number(budget?.target_cap ?? budget?.budget_cap ?? targetCap);
  const spent = Number(
    budget?.estimated_total ??
    budget?.total_cost ??
    budget?.after ??
    (typeof budget === 'number' ? budget : Math.round(cap * 0.85))
  );
  const rem = Number(budget?.remaining ?? Math.max(0, cap - spent));

  return {
    target_cap: cap,
    estimated_total: spent,
    remaining: rem,
    currency: (budget?.currency || currency) as Currency,
    contingency_status: rem < cap * 0.05 ? 'warning' : 'healthy',
    breakdown: budget?.breakdown || [
      { category: 'Activities & Entry', amount: Math.round(spent * 0.45), percentage: 45, color: 'bg-primary' },
      { category: 'Dining & Cafes', amount: Math.round(spent * 0.35), percentage: 35, color: 'bg-secondary' },
      { category: 'Local Transit', amount: Math.round(spent * 0.12), percentage: 12, color: 'bg-amber-500' },
      { category: 'Contingency Buffer', amount: Math.round(spent * 0.08), percentage: 8, color: 'bg-emerald-500' },
    ],
  };
}

/**
 * Maps complete backend Trip response
 */
function mapBackendTrip(data: any): Trip {
  const tripData = data.trip || data;
  const destination = tripData.destination || 'Selected Destination';
  const start_date = tripData.dates?.start || tripData.start_date || '2026-10-10';
  const end_date = tripData.dates?.end || tripData.end_date || '2026-10-14';
  const currency = (tripData.currency || 'INR') as Currency;
  const budgetCap = Number(
    tripData.budget?.target_cap ?? (typeof tripData.budget === 'number' ? tripData.budget : 50000)
  );

  const mappedItin = mapBackendItinerary(
    data.itinerary || tripData.itinerary,
    budgetCap,
    currency,
    destination
  );
  const mappedBudget = mapBackendBudget(
    data.budget || tripData.budget,
    budgetCap,
    currency
  );

  return {
    trip_id: data.trip_id || tripData.trip_id || 'trip_demo',
    destination,
    dates: {
      start: start_date,
      end: end_date,
    },
    budget: mappedBudget,
    itinerary: mappedItin,
    transportation: data.transportation || [],
    accommodation: data.accommodation || {
      name: `${destination.split(',')[0]} Signature Hotel`,
      address: `Historic & Cultural District, ${destination}`,
      check_in: '15:00',
      check_out: '11:00',
    },
    disruptions: data.disruptions || [],
    backups: data.backups || [],
    status: tripData.status || 'active',
  };
}

/**
 * Maps disruption alternatives from backend
 */
function mapBackendAlternatives(
  alts: any[],
  affectedActivityId: string,
  currency: Currency = 'INR',
  destination: string = ''
): Alternative[] {
  if (!Array.isArray(alts) || alts.length === 0) {
    return MOCK_DISRUPTED_ALTERNATIVES;
  }

  const defaultLoc = destination || currentTripState.destination || 'Local Area';

  return alts.map((alt: any, idx: number) => {
    const costVal = Number(alt.estimated_cost ?? alt.cost ?? 0);
    return {
      id: alt.id || `alt_${idx + 1}`,
      activity_id: affectedActivityId,
      name: alt.name || 'Alternative Activity',
      subtitle: alt.location || defaultLoc,
      type: alt.category || 'sightseeing',
      location: alt.location || defaultLoc,
      start_time: alt.start_time || '10:45',
      end_time: alt.end_time || '13:00',
      duration_minutes: alt.duration_minutes || 135,
      estimated_cost: costVal,
      currency: (alt.currency || currency) as Currency,
      description: alt.description || `Autonomous replacement candidate with verified operational status.`,
      match_score: alt.score ? Math.min(100, Math.round(alt.score)) : (idx === 0 ? 98 : (idx === 1 ? 92 : 88)),
      cost_difference: alt.cost_difference ?? -300,
      travel_time_difference: alt.travel_time_difference ?? -5,
      verification_source: alt.verification_source || (alt.source ? `Verified via ${alt.source}` : 'Tavily Verified Open'),
      operating_hours: alt.operating_hours || '09:30 – 18:00',
      transit_notes: alt.transit_notes || 'Direct 8-min walk across pedestrian bridge',
      tags: alt.tags || [alt.category || 'Museum', 'Walkable'],
      image_url: resolveActivityImage(alt.name, alt.location || defaultLoc, alt.category, alt.image_url),
      is_top_match: idx === 0,
    };
  });
}

/**
 * Maps backend diff changes to ChangeSummary[]
 */
function mapBackendChanges(changes: any): ChangeSummary[] {
  if (!changes) return MOCK_REPLANNED_CHANGES;
  if (Array.isArray(changes) && changes.length > 0) return changes;

  const list: ChangeSummary[] = [];
  if (changes.removed) {
    list.push({
      type: 'activity_removed',
      event_type: 'REMOVED',
      old_activity: changes.removed.name || 'Disrupted Activity',
      reason: changes.reason_for_change || 'Activity disrupted or cancelled',
      cost_delta: -(changes.removed.cost || 22),
      time_delta_minutes: 0,
      time_range: `${changes.removed.start_time || '10:00'} - ${changes.removed.end_time || '13:00'}`,
    });
  }
  if (changes.added) {
    list.push({
      type: 'activity_added',
      event_type: 'ADDED',
      new_activity: changes.added.name || 'Alternative Activity',
      reason: 'Optimized replacement with zero conflict overlap',
      cost_delta: changes.added.cost || 16,
      time_delta_minutes: 0,
      time_range: `${changes.added.start_time || '10:45'} - ${changes.added.end_time || '13:00'}`,
    });
  }
  if (Array.isArray(changes.changed_times)) {
    changes.changed_times.forEach((ct: any) => {
      list.push({
        type: 'time_shifted',
        event_type: 'RESCHEDULED',
        old_activity: ct.name || 'Activity',
        new_activity: ct.name || 'Activity',
        reason: 'Buffered arrival time adjustment',
        cost_delta: 0,
        time_delta_minutes: ct.delta_minutes || 5,
        time_range: ct.new_time || '13:20 - 14:35',
      });
    });
  }
  return list.length > 0 ? list : MOCK_REPLANNED_CHANGES;
}

export const api = {
  /**
   * POST /api/trips
   * Creates a trip and prepares initial state
   */
  async createTrip(constraints: TripConstraints): Promise<{ trip_id: string; status: string; trip: Trip }> {
    try {
      const response = await fetch(`${API_BASE}/trips`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination: constraints.destination,
          start_date: constraints.start_date,
          end_date: constraints.end_date,
          budget: constraints.budget,
          currency: constraints.currency,
          interests: constraints.interests,
          preferences: constraints.preferences,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        const mappedTrip = mapBackendTrip(data);
        currentTripState = mappedTrip;
        return {
          trip_id: data.trip_id || mappedTrip.trip_id,
          status: data.status || 'created',
          trip: mappedTrip,
        };
      }
    } catch (err) {
      console.warn('[TravelPilot] Backend createTrip error, using fallback:', err);
    }

    // Mock response fallback
    const newTrip: Trip = {
      ...INITIAL_MOCK_TRIP,
      trip_id: `trip_${Date.now().toString().slice(-4)}`,
      destination: constraints.destination || 'Paris, France',
      dates: {
        start: constraints.start_date || '2026-10-10',
        end: constraints.end_date || '2026-10-14',
      },
      budget: {
        ...INITIAL_MOCK_TRIP.budget,
        target_cap: constraints.budget || 50000,
        currency: constraints.currency || 'INR',
        remaining: (constraints.budget || 50000) - 45000,
      },
      constraints,
      status: 'created',
    };
    currentTripState = newTrip;
    return {
      trip_id: newTrip.trip_id,
      status: 'created',
      trip: newTrip,
    };
  },

  /**
   * POST /api/trips/{trip_id}/generate
   * Starts agent generation loop
   */
  async generateItinerary(
    tripId: string,
    reason: string = 'initial_generation'
  ): Promise<{ trip_id: string; status: string; itinerary: Itinerary; budget: Budget }> {
    try {
      const response = await fetch(`${API_BASE}/trips/${tripId}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      if (response.ok) {
        const data = await response.json();
        const mappedItin = mapBackendItinerary(
          data.itinerary,
          currentTripState.budget.target_cap,
          currentTripState.budget.currency,
          currentTripState.destination
        );
        const mappedBudget = mapBackendBudget(
          data.budget,
          currentTripState.budget.target_cap,
          currentTripState.budget.currency
        );
        currentTripState.itinerary = mappedItin;
        currentTripState.budget = mappedBudget;
        currentTripState.status = 'active';

        return {
          trip_id: tripId,
          status: data.status || 'success',
          itinerary: mappedItin,
          budget: mappedBudget,
        };
      }
    } catch (err) {
      console.warn('[TravelPilot] Backend generateItinerary error, using fallback:', err);
    }

    currentTripState.status = 'active';
    return {
      trip_id: tripId,
      status: 'success',
      itinerary: currentTripState.itinerary,
      budget: currentTripState.budget,
    };
  },

  /**
   * GET /api/trips/{trip_id}
   * Fetches the complete current trip state
   */
  async getTrip(tripId: string): Promise<Trip> {
    try {
      const response = await fetch(`${API_BASE}/trips/${tripId}`);
      if (response.ok) {
        const data = await response.json();
        const mapped = mapBackendTrip(data);
        currentTripState = mapped;
        return mapped;
      }
    } catch (err) {
      console.warn('[TravelPilot] Backend getTrip error, using fallback:', err);
    }

    return currentTripState;
  },

  /**
   * POST /api/trips/{trip_id}/chat
   * Sends natural-language query to AI agent
   */
  async sendChatMessage(
    tripId: string,
    message: string
  ): Promise<{ message: string; intent?: string; agent_steps?: any[]; changes?: any[] }> {
    try {
      const response = await fetch(`${API_BASE}/trips/${tripId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, simulate: false }),
      });
      if (response.ok) {
        const data = await response.json();
        const steps = (data.tool_results || []).map((tr: any) => ({
          type: tr.tool || 'tool_call',
          status: 'completed',
          label:
            tr.tool === 'replan_itinerary'
              ? 'Rebuilding schedule'
              : tr.tool === 'get_current_itinerary'
                ? 'Reading itinerary'
                : 'Validating constraints',
        }));

        return {
          message: data.reply || data.message,
          intent: data.intent?.intent || 'chat_message',
          agent_steps: steps.length > 0 ? steps : [{ type: 'read_itinerary', status: 'completed' }],
          changes: data.changes ? mapBackendChanges(data.changes) : [],
        };
      }
    } catch (err) {
      console.warn('[TravelPilot] Backend chat error, using fallback:', err);
    }

    // Mock natural language fallback response
    const lower = message.toLowerCase();
    let reply = `I evaluated your trip itinerary. All scheduled times and transportation routes are confirmed with 0 conflicts.`;
    let intent = 'itinerary_question';

    if (lower.includes('tomorrow') || lower.includes('day 1') || lower.includes('morning')) {
      reply = `Tomorrow morning starts at 09:15 CET with arrival at CDG Terminal 2E, followed by the Louvre Museum scheduled from 10:30 to 13:00. Scenic walk through Pont des Arts leads directly into lunch at Tuileries Bistro at 13:15.`;
      intent = 'itinerary_question';
    } else if (lower.includes('budget') || lower.includes('remaining') || lower.includes('spent') || lower.includes('cost')) {
      reply = `Your total budget cap is ₹50,000. Current estimated spend is ₹45,000, leaving a healthy ₹5,000 (10%) contingency margin for spontaneous Parisian experiences.`;
      intent = 'budget_inquiry';
    } else if (lower.includes('fit') || lower.includes('add') || lower.includes('another activity')) {
      reply = `Looking at Day 2: There is a 45-minute open window between Luxembourg Gardens (ends 16:30) and Shakespeare & Co (starts 17:00). You can fit a quick coffee stop at Saint-Sulpice square without violating travel buffers.`;
      intent = 'constraint_inquiry';
    } else if (lower.includes('cancel') || lower.includes('disrupt') || lower.includes('louvre')) {
      reply = `⚠️ Disruption analysis: If Louvre Museum is unavailable, I recommend Musée d'Orsay (10:45 – 13:00). It saves ₹300, reduces transit by 5 minutes, and keeps your Tuileries lunch reservation intact. Click 'Simulate Disruption' to preview.`;
      intent = 'disruption_query';
    }

    return {
      message: reply,
      intent,
      agent_steps: [
        { type: 'read_itinerary', status: 'completed' },
        { type: 'check_constraints', status: 'completed' },
      ],
      changes: [],
    };
  },

  /**
   * PATCH /api/trips/{trip_id}/constraints
   * Modifies constraints and triggers replanning
   */
  async updateConstraints(
    tripId: string,
    updatedConstraints: Partial<TripConstraints>
  ): Promise<{ status: string; changes: any[]; itinerary: Itinerary; budget: Budget }> {
    try {
      const response = await fetch(`${API_BASE}/trips/${tripId}/constraints`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          budget: updatedConstraints.budget,
          interests: updatedConstraints.interests,
          preferences: updatedConstraints.preferences,
          simulate: false,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        const mappedItin = data.after
          ? mapBackendItinerary(data.after, currentTripState.budget.target_cap, currentTripState.budget.currency)
          : currentTripState.itinerary;
        const mappedBudget = data.budget
          ? mapBackendBudget(data.budget, currentTripState.budget.target_cap, currentTripState.budget.currency)
          : currentTripState.budget;

        return {
          status: data.status || 'replanned',
          changes: mapBackendChanges(data.changes),
          itinerary: mappedItin,
          budget: mappedBudget,
        };
      }
    } catch (err) {
      console.warn('[TravelPilot] Backend updateConstraints error, using fallback:', err);
    }

    if (updatedConstraints.budget) {
      currentTripState.budget.target_cap = updatedConstraints.budget;
      currentTripState.budget.remaining = updatedConstraints.budget - currentTripState.budget.estimated_total;
    }

    return {
      status: 'replanned',
      changes: [],
      itinerary: currentTripState.itinerary,
      budget: currentTripState.budget,
    };
  },

  /**
   * POST /api/trips/{trip_id}/disruptions
   * Reports disruption or runs simulation
   */
  async reportDisruption(
    tripId: string,
    disruption: {
      activity_id: string;
      type: 'cancelled' | 'delayed' | 'closed' | 'strike';
      message: string;
      simulate?: boolean;
    }
  ): Promise<DisruptionResponse> {
    try {
      const response = await fetch(`${API_BASE}/trips/${tripId}/disruptions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(disruption),
      });
      if (response.ok) {
        const data = await response.json();
        const mappedAlts = mapBackendAlternatives(
          data.alternatives,
          disruption.activity_id,
          currentTripState.budget.currency,
          currentTripState.destination
        );
        const mappedChanges = mapBackendChanges(data.changes);
        const mappedItin = data.itinerary?.days
          ? mapBackendItinerary(data.itinerary, currentTripState.budget.target_cap, currentTripState.budget.currency, currentTripState.destination)
          : currentTripState.itinerary;
        const mappedBudget = data.budget
          ? mapBackendBudget(data.budget, currentTripState.budget.target_cap, currentTripState.budget.currency)
          : currentTripState.budget;

        return {
          status: data.status || 'replanned',
          simulated: data.simulated ?? false,
          affected_activities: data.affected_activities || [disruption.activity_id],
          alternatives: mappedAlts,
          changes: mappedChanges,
          itinerary: mappedItin,
          budget: mappedBudget,
        };
      }
    } catch (err) {
      console.warn('[TravelPilot] Backend reportDisruption error, using fallback:', err);
    }

    // Mark activity disrupted in fallback state
    const day1 = currentTripState.itinerary.days[0];
    if (day1) {
      const targetActivity = day1.activities.find(
        (a) => a.id === disruption.activity_id || a.id.includes('louvre')
      );
      if (targetActivity) {
        targetActivity.status = 'disrupted';
        targetActivity.status_label = 'Disrupted (Strike)';
        targetActivity.disruption_reason = disruption.message;
      }
    }

    return {
      status: 'replanned',
      simulated: disruption.simulate ?? false,
      affected_activities: [disruption.activity_id],
      alternatives: MOCK_DISRUPTED_ALTERNATIVES,
      changes: MOCK_REPLANNED_CHANGES,
      itinerary: currentTripState.itinerary,
      budget: currentTripState.budget,
    };
  },

  /**
   * POST /api/trips/{trip_id}/alternatives/{activity_id}/apply
   * Commits an alternative to the persistent trip
   */
  async applyAlternative(
    tripId: string,
    activityId: string,
    alternativeId: string
  ): Promise<ApplyAlternativeResponse> {
    try {
      const response = await fetch(
        `${API_BASE}/trips/${tripId}/alternatives/${activityId}/apply`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            alternative_id: alternativeId,
            candidate_name: alternativeId,
            simulate: false,
          }),
        }
      );
      if (response.ok) {
        const data = await response.json();
        const mappedChanges = mapBackendChanges(data.changes);
        const mappedItin = data.itinerary?.days
          ? mapBackendItinerary(data.itinerary, currentTripState.budget.target_cap, currentTripState.budget.currency)
          : currentTripState.itinerary;
        const mappedBudget = data.budget
          ? mapBackendBudget(data.budget, currentTripState.budget.target_cap, currentTripState.budget.currency)
          : currentTripState.budget;

        currentTripState.itinerary = mappedItin;
        currentTripState.budget = mappedBudget;
        currentTripState.status = 'replanned';

        return {
          status: data.status || 'success',
          changes: mappedChanges,
          itinerary: mappedItin,
          budget: mappedBudget,
        };
      }
    } catch (err) {
      console.warn('[TravelPilot] Backend applyAlternative error, using fallback:', err);
    }

    const selectedAlt =
      MOCK_DISRUPTED_ALTERNATIVES.find((alt) => alt.id === alternativeId) || MOCK_DISRUPTED_ALTERNATIVES[0];

    // Rebuild Day 1 in fallback
    const day1 = currentTripState.itinerary.days[0];
    if (day1) {
      const index = day1.activities.findIndex((a) => a.id === activityId || a.id.includes('louvre'));
      if (index !== -1) {
        day1.activities[index] = {
          id: selectedAlt.id,
          name: selectedAlt.name,
          type: 'museum',
          location: selectedAlt.location,
          start_time: selectedAlt.start_time,
          end_time: selectedAlt.end_time,
          duration_minutes: selectedAlt.duration_minutes,
          estimated_cost: selectedAlt.estimated_cost,
          currency: 'INR',
          description: `Autonomous Replacement • ${selectedAlt.description} • Entry confirmed`,
          status: 'replanned',
          status_label: 'Agent Replanned',
          tags: selectedAlt.tags,
          image_url: selectedAlt.image_url,
          transit_after: {
            type: 'walk',
            duration_minutes: 10,
            distance_km: 0.6,
            from_location: "Musée d'Orsay",
            to_location: 'Tuileries Garden Bistro',
            path_type: 'Passerelle Léopold Promenade',
            notes: 'Direct 8-min walk across pedestrian bridge',
          },
        };

        const lunchIndex = day1.activities.findIndex((a) => a.id.includes('lunch'));
        if (lunchIndex !== -1) {
          day1.activities[lunchIndex].start_time = '13:20';
          day1.activities[lunchIndex].end_time = '14:35';
        }

        currentTripState.budget.estimated_total = 44700;
        currentTripState.budget.remaining = 5300;
        day1.daily_cost = 11200;
        currentTripState.status = 'replanned';
      }
    }

    return {
      status: 'success',
      changes: MOCK_REPLANNED_CHANGES,
      itinerary: currentTripState.itinerary,
      budget: currentTripState.budget,
    };
  },

  /**
   * GET /api/trips/{trip_id}/agent-runs/{run_id}
   * Fetches execution step progress for UI
   */
  async getAgentRun(tripId: string, runId: string): Promise<AgentRun> {
    try {
      const response = await fetch(`${API_BASE}/trips/${tripId}/agent-runs/${runId}`);
      if (response.ok) {
        return await response.json();
      }
    } catch {
      // Backend fallback
    }

    return {
      run_id: runId,
      status: 'completed',
      steps: runId.includes('disrupt') ? MOCK_AGENT_STEPS_DISRUPTION : MOCK_AGENT_STEPS_GENERATION,
    };
  },

  /**
   * GET /api/images/search?query=...
   * Dynamic Activity Image Search
   */
  async searchActivityImage(query: string): Promise<string | null> {
    try {
      const response = await fetch(`${API_BASE}/images/search?query=${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.image_url) {
          return data.image_url;
        }
      }
    } catch {
      // Backend unavailable fallback
    }
    return null;
  },
};
