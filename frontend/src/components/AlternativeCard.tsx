import React from 'react';
import { Alternative, Currency } from '../types/trip';

interface AlternativeCardProps {
  alternative: Alternative;
  currency: Currency;
  onPreview: (alt: Alternative) => void;
  onApply: (alt: Alternative) => void;
}

export const AlternativeCard: React.FC<AlternativeCardProps> = ({
  alternative,
  currency,
  onPreview,
  onApply,
}) => {
  const formatCost = (val: number) => {
    if (currency === 'EUR') {
      return `€${Math.round(val / 90).toLocaleString()}`;
    }
    return `₹${val.toLocaleString()}`;
  };

  const formatCostDelta = (val: number) => {
    if (val === 0) return 'Same Cost';
    const sign = val < 0 ? 'Saves ' : '+';
    if (currency === 'EUR') {
      return `${sign}€${Math.abs(Math.round(val / 90))}`;
    }
    return `${sign}₹${Math.abs(val)}`;
  };

  return (
    <div
      className={`bg-surface-container-lowest rounded-xl p-5 md:p-6 shadow-xs space-y-4 relative overflow-hidden border transition-all ${
        alternative.is_top_match
          ? 'border-primary/40 shadow-sm ring-1 ring-primary/20'
          : 'border-outline-variant/60 hover:border-outline-variant'
      }`}
    >
      {/* Top Accent bar if top match */}
      {alternative.is_top_match && (
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-primary"></div>
      )}

      {/* Badges & Savings Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        <div className="flex flex-wrap items-center gap-2">
          {alternative.is_top_match && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary text-on-primary font-label-md text-xs font-bold">
              <span className="material-symbols-outlined text-sm">auto_awesome</span>
              TOP MATCH ({alternative.match_score}%)
            </span>
          )}
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
            {alternative.verification_source}
          </span>
        </div>

        <div
          className={`font-code-sm text-xs font-bold flex items-center gap-1 ${
            alternative.cost_difference <= 0 ? 'text-tertiary' : 'text-error'
          }`}
        >
          <span className="material-symbols-outlined text-sm">
            {alternative.cost_difference <= 0 ? 'savings' : 'payments'}
          </span>
          <span>{formatCostDelta(alternative.cost_difference)}</span>
        </div>
      </div>

      {/* Title & Preview Image */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        <div className="md:col-span-8 space-y-1.5">
          <h3 className="font-headline-sm text-lg md:text-xl text-on-surface font-bold">
            {alternative.name}{' '}
            {alternative.subtitle && (
              <span className="font-title-md text-sm text-on-surface-variant font-normal block sm:inline">
                ({alternative.subtitle})
              </span>
            )}
          </h3>
          <p className="font-body-sm text-xs text-on-surface-variant flex items-center gap-1">
            <span className="material-symbols-outlined text-sm text-primary">pin_drop</span>
            <span>{alternative.location}</span>
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1 pt-1">
            {alternative.tags.map((tag, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded bg-surface-container font-label-sm text-[11px] text-on-surface-variant"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Image */}
        {alternative.image_url && (
          <div className="md:col-span-4">
            <div className="w-full h-24 rounded-lg overflow-hidden relative shadow-inner bg-surface-container">
              <img
                src={alternative.image_url}
                alt={alternative.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-inverse-surface/80 text-inverse-on-surface font-code-sm text-[10px]">
                Verified Feed
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Data Matrix Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 rounded-lg bg-surface-container-low font-body-sm text-xs">
        <div className="p-1 space-y-0.5">
          <p className="font-label-sm text-[10px] text-on-surface-variant uppercase font-semibold">Time Slot</p>
          <p className="font-code-sm text-xs font-bold text-on-surface">
            {alternative.start_time} – {alternative.end_time}
          </p>
          <p className="text-[11px] text-on-surface-variant">{alternative.duration_minutes}m duration</p>
        </div>

        <div className="p-1 space-y-0.5">
          <p className="font-label-sm text-[10px] text-on-surface-variant uppercase font-semibold">Total Cost</p>
          <p className="font-code-sm text-xs font-bold text-tertiary">
            {formatCost(alternative.estimated_cost)}
          </p>
          <p className="text-[11px] text-tertiary">{formatCostDelta(alternative.cost_difference)}</p>
        </div>

        <div className="p-1 space-y-0.5">
          <p className="font-label-sm text-[10px] text-on-surface-variant uppercase font-semibold">Travel Overhead</p>
          <p className="font-code-sm text-xs font-semibold text-primary">
            {alternative.travel_time_difference <= 0
              ? `${Math.abs(alternative.travel_time_difference)} min faster`
              : `+${alternative.travel_time_difference} min transit`}
          </p>
          <p className="text-[11px] text-on-surface-variant truncate">{alternative.transit_notes}</p>
        </div>

        <div className="p-1 space-y-0.5">
          <p className="font-label-sm text-[10px] text-on-surface-variant uppercase font-semibold">Operating Hours</p>
          <p className="font-code-sm text-xs font-semibold text-on-surface truncate">
            {alternative.operating_hours}
          </p>
          <p className="text-[11px] text-tertiary font-medium">Tavily Checked</p>
        </div>
      </div>

      {/* Route Impact Summary */}
      <div className="flex items-center gap-2 text-on-surface-variant font-body-sm text-xs bg-surface-container/60 p-2.5 rounded-lg">
        <span className="material-symbols-outlined text-tertiary text-base shrink-0">directions_walk</span>
        <p className="line-clamp-2">
          <strong className="text-on-surface">Seamless connection:</strong> {alternative.description}
        </p>
      </div>

      {/* Action CTA Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-outline-variant/40">
        <div className="flex items-center gap-1.5 text-on-surface-variant font-code-sm text-[11px]">
          <span className="material-symbols-outlined text-primary text-sm">verified</span>
          <span>POST /alternatives/{alternative.id}/apply</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onPreview(alternative)}
            className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-xs font-semibold transition-colors flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-sm">visibility</span>
            <span>Preview Replan</span>
          </button>
          <button
            type="button"
            onClick={() => onApply(alternative)}
            className="px-3.5 py-1.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-md text-xs font-bold shadow-xs transition-all flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-sm">check_circle</span>
            <span>Apply Alternative</span>
          </button>
        </div>
      </div>
    </div>
  );
};
