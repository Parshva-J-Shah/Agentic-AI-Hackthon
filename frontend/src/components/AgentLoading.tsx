import React, { useState, useEffect } from 'react';
import { useDynamicActivityImage, NEUTRAL_ACTIVITY_PLACEHOLDER } from '../utils/imageUtils';

interface AgentLoadingProps {
  destination?: string;
  dates?: string;
  onComplete: () => void;
}

export const AgentLoading: React.FC<AgentLoadingProps> = ({
  destination = 'Paris, France',
  dates = 'Oct 12 – 16, 2026',
  onComplete,
}) => {
  const dynamicImage = useDynamicActivityImage(destination, undefined, undefined, destination);
  const [currentStepIndex, setCurrentStepIndex] = useState(2);
  const [progressPercent, setProgressPercent] = useState(20);

  const steps = [
    {
      title: 'Understanding your travel preferences',
      desc: 'Art immersion, French dining, and calm unhurried pacing.',
    },
    {
      title: 'Finding top-rated sights & activities',
      desc: 'Handpicked cultural venues and neighborhood bistros.',
    },
    {
      title: 'Building day-by-day itinerary',
      desc: 'Clustering stops geographically and ensuring balanced daily rhythms.',
    },
    {
      title: 'Checking opening hours & travel times',
      desc: 'Verifying verified opening hours and realistic walking buffers.',
    },
    {
      title: 'Calculating budget breakdown',
      desc: 'Allocating expenses across activities, dining, and contingency cushion.',
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setProgressPercent((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => {
            onComplete();
          }, 600);
          return 100;
        }
        const next = prev + Math.floor(Math.random() * 8) + 6;
        return Math.min(next, 100);
      });
    }, 400);

    return () => clearInterval(timer);
  }, [onComplete]);

  useEffect(() => {
    if (progressPercent < 25) setCurrentStepIndex(0);
    else if (progressPercent < 50) setCurrentStepIndex(1);
    else if (progressPercent < 75) setCurrentStepIndex(2);
    else if (progressPercent < 95) setCurrentStepIndex(3);
    else setCurrentStepIndex(4);
  }, [progressPercent]);

  return (
    <div className="relative w-full max-w-xl mx-auto py-8 flex flex-col items-center justify-center">
      {/* Central Photo Card Anchor */}
      <div className="w-full bg-surface-container-lowest rounded-3xl p-3 shadow-md border border-outline-variant/30 mb-8">
        <div className="relative w-full h-56 rounded-2xl overflow-hidden bg-surface-container">
          <img
            src={dynamicImage || NEUTRAL_ACTIVITY_PLACEHOLDER}
            alt={destination}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = NEUTRAL_ACTIVITY_PLACEHOLDER;
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

          {/* Curating Live Pulse Badge */}
          <div className="absolute top-4 left-4 bg-surface-container-lowest/90 backdrop-blur-md px-3.5 py-1.5 rounded-full flex items-center gap-2 shadow-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary"></span>
            </span>
            <span className="font-label-sm text-xs text-on-surface uppercase tracking-wider font-semibold">
              Curating live · {dates}
            </span>
          </div>

          {/* Bottom Destination Caption */}
          <div className="absolute bottom-4 left-5 right-5 text-white">
            <div className="font-label-sm text-xs uppercase tracking-widest text-white/80 font-medium">
              Autonomous Synthesis
            </div>
            <h2 className="font-headline-md text-2xl font-bold text-white drop-shadow-sm">
              {destination}
            </h2>
          </div>
        </div>
      </div>

      {/* Progress Copy Header */}
      <div className="text-center mb-6">
        <h3 className="font-headline-md text-2xl font-bold text-on-surface">
          Planning your trip...
        </h3>
        <p className="font-body-md text-on-surface-variant max-w-md mt-1.5">
          {destination.split(',')[0]} is coming together. We're clustering boutique stays, neighborhood bistros, and checking real-time hours.
        </p>
      </div>

      {/* Thin Progress Bar Container */}
      <div className="w-full bg-surface-container-lowest rounded-2xl p-5 shadow-xs border border-outline-variant/30 flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center font-label-sm text-xs text-on-surface-variant">
            <span>Synthesis Progress</span>
            <span className="font-semibold text-on-surface">{progressPercent}%</span>
          </div>
          <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>

        {/* 5-Stage Checklist */}
        <div className="flex flex-col gap-3.5">
          {steps.map((step, index) => {
            const isCompleted = index < currentStepIndex;
            const isCurrent = index === currentStepIndex;

            return (
              <div
                key={step.title}
                className={`flex items-start gap-3 transition-opacity ${
                  isCompleted || isCurrent ? 'opacity-100' : 'opacity-40'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {isCompleted ? (
                    <div className="w-5 h-5 rounded-full bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center">
                      <span className="material-symbols-outlined text-[14px]">check</span>
                    </div>
                  ) : isCurrent ? (
                    <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
                  ) : (
                    <div className="w-5 h-5 rounded-full border border-outline-variant"></div>
                  )}
                </div>

                <div className="flex flex-col">
                  <span
                    className={`font-label-md text-sm font-semibold ${
                      isCurrent ? 'text-primary' : 'text-on-surface'
                    }`}
                  >
                    {step.title}
                  </span>
                  <span className="font-body-sm text-xs text-on-surface-variant">
                    {step.desc}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
