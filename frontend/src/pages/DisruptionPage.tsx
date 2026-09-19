import React, { useState } from 'react';
import { Alternative, Currency, Trip } from '../types/trip';

interface DisruptionPageProps {
  alternatives: Alternative[];
  currency: Currency;
  onPreviewAlternative: (alt: Alternative) => void;
  onApplyAlternative: (alt: Alternative) => void;
  onBackToDashboard: () => void;
  trip?: Trip;
}

export const DisruptionPage: React.FC<DisruptionPageProps> = ({
  alternatives,
  currency,
  onPreviewAlternative,
  onApplyAlternative,
  onBackToDashboard,
  trip,
}) => {
  const [showOtherOptions, setShowOtherOptions] = useState(true);

  const destination = trip?.destination || 'Curated Destination';
  const cityName = destination.split(',')[0].trim();
  const disruptedAct = trip?.itinerary?.days
    ?.flatMap((d) => d.activities)
    ?.find((a) => a.status === 'disrupted') || trip?.itinerary?.days?.[0]?.activities?.[0];
  const disruptedName = disruptedAct?.name || 'Scheduled Activity';
  const disruptedSlot = disruptedAct ? `${disruptedAct.start_time} – ${disruptedAct.end_time} Slot` : 'Morning Slot';
  const disruptedLoc = disruptedAct?.location || destination;
  const disruptedCost = disruptedAct?.estimated_cost || 1200;

  const day1Acts = trip?.itinerary?.days?.[0]?.activities || [];
  const nextActs = day1Acts.filter((a) => a.id !== disruptedAct?.id).slice(0, 2);

  const formatCost = (val: number) => {
    if (currency === 'EUR') {
      return `€${Math.round(val / 90).toLocaleString()}`;
    }
    return `₹${val.toLocaleString()}`;
  };

  const primaryAlt: Alternative = alternatives[0] || {
    id: 'alt_001_primary',
    activity_id: disruptedAct?.id || 'act_001',
    name: `${cityName} Cultural Center`,
    description: `Verified landmark alternative in ${cityName} with compatible timing.`,
    type: 'sightseeing',
    location: `${cityName} Central`,
    start_time: disruptedAct?.start_time || '10:30',
    end_time: disruptedAct?.end_time || '12:30',
    duration_minutes: 120,
    estimated_cost: Math.round(disruptedCost * 0.9),
    currency: currency,
    match_score: 98,
    cost_difference: -Math.round(disruptedCost * 0.1),
    travel_time_difference: 0,
    verification_source: 'TravelPilot Verified Open',
    operating_hours: '09:30 - 18:00',
    transit_notes: `Direct transit within ${cityName}`,
    tags: ['Culture', 'Sightseeing', 'Verified'],
    image_url: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=1000&q=80',
  };

  const altB: Alternative | undefined = alternatives[1];
  const altC: Alternative | undefined = alternatives[2];

  const selectionReasons: string[] = [
    `Fits your curated schedule for ${cityName}`,
    `Fits the ${disruptedSlot} available window`,
    'No scheduling conflicts with subsequent itinerary stops',
    `Preserves transit efficiency in ${cityName}`,
    `Budget impact: ${formatCost(primaryAlt.estimated_cost)}`,
  ];

  return (
    <div className="w-full max-w-[1320px] mx-auto px-margin-mobile md:px-margin py-8 pb-20">
      {/* Top Status Reassurance Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-surface-container-low p-6 sm:p-10 shadow-xs mb-8 border border-outline-variant/30">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-secondary-fixed text-on-secondary-fixed">
                <span className="material-symbols-outlined text-[16px]">auto_fix_high</span>
              </span>
              <span className="font-label-sm text-xs uppercase tracking-widest text-secondary font-bold">
                Day 1 · Schedule Adaptation
              </span>
            </div>
            <h1 className="font-headline-lg text-2xl sm:text-3xl lg:text-4xl text-on-surface font-bold tracking-tight leading-tight">
              Your plans changed. TravelPilot found an alternative.
            </h1>
            <p className="font-body-md text-sm sm:text-base text-on-surface-variant leading-relaxed">
              Simulated disruption: {disruptedName} is unavailable. TravelPilot found an alternative in {cityName} that fits your schedule, interests, and budget.
            </p>
          </div>

          <button
            type="button"
            onClick={onBackToDashboard}
            className="px-space-md py-2 rounded-full bg-surface-container text-on-surface hover:bg-surface-container-high text-xs sm:text-sm font-label-md font-semibold transition-all shrink-0 cursor-pointer"
          >
            Return to Itinerary
          </button>
        </div>
      </div>

      {/* Main Comparison Grid: Asymmetrical Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
        {/* LEFT COLUMN: What Changed (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-space-lg">
          {/* Cancelled Item Module */}
          <div className="bg-surface-container-lowest rounded-2xl p-5 sm:p-6 shadow-xs border border-outline-variant/30 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-xs text-outline tracking-wider uppercase font-semibold">
                What Changed
              </span>
              <span className="inline-flex items-center gap-1 font-label-sm text-xs px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-medium">
                <span className="material-symbols-outlined text-[14px]">event_busy</span>
                Venue Disruption
              </span>
            </div>

            <div className="space-y-1">
              <div className="text-sm font-label-md text-outline line-through">
                {disruptedName}
              </div>
              <div className="font-headline-sm text-xl font-bold text-on-surface">
                {disruptedSlot}
              </div>
              <p className="font-body-sm text-xs text-on-surface-variant leading-relaxed">
                Unscheduled temporary closure in {cityName}. Your schedule opened up an opportunity for a verified alternative.
              </p>
            </div>

            {/* Cost Removed Capsule */}
            <div className="rounded-xl bg-surface-container-low p-3.5 flex items-center justify-between border border-outline-variant/20">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-surface-container flex items-center justify-center text-on-surface">
                  <span className="material-symbols-outlined text-[16px]">payments</span>
                </div>
                <div>
                  <div className="font-label-md text-xs text-on-surface font-semibold">
                    {formatCost(disruptedCost)} estimated cost removed
                  </div>
                  <div className="font-body-sm text-[11px] text-outline">
                    {disruptedLoc}
                  </div>
                </div>
              </div>
              <span className="font-label-sm text-xs text-outline font-medium">Adjusted</span>
            </div>

            {/* Timeline Mini Graphic */}
            <div className="pt-1 space-y-1.5">
              <span className="font-label-sm text-[11px] text-outline uppercase tracking-wider font-semibold">
                Schedule Harmony
              </span>
              <div className="relative w-full h-8 bg-surface-container rounded-lg overflow-hidden flex text-xs font-label-sm font-medium">
                <div className="w-[25%] bg-surface-container-high text-on-surface-variant flex items-center justify-center">
                  09:30
                </div>
                <div className="w-[45%] bg-error-container text-on-error-container flex items-center justify-center gap-1 font-semibold">
                  <span className="material-symbols-outlined text-[14px]">block</span> Open Slot
                </div>
                <div className="w-[30%] bg-surface-container-high text-on-surface-variant flex items-center justify-center">
                  Next Stop
                </div>
              </div>
            </div>
          </div>

          {/* Day 1 Continuity Snapshot */}
          <div className="bg-surface-container-lowest rounded-2xl p-5 sm:p-6 shadow-xs border border-outline-variant/30 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-xs text-outline tracking-wider uppercase font-semibold">
                Day 1 Continuity
              </span>
              <span className="material-symbols-outlined text-secondary text-[20px]">
                check_circle
              </span>
            </div>

            <div className="space-y-3 text-xs font-body-sm">
              {nextActs.length > 0 ? (
                nextActs.map((act) => (
                  <div key={act.id} className="flex items-start gap-2.5">
                    <div className="w-2 h-2 rounded-full bg-secondary mt-1.5 shrink-0"></div>
                    <div>
                      <div className="font-semibold text-on-surface">{act.name} ({act.start_time})</div>
                      <div className="text-outline">Preserved · Verified timing in {cityName}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex items-start gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-secondary mt-1.5 shrink-0"></div>
                  <div>
                    <div className="font-semibold text-on-surface">Subsequent Itinerary Stops</div>
                    <div className="text-outline">Preserved · Zero conflict overlap</div>
                  </div>
                </div>
              )}

              <div className="pt-2 flex items-center justify-between bg-surface-container-low rounded-xl p-3 border border-outline-variant/20">
                <span className="text-on-surface-variant">Contingency budget status</span>
                <span className="font-headline-sm text-sm font-bold text-on-surface">
                  Healthy <span className="text-secondary font-normal">(Aligned)</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Recommended Replacement (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-space-lg">
          {/* High Craft Featured Replacement Card */}
          <div className="bg-surface-container-lowest rounded-3xl shadow-md border border-outline-variant/30 overflow-hidden flex flex-col">
            {/* Hero Image with integrated Match Badge */}
            <div className="relative w-full h-72 sm:h-80 overflow-hidden bg-surface-container">
              <img
                className="w-full h-full object-cover"
                src={primaryAlt.image_url || 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=1000&q=80'}
                alt={primaryAlt.name}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent"></div>

              {/* Floating Badges */}
              <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-lowest/95 backdrop-blur-md text-on-surface font-label-sm text-xs font-bold shadow-xs">
                  <span className="text-secondary font-bold">✦</span> Recommended Alternative · {primaryAlt.match_score || 98}% Match
                </span>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-black/50 backdrop-blur-md text-white font-label-sm text-xs">
                  <span className="material-symbols-outlined text-[14px]">schedule</span> Fits Available Slot
                </span>
              </div>

              {/* Overlaid Destination Info */}
              <div className="absolute bottom-5 left-6 right-6 text-white">
                <div className="font-label-sm text-xs tracking-widest uppercase text-white/80 font-medium">
                  {primaryAlt.location || `${cityName} District`}
                </div>
                <h2 className="font-headline-lg text-2xl sm:text-3xl text-white font-bold drop-shadow-sm mt-0.5">
                  {primaryAlt.name}
                </h2>
                <div className="flex items-center gap-3 pt-1 text-white/90 font-body-sm text-xs sm:text-sm">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">schedule</span>
                    {primaryAlt.start_time} – {primaryAlt.end_time}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">place</span>
                    {primaryAlt.subtitle || cityName}
                  </span>
                </div>
              </div>
            </div>

            {/* Card Body Details */}
            <div className="p-6 sm:p-8 space-y-6">
              {/* Highlights 3-Column Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-surface-container-low p-4 rounded-2xl space-y-1 border border-outline-variant/20">
                  <span className="font-label-sm text-xs text-outline uppercase tracking-wider font-semibold">
                    Estimated Cost
                  </span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-headline-sm text-lg font-bold text-on-surface">
                      {formatCost(primaryAlt.estimated_cost)}
                    </span>
                    <span className="font-label-sm text-xs text-secondary font-medium">estimated</span>
                  </div>
                  <div className="font-body-sm text-xs text-outline">
                    {formatCost(Math.abs(primaryAlt.cost_difference || 0))} {primaryAlt.cost_difference && primaryAlt.cost_difference < 0 ? 'saving' : 'adjusted'}
                  </div>
                </div>

                <div className="bg-surface-container-low p-4 rounded-2xl space-y-1 border border-outline-variant/20">
                  <span className="font-label-sm text-xs text-outline uppercase tracking-wider font-semibold">
                    Transit Harmony
                  </span>
                  <div className="font-headline-sm text-lg font-semibold text-on-surface">
                    Convenient
                  </div>
                  <div className="font-body-sm text-xs text-outline">Seamless connection</div>
                </div>

                <div className="bg-surface-container-low p-4 rounded-2xl space-y-1 border border-outline-variant/20">
                  <span className="font-label-sm text-xs text-outline uppercase tracking-wider font-semibold">
                    Verification
                  </span>
                  <div className="font-headline-sm text-lg font-semibold text-on-surface">
                    Verified
                  </div>
                  <div className="font-body-sm text-xs text-outline">Autonomous check passed</div>
                </div>
              </div>

              {/* Why TravelPilot Selected This */}
              <div className="space-y-2">
                <h3 className="font-label-md text-xs uppercase tracking-wider text-outline font-bold">
                  Why TravelPilot Selected This
                </h3>
                <ul className="space-y-2 text-sm font-body-md text-on-surface">
                  {selectionReasons.map((t, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-secondary text-[18px] shrink-0 mt-0.5">
                        check
                      </span>
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Transit Route Micro Visualizer */}
              <div className="bg-surface-container-low rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border border-outline-variant/20">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-surface-container-lowest flex items-center justify-center text-secondary shadow-2xs">
                    <span className="material-symbols-outlined text-[18px]">directions_walk</span>
                  </div>
                  <div>
                    <div className="font-label-md text-xs font-bold text-on-surface">
                      Connecting Route in {cityName}
                    </div>
                    <div className="font-body-sm text-xs text-on-surface-variant">
                      {primaryAlt.transit_notes || `${primaryAlt.name} ➔ Direct connection to next scheduled stop`}
                    </div>
                  </div>
                </div>
                <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-surface-container-lowest text-on-surface font-label-sm text-xs shadow-2xs">
                  <span className="material-symbols-outlined text-secondary text-[14px]">verified</span>
                  <span>Zero schedule overlap</span>
                </div>
              </div>

              {/* Primary Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3 justify-between">
                <div className="w-full sm:w-auto flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => onApplyAlternative(primaryAlt)}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-space-lg py-3 rounded-full bg-primary text-on-primary font-label-md text-sm font-semibold hover:bg-neutral-800 active:scale-98 transition-all shadow-md group cursor-pointer"
                  >
                    <span>Use This Instead</span>
                    <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">
                      arrow_forward
                    </span>
                  </button>

                  {(altB || altC) && (
                    <button
                      type="button"
                      onClick={() => setShowOtherOptions(!showOtherOptions)}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-space-md py-3 rounded-full bg-surface-container-low text-on-surface hover:bg-surface-container transition-all font-label-md text-sm border border-outline-variant/30 cursor-pointer"
                    >
                      <span>{showOtherOptions ? 'Hide Other Options' : 'See Other Options'}</span>
                      <span className="material-symbols-outlined text-[18px]">
                        {showOtherOptions ? 'expand_less' : 'expand_more'}
                      </span>
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => onPreviewAlternative(primaryAlt)}
                  className="text-on-surface-variant hover:text-on-surface font-label-sm text-xs flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px] text-secondary">tune</span>
                  <span>Preview Itinerary Diff</span>
                </button>
              </div>
            </div>
          </div>

          {/* Other Alternative Cards Grid */}
          {showOtherOptions && (altB || altC) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
              {/* Option B */}
              {altB && (
                <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-xs border border-outline-variant/30 flex flex-col justify-between gap-4 group hover:shadow-md transition-all">
                  <div className="space-y-3">
                    <div className="relative h-40 rounded-xl overflow-hidden bg-surface-container">
                      <img
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        src={altB.image_url || 'https://images.unsplash.com/photo-1549144511-f099e773c147?auto=format&fit=crop&w=600&q=80'}
                        alt={altB.name}
                      />
                      <span className="absolute top-2 right-2 px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white font-label-sm text-xs font-semibold">
                        {altB.match_score || 92}% Match
                      </span>
                    </div>
                    <div>
                      <div className="font-label-sm text-xs text-outline">Option B · {altB.location || cityName}</div>
                      <div className="font-headline-sm text-base font-bold text-on-surface mt-0.5">
                        {altB.name}
                      </div>
                      <p className="font-body-sm text-xs text-on-surface-variant pt-1 leading-relaxed">
                        {altB.description || `Alternative sightseeing option in ${cityName}.`}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-outline-variant/20">
                    <div className="flex items-center justify-between text-xs font-label-sm">
                      <span className="text-outline">{altB.start_time || '11:00'} – {altB.end_time || '12:45'}</span>
                      <span className="font-bold text-on-surface">{formatCost(altB.estimated_cost)}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => onApplyAlternative(altB)}
                      className="w-full py-2 rounded-full bg-surface-container-low hover:bg-surface-container text-on-surface font-label-sm text-xs font-semibold transition-colors border border-outline-variant/30 cursor-pointer"
                    >
                      Select {altB.name}
                    </button>
                  </div>
                </div>
              )}

              {/* Option C */}
              {altC && (
                <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-xs border border-outline-variant/30 flex flex-col justify-between gap-4 group hover:shadow-md transition-all">
                  <div className="space-y-3">
                    <div className="relative h-40 rounded-xl overflow-hidden bg-surface-container">
                      <img
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        src={altC.image_url || 'https://images.unsplash.com/photo-1509299349698-dd22323b5963?auto=format&fit=crop&w=600&q=80'}
                        alt={altC.name}
                      />
                      <span className="absolute top-2 right-2 px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white font-label-sm text-xs font-semibold">
                        {altC.match_score || 85}% Match
                      </span>
                    </div>
                    <div>
                      <div className="font-label-sm text-xs text-outline">Option C · {altC.location || cityName}</div>
                      <div className="font-headline-sm text-base font-bold text-on-surface mt-0.5">
                        {altC.name}
                      </div>
                      <p className="font-body-sm text-xs text-on-surface-variant pt-1 leading-relaxed">
                        {altC.description || `Alternative sightseeing option in ${cityName}.`}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-outline-variant/20">
                    <div className="flex items-center justify-between text-xs font-label-sm">
                      <span className="text-outline">{altC.start_time || '10:30'} – {altC.end_time || '12:30'}</span>
                      <span className="font-bold text-on-surface">{formatCost(altC.estimated_cost)}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => onApplyAlternative(altC)}
                      className="w-full py-2 rounded-full bg-surface-container-low hover:bg-surface-container text-on-surface font-label-sm text-xs font-semibold transition-colors border border-outline-variant/30 cursor-pointer"
                    >
                      Select {altC.name}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
