import React, { useState } from 'react';
import { Alternative, Currency } from '../types/trip';

interface DisruptionPageProps {
  alternatives: Alternative[];
  currency: Currency;
  onPreviewAlternative: (alt: Alternative) => void;
  onApplyAlternative: (alt: Alternative) => void;
  onBackToDashboard: () => void;
}

export const DisruptionPage: React.FC<DisruptionPageProps> = ({
  alternatives,
  currency,
  onPreviewAlternative,
  onApplyAlternative,
  onBackToDashboard,
}) => {
  const [showOtherOptions, setShowOtherOptions] = useState(true);

  const formatCost = (val: number) => {
    if (currency === 'EUR') {
      return `€${Math.round(val / 90).toLocaleString()}`;
    }
    return `₹${val.toLocaleString()}`;
  };

  const selectionReasons: string[] = [
    'Fits your art & history interests',
    'Fits the 10:45 – 13:00 available time',
    'No scheduling conflicts with lunch',
    'Short 5-minute walk across the river footbridge',
    'Reduces Day 1 budget by ₹300',
  ];

  const primaryAlt: Alternative = alternatives[0] || {
    id: 'alt_001_orsay',
    activity_id: 'act_002_louvre',
    name: "Musée d'Orsay",
    description: "Impressionist & Post-Impressionist masterpieces housed in a grand Beaux-Arts railway station.",
    type: 'museum',
    location: "1 Rue de la Légion d'Honneur, 75007 Paris",
    start_time: '10:45',
    end_time: '13:00',
    duration_minutes: 135,
    estimated_cost: 1900,
    currency: currency,
    match_score: 98,
    cost_difference: -300,
    travel_time_difference: -5,
    verification_source: 'Tavily Verified Open',
    operating_hours: '09:30 - 18:00',
    transit_notes: '5 min walk from Tuileries',
    tags: ['Art & Museums', 'Impressionism', 'Walkable'],
    image_url: 'https://images.unsplash.com/photo-1597935258735-e254c183921e?auto=format&fit=crop&w=1000&q=80',
  };

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
              Simulated disruption: Louvre Museum is unavailable. TravelPilot found an alternative that fits your schedule, interests, and budget.
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
                Venue Closure
              </span>
            </div>

            <div className="space-y-1">
              <div className="text-sm font-label-md text-outline line-through">
                Louvre Museum (Main Courtyard)
              </div>
              <div className="font-headline-sm text-xl font-bold text-on-surface">
                10:30 – 13:00 Slot
              </div>
              <p className="font-body-sm text-xs text-on-surface-variant leading-relaxed">
                Unscheduled administrative closure. Your schedule opened up 2h 30m in the 1st Arrondissement.
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
                    {formatCost(2200)} estimated cost removed
                  </div>
                  <div className="font-body-sm text-[11px] text-outline">
                    Original admission fee refunded
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
                <div className="w-[20%] bg-surface-container-high text-on-surface-variant flex items-center justify-center">
                  09:00
                </div>
                <div className="w-[45%] bg-error-container text-on-error-container flex items-center justify-center gap-1 font-semibold">
                  <span className="material-symbols-outlined text-[14px]">block</span> Free 2h 30m
                </div>
                <div className="w-[35%] bg-surface-container-high text-on-surface-variant flex items-center justify-center">
                  13:15 Lunch
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
              <div className="flex items-start gap-2.5">
                <div className="w-2 h-2 rounded-full bg-secondary mt-1.5 shrink-0"></div>
                <div>
                  <div className="font-semibold text-on-surface">Tuileries Lunch (13:15)</div>
                  <div className="text-outline">Preserved · 0 min delay · No itinerary shift</div>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-2 h-2 rounded-full bg-secondary mt-1.5 shrink-0"></div>
                <div>
                  <div className="font-semibold text-on-surface">Seine Cruise (15:00)</div>
                  <div className="text-outline">Confirmed · Pont Neuf boarding slip verified</div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between bg-surface-container-low rounded-xl p-3 border border-outline-variant/20">
                <span className="text-on-surface-variant">Net contingency balance</span>
                <span className="font-headline-sm text-sm font-bold text-on-surface">
                  {formatCost(5600)}{' '}
                  <span className="text-secondary font-normal">(+{formatCost(300)})</span>
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
                src={primaryAlt.image_url || 'https://images.unsplash.com/photo-1597935258735-e254c183921e?auto=format&fit=crop&w=1000&q=80'}
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
                  Left Bank · 7th Arrondissement
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
                    <span className="material-symbols-outlined text-[16px]">palette</span>
                    Impressionist Masterpieces
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
                    Ticket Cost
                  </span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-headline-sm text-lg font-bold text-on-surface">
                      {formatCost(primaryAlt.estimated_cost)}
                    </span>
                    <span className="font-label-sm text-xs text-secondary font-medium">estimated</span>
                  </div>
                  <div className="font-body-sm text-xs text-outline">
                    {formatCost(300)} lower than Louvre
                  </div>
                </div>

                <div className="bg-surface-container-low p-4 rounded-2xl space-y-1 border border-outline-variant/20">
                  <span className="font-label-sm text-xs text-outline uppercase tracking-wider font-semibold">
                    Transit Harmony
                  </span>
                  <div className="font-headline-sm text-lg font-semibold text-on-surface">
                    5 min walk
                  </div>
                  <div className="font-body-sm text-xs text-outline">from Tuileries</div>
                </div>

                <div className="bg-surface-container-low p-4 rounded-2xl space-y-1 border border-outline-variant/20">
                  <span className="font-label-sm text-xs text-outline uppercase tracking-wider font-semibold">
                    Wait Time Estimate
                  </span>
                  <div className="font-headline-sm text-lg font-semibold text-on-surface">
                    Typical: ~10 mins
                  </div>
                  <div className="font-body-sm text-xs text-outline">Standard queue estimate</div>
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
                      Footbridge Crossing Route
                    </div>
                    <div className="font-body-sm text-xs text-on-surface-variant">
                      Musée d'Orsay ➔ Passerelle Footbridge ➔ Tuileries Gardens
                    </div>
                  </div>
                </div>
                <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-surface-container-lowest text-on-surface font-label-sm text-xs shadow-2xs">
                  <span className="material-symbols-outlined text-secondary text-[14px]">park</span>
                  <span>Scenic riverside path</span>
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
          {showOtherOptions && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
              {/* Option B: Musée de l'Orangerie */}
              <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-xs border border-outline-variant/30 flex flex-col justify-between gap-4 group hover:shadow-md transition-all">
                <div className="space-y-3">
                  <div className="relative h-40 rounded-xl overflow-hidden bg-surface-container">
                    <img
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      src="https://images.unsplash.com/photo-1549144511-f099e773c147?auto=format&fit=crop&w=600&q=80"
                      alt="Musée de l'Orangerie"
                    />
                    <span className="absolute top-2 right-2 px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white font-label-sm text-xs font-semibold">
                      92% Match
                    </span>
                  </div>
                  <div>
                    <div className="font-label-sm text-xs text-outline">Option B · Direct in Tuileries</div>
                    <div className="font-headline-sm text-base font-bold text-on-surface mt-0.5">
                      Musée de l'Orangerie
                    </div>
                    <p className="font-body-sm text-xs text-on-surface-variant pt-1 leading-relaxed">
                      Monet's Water Lilies murals in naturally lit oval sanctuaries. Direct walk to lunch venue.
                    </p>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-outline-variant/20">
                  <div className="flex items-center justify-between text-xs font-label-sm">
                    <span className="text-outline">11:00 – 12:45</span>
                    <span className="font-bold text-on-surface">{formatCost(1650)}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      onApplyAlternative(
                        alternatives[1] || {
                          id: 'alt_002_orangerie',
                          activity_id: 'act_002_louvre',
                          name: "Musée de l'Orangerie",
                          description: "Monet Water Lilies",
                          start_time: '11:00',
                          end_time: '12:45',
                          estimated_cost: 1650,
                          category: 'Museum',
                          match_score: 92,
                        }
                      )
                    }
                    className="w-full py-2 rounded-full bg-surface-container-low hover:bg-surface-container text-on-surface font-label-sm text-xs font-semibold transition-colors border border-outline-variant/30 cursor-pointer"
                  >
                    Select L'Orangerie
                  </button>
                </div>
              </div>

              {/* Option C: Centre Pompidou */}
              <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-xs border border-outline-variant/30 flex flex-col justify-between gap-4 group hover:shadow-md transition-all">
                <div className="space-y-3">
                  <div className="relative h-40 rounded-xl overflow-hidden bg-surface-container">
                    <img
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      src="https://images.unsplash.com/photo-1509299349698-dd22323b5963?auto=format&fit=crop&w=600&q=80"
                      alt="Centre Pompidou"
                    />
                    <span className="absolute top-2 right-2 px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white font-label-sm text-xs font-semibold">
                      84% Match
                    </span>
                  </div>
                  <div>
                    <div className="font-label-sm text-xs text-outline">Option C · Modern &amp; Contemporary</div>
                    <div className="font-headline-sm text-base font-bold text-on-surface mt-0.5">
                      Centre Pompidou
                    </div>
                    <p className="font-body-sm text-xs text-on-surface-variant pt-1 leading-relaxed">
                      Modern art masters &amp; sweeping panoramic rooftop vistas. Requires short 12m Metro line 1.
                    </p>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-outline-variant/20">
                  <div className="flex items-center justify-between text-xs font-label-sm">
                    <span className="text-outline">10:30 – 12:30</span>
                    <span className="font-bold text-on-surface">{formatCost(1800)}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      onApplyAlternative(
                        alternatives[2] || {
                          id: 'alt_003_pompidou',
                          activity_id: 'act_002_louvre',
                          name: 'Centre Pompidou',
                          description: 'Modern art masters',
                          start_time: '10:30',
                          end_time: '12:30',
                          estimated_cost: 1800,
                          category: 'Museum',
                          match_score: 84,
                        }
                      )
                    }
                    className="w-full py-2 rounded-full bg-surface-container-low hover:bg-surface-container text-on-surface font-label-sm text-xs font-semibold transition-colors border border-outline-variant/30 cursor-pointer"
                  >
                    Select Pompidou
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
