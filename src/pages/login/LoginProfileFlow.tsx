import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronLeft,
  ArrowRight,
  User,
  Lock,
  Mic,
  RotateCcw,
  Edit3,
  Check,
  AlertCircle,
  Users,
  ShieldCheck,
  Eye,
  EyeOff,
  LogIn,
  UserPlus,
  Volume2,
} from 'lucide-react';
import { Language, Patient } from '../../types';
import { getTranslation, SUPPORTED_LANGUAGES } from '../../locales/translations';
import { voiceService } from '../../services/voiceService';
import { NeuroMascot } from '../../components/mascot/NeuroMascot';

interface LoginProfileFlowProps {
  language: Language;
  patient: Patient;
  onComplete: (updates: Partial<Patient>) => void;
}

const NER_REGIONS = [
  'Assam', 'Meghalaya', 'Mizoram', 'Tripura', 'Manipur',
  'Nagaland', 'Arunachal Pradesh', 'Sikkim', 'West Bengal', 'Other',
];

const HEALTH_CONDITIONS = [
  { key: 'condDiabetes',      id: 'diabetes',       emoji: '🩸' },
  { key: 'condBloodPressure', id: 'blood_pressure', emoji: '🩺' },
  { key: 'condHeart',         id: 'heart',          emoji: '❤️' },
  { key: 'condMemory',        id: 'memory',         emoji: '🧠' },
];

const GENDER_OPTIONS = [
  { id: 'male',       labelKey: 'genderMale',      emoji: '👨' },
  { id: 'female',     labelKey: 'genderFemale',    emoji: '👩' },
  { id: 'other',      labelKey: 'genderOther',     emoji: '🧑' },
  { id: 'prefer_not', labelKey: 'genderPreferNot', emoji: '🔒' },
];

type FlowView = 
  | 'auth'
  | 'q_age'
  | 'q_gender'
  | 'q_region'
  | 'q_health'
  | 'q_caregiver'
  | 'q_complete';

