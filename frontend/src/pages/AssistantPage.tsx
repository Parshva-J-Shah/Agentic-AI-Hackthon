import React, { useState } from 'react';
import { AgentMessage, Trip, Currency } from '../types/trip';

interface AssistantPageProps {
  messages: AgentMessage[];
  onSendMessage: (msg: string) => void;
  isLoading: boolean;
  onBackToDashboard: () => void;
  trip?: Trip;
  currency?: Currency;
}

export const AssistantPage: React.FC<AssistantPageProps> = ({
  messages,
  onSendMessage,
  isLoading,
  onBackToDashboard,
  trip,
  currency = 'INR',
}) => {
  const [inputText, setInputText] = useState('');

  const destinationName = trip?.destination || 'Curated Expedition';
  const cityName = destinationName.split(',')[0].trim();
  const day1Activities = trip?.itinerary?.days?.[0]?.activities || [];
  const totalDays = trip?.itinerary?.days?.length || 4;

  const formatCost = (cost: number) => {
    if (currency === 'EUR') {
      return `€${Math.round(cost / 90).toLocaleString()}`;
    }
    return `₹${cost.toLocaleString()}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    onSendMessage(inputText);
    setInputText('');
  };

  const handlePromptChip = (chipText: string) => {
    onSendMessage(chipText);
  };

  return (
    <div className="w-full max-w-[1320px] mx-auto px-margin-mobile md:px-margin py-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
        {/* MAIN CONVERSATION STREAM (approx 65% / 8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-space-lg">
          {/* Concierge Header Card */}
          <div className="bg-surface-container-lowest rounded-2xl p-space-md shadow-xs border border-outline-variant/30 flex items-center justify-between">
            <div className="flex items-center gap-space-md min-w-0">
              <div className="relative shrink-0">
                <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[24px] text-secondary">
                    explore
                  </span>
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-secondary rounded-full ring-2 ring-surface-container-lowest"></span>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="font-headline-sm text-lg sm:text-xl font-bold text-on-surface truncate">
                    TravelPilot Assistant
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-sm text-xs font-semibold">
                    Trip Co-Pilot
                  </span>
                </div>
                <p className="font-body-sm text-xs sm:text-sm text-on-surface-variant flex items-center gap-1.5 truncate mt-0.5">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-secondary"></span>
                  Connected to Day 1 Itinerary · {destinationName}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onBackToDashboard}
              className="px-space-md py-space-xs rounded-full bg-surface-container-low text-on-surface hover:bg-surface-container font-label-md text-xs sm:text-sm transition-colors flex items-center gap-1.5 border border-outline-variant/30 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">calendar_month</span>
              <span className="hidden sm:inline">View Timeline</span>
            </button>
          </div>

          {/* Conversation Timeline */}
          <div className="flex flex-col gap-space-lg" id="chat-stream">
            {/* Date Stamp */}
            <div className="flex items-center justify-center my-1">
              <div className="px-space-md py-1 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-xs tracking-wider uppercase font-semibold">
                {trip?.dates?.start ? `Start: ${trip.dates.start}` : 'Active Journey'} · Day 1
              </div>
            </div>

            {/* Dynamic Conversation Messages */}
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col gap-1 ${
                    isUser ? 'items-end self-end max-w-[85%] sm:max-w-[75%]' : 'items-start self-start max-w-full sm:max-w-[92%]'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-label-sm text-xs font-bold text-on-surface">
                      {isUser ? 'You' : 'TravelPilot'}
                    </span>
                    <span className="font-label-sm text-[11px] text-on-surface-variant">
                      {msg.timestamp}
                    </span>
                  </div>
                  <div
                    className={`p-space-lg rounded-2xl shadow-xs ${
                      isUser
                        ? 'bg-primary text-on-primary rounded-tr-xs'
                        : 'bg-surface-container-lowest text-on-surface border border-outline-variant/30 rounded-tl-xs flex flex-col gap-space-md w-full'
                    }`}
                  >
                    <p className="font-body-md text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
                      {msg.text}
                    </p>

                    {!isUser && (
                      <div className="flex flex-wrap gap-2 pt-1 border-t border-outline-variant/20">
                        <button
                          type="button"
                          onClick={() => handlePromptChip(`Which is the best restaurant for lunch in ${cityName}?`)}
                          className="px-space-md py-1.5 rounded-full bg-surface-container text-on-surface hover:bg-surface-container-high text-xs font-label-sm transition-all flex items-center gap-1.5 shadow-2xs border border-outline-variant/30 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[16px] text-secondary">restaurant</span>
                          <span>Best lunch spots in {cityName}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handlePromptChip('Are there any timing conflicts in Day 1?')}
                          className="px-space-md py-1.5 rounded-full bg-surface-container text-on-surface hover:bg-surface-container-high text-xs font-label-sm transition-all flex items-center gap-1.5 shadow-2xs border border-outline-variant/30 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[16px]">verified</span>
                          <span>Check timing conflicts</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-center gap-2 p-4 bg-surface-container-lowest rounded-2xl border border-outline-variant/30 w-fit">
                <div className="w-4 h-4 rounded-full border-2 border-secondary border-t-transparent animate-spin"></div>
                <span className="font-label-sm text-xs text-on-surface-variant">
                  TravelPilot is querying itinerary constraints &amp; travel data...
                </span>
              </div>
            )}
          </div>

          {/* Floating Bottom Input Dock */}
          <div className="sticky bottom-4 z-20 flex flex-col gap-2 pt-2">
            {/* Suggested Follow-ups */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              <span className="text-xs font-label-sm text-on-surface-variant shrink-0">
                Try asking:
              </span>
              <button
                type="button"
                onClick={() => handlePromptChip(`Which is the best restaurant for lunch in ${cityName}?`)}
                className="px-3.5 py-1 rounded-full bg-surface-container-lowest text-on-surface-variant hover:text-on-surface hover:bg-surface-container text-xs font-label-sm transition-all whitespace-nowrap shadow-2xs border border-outline-variant/30 cursor-pointer"
              >
                "Which is the best restaurant for lunch in {cityName}?"
              </button>
              <button
                type="button"
                onClick={() => handlePromptChip('Can you reduce my budget?')}
                className="px-3.5 py-1 rounded-full bg-surface-container-lowest text-on-surface-variant hover:text-on-surface hover:bg-surface-container text-xs font-label-sm transition-all whitespace-nowrap shadow-2xs border border-outline-variant/30 cursor-pointer"
              >
                "Can you reduce my budget?"
              </button>
              <button
                type="button"
                onClick={() => handlePromptChip('What activities are scheduled for Day 1?')}
                className="px-3.5 py-1 rounded-full bg-surface-container-lowest text-on-surface-variant hover:text-on-surface hover:bg-surface-container text-xs font-label-sm transition-all whitespace-nowrap shadow-2xs border border-outline-variant/30 cursor-pointer"
              >
                "What activities are scheduled for Day 1?"
              </button>
            </div>

            {/* Input Bar */}
            <form
              onSubmit={handleSubmit}
              className="bg-surface-container-lowest rounded-full p-1.5 shadow-md border border-outline-variant/40 flex items-center gap-2"
            >
              <button
                type="button"
                className="w-9 h-9 rounded-full flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
                title="Attach query note"
              >
                <span className="material-symbols-outlined text-[18px]">attach_file</span>
              </button>

              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={`Ask TravelPilot to adjust timing, find a restaurant in ${cityName}, or check transit...`}
                className="flex-1 bg-transparent px-2 py-2 text-sm font-body-md text-on-surface placeholder:text-on-surface-variant focus:outline-none min-w-0"
              />

              <button
                type="submit"
                disabled={isLoading || !inputText.trim()}
                className="w-9 h-9 rounded-full bg-primary text-on-primary hover:bg-neutral-800 flex items-center justify-center transition-transform hover:scale-105 active:scale-95 shadow-xs cursor-pointer disabled:opacity-40"
                title="Send message"
              >
                <span className="material-symbols-outlined text-[18px]">arrow_upward</span>
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: LIVE TRIP CONTEXT CARD (approx 35% / 4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-space-lg lg:sticky lg:top-24">
          <div className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-xs border border-outline-variant/30 flex flex-col gap-space-md">
            <div className="flex items-start justify-between">
              <div>
                <span className="font-label-sm text-xs uppercase tracking-widest text-secondary font-bold">
                  Active Trip Context
                </span>
                <h2 className="font-headline-md text-xl font-bold text-on-surface mt-0.5">
                  {destinationName}
                </h2>
                <p className="font-body-sm text-xs text-on-surface-variant">
                  {totalDays} Days · {trip?.dates?.start ? `${trip.dates.start} to ${trip.dates.end}` : 'Curated Itinerary'}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-surface-container-low flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined text-[20px]">explore</span>
              </div>
            </div>

            {/* Day 1 Progression */}
            <div className="flex flex-col gap-1.5 pt-1">
              <div className="flex justify-between items-center text-xs font-label-sm">
                <span className="text-on-surface font-semibold">Day 1 Overview</span>
                <span className="text-on-surface-variant">{day1Activities.length} scheduled stops</span>
              </div>
              <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                <div className="bg-secondary h-full rounded-full transition-all duration-500 w-2/5"></div>
              </div>
            </div>

            {/* Real-Time Day 1 Timeline Snapshot */}
            <div className="flex flex-col gap-2.5 pt-2 border-t border-outline-variant/20">
              <span className="font-label-sm text-xs text-on-surface-variant uppercase tracking-wider font-semibold">
                Day 1 Timetable
              </span>

              {day1Activities.length > 0 ? (
                <div className="relative pl-5 flex flex-col gap-3 before:content-[''] before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-[1.5px] before:bg-surface-container">
                  {day1Activities.map((act, index) => (
                    <div key={act.id || index} className="relative flex items-start justify-between text-xs">
                      <div className="absolute -left-5 top-1 w-3 h-3 rounded-full bg-secondary"></div>
                      <div className="pr-2 min-w-0">
                        <h4 className="font-semibold text-on-surface truncate">
                          {act.start_time} · {act.name}
                        </h4>
                        <p className="text-on-surface-variant truncate">{act.location || act.type}</p>
                      </div>
                      <span className="text-on-surface-variant shrink-0 font-medium">{formatCost(act.estimated_cost)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-on-surface-variant py-2">
                  Activities will populate once itinerary generation completes.
                </div>
              )}
            </div>

            {/* Live Advisory Pill */}
            <div className="mt-2 p-3 rounded-xl bg-surface-container-low border border-outline-variant/30 flex items-center gap-2 text-xs text-on-surface-variant">
              <span className="material-symbols-outlined text-[16px] text-secondary">
                wb_sunny
              </span>
              <span>Weather advisory: Mild / Clear · Feasible walking conditions</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
