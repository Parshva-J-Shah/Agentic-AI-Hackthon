import React from 'react';
import { Activity, Currency } from '../types/trip';
import { ActivityImage } from '../utils/imageUtils';

interface ActivityCardProps {
  activity: Activity;
  currency: Currency;
  onSimulateCancel?: (activityId: string) => void;
  onViewAlternatives?: (activityId: string) => void;
}

export const ActivityCard: React.FC<ActivityCardProps> = ({
  activity,
  currency,
  onSimulateCancel,
  onViewAlternatives,
}) => {
  const isDisrupted = activity.status === 'disrupted';
  const isReplanned = activity.status === 'replanned';

  const formatCost = (cost: number, curr: Currency) => {
    if (cost === 0) return 'Free / Included';
    if (curr === 'EUR') {
      const eur = Math.round(cost / 90);
      return `€${eur} est.`;
    }
    return `₹${cost.toLocaleString()} est.`;
  };

  return (
    <div className="relative group pl-6 sm:pl-8">
      {/* Vertical Spine */}
      <div className="absolute left-[11px] sm:left-[15px] -top-3 -bottom-3 w-0.5 bg-surface-container -z-0"></div>

      {/* Node Bullet */}
      <div
        className={`absolute left-[12px] sm:left-[16px] top-6 w-3 h-3 rounded-full -translate-x-1/2 z-10 transition-all ${
          isDisrupted
            ? 'bg-error ring-4 ring-error-container'
            : isReplanned
            ? 'bg-secondary ring-4 ring-secondary-fixed'
            : 'bg-on-surface-variant'
        }`}
      ></div>

      {/* Main Card Container */}
      <div
        className={`rounded-2xl p-4 sm:p-5 transition-all shadow-xs border relative overflow-hidden ${
          isDisrupted
            ? 'bg-error-container/15 border-error/40'
            : isReplanned
            ? 'bg-secondary-fixed/20 border-secondary/40'
            : 'bg-surface-container-lowest border-outline-variant/30 hover:border-outline-variant/60'
        }`}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            {/* Time & Badges */}
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-sm text-xs font-semibold">
                {activity.start_time} – {activity.end_time}
              </span>
              {isDisrupted && (
                <span className="px-2 py-0.5 rounded-full bg-error text-on-error font-label-sm text-[11px] font-bold">
                  Disrupted (Venue Closed)
                </span>
              )}
              {isReplanned && (
                <span className="px-2 py-0.5 rounded-full bg-secondary text-on-secondary font-label-sm text-[11px] font-bold">
                  Adapted Replacement
                </span>
              )}
              <span className="font-label-sm text-xs text-on-surface-variant uppercase tracking-wider">
                {activity.type}
              </span>
            </div>

            {/* Title & Description */}
            <h3
              className={`font-headline-sm text-lg font-bold ${
                isDisrupted ? 'line-through text-outline' : 'text-on-surface'
              }`}
            >
              {activity.name}
            </h3>

            <p className="font-body-sm text-xs sm:text-sm text-on-surface-variant mt-1 line-clamp-2">
              {activity.description}
            </p>

            {/* Bottom Meta */}
            <div className="flex flex-wrap items-center gap-4 mt-3 pt-2 border-t border-outline-variant/20 text-xs font-label-sm text-on-surface-variant">
              <span className="flex items-center gap-1 font-semibold text-on-surface">
                {formatCost(activity.estimated_cost, currency)}
              </span>
              {activity.location && (
                <span>{activity.location}</span>
              )}
              {isDisrupted && onViewAlternatives && (
                <button
                  type="button"
                  onClick={() => onViewAlternatives(activity.id)}
                  className="text-error font-bold hover:underline ml-auto flex items-center gap-1 cursor-pointer"
                >
                  <span>Resolve with TravelPilot</span>
                  <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </button>
              )}
            </div>
          </div>

          {/* Thumbnail Image on Right */}
          {activity.image_url && (
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden shrink-0 bg-surface-container shadow-xs">
              <ActivityImage
                name={activity.name}
                location={activity.location}
                initialUrl={activity.image_url}
                alt={activity.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
