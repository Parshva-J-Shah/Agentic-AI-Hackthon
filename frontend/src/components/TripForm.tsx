import React, { useState } from 'react';
import { TripConstraints, Currency } from '../types/trip';

interface TripFormProps {
  onSubmit: (constraints: TripConstraints) => void;
  isLoading?: boolean;
}

export const TripForm: React.FC<TripFormProps> = ({ onSubmit, isLoading = false }) => {
  const [destination, setDestination] = useState('Paris, France');
  const [startDate, setStartDate] = useState('2026-10-12');
  const [endDate, setEndDate] = useState('2026-10-16');
  const [budget, setBudget] = useState(50000);
  const [currency, setCurrency] = useState<Currency>('INR');
  const [interests, setInterests] = useState<string[]>([
    'Food & Dining',
    'History & Architecture',
    'Art & Museums',
    'Scenic Walks',
  ]);
  const [pace, setPace] = useState<'relaxed' | 'moderate' | 'intensive'>('moderate');

  const popularDestinations = ['Paris, France', 'Rome, Italy', 'Tokyo, Japan', 'Kyoto, Japan'];

  const availableInterests = [
    'Food & Dining',
    'History & Architecture',
    'Art & Museums',
    'Scenic Walks',
    'Coffee & Cafés',
    'Hidden Gems',
    'Photography',
    'Local Markets',
  ];

  const toggleInterest = (tag: string) => {
    if (interests.includes(tag)) {
      setInterests(interests.filter((t) => t !== tag));
    } else {
      setInterests([...interests, tag]);
    }
  };

  // Calculate duration
  const calculateDays = () => {
    try {
      const d1 = new Date(startDate);
      const d2 = new Date(endDate);
      const diffTime = Math.abs(d2.getTime() - d1.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays || 4;
    } catch {
      return 4;
    }
  };

  const daysCount = calculateDays();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      destination,
      start_date: startDate,
      end_date: endDate,
      budget,
      currency,
      interests,
      preferences: {
        preferred_start_time: '09:00',
        preferred_end_time: '21:00',
        activity_intensity: pace,
        max_activity_travel_minutes: 45,
      },
    });
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Top Header */}
      <div className="mb-8">
        <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest font-semibold">
          Step 1 of 1 · Let's plan your journey
        </span>
        <h1 className="font-headline-lg text-3xl sm:text-4xl text-on-surface font-bold mt-1">
          Craft your signature itinerary
        </h1>
        <p className="font-body-md text-on-surface-variant mt-2">
          Tell us where and how you want to travel. TravelPilot's autonomous agent will assemble your schedule, verify opening hours, and budget.
        </p>
      </div>

      {/* Main Single Card Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-surface-container-lowest rounded-3xl p-6 sm:p-10 shadow-sm border border-outline-variant/30 flex flex-col gap-8"
      >
        {/* STEP 1: Destination */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <span className="w-7 h-7 rounded-full bg-primary text-on-primary font-label-sm font-bold flex items-center justify-center text-xs">
              1
            </span>
            <label htmlFor="destination" className="font-headline-sm text-lg font-semibold text-on-surface">
              Where are you going?
            </label>
          </div>

          <div className="relative pl-10">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
                location_on
              </span>
              <input
                id="destination"
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                required
                className="w-full pl-11 pr-4 py-3 rounded-full bg-surface-container-low border border-outline-variant/40 font-body-md text-on-surface focus:outline-none focus:border-secondary focus:bg-surface-container-lowest transition-all"
                placeholder="City or region (e.g. Paris, France)"
              />
            </div>

            {/* Popular quick chips */}
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <span className="font-label-sm text-xs text-on-surface-variant">Popular:</span>
              {popularDestinations.map((dest) => (
                <button
                  key={dest}
                  type="button"
                  onClick={() => setDestination(dest)}
                  className={`px-3 py-1 rounded-full text-xs font-label-sm transition-all ${
                    destination === dest
                      ? 'bg-primary text-on-primary font-semibold'
                      : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {dest.split(',')[0]}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="h-px bg-outline-variant/20 ml-10"></div>

        {/* STEP 2: When */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-full bg-primary text-on-primary font-label-sm font-bold flex items-center justify-center text-xs">
                2
              </span>
              <span className="font-headline-sm text-lg font-semibold text-on-surface">
                When?
              </span>
            </div>
            <span className="font-label-sm text-xs px-3 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed font-semibold">
              {daysCount} Days · {Math.max(1, daysCount - 1)} Nights
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pl-10">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="start_date" className="font-label-sm text-xs text-on-surface-variant font-medium">
                Departure Date
              </label>
              <input
                id="start_date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-full bg-surface-container-low border border-outline-variant/40 font-body-md text-on-surface focus:outline-none focus:border-secondary transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="end_date" className="font-label-sm text-xs text-on-surface-variant font-medium">
                Return Date
              </label>
              <input
                id="end_date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-full bg-surface-container-low border border-outline-variant/40 font-body-md text-on-surface focus:outline-none focus:border-secondary transition-all"
              />
            </div>
          </div>
        </div>

        <div className="h-px bg-outline-variant/20 ml-10"></div>

        {/* STEP 3: Budget */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-full bg-primary text-on-primary font-label-sm font-bold flex items-center justify-center text-xs">
                3
              </span>
              <label htmlFor="budget_amount" className="font-headline-sm text-lg font-semibold text-on-surface">
                What's your total budget?
              </label>
            </div>

            {/* Currency pill toggle */}
            <div className="inline-flex rounded-full bg-surface-container p-0.5 text-xs font-label-sm">
              <button
                type="button"
                onClick={() => setCurrency('INR')}
                className={`px-3 py-1 rounded-full font-semibold transition-all ${
                  currency === 'INR'
                    ? 'bg-surface-container-lowest text-primary shadow-xs'
                    : 'text-on-surface-variant'
                }`}
              >
                INR ₹
              </button>
              <button
                type="button"
                onClick={() => setCurrency('EUR')}
                className={`px-3 py-1 rounded-full font-semibold transition-all ${
                  currency === 'EUR'
                    ? 'bg-surface-container-lowest text-primary shadow-xs'
                    : 'text-on-surface-variant'
                }`}
              >
                EUR €
              </button>
            </div>
          </div>

          <div className="pl-10">
            <div className="relative max-w-sm">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-semibold text-on-surface-variant">
                {currency === 'INR' ? '₹' : '€'}
              </span>
              <input
                id="budget_amount"
                type="number"
                min="5000"
                step="500"
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                required
                className="w-full pl-9 pr-4 py-2.5 rounded-full bg-surface-container-low border border-outline-variant/40 font-body-md text-on-surface focus:outline-none focus:border-secondary transition-all"
              />
            </div>
            <p className="font-body-sm text-xs text-on-surface-variant mt-2">
              For on-the-ground activities, local transit &amp; dining (excludes flights and long-term accommodation).
            </p>
          </div>
        </div>

        <div className="h-px bg-outline-variant/20 ml-10"></div>

        {/* STEP 4: Interests */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <span className="w-7 h-7 rounded-full bg-primary text-on-primary font-label-sm font-bold flex items-center justify-center text-xs">
              4
            </span>
            <span className="font-headline-sm text-lg font-semibold text-on-surface">
              What do you enjoy?
            </span>
          </div>

          <div className="pl-10">
            <div className="flex flex-wrap gap-2">
              {availableInterests.map((tag) => {
                const selected = interests.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleInterest(tag)}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full font-label-sm text-xs sm:text-sm transition-all border ${
                      selected
                        ? 'bg-primary text-on-primary border-primary font-semibold shadow-xs'
                        : 'bg-surface-container-low text-on-surface border-outline-variant/40 hover:bg-surface-container'
                    }`}
                  >
                    {selected && (
                      <span className="material-symbols-outlined text-[16px]">check</span>
                    )}
                    <span>{tag}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="h-px bg-outline-variant/20 ml-10"></div>

        {/* STEP 5: Travel Pace */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <span className="w-7 h-7 rounded-full bg-primary text-on-primary font-label-sm font-bold flex items-center justify-center text-xs">
              5
            </span>
            <span className="font-headline-sm text-lg font-semibold text-on-surface">
              Travel pace
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pl-10">
            <button
              type="button"
              onClick={() => setPace('relaxed')}
              className={`p-3 rounded-2xl border text-left transition-all ${
                pace === 'relaxed'
                  ? 'border-primary bg-surface-container text-on-surface font-semibold ring-1 ring-primary'
                  : 'border-outline-variant/40 bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              <div className="font-label-md text-sm text-on-surface font-bold">Relaxed</div>
              <div className="font-body-sm text-xs text-on-surface-variant mt-0.5">
                2-3 stops/day · unhurried
              </div>
            </button>

            <button
              type="button"
              onClick={() => setPace('moderate')}
              className={`p-3 rounded-2xl border text-left transition-all ${
                pace === 'moderate'
                  ? 'border-primary bg-surface-container text-on-surface font-semibold ring-1 ring-primary'
                  : 'border-outline-variant/40 bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              <div className="font-label-md text-sm text-on-surface font-bold">Balanced</div>
              <div className="font-body-sm text-xs text-on-surface-variant mt-0.5">
                3-4 stops/day · signature rhythm
              </div>
            </button>

            <button
              type="button"
              onClick={() => setPace('intensive')}
              className={`p-3 rounded-2xl border text-left transition-all ${
                pace === 'intensive'
                  ? 'border-primary bg-surface-container text-on-surface font-semibold ring-1 ring-primary'
                  : 'border-outline-variant/40 bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              <div className="font-label-md text-sm text-on-surface font-bold">Active</div>
              <div className="font-body-sm text-xs text-on-surface-variant mt-0.5">
                5+ stops/day · packed agenda
              </div>
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4 pl-10">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 rounded-full bg-primary text-on-primary font-label-md text-base font-bold hover:bg-neutral-800 active:scale-98 transition-all shadow-md flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <span className="w-5 h-5 rounded-full border-2 border-on-primary border-t-transparent animate-spin"></span>
                <span>Synthesizing Itinerary...</span>
              </>
            ) : (
              <>
                <span>Synthesize Itinerary</span>
                <span className="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
