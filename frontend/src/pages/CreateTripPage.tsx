import React from 'react';
import { TripConstraints } from '../types/trip';
import { TripForm } from '../components/TripForm';

interface CreateTripPageProps {
  onSubmit: (constraints: TripConstraints) => void;
  isLoading?: boolean;
}

export const CreateTripPage: React.FC<CreateTripPageProps> = ({ onSubmit, isLoading }) => {
  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12 py-8 pb-20">
      <TripForm onSubmit={onSubmit} isLoading={isLoading} />
    </div>
  );
};
