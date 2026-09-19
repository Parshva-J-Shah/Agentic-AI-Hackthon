import React from 'react';
import { ItineraryDay, Currency } from '../types/trip';
import { ActivityCard } from './ActivityCard';
import { TransitConnector } from './TransitConnector';

interface ItineraryTimelineProps {
  day: ItineraryDay;
  currency: Currency;
  onSimulateCancel: (activityId: string) => void;
  onViewAlternatives: (activityId: string) => void;
}

export const ItineraryTimeline: React.FC<ItineraryTimelineProps> = ({
  day,
  currency,
  onSimulateCancel,
  onViewAlternatives,
}) => {
  return (
    <div className="bg-surface-container-lowest rounded-xl p-4 sm:p-6 shadow-xs border border-outline-variant/60">
      {/* Day Title & Summary Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-6 border-b border-outline-variant/40 gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-headline-sm text-base sm:text-lg font-bold text-on-surface">
              Day {day.day_number}: {day.title}
            </h2>
            <span className="font-code-sm text-xs px-2 py-0.5 rounded bg-surface-container text-on-surface-variant font-medium">
              {day.date}
            </span>
          </div>
          <p className="font-body-sm text-xs sm:text-sm text-on-surface-variant mt-0.5">
            {day.theme}
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-code-sm text-on-surface-variant self-start sm:self-auto">
          {day.walking_distance_km && (
            <span className="flex items-center gap-1 bg-surface-container-low px-2 py-1 rounded">
              <span className="material-symbols-outlined text-sm text-tertiary">directions_walk</span>
              {day.walking_distance_km} km ({day.walking_duration_minutes}m)
            </span>
          )}
          <span className="flex items-center gap-1 bg-surface-container-low px-2 py-1 rounded text-tertiary font-bold">
            <span className="material-symbols-outlined text-sm">check_circle</span>
            0 Conflicts
          </span>
        </div>
      </div>

      {/* Timeline Stream */}
      <div className="space-y-1 relative">
        {day.activities.map((activity) => (
          <React.Fragment key={activity.id}>
            <ActivityCard
              activity={activity}
              currency={currency}
              onSimulateCancel={onSimulateCancel}
              onViewAlternatives={onViewAlternatives}
            />
            {activity.transit_after && (
              <TransitConnector transit={activity.transit_after} />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
