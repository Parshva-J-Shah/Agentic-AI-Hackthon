import React from 'react';
import { Currency, ChangeSummary as ChangeSummaryType, Trip, Itinerary, Alternative } from '../types/trip';
import { ChangeSummary } from '../components/ChangeSummary';

interface BeforeAfterPageProps {
  changes: ChangeSummaryType[];
  currency: Currency;
  onCommit: () => void;
  onRevert: () => void;
  trip?: Trip;
  originalItinerary?: Itinerary;
  selectedAlternative?: Alternative;
}

export const BeforeAfterPage: React.FC<BeforeAfterPageProps> = ({
  changes,
  currency,
  onCommit,
  onRevert,
  trip,
  originalItinerary,
  selectedAlternative,
}) => {
  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12 py-6 pb-24">
      <ChangeSummary
        changes={changes}
        currency={currency}
        onCommit={onCommit}
        onRevert={onRevert}
        trip={trip}
        originalItinerary={originalItinerary}
        selectedAlternative={selectedAlternative}
      />
    </div>
  );
};
