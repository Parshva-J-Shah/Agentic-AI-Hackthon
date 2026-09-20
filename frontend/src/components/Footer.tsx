import React from 'react';

interface FooterProps {
  onNavigateHome?: () => void;
  onNavigateChat?: () => void;
  onOpenPrivacy?: () => void;
  onOpenSupport?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigateHome,
  onNavigateChat,
  onOpenPrivacy,
  onOpenSupport,
}) => {
  return (
    <footer className="w-full bg-surface-container-low py-space-lg border-t border-outline-variant/20 mt-16 shadow-[0_-1px_6px_rgba(0,0,0,0.02)]">
      <div className="max-w-[1320px] mx-auto px-margin-mobile md:px-margin flex flex-col md:flex-row items-center justify-between gap-space-md">
        <div className="flex items-center gap-space-xs text-on-surface-variant font-body-sm text-body-sm">
          <span className="font-semibold text-on-surface">TravelPilot</span>
          <span>© 2026 Curated Journeys. All rights reserved.</span>
        </div>
        <div className="flex items-center gap-space-lg">
          <button
            type="button"
            onClick={onNavigateChat || onNavigateHome}
            className="text-on-surface-variant hover:text-on-surface transition-colors font-label-sm text-label-sm cursor-pointer bg-transparent border-none p-0"
          >
            TravelPilot AI
          </button>
          <button
            type="button"
            onClick={onOpenPrivacy}
            className="text-on-surface-variant hover:text-on-surface transition-colors font-label-sm text-label-sm cursor-pointer bg-transparent border-none p-0"
          >
            Privacy
          </button>
          <button
            type="button"
            onClick={onOpenSupport}
            className="text-on-surface-variant hover:text-on-surface transition-colors font-label-sm text-label-sm cursor-pointer bg-transparent border-none p-0"
          >
            Support
          </button>
        </div>
      </div>
    </footer>
  );
};
