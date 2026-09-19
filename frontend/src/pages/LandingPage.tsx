import React from 'react';

interface LandingPageProps {
  onPlanTrip: () => void;
  onExploreDemo: () => void;
  onTriggerDisruption: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onPlanTrip,
  onExploreDemo,
  onTriggerDisruption,
}) => {
  return (
    <div className="flex flex-col w-full pb-16">
      {/* Editorial Hero Section */}
      <section className="relative w-full max-w-[1320px] mx-auto px-margin-mobile md:px-margin pt-10 pb-16">
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-12">
          {/* Trust Marker Pill */}
          <div className="inline-flex items-center gap-space-xs px-space-md py-space-xs rounded-full bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm mb-6 border border-outline-variant/30 shadow-xs">
            <div className="flex -space-x-2 mr-1">
              <img
                className="w-5 h-5 rounded-full object-cover ring-2 ring-surface"
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80"
                alt="Traveler"
              />
              <img
                className="w-5 h-5 rounded-full object-cover ring-2 ring-surface"
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&q=80"
                alt="Traveler"
              />
              <img
                className="w-5 h-5 rounded-full object-cover ring-2 ring-surface"
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&q=80"
                alt="Traveler"
              />
            </div>
            <span>Over 14,000 calm days orchestrated across 42 countries</span>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl text-on-surface font-extrabold tracking-tight leading-tight mb-6">
            Plan your entire trip with AI.
          </h1>

          <p className="font-body-lg text-lg sm:text-xl text-on-surface-variant max-w-2xl leading-relaxed mb-8">
            TravelPilot builds a personalized, connected itinerary in seconds — and seamlessly adapts when plans change.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-space-md">
            <button
              type="button"
              onClick={onPlanTrip}
              className="inline-flex items-center justify-center gap-space-xs px-space-xl py-3.5 rounded-full bg-primary text-on-primary font-label-md text-base font-semibold hover:bg-neutral-800 active:scale-98 transition-all shadow-md group cursor-pointer"
            >
              <span>Plan My Trip</span>
              <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">
                arrow_forward
              </span>
            </button>

            <button
              type="button"
              onClick={onExploreDemo}
              className="inline-flex items-center justify-center gap-space-xs px-space-lg py-3.5 rounded-full bg-surface-container-low text-on-surface hover:bg-surface-container font-label-md text-base font-medium transition-all border border-outline-variant/30 cursor-pointer"
            >
              <span>See How It Works</span>
              <span className="material-symbols-outlined text-[18px] text-secondary">
                play_circle
              </span>
            </button>
          </div>
        </div>

        {/* Hero Visual Anchor: Editorial Trip Showcase Card */}
        <div className="relative w-full max-w-4xl mx-auto">
          <div className="bg-surface-container-lowest rounded-2xl shadow-xl border border-outline-variant/30 p-space-lg md:p-space-xl">
            {/* Card Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm pb-space-lg border-b border-outline-variant/20">
              <div>
                <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary font-bold">
                  Sample Signature Itinerary
                </span>
                <h3 className="font-headline-md text-2xl font-bold text-on-surface mt-0.5">
                  Spring Reverie · Paris, France · 5 Days
                </h3>
              </div>
              <div className="inline-flex items-center gap-2 px-space-md py-space-xs rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm self-start sm:self-auto">
                <span className="w-2 h-2 rounded-full bg-secondary"></span>
                <span>Day 1 of 5 · Left Bank Heart</span>
              </div>
            </div>

            {/* Micro Itinerary Timeline */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md pt-space-lg">
              {/* Activity 1 */}
              <div className="bg-surface-container-low/60 rounded-xl p-space-md flex flex-col justify-between">
                <div>
                  <span className="font-label-sm text-label-sm text-secondary font-semibold">
                    09:15 · Breakfast
                  </span>
                  <h4 className="font-headline-sm text-base font-bold text-on-surface mt-1">
                    Café de Flore
                  </h4>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                    Espresso and warm croissants at the classic Saint-Germain terrace.
                  </p>
                </div>
                <div className="pt-3 mt-3 border-t border-outline-variant/20 flex items-center justify-between text-on-surface-variant font-label-sm text-xs">
                  <span>₹1,620 est.</span>
                  <span>12 min walk to Orsay</span>
                </div>
              </div>

              {/* Activity 2 with Photo */}
              <div className="bg-surface-container-low/60 rounded-xl p-space-md flex flex-col justify-between ring-1 ring-secondary/20">
                <div>
                  <span className="font-label-sm text-label-sm text-secondary font-bold">
                    10:45 · Museum
                  </span>
                  <h4 className="font-headline-sm text-base font-bold text-on-surface mt-1">
                    Musée d'Orsay
                  </h4>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                    Timed entry for Impressionist masterpieces under the grand vaulted ceiling.
                  </p>
                </div>
                <div className="pt-3 mt-3 border-t border-outline-variant/20 flex items-center justify-between text-on-surface-variant font-label-sm text-xs">
                  <span className="text-secondary font-semibold">₹1,900 ticket</span>
                  <span>Direct bridge route</span>
                </div>
              </div>

              {/* Activity 3 */}
              <div className="bg-surface-container-low/60 rounded-xl p-space-md flex flex-col justify-between">
                <div>
                  <span className="font-label-sm text-label-sm text-secondary font-semibold">
                    13:15 · Lunch
                  </span>
                  <h4 className="font-headline-sm text-base font-bold text-on-surface mt-1">
                    Tuileries Bistro
                  </h4>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                    Relaxed bistro lunch overlooking the gardens before afternoon promenade.
                  </p>
                </div>
                <div className="pt-3 mt-3 border-t border-outline-variant/20 flex items-center justify-between text-on-surface-variant font-label-sm text-xs">
                  <span>₹2,400 est.</span>
                  <span>Protected table</span>
                </div>
              </div>
            </div>

            {/* Floating Adaptive Buffer Active Badge */}
            <div className="mt-space-lg pt-space-md flex flex-wrap items-center justify-between gap-space-sm bg-surface-container-low/80 rounded-xl p-space-sm px-space-md border border-outline-variant/20">
              <div className="flex items-center gap-space-xs text-secondary font-label-sm text-label-sm">
                <span className="material-symbols-outlined text-[18px]">verified_user</span>
                <span className="font-semibold">Adaptive Buffer Active</span>
                <span className="text-on-surface-variant hidden sm:inline">
                  — 15 min walking buffer preserved between stops
                </span>
              </div>
              <button
                type="button"
                onClick={onTriggerDisruption}
                className="text-xs font-semibold text-error hover:underline flex items-center gap-1"
              >
                <span>Test disruption recovery</span>
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Editorial Curated Philosophy (3 Vignettes) */}
      <section className="w-full max-w-[1320px] mx-auto px-margin-mobile md:px-margin py-12">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary font-bold">
            Orchestration In Motion
          </span>
          <h2 className="font-headline-lg text-3xl sm:text-4xl text-on-surface font-bold mt-2">
            Curated travel, orchestrated with quiet precision
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-space-lg">
          {/* Card 1 */}
          <div className="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm border border-outline-variant/20 flex flex-col">
            <div className="h-48 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=600&q=80"
                alt="Paris morning café"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="p-space-lg flex-1 flex flex-col justify-between">
              <div>
                <span className="font-label-sm text-label-sm text-secondary font-semibold uppercase">
                  Morning Rhythm
                </span>
                <h3 className="font-headline-sm text-xl font-bold text-on-surface mt-1">
                  Morning Calm
                </h3>
                <p className="font-body-md text-body-md text-on-surface-variant mt-2 leading-relaxed">
                  Never rush through breakfast. TravelPilot calculates realistic travel buffers so you start every day at ease.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-outline-variant/20 text-on-surface-variant font-label-sm text-xs">
                Zero rushed departures
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm border border-outline-variant/20 flex flex-col">
            <div className="h-48 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=600&q=80"
                alt="Museum architectural interior"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="p-space-lg flex-1 flex flex-col justify-between">
              <div>
                <span className="font-label-sm text-label-sm text-secondary font-semibold uppercase">
                  Curated Itinerary
                </span>
                <h3 className="font-headline-sm text-xl font-bold text-on-surface mt-1">
                  High Culture &amp; Heritage
                </h3>
                <p className="font-body-md text-body-md text-on-surface-variant mt-2 leading-relaxed">
                  Priority cultural attractions clustered geographically to maximize time enjoying exhibits rather than navigating transit.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-outline-variant/20 text-on-surface-variant font-label-sm text-xs">
                Neighborhood clustering
              </div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm border border-outline-variant/20 flex flex-col">
            <div className="h-48 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&w=600&q=80"
                alt="Golden hour Seine cruise"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="p-space-lg flex-1 flex flex-col justify-between">
              <div>
                <span className="font-label-sm text-label-sm text-secondary font-semibold uppercase">
                  Evening Splendor
                </span>
                <h3 className="font-headline-sm text-xl font-bold text-on-surface mt-1">
                  Golden Twilight
                </h3>
                <p className="font-body-md text-body-md text-on-surface-variant mt-2 leading-relaxed">
                  Seine riverboat cruises and candlelit bistros with reservations aligned naturally to sunset and opening hours.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-outline-variant/20 text-on-surface-variant font-label-sm text-xs">
                Sunset alignment
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Editorial Step Guide */}
      <section className="w-full max-w-[1320px] mx-auto px-margin-mobile md:px-margin py-12">
        <div className="bg-surface-container-low rounded-2xl p-space-lg md:p-space-xl">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary font-bold">
              Autonomous Intelligence
            </span>
            <h3 className="font-headline-lg text-2xl sm:text-3xl font-bold text-on-surface mt-2">
              Three steps to seamless travel
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-space-lg">
            <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-xs">
              <span className="font-label-sm text-xs text-secondary font-bold">01</span>
              <h4 className="font-headline-sm text-lg font-bold text-on-surface mt-1">
                Describe your journey
              </h4>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-2">
                Share your destination, dates, budget, and travel style. No overwhelming surveys.
              </p>
            </div>

            <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-xs">
              <span className="font-label-sm text-xs text-secondary font-bold">02</span>
              <h4 className="font-headline-sm text-lg font-bold text-on-surface mt-1">
                Synthesize the rhythm
              </h4>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-2">
                TravelPilot connects verified operating hours, travel times, and sensible cost distributions.
              </p>
            </div>

            <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-xs">
              <span className="font-label-sm text-xs text-secondary font-bold">03</span>
              <h4 className="font-headline-sm text-lg font-bold text-on-surface mt-1">
                Adapt when life shifts
              </h4>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-2">
                Closures or rain? The agent evaluates alternatives that preserve your downstream bookings with zero effort.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA Section */}
      <section className="w-full max-w-[1320px] mx-auto px-margin-mobile md:px-margin pt-6">
        <div className="bg-primary text-on-primary rounded-3xl p-space-xl text-center flex flex-col items-center">
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold max-w-xl leading-tight">
            Ready to experience calm, intelligent travel?
          </h2>
          <p className="font-body-lg text-neutral-300 max-w-lg mt-3">
            Build your signature itinerary in seconds. Free for Paris and European destinations during the MVP.
          </p>
          <button
            type="button"
            onClick={onPlanTrip}
            className="mt-8 px-space-xl py-3.5 rounded-full bg-surface-container-lowest text-primary font-label-md text-base font-bold hover:bg-surface transition-all shadow-lg cursor-pointer"
          >
            Start Planning Free
          </button>
        </div>
      </section>
    </div>
  );
};
