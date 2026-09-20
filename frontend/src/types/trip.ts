/**
 * TravelPilot Types — Conforming strictly to 04_API_CONTRACT.md and Stitch Design System
 */

export type Currency = 'INR' | 'EUR' | 'USD';

export type ActivityStatus = 'planned' | 'confirmed' | 'disrupted' | 'replanned' | 'cancelled';

export interface TripPreferences {
  preferred_start_time?: string;
  preferred_end_time?: string;
  max_activity_travel_minutes?: number;
  activity_intensity?: 'relaxed' | 'moderate' | 'intensive';
}

export interface TripConstraints {
  destination: string;
  start_date: string;
  end_date: string;
  budget: number;
  currency: Currency;
  interests: string[];
  preferences: TripPreferences;
}

export interface Transportation {
  type: 'walk' | 'metro' | 'bus' | 'train' | 'taxi' | 'flight';
  duration_minutes: number;
  distance_km?: number;
  from_location: string;
  to_location: string;
  path_type?: string; // e.g. "Optimal Path", "Direct", "Low Congestion"
  notes?: string;
}

export interface Activity {
  id: string;
  name: string;
  type: 'sightseeing' | 'landmark' | 'museum' | 'food' | 'dining' | 'flight' | 'transport' | 'leisure';
  location: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  estimated_cost: number;
  currency: Currency;
  description: string;
  status: ActivityStatus;
  status_label?: string; // e.g. "Pass Verified", "Table Reserved", "Strike Notice"
  tags?: string[];
  image_url?: string;
  transit_after?: Transportation;
  disruption_reason?: string;
  cancellation_policy?: string;
  replacement_id?: string;
}

export interface ItineraryDay {
  day_number: number;
  date: string;
  title: string;
  theme: string;
  activities: Activity[];
  daily_cost: number;
  currency: Currency;
  walking_distance_km?: number;
  walking_duration_minutes?: number;
  conflicts_count?: number;
}

export interface Itinerary {
  days: ItineraryDay[];
}

export interface BudgetBreakdownCategory {
  category: string;
  amount: number;
  percentage: number;
  color?: string;
}

export interface Budget {
  target_cap: number;
  estimated_total: number;
  currency: Currency;
  remaining: number;
  contingency_status?: 'healthy' | 'warning' | 'exceeded';
  breakdown?: BudgetBreakdownCategory[];
}

export interface TripDates {
  start: string;
  end: string;
}

export interface Trip {
  trip_id: string;
  destination: string;
  dates: TripDates;
  budget: Budget;
  itinerary: Itinerary;
  transportation?: Transportation[];
  accommodation?: {
    name: string;
    address: string;
    check_in: string;
    check_out: string;
  };
  disruptions?: Disruption[];
  backups?: Alternative[];
  constraints?: TripConstraints;
  status: 'created' | 'generating' | 'active' | 'replanned';
}

export interface Disruption {
  activity_id: string;
  type: 'cancelled' | 'delayed' | 'closed' | 'strike';
  message: string;
  simulate?: boolean;
  timestamp?: string;
  affected_activities?: string[];
}

export interface Alternative {
  id: string;
  activity_id: string; // The activity it replaces
  name: string;
  subtitle?: string;
  type: string;
  location: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  estimated_cost: number;
  currency: Currency;
  description: string;
  match_score: number; // 0-100 (e.g. 98)
  cost_difference: number; // relative to replaced, e.g. -300
  travel_time_difference: number; // minutes delta, e.g. -5
  verification_source: string; // e.g. "Tavily Verified Open"
  operating_hours: string;
  transit_notes: string;
  tags: string[];
  image_url?: string;
  is_top_match?: boolean;
}

export interface ChangeSummary {
  type: 'activity_replaced' | 'time_shifted' | 'activity_removed' | 'activity_added';
  event_type?: 'REMOVED' | 'ADDED' | 'RESCHEDULED';
  old_activity?: string;
  new_activity?: string;
  reason: string;
  time_range?: string;
  cost_delta: number;
  time_delta_minutes?: number;
  trigger_reason?: string;
}

export interface AgentStep {
  label: string;
  status: 'completed' | 'in_progress' | 'pending';
  details?: string;
  type?: string;
}

export interface AgentRun {
  run_id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  steps: AgentStep[];
}

export interface AgentMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
  intent?: string;
  agent_steps?: AgentStep[];
  changes?: ChangeSummary[];
}

export interface DisruptionResponse {
  status: 'replanned';
  simulated: boolean;
  affected_activities: string[];
  alternatives: Alternative[];
  changes: ChangeSummary[];
  itinerary: Itinerary;
  budget: Budget;
}

export interface ApplyAlternativeResponse {
  status: 'success';
  changes: ChangeSummary[];
  itinerary: Itinerary;
  budget: Budget;
  before_itinerary?: Itinerary;
  selected_alternative?: any;
}

export interface ApiError {
  status: 'error';
  code:
    | 'INVALID_REQUEST'
    | 'TRIP_NOT_FOUND'
    | 'TOOL_ERROR'
    | 'AGENT_ERROR'
    | 'NO_ALTERNATIVE_FOUND'
    | 'BUDGET_EXCEEDED'
    | 'SCHEDULING_CONFLICT'
    | 'INTERNAL_ERROR';
  message: string;
}
