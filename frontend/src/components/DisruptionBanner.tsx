import React from 'react';

interface DisruptionBannerProps {
  onAutoApply: () => void;
  onInspectChanges: () => void;
  onDismiss: () => void;
}

export const DisruptionBanner: React.FC<DisruptionBannerProps> = ({
  onAutoApply,
  onInspectChanges,
  onDismiss,
}) => {
  return (
    <div className="rounded-xl bg-error-container p-4 sm:p-5 shadow-sm border border-error/20 transition-all duration-300">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined text-error text-2xl mt-0.5">error</span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-headline-sm text-base sm:text-lg font-bold text-on-error-container">
                Museum Closure Disruption Injected
              </h2>
              <span className="px-2 py-0.5 rounded bg-error text-on-error font-code-sm text-[10px] font-bold uppercase">
                Sev-2 Blocker
              </span>
            </div>
            <p className="font-body-sm text-xs sm:text-sm text-on-error-container/90 mt-1 max-w-2xl leading-relaxed">
              Louvre Museum has experienced an unannounced strike closure. TravelPilot autonomous re-routing has
              staged an alternative slot at Musée d'Orsay with zero additional transit penalty.
            </p>
          </div>
        </div>

        <button
          onClick={onDismiss}
          className="text-on-error-container hover:opacity-70 p-1 rounded transition-opacity"
          title="Dismiss notification"
        >
          <span className="material-symbols-outlined text-lg">close</span>
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2 mt-4 pt-2 border-t border-error/20">
        <button
          type="button"
          onClick={onAutoApply}
          className="px-3.5 py-1.5 rounded-lg bg-error text-on-error font-label-md text-xs font-semibold shadow-xs hover:bg-error/90 transition-all flex items-center gap-1.5"
        >
          <span className="material-symbols-outlined text-sm">auto_fix_high</span>
          <span>Auto-Apply Alternative Route</span>
        </button>
        <button
          type="button"
          onClick={onInspectChanges}
          className="px-3.5 py-1.5 rounded-lg bg-surface-container-lowest text-on-surface font-label-md text-xs font-semibold shadow-xs hover:bg-surface-container-low transition-all flex items-center gap-1.5"
        >
          <span className="material-symbols-outlined text-sm">compare_arrows</span>
          <span>Inspect Schedule Changes (Before/After)</span>
        </button>
      </div>
    </div>
  );
};
