import React from 'react';
import { Currency } from '../types/trip';

interface HeaderProps {
  currentScreen: string;
  onNavigate: (screen: string) => void;
  currency: Currency;
  onCurrencyToggle: () => void;
  onTriggerDisruption: () => void;
  isDisrupted?: boolean;
  isDisrupting?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentScreen,
  onNavigate,
  currency,
  onCurrencyToggle,
  onTriggerDisruption,
  isDisrupted = false,
  isDisrupting = false,
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 w-full z-50 bg-surface/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.03)] border-b border-outline-variant/20">
      <div className="h-20 max-w-[1320px] mx-auto px-margin-mobile md:px-margin flex items-center justify-between">
        {/* Brand Logo & Name */}
        <button
          onClick={() => onNavigate('landing')}
          className="flex items-center gap-space-xs text-left focus:outline-none group"
        >
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary shadow-sm group-hover:opacity-85 transition-opacity">
            <span className="material-symbols-outlined text-[18px]">explore</span>
          </div>
          <span className="font-headline-sm text-headline-sm text-on-surface tracking-tight font-bold ml-1">
            TravelPilot
          </span>
        </button>

        {/* Minimal Editorial Pill Navigation */}
        <nav className="hidden md:flex items-center gap-1 bg-surface-container-low p-1 rounded-full border border-outline-variant/30">
          <button
            onClick={() => onNavigate('landing')}
            className={`px-space-md py-space-xs rounded-full font-label-md text-label-md transition-all ${
              currentScreen === 'landing'
                ? 'bg-surface-container-highest text-on-surface font-semibold shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => onNavigate('dashboard')}
            className={`px-space-md py-space-xs rounded-full font-label-md text-label-md transition-all ${
              currentScreen === 'dashboard' || currentScreen === 'disruption' || currentScreen === 'before_after'
                ? 'bg-surface-container-highest text-on-surface font-semibold shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            My Trips
          </button>
          <button
            onClick={() => onNavigate('assistant')}
            className={`px-space-md py-space-xs rounded-full font-label-md text-label-md transition-all ${
              currentScreen === 'assistant'
                ? 'bg-surface-container-highest text-on-surface font-semibold shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Ask TravelPilot
          </button>
        </nav>

        {/* Right Action Tools */}
        <div className="flex items-center gap-space-sm sm:gap-space-md">
          {/* Simulate / Reset Disruption pill */}
          <button
            type="button"
            onClick={onTriggerDisruption}
            disabled={isDisrupting}
            className={`inline-flex items-center gap-1.5 px-space-md py-space-xs rounded-full font-label-sm text-label-sm transition-all shadow-xs ${
              isDisrupting
                ? 'opacity-70 cursor-not-allowed bg-surface-container-low text-error border border-error/20'
                : isDisrupted
                ? 'bg-error text-on-error shadow-error/20 hover:bg-error/90 cursor-pointer'
                : 'bg-surface-container-low text-error border border-error/20 hover:bg-error-container cursor-pointer'
            }`}
            title={
              isDisrupting
                ? 'Simulating Disruption…'
                : isDisrupted
                ? 'Reset simulated disruption'
                : 'Simulate itinerary disruption'
            }
          >
            {isDisrupting ? (
              <span className="w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin shrink-0"></span>
            ) : (
              <span className="material-symbols-outlined text-[16px]">
                {isDisrupted ? 'restart_alt' : 'bolt'}
              </span>
            )}
            <span className="hidden sm:inline font-semibold">
              {isDisrupting
                ? 'Simulating Disruption…'
                : isDisrupted
                ? 'Reset Disruption'
                : 'Simulate Disruption'}
            </span>
          </button>

          {/* Currency Switcher capsule */}
          <button
            type="button"
            onClick={onCurrencyToggle}
            className="px-space-sm py-space-xs rounded-full bg-surface-container-low text-on-surface-variant hover:text-on-surface hover:bg-surface-container font-label-sm text-label-sm tracking-wide transition-all border border-outline-variant/30"
          >
            {currency === 'INR' ? 'EUR / INR (₹)' : 'EUR / INR (€)'}
          </button>

          {/* User Profile Avatar */}
          <div className="flex items-center">
            <img
              alt="Traveler Profile"
              className="w-8 h-8 rounded-full object-cover ring-1 ring-outline-variant/40"
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
            />
          </div>
        </div>
      </div>
    </header>
  );
};
