import React, { useState } from 'react';
import { Currency, ChangeSummary as ChangeSummaryType } from '../types/trip';

interface ChangeSummaryProps {
  changes: ChangeSummaryType[];
  currency: Currency;
  onCommit: () => void;
  onRevert: () => void;
}

export const ChangeSummary: React.FC<ChangeSummaryProps> = ({
  currency,
  onCommit,
  onRevert,
}) => {
  const [toastVisible, setToastVisible] = useState(false);

  const formatCost = (val: number) => {
    if (currency === 'EUR') {
      return `€${Math.round(val / 90).toLocaleString()}`;
    }
    return `₹${val.toLocaleString()}`;
  };

  const handleCommit = () => {
    setToastVisible(true);
    setTimeout(() => {
      onCommit();
    }, 600);
  };

  return (
    <div className="w-full max-w-[1320px] mx-auto px-margin-mobile md:px-margin pb-20">
      {/* Top Editorial Header & Status Section */}
      <section className="pt-4 pb-8 flex flex-col gap-6 relative">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Breadcrumb navigation */}
          <nav className="flex items-center gap-2 text-on-surface-variant font-label-sm text-xs uppercase tracking-wider">
            <button
              type="button"
              onClick={onRevert}
              className="hover:text-on-surface transition-colors cursor-pointer"
            >
              Trips
            </button>
            <span>/</span>
            <span className="hover:text-on-surface transition-colors">Paris Trip</span>
            <span>/</span>
            <span className="text-on-surface font-semibold">Schedule Update</span>
          </nav>

          {/* Status Pill */}
          <div className="inline-flex items-center gap-2 px-space-md py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-sm text-xs font-semibold shadow-xs">
            <span className="material-symbols-outlined text-[16px]">check_circle</span>
            <span>0 Conflicts · {formatCost(300)} Budget Saved</span>
          </div>
        </div>

        {/* Main Headline & Narrative */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
          <div className="lg:col-span-8 flex flex-col gap-2">
            <span className="font-label-sm text-xs uppercase tracking-widest text-secondary font-bold">
              Autonomous Harmony
            </span>
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl text-on-surface font-bold leading-tight tracking-tight">
              Your itinerary is seamlessly updated
            </h1>
            <p className="font-body-lg text-base sm:text-lg text-on-surface-variant max-w-2xl mt-1">
              Review how TravelPilot reorganized Day 1 without disrupting lunch or evening plans.
            </p>
          </div>

          {/* Metric Accent Mini Card */}
          <div className="lg:col-span-4 flex justify-start lg:justify-end">
            <div className="bg-surface-container-lowest p-4 rounded-2xl shadow-xs border border-outline-variant/30 flex items-center gap-4 w-full sm:w-auto">
              <div className="w-12 h-12 rounded-xl bg-surface-container-low flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined text-[24px]">tune</span>
              </div>
              <div className="flex flex-col">
                <span className="font-label-sm text-xs text-on-surface-variant uppercase tracking-wider">
                  Replanned Focus
                </span>
                <span className="font-headline-sm text-base font-bold text-on-surface">
                  Day 1 · Left Bank
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Side-by-Side Comparison Workspace */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-space-lg mb-8">
        {/* ================= LEFT COLUMN: Original Itinerary ================= */}
        <div className="bg-surface-container-low/70 rounded-3xl p-6 sm:p-8 flex flex-col gap-6 shadow-xs border border-outline-variant/30">
          <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-outline"></span>
              <h2 className="font-headline-md text-xl font-bold text-on-surface">
                Original Itinerary
              </h2>
            </div>
            <span className="px-3 py-0.5 rounded-full bg-surface-container-highest text-on-surface-variant font-label-sm text-xs font-semibold">
              Louvre unavailable
            </span>
          </div>

          {/* Timeline Schedule Items */}
          <div className="flex flex-col gap-4 relative pl-5">
            <div className="absolute left-1.5 top-3 bottom-4 w-[1.5px] bg-outline-variant/60"></div>

            {/* Stop 1 */}
            <div className="relative flex items-start gap-4">
              <div className="w-3.5 h-3.5 rounded-full bg-surface-container-highest -ml-5 mt-1.5 z-10 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-outline"></div>
              </div>
              <div className="flex-1 bg-surface-container-lowest/80 p-4 rounded-xl shadow-2xs border border-outline-variant/20">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-on-surface">09:15</span>
                  <span className="text-outline font-medium">Confirmed</span>
                </div>
                <p className="font-bold text-sm text-on-surface mt-1">Café de Flore</p>
                <p className="font-body-sm text-xs text-on-surface-variant">
                  Saint-Germain-des-Prés · Breakfast &amp; Espresso
                </p>
              </div>
            </div>

            {/* Stop 2: Cancelled Louvre Block */}
            <div className="relative flex items-start gap-4">
              <div className="w-3.5 h-3.5 rounded-full bg-error-container -ml-5 mt-1.5 z-10 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-error"></div>
              </div>
              <div className="flex-1 bg-error-container/20 p-4 rounded-xl shadow-2xs border border-error/30">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-error line-through">10:30 – 13:00</span>
                  <span className="px-2 py-0.5 rounded-full bg-error text-on-error font-label-sm text-[11px] font-bold">
                    Cancelled
                  </span>
                </div>
                <p className="font-bold text-sm text-outline line-through mt-1">Louvre Museum</p>
                <p className="font-body-sm text-xs text-outline line-through">
                  Temporary administrative closure
                </p>
                <div className="mt-2 flex items-center gap-1.5 text-error font-label-sm text-xs font-semibold">
                  <span className="material-symbols-outlined text-[14px]">warning</span>
                  <span>Simulated cancellation: Venue unavailable</span>
                </div>
              </div>
            </div>

            {/* Stop 3 */}
            <div className="relative flex items-start gap-4">
              <div className="w-3.5 h-3.5 rounded-full bg-surface-container-highest -ml-5 mt-1.5 z-10 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-outline"></div>
              </div>
              <div className="flex-1 bg-surface-container-lowest/80 p-4 rounded-xl shadow-2xs border border-outline-variant/20">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-on-surface">13:15</span>
                  <span className="text-outline font-medium">Confirmed</span>
                </div>
                <p className="font-bold text-sm text-on-surface mt-1">Lunch at Tuileries Bistro</p>
                <p className="font-body-sm text-xs text-on-surface-variant">Table reservation for 2</p>
              </div>
            </div>

            {/* Stop 4 */}
            <div className="relative flex items-start gap-4">
              <div className="w-3.5 h-3.5 rounded-full bg-surface-container-highest -ml-5 mt-1.5 z-10 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-outline"></div>
              </div>
              <div className="flex-1 bg-surface-container-lowest/80 p-4 rounded-xl shadow-2xs border border-outline-variant/20">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-on-surface">15:00</span>
                  <span className="text-outline font-medium">Confirmed</span>
                </div>
                <p className="font-bold text-sm text-on-surface mt-1">Seine Architectural Cruise</p>
                <p className="font-body-sm text-xs text-on-surface-variant">
                  Pont Neuf Pier · Boarding passes issued
                </p>
              </div>
            </div>

            {/* Stop 5 */}
            <div className="relative flex items-start gap-4">
              <div className="w-3.5 h-3.5 rounded-full bg-surface-container-highest -ml-5 mt-1.5 z-10 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-outline"></div>
              </div>
              <div className="flex-1 bg-surface-container-lowest/80 p-4 rounded-xl shadow-2xs border border-outline-variant/20">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-on-surface">19:30</span>
                  <span className="text-outline font-medium">Confirmed</span>
                </div>
                <p className="font-bold text-sm text-on-surface mt-1">Dinner at Le Christine</p>
                <p className="font-body-sm text-xs text-on-surface-variant">
                  Michelin Guide Selection · Confirmed
                </p>
              </div>
            </div>
          </div>

          <div className="mt-auto pt-3 border-t border-outline-variant/20 text-on-surface-variant font-body-sm text-xs">
            Original route spanned 4.2 km total walking distance with scheduled river crossing queues.
          </div>
        </div>

        {/* ================= RIGHT COLUMN: Adapted Itinerary ================= */}
        <div className="bg-surface-container-lowest rounded-3xl p-6 sm:p-8 flex flex-col gap-6 shadow-md border border-secondary/30 relative overflow-hidden">
          {/* Top accent highlight ribbon */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-secondary"></div>

          <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-secondary"></span>
              <h2 className="font-headline-md text-xl font-bold text-on-surface">
                Adapted Itinerary
              </h2>
            </div>
            <span className="px-3 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-sm text-xs font-bold flex items-center gap-1 shadow-xs">
              <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
              Harmonized &amp; Active
            </span>
          </div>

          {/* Timeline Schedule Items */}
          <div className="flex flex-col gap-4 relative pl-5">
            <div className="absolute left-1.5 top-3 bottom-4 w-[1.5px] bg-secondary/40"></div>

            {/* Stop 1 */}
            <div className="relative flex items-start gap-4">
              <div className="w-3.5 h-3.5 rounded-full bg-surface-container -ml-5 mt-1.5 z-10 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-secondary"></div>
              </div>
              <div className="flex-1 bg-surface-container-low/50 p-4 rounded-xl shadow-2xs border border-outline-variant/20">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-secondary">09:15</span>
                  <span className="text-on-surface-variant font-medium">Maintained</span>
                </div>
                <p className="font-bold text-sm text-on-surface mt-1">Café de Flore</p>
                <p className="font-body-sm text-xs text-on-surface-variant">
                  Saint-Germain-des-Prés · Breakfast &amp; Espresso
                </p>
              </div>
            </div>

            {/* Stop 2: Replaced Orsay Hero Card */}
            <div className="relative flex items-start gap-4">
              <div className="w-3.5 h-3.5 rounded-full bg-secondary -ml-5 mt-1.5 z-10 flex items-center justify-center shadow-xs">
                <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
              </div>
              <div className="flex-1 bg-secondary-fixed/30 p-4 sm:p-5 rounded-2xl shadow-xs border border-secondary/40">
                <div className="flex flex-wrap items-center justify-between gap-1">
                  <span className="font-bold text-secondary text-xs sm:text-sm">
                    10:45 – 13:00
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-secondary text-on-secondary font-label-sm text-[11px] font-bold">
                    Suggested replacement · {formatCost(1900)}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 mt-3 items-start">
                  <div className="w-full sm:w-24 h-20 rounded-xl overflow-hidden shrink-0 bg-surface-container shadow-2xs">
                    <img
                      src="https://images.unsplash.com/photo-1597935258735-e254c183921e?auto=format&fit=crop&w=400&q=80"
                      alt="Musée d'Orsay"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col justify-center">
                    <p className="font-headline-sm text-base font-bold text-on-surface">
                      Musée d'Orsay
                    </p>
                    <p className="font-body-sm text-xs text-on-surface-variant leading-relaxed mt-1">
                      Impressionist Masterpieces &amp; Sculptures. Left Bank alignment eliminates transit friction.
                    </p>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-secondary/20 flex items-center justify-between text-xs font-label-sm text-secondary">
                  <span className="flex items-center gap-1 font-semibold">
                    <span className="material-symbols-outlined text-[16px]">footprint</span>
                    12 min walk from café
                  </span>
                  <span className="font-bold">{formatCost(1900)} (was {formatCost(2200)})</span>
                </div>
              </div>
            </div>

            {/* Stop 3 */}
            <div className="relative flex items-start gap-4">
              <div className="w-3.5 h-3.5 rounded-full bg-surface-container -ml-5 mt-1.5 z-10 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-secondary"></div>
              </div>
              <div className="flex-1 bg-surface-container-low/50 p-4 rounded-xl shadow-2xs border border-outline-variant/20">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-secondary">13:15</span>
                  <span className="text-secondary font-medium">Maintained (+5 min buffer)</span>
                </div>
                <p className="font-bold text-sm text-on-surface mt-1">Lunch at Tuileries Bistro</p>
                <p className="font-body-sm text-xs text-on-surface-variant">
                  Passerelle Léopold-Sédar-Senghor direct bridge crossing
                </p>
              </div>
            </div>

            {/* Stop 4 */}
            <div className="relative flex items-start gap-4">
              <div className="w-3.5 h-3.5 rounded-full bg-surface-container -ml-5 mt-1.5 z-10 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-secondary"></div>
              </div>
              <div className="flex-1 bg-surface-container-low/50 p-4 rounded-xl shadow-2xs border border-outline-variant/20">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-secondary">15:00</span>
                  <span className="text-on-surface-variant font-medium">Maintained</span>
                </div>
                <p className="font-bold text-sm text-on-surface mt-1">Seine Architectural Cruise</p>
                <p className="font-body-sm text-xs text-on-surface-variant">
                  Pont Neuf Pier · Boarding passes preserved intact
                </p>
              </div>
            </div>

            {/* Stop 5 */}
            <div className="relative flex items-start gap-4">
              <div className="w-3.5 h-3.5 rounded-full bg-surface-container -ml-5 mt-1.5 z-10 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-secondary"></div>
              </div>
              <div className="flex-1 bg-surface-container-low/50 p-4 rounded-xl shadow-2xs border border-outline-variant/20">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-secondary">19:30</span>
                  <span className="text-on-surface-variant font-medium">Maintained</span>
                </div>
                <p className="font-bold text-sm text-on-surface mt-1">Dinner at Le Christine</p>
                <p className="font-body-sm text-xs text-on-surface-variant">
                  Dinner reservations protected
                </p>
              </div>
            </div>
          </div>

          <div className="mt-auto pt-3 border-t border-outline-variant/20 flex items-center gap-1.5 text-on-surface-variant font-body-sm text-xs">
            <span className="material-symbols-outlined text-[16px] text-secondary">verified</span>
            <span>Zero changes required for transportation tickets or dining bookings.</span>
          </div>
        </div>
      </section>

      {/* Change Summary 4-Card Grid */}
      <section className="mb-8 bg-surface-container-lowest rounded-3xl p-6 sm:p-8 shadow-xs border border-outline-variant/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-3 border-b border-outline-variant/20">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed">
              <span className="material-symbols-outlined text-[20px]">fact_check</span>
            </div>
            <div>
              <h3 className="font-headline-sm text-lg font-bold text-on-surface">
                Change Summary
              </h3>
              <p className="font-body-sm text-xs text-on-surface-variant">
                Key itinerary adjustments computed autonomously
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-xs font-semibold self-start sm:self-auto">
            Autonomous Feasibility Verified
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-surface-container-low border border-outline-variant/20">
            <span className="material-symbols-outlined text-secondary text-[20px] mt-0.5">
              check_circle
            </span>
            <div>
              <p className="font-label-md text-xs font-bold text-on-surface">1 Activity Replaced</p>
              <p className="font-body-sm text-xs text-on-surface-variant mt-0.5">
                Louvre Museum → Musée d'Orsay
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-surface-container-low border border-outline-variant/20">
            <span className="material-symbols-outlined text-secondary text-[20px] mt-0.5">
              check_circle
            </span>
            <div>
              <p className="font-label-md text-xs font-bold text-on-surface">No Conflicts Detected</p>
              <p className="font-body-sm text-xs text-on-surface-variant mt-0.5">
                All reservations aligned smoothly
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-surface-container-low border border-outline-variant/20">
            <span className="material-symbols-outlined text-secondary text-[20px] mt-0.5">
              check_circle
            </span>
            <div>
              <p className="font-label-md text-xs font-bold text-on-surface">Travel Time Checked</p>
              <p className="font-body-sm text-xs text-on-surface-variant mt-0.5">
                Walking reduced by 600m
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-surface-container-low border border-outline-variant/20">
            <span className="material-symbols-outlined text-secondary text-[20px] mt-0.5">
              check_circle
            </span>
            <div>
              <p className="font-label-md text-xs font-bold text-on-surface">Budget Recalculated</p>
              <p className="font-body-sm text-xs text-on-surface-variant mt-0.5">
                {formatCost(300)} estimated savings
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Summary Strip: 3 Key Metric Highlight Cards */}
      <section className="bg-surface-container-low rounded-3xl p-6 sm:p-8 shadow-xs border border-outline-variant/30 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Metric 1 */}
          <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-2xs border border-outline-variant/20 flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface shrink-0">
              <span className="material-symbols-outlined text-[20px]">schedule</span>
            </div>
            <div className="flex flex-col">
              <span className="font-label-sm text-xs text-on-surface-variant uppercase tracking-wider font-semibold">
                Timing
              </span>
              <span className="font-headline-sm text-lg font-bold text-on-surface mt-0.5">
                Zero Overlap
              </span>
              <p className="font-body-sm text-xs text-on-surface-variant mt-1">
                Zero overlap, perfect walking pacing
              </p>
            </div>
          </div>

          {/* Metric 2 */}
          <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-2xs border border-outline-variant/20 flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed shrink-0">
              <span className="material-symbols-outlined text-[20px]">directions_walk</span>
            </div>
            <div className="flex flex-col">
              <span className="font-label-sm text-xs text-on-surface-variant uppercase tracking-wider font-semibold">
                Transit
              </span>
              <span className="font-headline-sm text-lg font-bold text-on-surface mt-0.5">
                600m Less Walking
              </span>
              <p className="font-body-sm text-xs text-on-surface-variant mt-1">
                Walking reduced by 600m across river footbridge
              </p>
            </div>
          </div>

          {/* Metric 3 */}
          <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-2xs border border-outline-variant/20 flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-secondary shrink-0">
              <span className="material-symbols-outlined text-[20px]">savings</span>
            </div>
            <div className="flex flex-col">
              <span className="font-label-sm text-xs text-on-surface-variant uppercase tracking-wider font-semibold">
                Budget
              </span>
              <span className="font-headline-sm text-lg font-bold text-on-surface mt-0.5">
                {formatCost(300)} Saved
              </span>
              <p className="font-body-sm text-xs text-on-surface-variant mt-1">
                Total Day 1 spend reduced from {formatCost(11300)} to {formatCost(11000)}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pinned Editorial CTA Bar */}
      <section className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <button
          type="button"
          onClick={onRevert}
          className="text-on-surface-variant hover:text-on-surface font-label-md text-sm inline-flex items-center gap-2 transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">assistant</span>
          <span>Need to adjust further? Ask TravelPilot</span>
        </button>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleCommit}
            className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-primary text-on-primary hover:bg-neutral-800 transition-all font-label-md text-sm font-semibold shadow-md flex items-center justify-center gap-2 group cursor-pointer"
          >
            <span>View Updated Itinerary</span>
            <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">
              arrow_forward
            </span>
          </button>
        </div>
      </section>

      {/* Feedback Toast */}
      {toastVisible && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3 rounded-full bg-primary text-on-primary shadow-xl animate-bounce">
          <span className="material-symbols-outlined text-secondary">check_circle</span>
          <span className="font-label-md text-sm">Schedule updated seamlessly!</span>
        </div>
      )}
    </div>
  );
};
