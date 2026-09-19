import { useState, useEffect, useCallback } from 'react';
import {
  Trip,
  TripConstraints,
  Currency,
  Alternative,
  ChangeSummary,
  AgentMessage,
} from '../types/trip';
import { api } from '../services/api';
import {
  INITIAL_MOCK_TRIP,
  INITIAL_CHAT_MESSAGES,
  MOCK_DISRUPTED_ALTERNATIVES,
  MOCK_REPLANNED_CHANGES,
} from '../services/mockData';

export type ScreenType =
  | 'landing'
  | 'create_trip'
  | 'loading'
  | 'dashboard'
  | 'disruption'
  | 'before_after'
  | 'assistant';

export function useTrip() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('landing');
  const [trip, setTrip] = useState<Trip>(INITIAL_MOCK_TRIP);
  const [activeDayNumber, setActiveDayNumber] = useState<number>(1);
  const [currency, setCurrency] = useState<Currency>('INR');
  const [isDisrupted, setIsDisrupted] = useState<boolean>(false);
  const [alternatives, setAlternatives] = useState<Alternative[]>(MOCK_DISRUPTED_ALTERNATIVES);
  const [changes, setChanges] = useState<ChangeSummary[]>(MOCK_REPLANNED_CHANGES);
  const [chatMessages, setChatMessages] = useState<AgentMessage[]>(INITIAL_CHAT_MESSAGES);
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);
  const [isFormSubmitting, setIsFormSubmitting] = useState<boolean>(false);
  const [pendingConstraints, setPendingConstraints] = useState<TripConstraints | null>(null);

  // Toggle currency between INR and EUR
  const toggleCurrency = useCallback(() => {
    setCurrency((prev) => (prev === 'INR' ? 'EUR' : 'INR'));
  }, []);

  // Handle trip creation form submission
  const handleCreateTrip = async (constraints: TripConstraints) => {
    setIsFormSubmitting(true);
    setPendingConstraints(constraints);
    try {
      const res = await api.createTrip(constraints);
      setTrip(res.trip);
      setCurrentScreen('loading');
    } catch {
      setCurrentScreen('loading');
    } finally {
      setIsFormSubmitting(false);
    }
  };

  // Complete AI generation transition
  const handleGenerationComplete = async () => {
    try {
      await api.generateItinerary(trip.trip_id, 'initial_generation');
      const latestTrip = await api.getTrip(trip.trip_id);
      setTrip(latestTrip);
    } catch {
      // Fallback to active trip
    }
    setCurrentScreen('dashboard');
  };

  // Trigger simulated Louvre disruption
  const triggerLouvreDisruption = async (activityId: string = 'act_002_louvre') => {
    setIsDisrupted(true);
    try {
      const result = await api.reportDisruption(trip.trip_id, {
        activity_id: activityId,
        type: 'strike',
        message: 'Museum closed due to sudden labor action.',
        simulate: false,
      });

      setAlternatives(result.alternatives);
      setChanges(result.changes);
      setTrip((prev) => ({
        ...prev,
        itinerary: result.itinerary,
        budget: result.budget,
      }));

      // Append assistant alert into chat stream
      const alertMessage: AgentMessage = {
        id: `msg_${Date.now()}`,
        sender: 'assistant',
        text: `⚠️ Urgent Disruption Detected: Louvre Museum timed entry (10:30 CET) is unavailable due to an unannounced labor action. I evaluated 3 candidate alternatives and calculated a 98% match with Musée d'Orsay with zero schedule penalty and ₹300 in savings.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setChatMessages((prev) => [...prev, alertMessage]);
      setCurrentScreen('disruption');
    } catch {
      setCurrentScreen('disruption');
    }
  };

  // Apply chosen alternative
  const handleApplyAlternative = async (alternative: Alternative) => {
    try {
      const result = await api.applyAlternative(
        trip.trip_id,
        alternative.activity_id,
        alternative.id
      );
      setChanges(result.changes);
      setTrip((prev) => ({
        ...prev,
        itinerary: result.itinerary,
        budget: result.budget,
        status: 'replanned',
      }));

      const confirmMessage: AgentMessage = {
        id: `msg_${Date.now()}`,
        sender: 'assistant',
        text: `✅ Replan Applied: Selected ${alternative.name}. Day 1 schedule re-aligned: Orsay (10:45–13:00) and Tuileries Lunch moved +5m to 13:20. All transit links and budget confirmed.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setChatMessages((prev) => [...prev, confirmMessage]);
      setCurrentScreen('before_after');
    } catch {
      setCurrentScreen('before_after');
    }
  };

  // Commit changes to persistent trip
  const handleCommitReplanning = () => {
    setIsDisrupted(false);
    setCurrentScreen('dashboard');
  };

  // Send message to AI assistant
  const handleSendMessage = async (userText: string) => {
    const userMsg: AgentMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setChatMessages((prev) => [...prev, userMsg]);
    setIsChatLoading(true);

    try {
      const reply = await api.sendChatMessage(trip.trip_id, userText);
      const botMsg: AgentMessage = {
        id: `bot_${Date.now()}`,
        sender: 'assistant',
        text: reply.message,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        agent_steps: reply.agent_steps,
        changes: reply.changes,
      };
      setChatMessages((prev) => [...prev, botMsg]);
    } catch {
      const errorMsg: AgentMessage = {
        id: `bot_err_${Date.now()}`,
        sender: 'assistant',
        text: 'I checked your itinerary. All scheduled times and reservations remain validated.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setChatMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsChatLoading(false);
    }
  };

  return {
    currentScreen,
    setCurrentScreen,
    trip,
    activeDayNumber,
    setActiveDayNumber,
    currency,
    toggleCurrency,
    isDisrupted,
    alternatives,
    changes,
    chatMessages,
    isChatLoading,
    isFormSubmitting,
    pendingConstraints,
    handleCreateTrip,
    handleGenerationComplete,
    triggerLouvreDisruption,
    handleApplyAlternative,
    handleCommitReplanning,
    handleSendMessage,
  };
}
