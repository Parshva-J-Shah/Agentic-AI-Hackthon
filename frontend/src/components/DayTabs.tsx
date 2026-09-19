import React from 'react';
import { ItineraryDay } from '../types/trip';

interface DayTabsProps {
  days: ItineraryDay[];
  activeDayNumber: number;
  onSelectDay: (dayNumber: number) => void;
}

export const DayTabs: React.FC<DayTabsProps> = ({
  days,
  activeDayNumber,
  onSelectDay,
}) => {
  return (
    <div className="flex items-center gap-space-xs overflow-x-auto no-scrollbar py-1">
      {days.map((day) => {
        const isActive = day.day_number === activeDayNumber;
        return (
          <button
            key={day.day_number}
            type="button"
            onClick={() => onSelectDay(day.day_number)}
            className={`px-space-md py-2 rounded-full font-label-md text-xs sm:text-sm flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
              isActive
                ? 'bg-primary text-on-primary font-semibold shadow-xs'
                : 'bg-surface-container-low text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
                isActive ? 'bg-white/20 text-white' : 'bg-surface-container text-on-surface-variant'
              }`}
            >
              {day.day_number}
            </span>
            <span>
              Day {day.day_number}: {day.title.split(':')[0]}
            </span>
          </button>
        );
      })}
    </div>
  );
};
