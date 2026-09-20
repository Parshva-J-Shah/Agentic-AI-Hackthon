import React from 'react';
import { Trip, Currency, AgentMessage } from '../types/trip';
import { DayTabs } from '../components/DayTabs';
import { BudgetOverview } from '../components/BudgetOverview';
import { ItineraryTimeline } from '../components/ItineraryTimeline';

interface DashboardPageProps {
  trip: Trip;
  currency: Currency;
  activeDayNumber: number;
  onSelectDay: (dayNumber: number) => void;
  isDisrupted: boolean;
  onTriggerDisruption: () => void;
  onAutoApplyFix: () => void;
  onInspectBeforeAfter: () => void;
  onDismissDisruptionBanner: () => void;
  chatMessages: AgentMessage[];
  onSendChatMessage: (msg: string) => void;
  isChatLoading: boolean;
  onViewAlternatives: (activityId: string) => void;
  isDisrupting?: boolean;
}

function getDestinationWeather(destination: string): { weatherInfo: string; weatherNote: string } {
  const dest = (destination || 'Destination').trim();

  // Deterministic hash based on destination string
  let hash = 2166136261;
  for (let i = 0; i < dest.length; i++) {
    hash ^= dest.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  const seed = Math.abs(hash);

  // Deterministic temperature range (16°C to 34°C)
  const d = dest.toLowerCase();
  let baseTemp = 18 + (seed % 14);

  if (
    d.includes('beach') ||
    d.includes('island') ||
    d.includes('coast') ||
    d.includes('tropical') ||
    d.includes('resort') ||
    d.includes('bay') ||
    d.includes('goa') ||
    d.includes('miami') ||
    d.includes('cancun')
  ) {
    baseTemp = 28 + (seed % 5);
  } else if (
    d.includes('mountain') ||
    d.includes('alps') ||
    d.includes('hill') ||
    d.includes('peak') ||
    d.includes('snow') ||
    d.includes('lake')
  ) {
    baseTemp = 12 + (seed % 8);
  } else if (
    d.includes('desert') ||
    d.includes('oasis') ||
    d.includes('dune')
  ) {
    baseTemp = 30 + (seed % 6);
  }

  let condition = 'Mild / Clear';
  let note = 'Pleasant for walking · Comfortable attire recommended';

  if (baseTemp >= 30) {
    const conditions = ['Sunny / Warm', 'Clear Skies / Warm', 'Sunny & Bright', 'Dry & Warm'];
    condition = conditions[seed % conditions.length];
    note = 'Stay hydrated · Sun protection & light attire recommended';
  } else if (baseTemp >= 26) {
    const conditions = ['Warm / Pleasant', 'Sunny / Mild Breeze', 'Clear & Sunny', 'Breezy / Warm'];
    condition = conditions[seed % conditions.length];
    note = 'Ideal for outdoor exploration · Light layer recommended';
  } else if (baseTemp >= 21) {
    const conditions = ['Mild / Clear', 'Partly Cloudy / Fair', 'Pleasant / Breezy', 'Fair & Sunny'];
    condition = conditions[seed % conditions.length];
    note = 'Optimal walking temperature · Light jacket for evenings';
  } else if (baseTemp >= 16) {
    const conditions = ['Cool / Clear', 'Brisk & Sunny', 'Crisp / Fair', 'Mild / Breezy'];
    condition = conditions[seed % conditions.length];
    note = 'Comfortable for active walking · Light sweater recommended';
  } else {
    const conditions = ['Cool / Crisp', 'Chilly / Clear', 'Brisk Air / Clear', 'Overcast / Cool'];
    condition = conditions[seed % conditions.length];
    note = 'Brisk climate · Warm layers & jacket recommended';
  }

  return {
    weatherInfo: `${baseTemp}°C · ${condition}`,
    weatherNote: note,
  };
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  trip,
  currency,
  activeDayNumber,
  onSelectDay,
  isDisrupted,
  isDisrupting = false,
  onTriggerDisruption,
  onViewAlternatives,
}) => {
  const activeDay =
    trip.itinerary.days.find((d) => d.day_number === activeDayNumber) ||
    trip.itinerary.days[0];

  const totalActivities = activeDay.activities.length;
  const daySpend = activeDay.activities.reduce((acc, a) => acc + a.estimated_cost, 0);

  const formatCost = (cost: number) => {
    if (currency === 'EUR') {
      return `€${Math.round(cost / 90).toLocaleString()}`;
    }
    return `₹${cost.toLocaleString()}`;
  };

  const disruptedAct = trip.itinerary?.days
    ?.flatMap((d) => d.activities)
    ?.find((a) => a.status === 'disrupted') || trip.itinerary?.days?.[0]?.activities?.[0];
  const disruptedName = disruptedAct?.name || 'Scheduled Activity';

  const hotelName = trip.accommodation?.name || `${trip.destination.split(',')[0]} Signature Hotel`;
  const hotelAddr = trip.accommodation?.address || `Central District, ${trip.destination}`;
  const transitPass = `${trip.destination.split(',')[0]} Transit Card`;
  const transitNote = `Suggested for convenient travel in ${trip.destination.split(',')[0]}`;
  const { weatherInfo, weatherNote } = getDestinationWeather(trip.destination);

  return (
    <div className="w-full max-w-[1320px] mx-auto px-margin-mobile md:px-margin py-8 space-y-8">
      {/* Top Trip Banner Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-outline-variant/20">
        <div>
          <span className="font-label-sm text-xs uppercase tracking-widest text-secondary font-bold">
            Curated Signature Journey
          </span>
          <div className="flex flex-wrap items-baseline gap-2 sm:gap-3 mt-0.5">
            <h1 className="font-headline-lg text-2xl sm:text-3xl font-bold text-on-surface">
              {trip.destination}
            </h1>
            <span className="font-body-md text-on-surface-variant">
              · {trip.dates.start} – {trip.dates.end} · {trip.itinerary.days.length} days
            </span>
          </div>
        </div>

        {/* Top Right Action Pills */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 self-start sm:self-auto">
          {/* Simulate / Reset Disruption Pill */}
          <button
            type="button"
            onClick={onTriggerDisruption}
            disabled={isDisrupting}
            className={`inline-flex items-center gap-1.5 px-space-md py-2 rounded-full font-label-md text-xs sm:text-sm font-semibold transition-all shadow-xs ${
              isDisrupting
                ? 'opacity-70 cursor-not-allowed bg-surface-container-low text-error border border-error/20'
                : isDisrupted
                ? 'bg-error text-on-error hover:bg-error/90 shadow-error/20 cursor-pointer'
                : 'bg-surface-container-low text-error border border-error/20 hover:bg-error-container cursor-pointer'
            }`}
            title={
              isDisrupting
                ? 'Simulating Disruption…'
                : isDisrupted
                ? 'Reset simulated disruption'
                : 'Simulate itinerary disruption'
            }
          >
            {isDisrupting ? (
              <span className="w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin shrink-0"></span>
            ) : (
              <span className="material-symbols-outlined text-[16px]">
                {isDisrupted ? 'restart_alt' : 'bolt'}
              </span>
            )}
            <span>
              {isDisrupting
                ? 'Simulating Disruption…'
                : isDisrupted
                ? 'Reset Disruption'
                : 'Simulate Disruption (Demo)'}
            </span>
          </button>

          {/* Ask TravelPilot Black Pill */}
          <button
            type="button"
            onClick={() => {
              const navBtn = document.querySelector('nav button:last-child') as HTMLButtonElement;
              if (navBtn) navBtn.click();
            }}
            className="inline-flex items-center gap-1.5 px-space-md py-2 rounded-full bg-primary text-on-primary font-label-md text-xs sm:text-sm font-semibold hover:bg-neutral-800 transition-all shadow-xs cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">smart_toy</span>
            <span>Ask TravelPilot</span>
          </button>
        </div>
      </div>

      {/* Disruption Alert Card (if triggered) */}
      {isDisrupted && (
        <div className="bg-error-container/20 border border-error/30 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-error text-on-error flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[18px]">warning</span>
            </div>
            <div>
              <h3 className="font-headline-sm text-base font-bold text-on-surface">
                {disruptedName} disruption detected
              </h3>
              <p className="font-body-sm text-xs sm:text-sm text-on-surface-variant mt-0.5">
                Unannounced schedule change on Day 1. TravelPilot evaluated alternatives that preserve your timing &amp; transit schedule.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onViewAlternatives(disruptedAct?.id || 'act_001')}
            className="px-space-md py-2 rounded-full bg-primary text-on-primary font-label-md text-xs sm:text-sm font-semibold hover:bg-neutral-800 transition-all shrink-0 self-start sm:self-auto cursor-pointer"
          >
            Review Recommended Alternative
          </button>
        </div>
      )}

      {/* Day Pill Tabs */}
      <DayTabs
        days={trip.itinerary.days}
        activeDayNumber={activeDayNumber}
        onSelectDay={onSelectDay}
      />

      {/* 70 / 30 Two-Column Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
        {/* LEFT COLUMN: 70% (8 cols) Day Itinerary Stream */}
        <div className="lg:col-span-8 flex flex-col gap-space-md">
          {/* Day Metrics Capsule */}
          <div className="flex flex-wrap items-center justify-between gap-2 px-space-md py-2.5 rounded-2xl bg-surface-container-low text-xs font-label-sm text-on-surface-variant border border-outline-variant/30">
            <span className="font-semibold text-on-surface">
              {totalActivities} activities scheduled
            </span>
            <span>·</span>
            <span>{activeDay.walking_distance_km || 4.2} km total walking</span>
            <span>·</span>
            <span>{formatCost(daySpend)} estimated day spend</span>
          </div>

          {/* Timeline Container */}
          <ItineraryTimeline
            day={activeDay}
            currency={currency}
            onSimulateCancel={() => onTriggerDisruption()}
            onViewAlternatives={onViewAlternatives}
          />
        </div>

        {/* RIGHT COLUMN: 30% (4 cols) Budget & Trip Overview Sidebar */}
        <div className="lg:col-span-4 flex flex-col gap-space-lg lg:sticky lg:top-24">
          {/* Budget Overview Card */}
          <BudgetOverview budget={trip.budget} currency={currency} />

          {/* Quick Trip Essentials Card (truthful MVP wording) */}
          <div className="bg-surface-container-lowest rounded-2xl p-5 sm:p-6 shadow-xs border border-outline-variant/30 flex flex-col gap-4">
            <span className="font-label-sm text-xs uppercase tracking-widest text-secondary font-semibold">
              Trip Essentials
            </span>

            <div className="space-y-3 text-xs font-body-sm">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-[18px] text-secondary mt-0.5">
                  hotel
                </span>
                <div>
                  <div className="font-semibold text-on-surface">{hotelName}</div>
                  <div className="text-on-surface-variant">{hotelAddr}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-[18px] text-secondary mt-0.5">
                  confirmation_number
                </span>
                <div>
                  <div className="font-semibold text-on-surface">{transitPass}</div>
                  <div className="text-on-surface-variant">{transitNote}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-[18px] text-secondary mt-0.5">
                  wb_sunny
                </span>
                <div>
                  <div className="font-semibold text-on-surface">{weatherInfo}</div>
                  <div className="text-on-surface-variant">{weatherNote}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Autonomous Reassurance Mini Card */}
          <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex items-center gap-3">
            <span className="material-symbols-outlined text-[20px] text-secondary">
              verified_user
            </span>
            <div className="text-xs font-body-sm text-on-surface-variant">
              TravelPilot monitors itinerary feasibility in the background. If plans change, alternatives are prepared instantly.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
