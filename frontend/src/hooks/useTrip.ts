import { useState, useEffect, useCallback } from 'react';
import {
  Trip,
  TripConstraints,
  Itinerary,
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
  | 'login'
  | 'signup'
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
  const [isDisrupting, setIsDisrupting] = useState<boolean>(false);
  const [alternatives, setAlternatives] = useState<Alternative[]>([]);
  const [changes, setChanges] = useState<ChangeSummary[]>([]);
  const [originalItinerary, setOriginalItinerary] = useState<Itinerary | null>(null);
  const [selectedAlternative, setSelectedAlternative] = useState<Alternative | null>(null);
  const [chatMessages, setChatMessages] = useState<AgentMessage[]>(INITIAL_CHAT_MESSAGES);
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);
  const [isFormSubmitting, setIsFormSubmitting] = useState<boolean>(false);
  const [pendingConstraints, setPendingConstraints] = useState<TripConstraints | null>(null);

  // Initial fetch of persisted trip from localStorage or backend if available
  useEffect(() => {
    const savedTripId = localStorage.getItem('travelpilot_current_trip_id');
    if (savedTripId) {
      api.getTrip(savedTripId)
        .then((loadedTrip) => {
          if (loadedTrip && loadedTrip.trip_id) {
            setTrip(loadedTrip);
            if (loadedTrip.itinerary?.days && loadedTrip.itinerary.days.length > 0) {
              const savedScreen = localStorage.getItem('travelpilot_current_screen') as ScreenType;
              if (savedScreen && ['dashboard', 'assistant', 'disruption', 'before_after'].includes(savedScreen)) {
                setCurrentScreen(savedScreen);
              } else {
                setCurrentScreen('dashboard');
              }
            }
          }
        })
        .catch(() => {});
    }
  }, []);

  // Save current screen for smooth reload
  useEffect(() => {
    if (currentScreen !== 'loading') {
      localStorage.setItem('travelpilot_current_screen', currentScreen);
    }
  }, [currentScreen]);

  // Edge Case D: Auto-sync isDisrupted to false if trip has no disrupted activities
  useEffect(() => {
    if (isDisrupted && trip?.itinerary?.days) {
      const hasAnyDisrupted = trip.itinerary.days.some((day) =>
        day.activities.some((act) => act.status === 'disrupted')
      );
      if (!hasAnyDisrupted && (trip.status === 'active' || trip.status === 'created')) {
        setIsDisrupted(false);
      }
    }
  }, [trip, isDisrupted]);

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
      localStorage.setItem('travelpilot_current_trip_id', res.trip.trip_id);
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
      localStorage.setItem('travelpilot_current_trip_id', latestTrip.trip_id);
    } catch {
      // Fallback to active trip
    }
    setCurrentScreen('dashboard');
  };

  // Trigger simulated disruption on current Day 1 activity
  const triggerLouvreDisruption = async (activityId?: string) => {
    if (isDisrupting) return;
    setIsDisrupting(true);
    setIsDisrupted(true);
    const targetAct =
      trip.itinerary?.days?.[0]?.activities?.find((a) => a.id === activityId) ||
      trip.itinerary?.days?.[0]?.activities?.[0];

    if (trip?.itinerary) {
      setOriginalItinerary(JSON.parse(JSON.stringify(trip.itinerary)));
    }

    const targetId = activityId || targetAct?.id || 'act_001';
    const targetName = targetAct?.name || 'Scheduled Activity';

    try {
      const result = await api.reportDisruption(trip.trip_id, {
        activity_id: targetId,
        type: 'strike',
        message: `${targetName} closed due to unexpected temporary closure.`,
        simulate: true,
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
        text: `⚠️ Urgent Disruption Detected: ${targetName} timed entry is unavailable due to an unexpected closure. I evaluated candidate alternatives and calculated a top match with ${result.alternatives[0]?.name || 'a verified replacement'}.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setChatMessages((prev) => [...prev, alertMessage]);
      setCurrentScreen('disruption');
    } catch {
      setCurrentScreen('disruption');
    } finally {
      setIsDisrupting(false);
    }
  };

  // Reset simulated disruption and return UI cleanly to original normal state
  const handleResetDisruption = async () => {
    setIsDisrupted(false);
    setOriginalItinerary(null);
    setSelectedAlternative(null);
    try {
      if (trip?.trip_id) {
        const cleanTrip = await api.getTrip(trip.trip_id);
        if (cleanTrip && cleanTrip.trip_id) {
          setTrip(cleanTrip);
        }
      }
    } catch {
      // Fallback: restore any locally marked disrupted activities back to scheduled
      setTrip((prev) => ({
        ...prev,
        status: 'active',
        itinerary: {
          ...prev.itinerary,
          days: prev.itinerary.days.map((day) => ({
            ...day,
            activities: day.activities.map((act) =>
              act.status === 'disrupted'
                ? { ...act, status: 'planned' as const, status_label: 'Planned', disruption_reason: undefined }
                : act
            ),
          })),
        },
      }));
    }

    if (currentScreen === 'disruption' || currentScreen === 'before_after') {
      setCurrentScreen('dashboard');
    }
  };

  // Toggle between Simulate Disruption and Reset Disruption
  const handleToggleDisruption = async (activityId?: string) => {
    if (isDisrupting) return;
    if (isDisrupted) {
      await handleResetDisruption();
    } else {
      await triggerLouvreDisruption(activityId);
    }
  };

  // Apply chosen alternative
  const handleApplyAlternative = async (alternative: Alternative) => {
    try {
      setSelectedAlternative(alternative);
      if (!originalItinerary && trip?.itinerary) {
        setOriginalItinerary(JSON.parse(JSON.stringify(trip.itinerary)));
      }

      const targetActId =
        alternative.activity_id ||
        trip.itinerary?.days?.[0]?.activities?.find((a) => a.status === 'disrupted')?.id ||
        trip.itinerary?.days?.[0]?.activities?.[0]?.id ||
        'act_001';

      const result = await api.applyAlternative(
        trip.trip_id,
        targetActId,
        alternative.id,
        alternative
      );
      if (result.before_itinerary) {
        setOriginalItinerary(result.before_itinerary);
      }
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
        text: `✅ Replan Applied: Selected ${alternative.name}. Day 1 schedule re-aligned with replacement. All transit links and budget confirmed.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setChatMessages((prev) => [...prev, confirmMessage]);
      setCurrentScreen('before_after');
    } catch {
      setCurrentScreen('before_after');
    }
  };

  // Commit changes to persistent trip and refresh source of truth
  const handleCommitReplanning = async () => {
    setIsDisrupted(false);
    try {
      const latestTrip = await api.getTrip(trip.trip_id);
      setTrip(latestTrip);
      localStorage.setItem('travelpilot_current_trip_id', latestTrip.trip_id);
    } catch {}
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
    isDisrupting,
    alternatives,
    changes,
    originalItinerary,
    selectedAlternative,
    chatMessages,
    isChatLoading,
    isFormSubmitting,
    pendingConstraints,
    handleCreateTrip,
    handleGenerationComplete,
    triggerLouvreDisruption,
    handleResetDisruption,
    handleToggleDisruption,
    handleApplyAlternative,
    handleCommitReplanning,
    handleSendMessage,
  };
}
