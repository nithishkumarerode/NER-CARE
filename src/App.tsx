import React, { useState, useEffect } from 'react';
import { LocalDatabase } from './database/localDatabase';
import { Language, Patient, Reminder, GameSession, UserRole, GameType } from './types';
import { patientRepository } from './repositories/patientRepository';
import { reminderRepository } from './repositories/reminderRepository';
import { gameSessionRepository } from './repositories/gameSessionRepository';
import { syncRepository } from './repositories/syncRepository';
import { voiceService } from './services/voiceService';

// Navigation & Layout
import { TopHeader } from './components/navigation/TopHeader';
import { BottomNavBar, TabType } from './components/navigation/BottomNavBar';
import { LiveAlarmModal } from './components/reminders/LiveAlarmModal';
import { VoiceAssistantModal } from './components/voice/VoiceAssistantModal';
import { DemoToolbar } from './components/demo/DemoToolbar';

// Pages
import { SplashScreen } from './pages/splash/SplashScreen';
import { OnboardingFlow } from './pages/onboarding/OnboardingFlow';
import { LoginProfileFlow } from './pages/login/LoginProfileFlow';
import { LanguageSelectScreen } from './pages/language/LanguageSelectScreen';
import { HomeDashboard } from './pages/home/HomeDashboard';
import { ProgressScreen } from './pages/progress/ProgressScreen';
import { GamesHub } from './features/games/GamesHub';
import { CaregiverScreen } from './pages/caregiver/CaregiverScreen';
import { SettingsScreen } from './pages/settings/SettingsScreen';
import { RemindersScreen } from './pages/reminders/RemindersScreen';
import { ASHAWorkerDashboard } from './pages/asha/ASHAWorkerDashboard';

// Games
import { GameRouter } from './features/games/GameRouter';
import { AppearanceScreen } from './pages/appearance/AppearanceScreen';

