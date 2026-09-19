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
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  trip,
  currency,
  activeDayNumber,
  onSelectDay,
  isDisrupted,
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
          {/* Simulate Disruption Pill */}
          <button
            type="button"
            onClick={onTriggerDisruption}
            className={`inline-flex items-center gap-1.5 px-space-md py-2 rounded-full font-label-md text-xs sm:text-sm font-semibold transition-all shadow-xs cursor-pointer ${
              isDisrupted
                ? 'bg-error text-on-error hover:bg-error/90'
                : 'bg-surface-container-low text-error border border-error/20 hover:bg-error-container'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">bolt</span>
            <span>Simulate Disruption (Demo)</span>
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
            <span className="material-symbols-outlined text-[16px]">chat_spark</span>
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
                Louvre Museum disruption detected
              </h3>
              <p className="font-body-sm text-xs sm:text-sm text-on-surface-variant mt-0.5">
                Unannounced venue closure on Day 1. TravelPilot evaluated alternatives that preserve your lunch &amp; cruise schedule.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onViewAlternatives('act_002_louvre')}
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
                  <div className="font-semibold text-on-surface">Hôtel Saint-Germain</div>
                  <div className="text-on-surface-variant">Saint-Germain-des-Prés · Base location</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-[18px] text-secondary mt-0.5">
                  confirmation_number
                </span>
                <div>
                  <div className="font-semibold text-on-surface">Paris Visite Metro Pass</div>
                  <div className="text-on-surface-variant">Zones 1–3 · Suggested for easy transit</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-[18px] text-secondary mt-0.5">
                  wb_sunny
                </span>
                <div>
                  <div className="font-semibold text-on-surface">18°C · Mild · Demo</div>
                  <div className="text-on-surface-variant">Pleasant for walking · Light sweater recommended</div>
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
