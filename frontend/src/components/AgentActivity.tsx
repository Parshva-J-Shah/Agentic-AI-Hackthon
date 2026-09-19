import React from 'react';
import { AgentStep } from '../types/trip';

interface AgentActivityProps {
  steps: AgentStep[];
  title?: string;
  statusLabel?: string;
}

export const AgentActivity: React.FC<AgentActivityProps> = ({
  steps,
  title = 'Agent Activity Timeline',
  statusLabel = 'RESOLVED',
}) => {
  return (
    <div className="bg-surface-container-lowest rounded-xl p-4 sm:p-5 shadow-xs border border-outline-variant/60 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-xl">smart_toy</span>
          <h3 className="font-headline-sm text-sm sm:text-base font-bold text-on-surface">{title}</h3>
        </div>
        <span className="px-2 py-0.5 rounded bg-tertiary-fixed text-on-tertiary-fixed font-code-sm text-[10px] font-bold">
          {statusLabel}
        </span>
      </div>

      {/* Steps List */}
      <div className="space-y-2 font-body-sm text-xs">
        {steps.map((step, i) => (
          <div key={i} className="p-2.5 rounded-lg bg-surface-container-low flex items-start gap-2.5">
            <div className="w-5 h-5 rounded-full bg-tertiary text-on-tertiary flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
              <span className="material-symbols-outlined text-xs font-bold">check</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-bold text-on-surface">{step.label}</p>
              {step.details && (
                <p className="font-code-sm text-[11px] text-on-surface-variant truncate mt-0.5">
                  {step.details}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Solver Telemetry Metric */}
      <div className="bg-surface-container p-3 rounded-lg space-y-1.5">
        <div className="flex items-center justify-between font-label-sm text-[11px]">
          <span className="font-code-sm text-on-surface-variant">Constraint Solver Mesh</span>
          <span className="font-code-sm font-bold text-tertiary">98.4% Efficiency</span>
        </div>
        <div className="w-full h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full" style={{ width: '98%' }}></div>
        </div>
        <div className="flex justify-between text-[10px] text-on-surface-variant font-code-sm">
          <span>0ms: Conflict Detected</span>
          <span>180ms: Tavily Mesh</span>
          <span>320ms: Re-route Validated</span>
        </div>
      </div>
    </div>
  );
};