export const App: React.FC = () => {
  // App Core State
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [hasChosenLanguage, setHasChosenLanguage] = useState<boolean>(LocalDatabase.getLanguageSelected());
  const [hasCompletedProfile, setHasCompletedProfile] = useState<boolean>(LocalDatabase.getProfileSetupComplete());
  const [isOnboarding, setIsOnboarding] = useState<boolean>(false);
  const [showLanguageScreen, setShowLanguageScreen] = useState<boolean>(false);
  const [showAppearanceScreen, setShowAppearanceScreen] = useState<boolean>(false);
  const [showRemindersScreen, setShowRemindersScreen] = useState<boolean>(false);
  const [showVoiceModal, setShowVoiceModal] = useState<boolean>(false);
  
  const [currentTab, setCurrentTab] = useState<TabType>('home');
  const [currentRole, setCurrentRole] = useState<UserRole>('patient');
  const [activeGame, setActiveGame] = useState<GameType | null>(null);
  
  // Data Repositories State
  const [patient, setPatient] = useState<Patient>(patientRepository.getPatient());
  const [reminders, setReminders] = useState<Reminder[]>(reminderRepository.getReminders());
  const [sessions, setSessions] = useState<GameSession[]>(gameSessionRepository.getSessions());
  const [isOffline, setIsOffline] = useState<boolean>(syncRepository.isOffline());
  
  // Live Alarm state
  const [alarmReminder, setAlarmReminder] = useState<Reminder | null>(null);
  const [isAlarmOpen, setIsAlarmOpen] = useState<boolean>(false);

  // Apply initial accessibility preferences
  useEffect(() => {
    document.body.classList.remove('text-size-normal', 'text-size-large', 'text-size-xlarge');
    document.body.classList.add(`text-size-${patient.text_size || 'large'}`);

    if (patient.high_contrast) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
  }, [patient]);

  // Periodic network sync worker
  useEffect(() => {
    const syncInterval = setInterval(() => {
      if (!isOffline) {
        syncRepository.processSyncQueue();
      }
    }, 12000);
    return () => clearInterval(syncInterval);
  }, [isOffline]);

  const handlePatientUpdate = (updated: Patient) => {
    setPatient(updated);
  };

  const handleLanguageSelect = (lang: Language) => {
    const updated = patientRepository.updateLanguage(lang);
    setPatient(updated);
    LocalDatabase.setLanguageSelected(true);
    setHasChosenLanguage(true);
    setShowLanguageScreen(false);
  };

  const handleProfileComplete = (updates: Partial<typeof patient>) => {
    const updated = patientRepository.updatePatient(updates);
    setPatient(updated);
    LocalDatabase.setProfileSetupComplete(true);
    setHasCompletedProfile(true);
  };

  const handleTriggerAlarm = (rem?: Reminder) => {
    const target = rem || reminders.find(r => r.type === 'medicine') || reminders[0];
    setAlarmReminder(target);
    setIsAlarmOpen(true);
  };

  const handleAlarmTaken = (id: string) => {
    reminderRepository.markStatus(id, 'taken');
    setReminders(reminderRepository.getReminders());
    setIsAlarmOpen(false);
  };

  const handleAlarmSnooze = (id: string) => {
    reminderRepository.snooze(id);
    setReminders(reminderRepository.getReminders());
    setIsAlarmOpen(false);
  };

  const handleVoiceCommand = (cmd: string) => {
    if (cmd.startsWith('game:')) {
      const type = cmd.split(':')[1] as GameType;
      setActiveGame(type);
    } else if (cmd === 'action:water') {
      const updated = patientRepository.incrementWater();
      setPatient(updated);
    } else if (cmd === 'nav:reminders') {
      setShowRemindersScreen(true);
    } else if (cmd === 'nav:caregiver') {
      setCurrentTab('caregiver');
    } else if (cmd === 'nav:home') {
      setCurrentTab('home');
      setActiveGame(null);
      setShowRemindersScreen(false);
    }
  };

  const nextReminder = reminderRepository.getNextReminder();
  const profile = gameSessionRepository.getCognitiveProfile();

  // 1. SPLASH SCREEN (Page 1)
  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  // 2. FIRST-LAUNCH LANGUAGE SELECTION OR MANUAL SWITCH
  if (!hasChosenLanguage || showLanguageScreen) {
    return (
      <LanguageSelectScreen
        currentLanguage={patient.language_pref}
        onSelectLanguage={handleLanguageSelect}
        onBack={hasChosenLanguage ? () => setShowLanguageScreen(false) : undefined}
        isFirstLaunch={!hasChosenLanguage}
      />
    );
  }

  // 3. FIRST-TIME PROFILE SETUP (shown once after language selection)
  if (!hasCompletedProfile && !showLanguageScreen) {
    return (
      <LoginProfileFlow
        language={patient.language_pref}
        patient={patient}
        onComplete={handleProfileComplete}
      />
    );
  }

  // 4. ONBOARDING & ASSESSMENT SEQUENCE (Pages 2 to 14)
  if (isOnboarding) {
    return (
      <OnboardingFlow
        language={patient.language_pref}
        patient={patient}
        onComplete={(updates) => {
          const updated = patientRepository.updatePatient(updates);
          setPatient(updated);
          setIsOnboarding(false);
        }}
        onSkipToHome={() => setIsOnboarding(false)}
      />
    );
  }

  // 4. THEME & APPEARANCE CUSTOMIZER
  if (showAppearanceScreen) {
    return (
      <AppearanceScreen
        language={patient.language_pref}
        onBack={() => setShowAppearanceScreen(false)}
      />
    );
  }

  // 5. ASHA WORKER DASHBOARD
  if (currentRole === 'asha') {
    return (
      <>
        <ASHAWorkerDashboard
          patient={patient}
          reminders={reminders}
          sessions={sessions}
          onBackToPatient={() => setCurrentRole('patient')}
        />
        <DemoToolbar
          currentRole={currentRole}
          isOffline={isOffline}
          onToggleOffline={() => {
            const next = !isOffline;
            syncRepository.setOfflineSimulation(next);
            setIsOffline(next);
          }}
          onTriggerAlarm={() => handleTriggerAlarm()}
          onSimulateGame={() => {
            gameSessionRepository.recordSession({
              patient_id: patient.patient_id,
              game_type: 'memory_match',
              score: 90,
              accuracy: 0.95,
              reaction_time: 1350,
              error_count: 0,
              difficulty_level: 2,
              timestamp: new Date().toISOString(),
            });
            setSessions(gameSessionRepository.getSessions());
          }}
          onRoleChange={setCurrentRole}
          onSync={() => syncRepository.processSyncQueue()}
          onResetData={() => {
            localStorage.clear();
            window.location.reload();
          }}
          onOpenAppearance={() => setShowAppearanceScreen(true)}
        />
      </>
    );
  }

  // 5. ACTIVE GAME OVERLAY
  if (activeGame) {
    return (
      <div className="min-h-screen theme-bg text-inherit py-4">
        <GameRouter
          gameType={activeGame}
          user={patient}
          onExit={() => setActiveGame(null)}
          onSessionComplete={() => setSessions(gameSessionRepository.getSessions())}
        />
      </div>
    );
  }

  // 6. REMINDERS FULL SCREEN
  if (showRemindersScreen) {
    return (
      <div className="min-h-screen theme-bg text-inherit">
        <TopHeader
          patient={patient}
          pendingRemindersCount={reminders.filter(r => r.status === 'pending').length}
          isOffline={isOffline}
          onBellClick={() => setShowRemindersScreen(false)}
          onVoiceToggle={() => {
            const updated = patientRepository.updatePatient({ voice_enabled: !patient.voice_enabled });
            setPatient(updated);
          }}
          onEmergencyClick={() => window.open(`tel:${patient.caregiver_phone}`)}
          onOpenAppearance={() => setShowAppearanceScreen(true)}
        />
        <RemindersScreen
          language={patient.language_pref}
          reminders={reminders}
          onTriggerAlarm={handleTriggerAlarm}
          onRemindersUpdate={setReminders}
          onBack={() => setShowRemindersScreen(false)}
        />
      </div>
    );
  }

  // 7. PRIMARY PATIENT / CAREGIVER INTERFACE
  return (
    <div className="min-h-screen theme-bg text-inherit flex flex-col justify-between select-none">
      {/* Top Header matching reference screens */}
      <TopHeader
        patient={patient}
        pendingRemindersCount={reminders.filter(r => r.status === 'pending').length}
        isOffline={isOffline}
        onBellClick={() => setShowRemindersScreen(true)}
        onVoiceToggle={() => {
          const updated = patientRepository.updatePatient({ voice_enabled: !patient.voice_enabled });
          setPatient(updated);
        }}
        onEmergencyClick={() => window.open(`tel:${patient.caregiver_phone}`)}
        onOpenAppearance={() => setShowAppearanceScreen(true)}
      />

      {/* Main Tab Views */}
      <main className="flex-1 w-full">
        {currentTab === 'home' && (
          <HomeDashboard
            language={patient.language_pref}
            patient={patient}
            nextReminder={nextReminder}
            onStartTraining={() => setActiveGame('memory_match')}
            onOpenAssess={() => setIsOnboarding(true)}
            onOpenFreeTraining={() => setCurrentTab('games')}
            onOpenMindfulness={() => {
              voiceService.playGentleChime();
              voiceService.speak('Take three deep, calm breaths. Inhale gently... and exhale.', patient.language_pref);
            }}
            onOpenVoiceAssistant={() => setShowVoiceModal(true)}
            onViewReminders={() => setShowRemindersScreen(true)}
            onPatientUpdate={handlePatientUpdate}
          />
        )}

        {currentTab === 'progress' && (
          <ProgressScreen
            language={patient.language_pref}
            patient={patient}
            profile={profile}
            onStartAssessment={() => setIsOnboarding(true)}
            onTrainSkills={() => setActiveGame('memory_match')}
          />
        )}

        {currentTab === 'games' && (
          <GamesHub
            language={patient.language_pref}
            onSelectGame={(type) => setActiveGame(type)}
          />
        )}

        {currentTab === 'caregiver' && (
          <CaregiverScreen
            language={patient.language_pref}
            patient={patient}
            reminders={reminders}
            sessions={sessions}
            onAddReminder={() => setShowRemindersScreen(true)}
            onPatientUpdate={handlePatientUpdate}
          />
        )}

        {currentTab === 'settings' && (
          <SettingsScreen
            language={patient.language_pref}
            patient={patient}
            currentRole={currentRole}
            onLanguageClick={() => setShowLanguageScreen(true)}
            onAppearanceClick={() => setShowAppearanceScreen(true)}
            onRoleChange={setCurrentRole}
            onPatientUpdate={handlePatientUpdate}
          />
        )}
      </main>

      {/* Floating Bottom Navigation Bar matching Reference Pages 15-21 */}
      <BottomNavBar currentTab={currentTab} onTabChange={setCurrentTab} language={patient.language_pref} />

      {/* Full-Screen Live Alarm Modal */}
      <LiveAlarmModal
        reminder={alarmReminder}
        language={patient.language_pref}
        isOpen={isAlarmOpen}
        onTaken={handleAlarmTaken}
        onSnooze={handleAlarmSnooze}
        onClose={() => setIsAlarmOpen(false)}
      />

      {/* Voice Assistant Modal */}
      <VoiceAssistantModal
        isOpen={showVoiceModal}
        language={patient.language_pref}
        onClose={() => setShowVoiceModal(false)}
        onCommand={handleVoiceCommand}
      />

      {/* Hackathon Demo Toolbar */}
      <DemoToolbar
        currentRole={currentRole}
        isOffline={isOffline}
        onToggleOffline={() => {
          const next = !isOffline;
          syncRepository.setOfflineSimulation(next);
          setIsOffline(next);
        }}
        onTriggerAlarm={() => handleTriggerAlarm()}
        onSimulateGame={() => {
          const newSession = gameSessionRepository.recordSession({
            patient_id: patient.patient_id,
            game_type: 'memory_match',
            score: 95,
            accuracy: 0.96,
            reaction_time: 1250,
            error_count: 0,
            difficulty_level: 2,
            timestamp: new Date().toISOString(),
          });
          setSessions(gameSessionRepository.getSessions());
          voiceService.playSuccessChime();
        }}
        onRoleChange={setCurrentRole}
        onSync={async () => {
          await syncRepository.processSyncQueue();
          voiceService.playSuccessChime();
        }}
        onResetData={() => {
          localStorage.clear();
          window.location.reload();
        }}
        onOpenAppearance={() => setShowAppearanceScreen(true)}
      />
    </div>
  );
};

export default App;
