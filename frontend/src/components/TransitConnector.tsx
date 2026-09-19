import React from 'react';
import { Transportation } from '../types/trip';

interface TransitConnectorProps {
  transit: Transportation;
}

export const TransitConnector: React.FC<TransitConnectorProps> = ({ transit }) => {
  return (
    <div className="relative py-2 pl-6 sm:pl-8 my-1">
      {/* Dashed spine */}
      <div className="absolute left-[11px] sm:left-[15px] top-0 bottom-0 w-0.5 border-l-2 border-dashed border-outline-variant/50"></div>

      {/* Transit pill badge */}
      <div className="relative z-10 inline-flex items-center gap-2 bg-surface-container-lowest border border-outline-variant/40 px-3.5 py-1.5 rounded-full shadow-xs text-xs font-label-sm text-on-surface-variant">
        <span className="material-symbols-outlined text-[16px] text-secondary">
          {transit.type === 'walk' ? 'directions_walk' : 'directions_subway'}
        </span>
        <span className="font-medium text-on-surface">
          {transit.duration_minutes} min {transit.type === 'walk' ? 'walk' : 'transit'}
        </span>
        {transit.notes && (
          <>
            <span className="text-outline-variant">•</span>
            <span className="text-on-surface-variant">{transit.notes}</span>
          </>
        )}
      </div>
    </div>
  );
};
