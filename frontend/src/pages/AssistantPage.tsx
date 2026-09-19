import React, { useState } from 'react';
import { AgentMessage } from '../types/trip';

interface AssistantPageProps {
  messages: AgentMessage[];
  onSendMessage: (msg: string) => void;
  isLoading: boolean;
  onBackToDashboard: () => void;
}

export const AssistantPage: React.FC<AssistantPageProps> = ({
  messages,
  onSendMessage,
  isLoading,
  onBackToDashboard,
}) => {
  const [inputText, setInputText] = useState('');
  const [proposalApplied, setProposalApplied] = useState(false);

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
                  Connected to Day 1 Itinerary · Paris Expedition
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
                Monday, 12 October · Day 1
              </div>
            </div>

            {/* MESSAGE 1: User Sample */}
            <div className="flex flex-col items-end gap-1.5 self-end max-w-[85%] sm:max-w-[75%]">
              <div className="bg-primary text-on-primary rounded-2xl rounded-tr-xs px-space-lg py-space-md shadow-xs">
                <p className="font-body-md text-sm sm:text-base">What should I do tomorrow morning?</p>
              </div>
              <span className="font-label-sm text-[11px] text-on-surface-variant px-1">08:24 PM</span>
            </div>

            {/* MESSAGE 1: AI Concierge with Curated Location Vignette */}
            <div className="flex flex-col items-start gap-1 self-start max-w-full sm:max-w-[92%]">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-label-sm text-xs font-bold text-on-surface">TravelPilot</span>
                <span className="font-label-sm text-[11px] text-on-surface-variant">08:25 PM</span>
              </div>
              <div className="bg-surface-container-lowest text-on-surface rounded-2xl rounded-tl-xs p-space-lg shadow-xs border border-outline-variant/30 flex flex-col gap-space-md w-full">
                <p className="font-body-md text-sm sm:text-base leading-relaxed">
                  Bonjour! Tomorrow morning <span className="font-semibold text-on-surface">(Day 1)</span> begins at 09:15 at <em>Café de Flore</em> in Saint-Germain. Enjoy a leisurely coffee on the terrace before your 10:45 timed entry at <em>Musée d'Orsay</em>, which is an easy 12-minute stroll across Boulevard Saint-Germain.
                </p>

                {/* Curated Location Vignette */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-sm bg-surface-container-low rounded-xl p-space-sm border border-outline-variant/20">
                  <div className="relative h-28 sm:h-full rounded-lg overflow-hidden">
                    <img
                      className="w-full h-full object-cover"
                      src="https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=400&q=80"
                      alt="Café de Flore terrace"
                    />
                  </div>
                  <div className="sm:col-span-2 flex flex-col justify-between p-1">
                    <div>
                      <span className="font-label-sm text-xs text-secondary tracking-wider uppercase font-semibold">
                        09:15 AM · Breakfast
                      </span>
                      <h4 className="font-headline-sm text-base font-bold text-on-surface mt-0.5">
                        Café de Flore
                      </h4>
                      <p className="font-body-sm text-xs text-on-surface-variant mt-1">
                        Recommended: Double espresso and fresh pain au chocolat under the covered terrace awning.
                      </p>
                    </div>
                    <div className="flex items-center gap-space-md mt-2 pt-2 border-t border-outline-variant/20 text-xs font-label-sm text-on-surface-variant">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px] text-secondary">footprint</span>
                        12 min to Orsay
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">payments</span>
                        €18 / ₹1,620 est.
                      </span>
                    </div>
                  </div>
                </div>

                <p className="font-body-md text-sm sm:text-base leading-relaxed text-on-surface-variant">
                  Would you like me to suggest the quietest scenic walking route past the Seine?
                </p>

                {/* Interactive Prompt Chips */}
                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handlePromptChip('Show walking route')}
                    className="px-space-md py-1.5 rounded-full bg-surface-container text-on-surface hover:bg-surface-container-high text-xs font-label-sm transition-all flex items-center gap-1.5 shadow-2xs border border-outline-variant/30 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px] text-secondary">map</span>
                    <span>Show walking route</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePromptChip('Suggest breakfast alternatives')}
                    className="px-space-md py-1.5 rounded-full bg-surface-container text-on-surface hover:bg-surface-container-high text-xs font-label-sm transition-all flex items-center gap-1.5 shadow-2xs border border-outline-variant/30 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">bakery_dining</span>
                    <span>Suggest breakfast alternatives</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePromptChip('Check morning weather')}
                    className="px-space-md py-1.5 rounded-full bg-surface-container text-on-surface hover:bg-surface-container-high text-xs font-label-sm transition-all flex items-center gap-1.5 shadow-2xs border border-outline-variant/30 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">wb_twilight</span>
                    <span>Check morning weather</span>
                  </button>
                </div>
              </div>
            </div>

            {/* MESSAGE 2: User Sample */}
            <div className="flex flex-col items-end gap-1.5 self-end max-w-[85%] sm:max-w-[75%]">
              <div className="bg-primary text-on-primary rounded-2xl rounded-tr-xs px-space-lg py-space-md shadow-xs">
                <p className="font-body-md text-sm sm:text-base">
                  The weather forecast says light rain in the afternoon. Can we swap the outdoor cruise?
                </p>
              </div>
              <span className="font-label-sm text-[11px] text-on-surface-variant px-1">08:27 PM</span>
            </div>

            {/* MESSAGE 2: AI Concierge with Schedule Shift Proposal Card */}
            <div className="flex flex-col items-start gap-1 self-start max-w-full sm:max-w-[92%]">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-label-sm text-xs font-bold text-on-surface">TravelPilot</span>
                <span className="font-label-sm text-[11px] text-on-surface-variant">08:28 PM</span>
              </div>
              <div className="bg-surface-container-lowest text-on-surface rounded-2xl rounded-tl-xs p-space-lg shadow-xs border border-outline-variant/30 flex flex-col gap-space-md w-full">
                <p className="font-body-md text-sm sm:text-base leading-relaxed">
                  I checked your Day 1 schedule. Moving your Seine Cruise from 15:00 to Day 3 afternoon is seamless. In its place, I can suggest the covered galleries of <span className="font-semibold text-on-surface">Palais-Royal</span> or <span className="font-semibold text-on-surface">Musée de l'Orangerie</span> right after your Tuileries lunch.
                </p>

                {/* Smart Reschedule Proposal Container */}
                <div className="p-space-md rounded-2xl bg-surface-container-low border border-outline-variant/30 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="font-label-sm text-xs text-on-surface-variant uppercase tracking-wider font-semibold">
                      Smart Reschedule Proposal
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-sm text-xs font-semibold">
                      Protected Timing
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-surface-container-lowest flex items-start gap-2.5 border border-outline-variant/20">
                      <span className="material-symbols-outlined text-error text-[20px] mt-0.5">
                        remove_circle_outline
                      </span>
                      <div>
                        <div className="font-label-md text-xs text-on-surface line-through font-semibold">
                          Day 1 · 15:00
                        </div>
                        <div className="font-body-sm text-xs text-on-surface-variant">
                          Vedettes du Pont Neuf (Rain risk 78%)
                        </div>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-surface-container-lowest flex items-start gap-2.5 border border-secondary/30">
                      <span className="material-symbols-outlined text-secondary text-[20px] mt-0.5">
                        swap_horiz
                      </span>
                      <div>
                        <div className="font-label-md text-xs text-secondary font-bold">
                          Day 1 · 15:00 Alternative
                        </div>
                        <div className="font-body-sm text-xs text-on-surface-variant">
                          Covered Palais-Royal Arcades &amp; Salon
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-xs">
                    <div className="flex items-center gap-1.5 text-on-surface-variant font-body-sm">
                      <span className="material-symbols-outlined text-[16px] text-secondary">
                        umbrella
                      </span>
                      <span>100% covered walkways · ₹0 budget delta</span>
                    </div>
                    <span className="font-label-sm font-semibold text-secondary">₹0 Delta</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-space-sm pt-1">
                  <button
                    type="button"
                    onClick={() => setProposalApplied(true)}
                    disabled={proposalApplied}
                    className="px-space-lg py-2 rounded-full bg-primary text-on-primary hover:bg-neutral-800 transition-all font-label-md text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-xs cursor-pointer disabled:opacity-60"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {proposalApplied ? 'check_circle' : 'check'}
                    </span>
                    <span>{proposalApplied ? 'Schedule Updated!' : 'Apply This Update'}</span>
                  </button>
                  <button
                    type="button"
                    className="px-space-md py-2 rounded-full bg-surface-container text-on-surface hover:bg-surface-container-high transition-all font-label-md text-xs sm:text-sm cursor-pointer"
                  >
                    Keep Original Plan
                  </button>
                </div>
              </div>
            </div>

            {/* Dynamic Real Chat Messages */}
            {messages.slice(2).map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col gap-1 ${
                    isUser ? 'items-end self-end max-w-[85%]' : 'items-start self-start max-w-[92%]'
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
                        : 'bg-surface-container-lowest text-on-surface border border-outline-variant/30 rounded-tl-xs'
                    }`}
                  >
                    <p className="font-body-md text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
                      {msg.text}
                    </p>
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-center gap-2 p-4 bg-surface-container-lowest rounded-2xl border border-outline-variant/30 w-fit">
                <div className="w-4 h-4 rounded-full border-2 border-secondary border-t-transparent animate-spin"></div>
                <span className="font-label-sm text-xs text-on-surface-variant">
                  TravelPilot is querying itinerary constraints...
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
                onClick={() => handlePromptChip('What activities are near my hotel?')}
                className="px-3.5 py-1 rounded-full bg-surface-container-lowest text-on-surface-variant hover:text-on-surface hover:bg-surface-container text-xs font-label-sm transition-all whitespace-nowrap shadow-2xs border border-outline-variant/30 cursor-pointer"
              >
                "What activities are near my hotel?"
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
                onClick={() => handlePromptChip('Add a vintage bookstore')}
                className="px-3.5 py-1 rounded-full bg-surface-container-lowest text-on-surface-variant hover:text-on-surface hover:bg-surface-container text-xs font-label-sm transition-all whitespace-nowrap shadow-2xs border border-outline-variant/30 cursor-pointer"
              >
                "Add a vintage bookstore"
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
                title="Attach reservation voucher"
              >
                <span className="material-symbols-outlined text-[18px]">attach_file</span>
              </button>

              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ask TravelPilot to adjust timing, find a bistro, or re-route..."
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
                  Paris Expedition
                </h2>
                <p className="font-body-sm text-xs text-on-surface-variant">
                  5 Days · Architectural &amp; Culinary Rhythm
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-surface-container-low flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined text-[20px]">explore</span>
              </div>
            </div>

            {/* Day 1 Progression */}
            <div className="flex flex-col gap-1.5 pt-1">
              <div className="flex justify-between items-center text-xs font-label-sm">
                <span className="text-on-surface font-semibold">Day 1 Progression</span>
                <span className="text-on-surface-variant">2 of 5 stops complete</span>
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

              <div className="relative pl-5 flex flex-col gap-3 before:content-[''] before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-[1.5px] before:bg-surface-container">
                {/* Stop 1 */}
                <div className="relative flex items-start justify-between text-xs">
                  <div className="absolute -left-5 top-1 w-3 h-3 rounded-full bg-secondary"></div>
                  <div>
                    <h4 className="font-semibold text-on-surface">09:15 · Café de Flore</h4>
                    <p className="text-on-surface-variant">Breakfast terrace</p>
                  </div>
                  <span className="text-on-surface-variant">₹1,620</span>
                </div>

                {/* Stop 2 */}
                <div className="relative flex items-start justify-between text-xs">
                  <div className="absolute -left-5 top-1 w-3 h-3 rounded-full bg-secondary"></div>
                  <div>
                    <h4 className="font-semibold text-on-surface">10:45 · Musée d'Orsay</h4>
                    <p className="text-on-surface-variant">Impressionist entry</p>
                  </div>
                  <span className="text-on-surface-variant">₹1,440</span>
                </div>

                {/* Stop 3 */}
                <div className="relative flex items-start justify-between text-xs">
                  <div className="absolute -left-5 top-1 w-3 h-3 rounded-full bg-secondary-fixed"></div>
                  <div>
                    <h4 className="font-semibold text-on-surface">13:15 · Tuileries Lunch</h4>
                    <p className="text-on-surface-variant">Garden bistro</p>
                  </div>
                  <span className="text-on-surface-variant">₹2,400</span>
                </div>

                {/* Stop 4 */}
                <div className="relative flex items-start justify-between text-xs">
                  <div className="absolute -left-5 top-1 w-3 h-3 rounded-full bg-outline-variant"></div>
                  <div>
                    <h4 className="font-semibold text-on-surface">15:00 · Palais-Royal Arcades</h4>
                    <p className="text-on-surface-variant">Covered walkway route</p>
                  </div>
                  <span className="text-on-surface-variant">₹0</span>
                </div>
              </div>
            </div>

            {/* Live Advisory Pill */}
            <div className="mt-2 p-3 rounded-xl bg-surface-container-low border border-outline-variant/30 flex items-center gap-2 text-xs text-on-surface-variant">
              <span className="material-symbols-outlined text-[16px] text-secondary">
                wb_sunny
              </span>
              <span>Weather demo: 18°C · Rain probability 20%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
