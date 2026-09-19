import React from 'react';
import { AgentLoading } from '../components/AgentLoading';
import { TripConstraints } from '../types/trip';

interface LoadingPageProps {
  constraints?: TripConstraints | null;
  onComplete: () => void;
}

export const LoadingPage: React.FC<LoadingPageProps> = ({ constraints, onComplete }) => {
  return (
    <div className="w-full min-h-[calc(100vh-140px)] flex items-center justify-center px-4 py-8">
      <AgentLoading
        destination={constraints?.destination || 'Paris, France'}
        dates={
          constraints?.start_date && constraints?.end_date
            ? `${constraints.start_date} – ${constraints.end_date}`
            : 'Oct 10 – 14, 2026'
        }
        onComplete={onComplete}
      />
    </div>
  );
};
