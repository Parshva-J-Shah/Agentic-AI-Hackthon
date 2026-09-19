import React, { useState, useRef, useEffect } from 'react';
import { AgentMessage } from '../types/trip';

interface AgentChatProps {
  messages: AgentMessage[];
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  isSidebarMode?: boolean;
}

export const AgentChat: React.FC<AgentChatProps> = ({
  messages,
  onSendMessage,
  isLoading = false,
  isSidebarMode = false,
}) => {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const promptSuggestions = [
    'What should I do tomorrow morning?',
    'What is my estimated remaining budget?',
    'Can I fit another activity on Day 2?',
    'What happens if Louvre booking is cancelled?',
  ];

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputValue.trim() || isLoading) return;
    onSendMessage(inputValue.trim());
    setInputValue('');
  };

  const handleChipClick = (suggestion: string) => {
    if (isLoading) return;
    onSendMessage(suggestion);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div
      className={`bg-surface-container-lowest rounded-xl p-4 sm:p-5 shadow-xs border border-outline-variant/60 flex flex-col ${
        isSidebarMode ? 'h-[460px]' : 'min-h-[580px] h-[calc(100vh-140px)]'
      }`}
    >
      {/* Agent Header */}
      <div className="flex items-center justify-between pb-3 border-b border-outline-variant/40 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="relative w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-xl">smart_toy</span>
            <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-tertiary ring-2 ring-surface-container-lowest"></span>
          </div>
          <div>
            <h3 className="font-title-md text-sm sm:text-base font-bold text-on-surface leading-tight">
              TravelPilot Concierge
            </h3>
            <span className="font-code-sm text-[10px] text-on-surface-variant leading-none">
              Autonomous Travel Intelligence
            </span>
          </div>
        </div>
        <span className="px-2 py-0.5 rounded bg-surface-container text-on-surface-variant font-code-sm text-[10px] font-semibold">
          Dual-LLM Mode
        </span>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto py-3 space-y-3 pr-1 text-on-surface" id="chat-stream">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-2.5 ${
              msg.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {msg.sender === 'assistant' && (
              <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                <span className="material-symbols-outlined text-xs">auto_awesome</span>
              </div>
            )}

            <div
              className={`p-3 rounded-2xl text-xs sm:text-sm leading-relaxed max-w-[85%] ${
                msg.sender === 'user'
                  ? 'bg-primary text-on-primary rounded-tr-xs shadow-xs'
                  : 'bg-surface-container-low text-on-surface rounded-tl-xs border border-outline-variant/40'
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.text}</p>
              <div
                className={`mt-1 text-[10px] font-code-sm text-right ${
                  msg.sender === 'user' ? 'text-on-primary/70' : 'text-on-surface-variant'
                }`}
              >
                {msg.timestamp}
              </div>
            </div>
          </div>
        ))}

        {/* Loading / Thinking Indicator */}
        {isLoading && (
          <div className="flex items-start gap-2.5">
            <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5 animate-spin">
              <span className="material-symbols-outlined text-xs">sync</span>
            </div>
            <div className="bg-surface-container-low p-3 rounded-2xl rounded-tl-xs text-xs text-on-surface-variant flex items-center gap-1.5 border border-outline-variant/40">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse delay-100"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse delay-200"></span>
              <span className="font-code-sm text-[11px] ml-1">Evaluating itinerary constraints...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompt Chips */}
      <div className="py-2 flex gap-1.5 overflow-x-auto no-scrollbar shrink-0 border-t border-outline-variant/30">
        {promptSuggestions.map((suggestion, i) => (
          <button
            key={i}
            type="button"
            onClick={() => handleChipClick(suggestion)}
            className="shrink-0 px-2.5 py-1 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface font-label-sm text-[11px] whitespace-nowrap transition-colors border border-outline-variant/40"
          >
            {suggestion}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form
        onSubmit={handleSend}
        className="pt-2 border-t border-outline-variant/40 flex items-center gap-2 shrink-0"
      >
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Ask TravelPilot anything about your trip..."
          disabled={isLoading}
          className="flex-1 bg-surface-container-low text-on-surface placeholder:text-on-surface-variant/60 font-body-sm text-xs sm:text-sm px-3.5 py-2.5 rounded-lg outline-none focus:ring-2 focus:ring-primary/50 transition-all border border-outline-variant/40"
        />
        <button
          type="submit"
          disabled={isLoading || !inputValue.trim()}
          className="p-2.5 bg-primary text-on-primary rounded-lg hover:bg-primary-container disabled:opacity-50 transition-colors shrink-0 shadow-xs flex items-center justify-center"
          title="Send query"
        >
          <span className="material-symbols-outlined text-lg">send</span>
        </button>
      </form>
    </div>
  );
};
