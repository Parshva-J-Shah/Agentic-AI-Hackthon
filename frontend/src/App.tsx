import React, { useState, useEffect } from 'react';
import { useTrip, ScreenType } from './hooks/useTrip';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { PrivacyModal, SupportModal } from './components/InfoModals';
import { LandingPage } from './pages/LandingPage';
import { CreateTripPage } from './pages/CreateTripPage';
import { LoadingPage } from './pages/LoadingPage';
import { DashboardPage } from './pages/DashboardPage';
import { DisruptionPage } from './pages/DisruptionPage';
import { BeforeAfterPage } from './pages/BeforeAfterPage';
import { AssistantPage } from './pages/AssistantPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';

const PROTECTED_SCREENS: ScreenType[] = [
  'create_trip',
  'loading',
  'dashboard',
  'disruption',
  'before_after',
  'assistant',
];

function AppContent() {
  const { user, loading: authLoading } = useAuth();
  const {
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
    handleResetDisruption,
    handleToggleDisruption,
    isDisrupting,
    originalItinerary,
    selectedAlternative,
    handleApplyAlternative,
    handleCommitReplanning,
    handleSendMessage,
  } = useTrip();

  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);

  // Route Guard: Redirect to Login if unauthenticated user tries to access protected screens
  useEffect(() => {
    if (!authLoading && !user && PROTECTED_SCREENS.includes(currentScreen)) {
      setCurrentScreen('login');
    }
  }, [authLoading, user, currentScreen, setCurrentScreen]);

  // Redirect to Dashboard if already authenticated user accesses Login/Signup directly
  useEffect(() => {
    if (!authLoading && user && (currentScreen === 'login' || currentScreen === 'signup')) {
      setCurrentScreen('dashboard');
    }
  }, [authLoading, user, currentScreen, setCurrentScreen]);

  // Loading state while checking persistent Supabase session
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center antialiased">
        <div className="w-9 h-9 rounded-full border-3 border-outline-variant/40 border-t-primary animate-spin mb-4" />
        <span className="font-label-md text-sm text-on-surface-variant font-medium tracking-wide">
          Loading TravelPilot…
        </span>
      </div>
    );
  }

  const navigatePostAuth = () => {
    if (trip?.itinerary?.days && trip.itinerary.days.length > 0) {
      setCurrentScreen('dashboard');
    } else {
      setCurrentScreen('create_trip');
    }
  };

  return (
    <div className="min-h-screen bg-background font-body-md text-on-surface flex flex-col antialiased">
      {/* Global Brand Header */}
      <Header
        currentScreen={currentScreen}
        onNavigate={(screen) => setCurrentScreen(screen as ScreenType)}
        currency={currency}
        onCurrencyToggle={toggleCurrency}
        onTriggerDisruption={() => handleToggleDisruption()}
        isDisrupted={isDisrupted}
        isDisrupting={isDisrupting}
      />

      {/* Main Screen Canvas */}
      <main className="flex-1 pt-24">
        {currentScreen === 'landing' && (
          <LandingPage
            onPlanTrip={() => {
              if (!user) {
                setCurrentScreen('login');
              } else {
                setCurrentScreen('create_trip');
              }
            }}
            onExploreDemo={() => {
              if (!user) {
                setCurrentScreen('login');
              } else {
                setCurrentScreen('dashboard');
              }
            }}
            onTriggerDisruption={() => handleToggleDisruption()}
          />
        )}

        {currentScreen === 'login' && (
          <LoginPage
            onSuccess={navigatePostAuth}
            onNavigateToSignup={() => setCurrentScreen('signup')}
            onNavigateToLanding={() => setCurrentScreen('landing')}
          />
        )}

        {currentScreen === 'signup' && (
          <SignupPage
            onSuccess={navigatePostAuth}
            onNavigateToLogin={() => setCurrentScreen('login')}
            onNavigateToLanding={() => setCurrentScreen('landing')}
          />
        )}

        {/* Protected screens: only rendered when user is authenticated */}
        {user && currentScreen === 'create_trip' && (
          <CreateTripPage
            onSubmit={handleCreateTrip}
            isLoading={isFormSubmitting}
          />
        )}

        {user && currentScreen === 'loading' && (
          <LoadingPage
            constraints={pendingConstraints}
            onComplete={handleGenerationComplete}
          />
        )}

        {user && currentScreen === 'dashboard' && (
          <DashboardPage
            trip={trip}
            currency={currency}
            activeDayNumber={activeDayNumber}
            onSelectDay={setActiveDayNumber}
            isDisrupted={isDisrupted}
            isDisrupting={isDisrupting}
            onTriggerDisruption={() => handleToggleDisruption()}
            onAutoApplyFix={() => handleApplyAlternative(alternatives[0])}
            onInspectBeforeAfter={() => setCurrentScreen('before_after')}
            onDismissDisruptionBanner={() => handleResetDisruption()}
            chatMessages={chatMessages}
            onSendChatMessage={handleSendMessage}
            isChatLoading={isChatLoading}
            onViewAlternatives={() => setCurrentScreen('disruption')}
          />
        )}

        {user && currentScreen === 'disruption' && (
          <DisruptionPage
            alternatives={alternatives}
            currency={currency}
            onPreviewAlternative={() => setCurrentScreen('before_after')}
            onApplyAlternative={handleApplyAlternative}
            onBackToDashboard={() => setCurrentScreen('dashboard')}
            onResetDisruption={handleResetDisruption}
            trip={trip}
          />
        )}

        {user && currentScreen === 'before_after' && (
          <BeforeAfterPage
            trip={trip}
            originalItinerary={originalItinerary || undefined}
            selectedAlternative={selectedAlternative || undefined}
            changes={changes}
            currency={currency}
            onCommit={handleCommitReplanning}
            onRevert={() => setCurrentScreen('disruption')}
          />
        )}

        {user && currentScreen === 'assistant' && (
          <AssistantPage
            messages={chatMessages}
            onSendMessage={handleSendMessage}
            isLoading={isChatLoading}
            onBackToDashboard={() => setCurrentScreen('dashboard')}
            trip={trip}
            currency={currency}
          />
        )}
      </main>

      {/* Global Footer */}
      <Footer
        onNavigateHome={() => setCurrentScreen('landing')}
        onNavigateChat={() => {
          if (!user) {
            setCurrentScreen('login');
          } else {
            setCurrentScreen('assistant');
          }
        }}
        onOpenPrivacy={() => setPrivacyOpen(true)}
        onOpenSupport={() => setSupportOpen(true)}
      />

      {/* Footer Info Modals */}
      <PrivacyModal isOpen={privacyOpen} onClose={() => setPrivacyOpen(false)} />
      <SupportModal isOpen={supportOpen} onClose={() => setSupportOpen(false)} />
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
