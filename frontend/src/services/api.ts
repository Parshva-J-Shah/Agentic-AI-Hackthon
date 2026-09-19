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
  Disruption,
  DisruptionResponse,
  ApplyAlternativeResponse,
  AgentMessage,
  AgentRun,
} from '../types/trip';
import {
  INITIAL_MOCK_TRIP,
  MOCK_DISRUPTED_ALTERNATIVES,
  MOCK_REPLANNED_CHANGES,
  MOCK_AGENT_STEPS_GENERATION,
  MOCK_AGENT_STEPS_DISRUPTION,
} from './mockData';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// In-memory state for mock fallback
let currentTripState: Trip = JSON.parse(JSON.stringify(INITIAL_MOCK_TRIP));

export const api = {
  /**
   * POST /api/trips
   * Creates a trip and prepares initial state
   */
  async createTrip(constraints: TripConstraints): Promise<{ trip_id: string; status: string; trip: Trip }> {
    try {
      const response = await fetch(`${BASE_URL}/trips`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(constraints),
      });
      if (response.ok) {
        return await response.json();
      }
    } catch {
      // Backend not running — fallback to mock
    }

    // Mock response
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
      const response = await fetch(`${BASE_URL}/trips/${tripId}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      if (response.ok) {
        return await response.json();
      }
    } catch {
      // Backend fallback
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
      const response = await fetch(`${BASE_URL}/trips/${tripId}`);
      if (response.ok) {
        const data = await response.json();
        currentTripState = data;
        return data;
      }
    } catch {
      // Backend fallback
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
      const response = await fetch(`${BASE_URL}/trips/${tripId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });
      if (response.ok) {
        return await response.json();
      }
    } catch {
      // Backend fallback
    }

    // Mock natural language intelligent response
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
      const response = await fetch(`${BASE_URL}/trips/${tripId}/constraints`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedConstraints),
      });
      if (response.ok) {
        return await response.json();
      }
    } catch {
      // Backend fallback
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
      const response = await fetch(`${BASE_URL}/trips/${tripId}/disruptions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(disruption),
      });
      if (response.ok) {
        return await response.json();
      }
    } catch {
      // Backend fallback
    }

    // Mark activity disrupted in mock state
    const day1 = currentTripState.itinerary.days[0];
    const targetActivity = day1.activities.find((a) => a.id === disruption.activity_id);
    if (targetActivity) {
      targetActivity.status = 'disrupted';
      targetActivity.status_label = 'Disrupted (Strike)';
      targetActivity.disruption_reason = disruption.message;
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
      const response = await fetch(`${BASE_URL}/trips/${tripId}/alternatives/${activityId}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alternative_id: alternativeId }),
      });
      if (response.ok) {
        return await response.json();
      }
    } catch {
      // Backend fallback
    }

    const selectedAlt =
      MOCK_DISRUPTED_ALTERNATIVES.find((alt) => alt.id === alternativeId) || MOCK_DISRUPTED_ALTERNATIVES[0];

    // Rebuild Day 1 in mock
    const day1 = currentTripState.itinerary.days[0];
    const index = day1.activities.findIndex((a) => a.id === activityId);
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

      // Adjust lunch timing
      const lunchIndex = day1.activities.findIndex((a) => a.id === 'act_003_lunch');
      if (lunchIndex !== -1) {
        day1.activities[lunchIndex].start_time = '13:20';
        day1.activities[lunchIndex].end_time = '14:35';
      }

      // Update costs
      currentTripState.budget.estimated_total = 44700;
      currentTripState.budget.remaining = 5300;
      day1.daily_cost = 11200;
      currentTripState.status = 'replanned';
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
      const response = await fetch(`${BASE_URL}/trips/${tripId}/agent-runs/${runId}`);
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
};
