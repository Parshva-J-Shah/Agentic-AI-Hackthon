import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-surface-container-low py-space-lg border-t border-outline-variant/20 mt-16 shadow-[0_-1px_6px_rgba(0,0,0,0.02)]">
      <div className="max-w-[1320px] mx-auto px-margin-mobile md:px-margin flex flex-col md:flex-row items-center justify-between gap-space-md">
        <div className="flex items-center gap-space-xs text-on-surface-variant font-body-sm text-body-sm">
          <span className="font-semibold text-on-surface">TravelPilot</span>
          <span>© 2025 Curated Journeys. All rights reserved.</span>
        </div>
        <div className="flex items-center gap-space-lg">
          <span className="text-on-surface-variant hover:text-on-surface transition-colors font-label-sm text-label-sm cursor-pointer">
            TravelPilot AI
          </span>
          <span className="text-on-surface-variant hover:text-on-surface transition-colors font-label-sm text-label-sm cursor-pointer">
            Privacy
          </span>
          <span className="text-on-surface-variant hover:text-on-surface transition-colors font-label-sm text-label-sm cursor-pointer">
            Support
          </span>
        </div>
      </div>
    </footer>
  );
};
