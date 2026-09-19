import React from 'react';
import { useTrip } from './hooks/useTrip';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { LandingPage } from './pages/LandingPage';
import { CreateTripPage } from './pages/CreateTripPage';
import { LoadingPage } from './pages/LoadingPage';
import { DashboardPage } from './pages/DashboardPage';
import { DisruptionPage } from './pages/DisruptionPage';
import { BeforeAfterPage } from './pages/BeforeAfterPage';
import { AssistantPage } from './pages/AssistantPage';

export function App() {
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
    triggerLouvreDisruption,
    handleApplyAlternative,
    handleCommitReplanning,
    handleSendMessage,
  } = useTrip();

  return (
    <div className="min-h-screen bg-background font-body-md text-on-surface flex flex-col antialiased">
      {/* Global Brand Header */}
      <Header
        currentScreen={currentScreen}
        onNavigate={(screen) => setCurrentScreen(screen as any)}
        currency={currency}
        onCurrencyToggle={toggleCurrency}
        onTriggerDisruption={() => triggerLouvreDisruption()}
        isDisrupted={isDisrupted}
      />

      {/* Main Screen Canvas */}
      <main className="flex-1 pt-24">
        {currentScreen === 'landing' && (
          <LandingPage
            onPlanTrip={() => setCurrentScreen('create_trip')}
            onExploreDemo={() => setCurrentScreen('dashboard')}
            onTriggerDisruption={() => triggerLouvreDisruption()}
          />
        )}

        {currentScreen === 'create_trip' && (
          <CreateTripPage
            onSubmit={handleCreateTrip}
            isLoading={isFormSubmitting}
          />
        )}

        {currentScreen === 'loading' && (
          <LoadingPage
            constraints={pendingConstraints}
            onComplete={handleGenerationComplete}
          />
        )}

        {currentScreen === 'dashboard' && (
          <DashboardPage
            trip={trip}
            currency={currency}
            activeDayNumber={activeDayNumber}
            onSelectDay={setActiveDayNumber}
            isDisrupted={isDisrupted}
            onTriggerDisruption={() => triggerLouvreDisruption()}
            onAutoApplyFix={() => handleApplyAlternative(alternatives[0])}
            onInspectBeforeAfter={() => setCurrentScreen('before_after')}
            onDismissDisruptionBanner={() => setCurrentScreen('dashboard')}
            chatMessages={chatMessages}
            onSendChatMessage={handleSendMessage}
            isChatLoading={isChatLoading}
            onViewAlternatives={() => setCurrentScreen('disruption')}
          />
        )}

        {currentScreen === 'disruption' && (
          <DisruptionPage
            alternatives={alternatives}
            currency={currency}
            onPreviewAlternative={() => setCurrentScreen('before_after')}
            onApplyAlternative={handleApplyAlternative}
            onBackToDashboard={() => setCurrentScreen('dashboard')}
            trip={trip}
          />
        )}

        {currentScreen === 'before_after' && (
          <BeforeAfterPage
            changes={changes}
            currency={currency}
            onCommit={handleCommitReplanning}
            onRevert={() => setCurrentScreen('disruption')}
          />
        )}

        {currentScreen === 'assistant' && (
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
      <Footer />
    </div>
  );
}

export default App;
