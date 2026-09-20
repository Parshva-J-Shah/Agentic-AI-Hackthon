import React, { useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-lg bg-surface-container-lowest rounded-3xl p-6 sm:p-8 shadow-2xl border border-outline-variant/30 relative flex flex-col gap-5 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center text-on-primary">
              <span className="material-symbols-outlined text-[20px]">security</span>
            </div>
            <div>
              <h2 className="font-headline-sm text-xl font-bold text-on-surface">
                Privacy &amp; Data Protection
              </h2>
              <p className="font-body-sm text-xs text-on-surface-variant">
                Your journey data is strictly confidential
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Content sections */}
        <div className="flex flex-col gap-4 text-xs font-body-sm text-on-surface-variant">
          <div className="p-3.5 rounded-2xl bg-surface-container-low border border-outline-variant/20 flex flex-col gap-1">
            <span className="font-label-md font-bold text-on-surface flex items-center gap-1.5">
              <span className="material-symbols-outlined text-secondary text-[16px]">lock</span>
              Encrypted Itinerary Storage
            </span>
            <p>
              Trip schedules, personal notes, and budget parameters are secured using Supabase Row-Level Security. Only you have access to your created journeys.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-surface-container-low border border-outline-variant/20 flex flex-col gap-1">
            <span className="font-label-md font-bold text-on-surface flex items-center gap-1.5">
              <span className="material-symbols-outlined text-secondary text-[16px]">search_check</span>
              Sanitized Search Queries
            </span>
            <p>
              Live operational searches through Tavily and Wikipedia only transmit destination and activity names. No personally identifiable information is sent to third parties.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-surface-container-low border border-outline-variant/20 flex flex-col gap-1">
            <span className="font-label-md font-bold text-on-surface flex items-center gap-1.5">
              <span className="material-symbols-outlined text-secondary text-[16px]">block</span>
              Zero Ad Tracking
            </span>
            <p>
              TravelPilot contains no behavioral advertising trackers, pixel trackers, or commercial data brokers. Your travel preferences remain strictly between you and your autonomous agent.
            </p>
          </div>
        </div>

        {/* Action button */}
        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-full bg-primary text-on-primary hover:bg-neutral-800 transition-all font-label-md text-xs font-semibold shadow-xs cursor-pointer"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};

export const SupportModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-lg bg-surface-container-lowest rounded-3xl p-6 sm:p-8 shadow-2xl border border-outline-variant/30 relative flex flex-col gap-5 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed">
              <span className="material-symbols-outlined text-[20px]">support_agent</span>
            </div>
            <div>
              <h2 className="font-headline-sm text-xl font-bold text-on-surface">
                TravelPilot Concierge Support
              </h2>
              <p className="font-body-sm text-xs text-on-surface-variant">
                Autonomous guidance and real-time trip assistance
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Content sections */}
        <div className="flex flex-col gap-4 text-xs font-body-sm text-on-surface-variant">
          <div className="p-3.5 rounded-2xl bg-surface-container-low border border-outline-variant/20 flex flex-col gap-1">
            <span className="font-label-md font-bold text-on-surface flex items-center gap-1.5">
              <span className="material-symbols-outlined text-primary text-[16px]">smart_toy</span>
              AI Concierge Chat
            </span>
            <p>
              Have a question about opening times, walking buffers, or need to fit a spontaneous stop? Tap the <strong>Assistant</strong> tab in the navigation header to converse directly with TravelPilot.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-surface-container-low border border-outline-variant/20 flex flex-col gap-1">
            <span className="font-label-md font-bold text-on-surface flex items-center gap-1.5">
              <span className="material-symbols-outlined text-primary text-[16px]">bolt</span>
              Live Disruption Replanning
            </span>
            <p>
              When a venue closes or unexpected delays arise, click <strong>Simulate Disruption</strong> or use the alert banners to review verified alternatives with zero schedule overlap.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-surface-container-low border border-outline-variant/20 flex flex-col gap-1">
            <span className="font-label-md font-bold text-on-surface flex items-center gap-1.5">
              <span className="material-symbols-outlined text-primary text-[16px]">mail</span>
              Direct Contact
            </span>
            <p>
              For developer inquiries, feedback, or custom trip curation assistance, contact us at <span className="font-semibold text-on-surface">support@travelpilot.ai</span>. Typical response time is under 15 minutes during active travel hours.
            </p>
          </div>
        </div>

        {/* Action button */}
        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-full bg-primary text-on-primary hover:bg-neutral-800 transition-all font-label-md text-xs font-semibold shadow-xs cursor-pointer"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