export const LoginProfileFlow: React.FC<LoginProfileFlowProps> = ({
  language,
  patient,
  onComplete,
}) => {
  const t = (key: string) => getTranslation(language, key);

  // Auth screen mode: signup (Create User) vs login
  const [authMode, setAuthMode] = useState<'signup' | 'login'>('signup');
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string>('');

  // Flow navigation state
  const [currentView, setCurrentView] = useState<FlowView>('auth');

  // Profile details state
  const [name, setName] = useState<string>(
    patient.name === 'Bhaben Baruah' ? '' : patient.name
  );
  const [age, setAge] = useState<number>(patient.age || 65);
  const [gender, setGender] = useState<string>(patient.gender || '');
  const [region, setRegion] = useState<string>(
    patient.region_code === 'NER-AS' ? '' : patient.region_code
  );
  const [conditions, setConditions] = useState<string[]>(patient.health_conditions || []);
  const [noneSelected, setNoneSelected] = useState<boolean>(
    (patient.health_conditions ?? []).length === 0
  );
  const [caregiverName, setCaregiverName] = useState<string>(
    patient.caregiver_name === 'Ananya Baruah' ? '' : patient.caregiver_name
  );
  const [caregiverPhone, setCaregiverPhone] = useState<string>(
    patient.caregiver_phone === '+91 94350 12345' ? '' : patient.caregiver_phone
  );

  // Voice interaction state
  const [isListening, setIsListening] = useState<boolean>(false);
  const [listeningTarget, setListeningTarget] = useState<string | null>(null);
  const [voiceSpokenValue, setVoiceSpokenValue] = useState<string | null>(null);
  const stopVoiceRef = useRef<(() => void) | null>(null);

  const isVoiceSupported = voiceService.isSpeechRecognitionSupported();
  const langVoiceCode = SUPPORTED_LANGUAGES.find(l => l.code === language)?.voiceCode || 'en-IN';

  // Cleanup voice on unmount
  useEffect(() => {
    return () => {
      if (stopVoiceRef.current) {
        stopVoiceRef.current();
      }
    };
  }, []);

  // Generic voice listener
  const startListening = (target: string, onDetected: (transcript: string) => void) => {
    if (isListening && stopVoiceRef.current) {
      stopVoiceRef.current();
      setIsListening(false);
      setListeningTarget(null);
      return;
    }

    voiceService.playGentleChime();
    setIsListening(true);
    setListeningTarget(target);
    setVoiceSpokenValue(null);

    const stop = voiceService.listenOnce(
      (transcript) => {
        setIsListening(false);
        setListeningTarget(null);
        voiceService.playSuccessChime();
        onDetected(transcript.trim());
      },
      (err) => {
        console.warn('Speech recognition notice:', err);
        setIsListening(false);
        setListeningTarget(null);
      },
      () => {
        setIsListening(false);
        setListeningTarget(null);
      },
      langVoiceCode
    );

    stopVoiceRef.current = stop;
  };

  // Listen for Username speech input
  const handleListenUsername = () => {
    startListening('username', (transcript) => {
      let clean = transcript
        .replace(/^(my name is|mera naam|amar naam|mur naam|ka hming chu)\s*/i, '')
        .trim();
      if (clean.length > 0) {
        clean = clean.charAt(0).toUpperCase() + clean.slice(1);
        setUsername(clean);
        setName(clean);
        setAuthError('');
      }
    });
  };

  // Listen for Age speech input
  const handleListenAge = () => {
    startListening('age', (transcript) => {
      const match = transcript.match(/\d+/);
      if (match) {
        const parsedAge = parseInt(match[0], 10);
        if (parsedAge >= 10 && parsedAge <= 120) {
          setAge(parsedAge);
          setVoiceSpokenValue(`${parsedAge}`);
        }
      }
    });
  };

  // --- Auth Submission Handler ---
  const handleAuthSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();

    // 1. Validation: Username is required
    if (!trimmedUsername) {
      setAuthError(t('usernameRequiredError'));
      return;
    }

    // 2. Validation: Password is required
    if (!trimmedPassword) {
      setAuthError(t('passwordRequiredError'));
      return;
    }

    // 3. Validation: Password length rule
    if (trimmedPassword.length < 6) {
      setAuthError(t('passwordTooShortError'));
      return;
    }

    setAuthError('');

    if (authMode === 'signup') {
      // Create Account flow
      voiceService.playSuccessChime();
      setName(trimmedUsername);
      try {
        localStorage.setItem(`ner_care_user_${trimmedUsername}`, JSON.stringify({
          username: trimmedUsername,
          created_at: new Date().toISOString(),
        }));
      } catch (err) {
        console.warn('Storage notice:', err);
      }

      // Advance directly to the one-question-per-screen setup flow
      setCurrentView('q_age');
    } else {
      // Login flow: Authenticate and proceed to Dashboard
      voiceService.playSuccessChime();
      onComplete({
        name: trimmedUsername,
      });
    }
  };

  // --- Handlers for Gender & Region ---
  const handleSelectGender = (val: string) => {
    voiceService.playGentleChime();
    setGender(val);
  };

  const handleSelectRegion = (val: string) => {
    voiceService.playGentleChime();
    setRegion(val);
  };

  // --- Handlers for Health Conditions ---
  const toggleCondition = (id: string) => {
    voiceService.playGentleChime();
    setNoneSelected(false);
    setConditions(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const selectNone = () => {
    voiceService.playGentleChime();
    setNoneSelected(true);
    setConditions([]);
  };

  // --- Final Profile Setup Complete ---
  const handleFinalComplete = () => {
    voiceService.playSuccessChime();
    onComplete({
      name: name.trim() || username.trim() || 'Friend',
      age: age || 65,
      gender: gender || 'prefer_not',
      region_code: region || 'Assam',
      health_conditions: noneSelected ? [] : conditions,
      caregiver_name: caregiverName.trim() || patient.caregiver_name,
      caregiver_phone: caregiverPhone.trim() || patient.caregiver_phone,
    });
  };

  // Progress computation (steps 1 to 5)
  const stepsList: FlowView[] = [
    'q_age',
    'q_gender',
    'q_region',
    'q_health',
    'q_caregiver',
  ];
  const currentStepIndex = stepsList.indexOf(currentView);
  const totalSteps = stepsList.length;

  // Render navigation bar for question steps
  const renderStepHeader = () => {
    if (currentView === 'auth' || currentView === 'q_complete') return null;

    const stepNumber = currentStepIndex + 1;
    const progressPercent = (stepNumber / totalSteps) * 100;

    return (
      <div className="w-full max-w-md mx-auto mb-6">
        <div className="flex items-center justify-between text-sm text-slate-300 mb-2">
          <button
            type="button"
            onClick={() => {
              voiceService.playGentleChime();
              setVoiceSpokenValue(null);
              if (currentStepIndex === 0) {
                setCurrentView('auth');
              } else {
                setCurrentView(stepsList[currentStepIndex - 1]);
              }
            }}
            className="flex items-center gap-1.5 py-2 px-3 rounded-xl bg-slate-800/70 border border-slate-700/60 text-slate-200 hover:text-white hover:bg-slate-700 transition"
          >
            <ChevronLeft className="w-5 h-5 text-cyan-400" />
            <span className="font-medium text-base">{t('back')}</span>
          </button>

          <span className="text-cyan-400 font-semibold text-base tracking-wide">
            {stepNumber} {t('stepOf')} {totalSteps}
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700/40">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    );
  };

  // ==========================================
  // VIEW 1: LOGIN / SIGNUP SCREEN (Matches Screenshot)
  // ==========================================
  if (currentView === 'auth') {
    return (
      <div className="min-h-screen bg-[#060D1E] text-white flex flex-col justify-center items-center px-4 py-8">
        <div className="w-full max-w-md mx-auto space-y-6">
          {/* Header Brand with Mascot matching screenshot */}
          <div className="flex items-center justify-center gap-3">
            <div className="w-16 h-16 shrink-0 relative flex items-center justify-center">
              <NeuroMascot mood="happy" size="sm" className="scale-75 origin-center" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-white leading-tight">
                CogniCare
              </h1>
              <p className="text-xs sm:text-sm text-cyan-300 font-medium">
                Remember. Engage. Live Independently.
              </p>
            </div>
          </div>

          {/* Main Card */}
          <div className="bg-[#0B1528] rounded-3xl border border-blue-900/40 p-6 sm:p-7 shadow-2xl shadow-blue-950/60 space-y-5">
            {/* Error Message */}
            {authError && (
              <div className="flex items-center gap-2 p-3 rounded-2xl bg-rose-950/50 border border-rose-500/50 text-rose-300 text-sm">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-5">
              {/* Field 1: User Name */}
              <div>
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
                    <User className="w-4 h-4" />
                  </div>
                  <label className="text-white text-lg font-bold">
                    {t('userNameLabel')}
                  </label>
                </div>

                <div className="relative flex items-center w-full rounded-2xl bg-[#EEF4FF] border border-blue-200/50 focus-within:ring-2 focus-within:ring-cyan-400 transition-all shadow-inner">
                  <User className="w-5 h-5 text-slate-400 ml-4 shrink-0" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      setName(e.target.value);
                      setAuthError('');
                    }}
                    placeholder={t('enterUserNamePlaceholder')}
                    className="w-full px-3 py-4 text-slate-800 text-lg placeholder-slate-400 font-medium bg-transparent focus:outline-none"
                    autoComplete="username"
                  />
                  {isVoiceSupported && (
                    <button
                      type="button"
                      onClick={handleListenUsername}
                      title="Speak username"
                      className={`w-9 h-9 rounded-full flex items-center justify-center mr-3 transition ${
                        isListening && listeningTarget === 'username'
                          ? 'bg-rose-500 text-white animate-pulse'
                          : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                      }`}
                    >
                      <Mic className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Field 2: Password / PIN */}
              <div>
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
                    <Lock className="w-4 h-4" />
                  </div>
                  <label className="text-white text-lg font-bold">
                    {t('passwordLabel')}
                  </label>
                </div>

                <div className="relative flex items-center w-full rounded-2xl bg-[#EEF4FF] border border-blue-200/50 focus-within:ring-2 focus-within:ring-cyan-400 transition-all shadow-inner">
                  <Lock className="w-5 h-5 text-slate-400 ml-4 shrink-0" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setAuthError('');
                    }}
                    placeholder={
                      authMode === 'signup'
                        ? t('createPasswordPlaceholder')
                        : t('enterPasswordPlaceholder')
                    }
                    className="w-full px-3 py-4 text-slate-800 text-lg placeholder-slate-400 font-medium bg-transparent focus:outline-none"
                    autoComplete={authMode === 'signup' ? 'new-password' : 'current-password'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(prev => !prev)}
                    className="w-9 h-9 rounded-full flex items-center justify-center mr-3 text-slate-500 hover:text-slate-700 transition"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>

                {/* Password Rule Hint matching screenshot */}
                {authMode === 'signup' && (
                  <div className="flex items-center gap-2 mt-2.5 text-xs sm:text-sm text-cyan-300/90 font-medium">
                    <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>{t('passwordRuleHint')}</span>
                  </div>
                )}
              </div>

              {/* Primary Action Button */}
              <button
                type="submit"
                className="w-full min-h-[56px] rounded-2xl bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xl shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2.5 transition transform active:scale-[0.98]"
              >
                <span>
                  {authMode === 'signup'
                    ? t('createUserButton')
                    : t('loginBtn')}
                </span>
                <ArrowRight className="w-5 h-5 stroke-[2.5]" />
              </button>
            </form>

            {/* Divider matching screenshot */}
            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-slate-700/60"></div>
              <span className="flex-shrink mx-4 text-slate-400 text-xs font-bold uppercase tracking-wider">
                OR
              </span>
              <div className="flex-grow border-t border-slate-700/60"></div>
            </div>

            {/* Switch Auth State Button matching screenshot */}
            <button
              type="button"
              onClick={() => {
                voiceService.playGentleChime();
                setAuthMode(prev => (prev === 'signup' ? 'login' : 'signup'));
                setAuthError('');
              }}
              className="w-full min-h-[54px] rounded-2xl bg-transparent hover:bg-blue-950/40 border-2 border-blue-500/50 text-white hover:text-cyan-200 font-bold text-base sm:text-lg flex items-center justify-center gap-2.5 transition"
            >
              {authMode === 'signup' ? (
                <>
                  <LogIn className="w-5 h-5 text-cyan-400" />
                  <span>{t('alreadyUserLoginButton')}</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5 text-cyan-400" />
                  <span>{t('newUserCreateButton')}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 2: QUESTION 1 — AGE
  // ==========================================
  if (currentView === 'q_age') {
    return (
      <div className="min-h-screen bg-[#060D1E] text-white flex flex-col justify-between px-5 py-8">
        {renderStepHeader()}

        <div className="w-full max-w-md mx-auto my-auto space-y-6">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-4xl mb-4 shadow-lg shadow-amber-500/10">
              🎂
            </div>
            <h2 className="text-3xl font-extrabold text-white">
              {t('howOldAreYou')}
            </h2>
            <p className="text-slate-400 text-base mt-1">
              {t('ageComparison')}
            </p>
          </div>

          <div className="bg-[#0B1528] rounded-3xl border border-slate-700/70 p-6 shadow-xl space-y-6">
            {/* Age display & stepper */}
            <div className="flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => {
                  voiceService.playGentleChime();
                  setAge(prev => Math.max(18, prev - 1));
                }}
                className="w-14 h-14 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white text-3xl font-bold flex items-center justify-center transition"
              >
                -
              </button>

              <div className="px-6 py-3 rounded-2xl bg-[#060D1E] border-2 border-cyan-400/60 text-center min-w-[140px]">
                <span className="text-4xl font-extrabold text-cyan-300">{age}</span>
                <span className="block text-xs font-semibold text-slate-400 uppercase mt-0.5">
                  {t('yearsOld')}
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  voiceService.playGentleChime();
                  setAge(prev => Math.min(105, prev + 1));
                }}
                className="w-14 h-14 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white text-3xl font-bold flex items-center justify-center transition"
              >
                +
              </button>
            </div>

            {/* Quick age chips */}
            <div className="flex justify-center gap-2">
              {[55, 60, 65, 70, 75, 80].map((quickAge) => (
                <button
                  key={quickAge}
                  type="button"
                  onClick={() => {
                    voiceService.playGentleChime();
                    setAge(quickAge);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-sm font-semibold transition ${
                    age === quickAge
                      ? 'bg-cyan-500 text-slate-950 shadow'
                      : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  {quickAge}
                </button>
              ))}
            </div>

            {/* Voice Input Section */}
            {isVoiceSupported && (
              <button
                type="button"
                onClick={handleListenAge}
                className={`w-full min-h-[54px] rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition border ${
                  isListening && listeningTarget === 'age'
                    ? 'bg-rose-600 border-rose-400 text-white animate-pulse'
                    : 'bg-gradient-to-r from-blue-900/50 to-cyan-900/50 hover:from-blue-800/60 hover:to-cyan-800/60 border-cyan-500/40 text-cyan-300'
                }`}
              >
                <Mic className="w-6 h-6 text-cyan-400" />
                <span>
                  {isListening && listeningTarget === 'age'
                    ? t('listeningForSpeech')
                    : `🎙️ ${t('speakYourAge')}`}
                </span>
              </button>
            )}

            {/* Confirm Button */}
            <button
              type="button"
              onClick={() => {
                voiceService.playGentleChime();
                setVoiceSpokenValue(null);
                setCurrentView('q_gender');
              }}
              className="w-full min-h-[54px] rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xl shadow-lg shadow-cyan-500/30 flex items-center justify-center gap-2 transition"
            >
              <span>{t('confirm')}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 3: QUESTION 2 — GENDER
  // ==========================================
  if (currentView === 'q_gender') {
    return (
      <div className="min-h-screen bg-[#060D1E] text-white flex flex-col justify-between px-5 py-8">
        {renderStepHeader()}

        <div className="w-full max-w-md mx-auto my-auto space-y-6">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-4xl mb-4 shadow-lg shadow-indigo-500/10">
              👥
            </div>
            <h2 className="text-3xl font-extrabold text-white">
              {t('whatIsYourGender')}
            </h2>
          </div>

          {/* Gender Options Grid */}
          <div className="bg-[#0B1528] rounded-3xl border border-slate-700/70 p-6 shadow-xl space-y-3">
            {GENDER_OPTIONS.map((opt) => {
              const isSelected = gender === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleSelectGender(opt.id)}
                  className={`w-full min-h-[58px] px-5 py-3 rounded-2xl border-2 font-bold text-lg flex items-center justify-between transition ${
                    isSelected
                      ? 'bg-cyan-950/60 border-cyan-400 text-white shadow-md shadow-cyan-500/20'
                      : 'bg-[#060D1E] border-slate-700 text-slate-300 hover:border-slate-500'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{opt.emoji}</span>
                    <span>{t(opt.labelKey)}</span>
                  </div>
                  {isSelected && (
                    <div className="w-7 h-7 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })}

            {/* Next Button */}
            <div className="pt-3">
              <button
                type="button"
                onClick={() => {
                  voiceService.playGentleChime();
                  setCurrentView('q_region');
                }}
                className="w-full min-h-[54px] rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xl shadow-lg shadow-cyan-500/30 flex items-center justify-center gap-2 transition"
              >
                <span>{t('next')}</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 4: QUESTION 3 — REGION / LOCATION
  // ==========================================
  if (currentView === 'q_region') {
    return (
      <div className="min-h-screen bg-[#060D1E] text-white flex flex-col justify-between px-5 py-8">
        {renderStepHeader()}

        <div className="w-full max-w-md mx-auto my-auto space-y-6">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-4xl mb-4 shadow-lg shadow-emerald-500/10">
              📍
            </div>
            <h2 className="text-3xl font-extrabold text-white">
              {t('whereDoYouLive')}
            </h2>
            <p className="text-slate-400 text-base mt-1">
              {t('selectRegion')}
            </p>
          </div>

          <div className="bg-[#0B1528] rounded-3xl border border-slate-700/70 p-6 shadow-xl space-y-4">
            {/* Region selection grid */}
            <div className="grid grid-cols-2 gap-2.5 max-h-[300px] overflow-y-auto pr-1">
              {NER_REGIONS.map((r) => {
                const isSelected = region === r;
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => handleSelectRegion(r)}
                    className={`min-h-[52px] p-3 rounded-2xl text-base font-bold transition flex items-center justify-between border-2 ${
                      isSelected
                        ? 'bg-cyan-950/60 border-cyan-400 text-white shadow-sm'
                        : 'bg-[#060D1E] border-slate-700 text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    <span>{r}</span>
                    {isSelected && <Check className="w-4 h-4 text-cyan-400" />}
                  </button>
                );
              })}
            </div>

            {/* Next Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  voiceService.playGentleChime();
                  setCurrentView('q_health');
                }}
                className="w-full min-h-[54px] rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xl shadow-lg shadow-cyan-500/30 flex items-center justify-center gap-2 transition"
              >
                <span>{t('next')}</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 5: QUESTION 4 — HEALTH CONDITIONS
  // ==========================================
  if (currentView === 'q_health') {
    return (
      <div className="min-h-screen bg-[#060D1E] text-white flex flex-col justify-between px-5 py-8">
        {renderStepHeader()}

        <div className="w-full max-w-md mx-auto my-auto space-y-6">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-rose-600/20 border border-rose-500/30 flex items-center justify-center text-4xl mb-4 shadow-lg shadow-rose-500/10">
              ❤️
            </div>
            <h2 className="text-3xl font-extrabold text-white">
              {t('healthInfo')}
            </h2>
            <p className="text-slate-400 text-base mt-1">
              {t('healthConditions')}
            </p>
          </div>

          <div className="bg-[#0B1528] rounded-3xl border border-slate-700/70 p-6 shadow-xl space-y-3">
            {HEALTH_CONDITIONS.map((c) => {
              const active = conditions.includes(c.id);
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => toggleCondition(c.id)}
                  className={`w-full min-h-[56px] px-4 py-3 rounded-2xl border-2 text-base font-bold flex items-center justify-between transition ${
                    active
                      ? 'bg-rose-950/40 border-rose-400 text-white'
                      : 'bg-[#060D1E] border-slate-700 text-slate-300 hover:border-slate-500'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{c.emoji}</span>
                    <span>{t(c.key)}</span>
                  </div>
                  {active && (
                    <div className="w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })}

            {/* None of the above option */}
            <button
              type="button"
              onClick={selectNone}
              className={`w-full min-h-[54px] px-4 py-3 rounded-2xl border-2 text-base font-bold flex items-center justify-between transition ${
                noneSelected
                  ? 'bg-emerald-950/40 border-emerald-400 text-white'
                  : 'bg-[#060D1E] border-slate-700 text-slate-400 hover:border-slate-500'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">🛡️</span>
                <span>{t('condNone')}</span>
              </div>
              {noneSelected && (
                <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                  <Check className="w-4 h-4 stroke-[3]" />
                </div>
              )}
            </button>

            {/* Next Button */}
            <div className="pt-3">
              <button
                type="button"
                onClick={() => {
                  voiceService.playGentleChime();
                  setCurrentView('q_caregiver');
                }}
                className="w-full min-h-[54px] rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xl shadow-lg shadow-cyan-500/30 flex items-center justify-center gap-2 transition"
              >
                <span>{t('next')}</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 6: QUESTION 5 — CAREGIVER DETAILS
  // ==========================================
  if (currentView === 'q_caregiver') {
    return (
      <div className="min-h-screen bg-[#060D1E] text-white flex flex-col justify-between px-5 py-8">
        {renderStepHeader()}

        <div className="w-full max-w-md mx-auto my-auto space-y-6">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-teal-600/20 border border-teal-500/30 flex items-center justify-center text-4xl mb-4 shadow-lg shadow-teal-500/10">
              📞
            </div>
            <h2 className="text-3xl font-extrabold text-white">
              {t('caregiverQuestion')}
            </h2>
            <p className="text-slate-400 text-base mt-1">
              {t('caregiverQuestionSub')}
            </p>
          </div>

          <div className="bg-[#0B1528] rounded-3xl border border-slate-700/70 p-6 shadow-xl space-y-4">
            {/* Caregiver Name */}
            <div>
              <label className="block text-slate-300 text-base font-semibold mb-2 flex items-center gap-2">
                <Users className="w-5 h-5 text-cyan-400" />
                <span>{t('caregiverNameLabel')}</span>
              </label>
              <input
                type="text"
                value={caregiverName}
                onChange={(e) => setCaregiverName(e.target.value)}
                placeholder="e.g. Ramesh"
                className="w-full h-14 px-4 text-xl rounded-2xl bg-[#060D1E] border-2 border-slate-700 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400 transition"
              />
            </div>

            {/* Caregiver Phone */}
            <div>
              <label className="block text-slate-300 text-base font-semibold mb-2 flex items-center gap-2">
                <Users className="w-5 h-5 text-cyan-400" />
                <span>{t('caregiverPhoneLabel')}</span>
              </label>
              <input
                type="tel"
                inputMode="numeric"
                value={caregiverPhone}
                onChange={(e) => setCaregiverPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full h-14 px-4 text-xl rounded-2xl bg-[#060D1E] border-2 border-slate-700 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400 transition"
              />
            </div>

            {/* Complete & Skip Buttons */}
            <div className="pt-2 space-y-2.5">
              <button
                type="button"
                onClick={() => {
                  voiceService.playGentleChime();
                  setCurrentView('q_complete');
                }}
                className="w-full min-h-[54px] rounded-2xl bg-gradient-to-r from-blue-600 via-cyan-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xl shadow-lg shadow-cyan-500/30 flex items-center justify-center gap-2 transition"
              >
                <span>{t('completeSetup')}</span>
                <Check className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={() => {
                  voiceService.playGentleChime();
                  setCurrentView('q_complete');
                }}
                className="w-full py-2.5 text-slate-400 hover:text-slate-200 text-base font-medium transition"
              >
                {t('skip')}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 7: COMPLETION / WELCOME SCREEN
  // ==========================================
  return (
    <div className="min-h-screen bg-[#060D1E] text-white flex flex-col justify-between px-5 py-8">
      <div className="w-full max-w-md mx-auto my-auto space-y-8 text-center">
        {/* Celebration badge */}
        <div className="relative inline-block">
          <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-5xl shadow-2xl shadow-cyan-500/40 border border-cyan-300/40 animate-bounce">
            🎉
          </div>
        </div>

        <div>
          <h2 className="text-3xl font-extrabold text-white">
            {t('profileCompleteTitle')}
          </h2>
          <p className="text-cyan-300 text-xl font-bold mt-2">
            {name || username ? `Welcome, ${name || username}!` : t('letsBegin')}
          </p>
          <p className="text-slate-300 text-base mt-2 max-w-xs mx-auto">
            {t('profileCompleteSub')}
          </p>
        </div>

        {/* Profile Card Summary */}
        <div className="bg-[#0B1528] rounded-3xl border border-slate-700/80 p-5 text-left space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-700/60">
            <span className="text-slate-400 text-base">{t('userNameLabel')}</span>
            <span className="text-white font-bold text-lg">{username || name || 'Friend'}</span>
          </div>
          <div className="flex items-center justify-between pb-2 border-b border-slate-700/60">
            <span className="text-slate-400 text-base">{t('yourAge')}</span>
            <span className="text-white font-bold text-lg">{age} {t('yearsOld')}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-base">{t('yourRegion')}</span>
            <span className="text-white font-bold text-lg">{region || 'Assam'}</span>
          </div>
        </div>

        {/* Let's Begin Button */}
        <button
          type="button"
          onClick={handleFinalComplete}
          className="w-full min-h-[60px] rounded-2xl bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-400 hover:from-blue-500 hover:to-emerald-300 text-slate-950 font-extrabold text-2xl shadow-xl shadow-cyan-500/30 flex items-center justify-center gap-3 transition transform active:scale-[0.98]"
        >
          <span>{t('letsBegin')}</span>
          <ArrowRight className="w-6 h-6 stroke-[3]" />
        </button>
      </div>
    </div>
  );
};
