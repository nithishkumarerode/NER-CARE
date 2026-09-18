import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle, Volume2, X } from 'lucide-react';
import { Language, Patient } from '../../types';
import { NeuroMascot } from '../../components/mascot/NeuroMascot';
import { HolographicBrain } from '../../components/visuals/HolographicBrain';
import { BellCurveChart } from '../../components/visuals/BellCurveChart';
import { voiceService } from '../../services/voiceService';
import { getTranslation } from '../../locales/translations';

interface OnboardingFlowProps {
  language: Language;
  patient: Patient;
  onComplete: (updatedPatient: Partial<Patient>) => void;
  onSkipToHome: () => void;
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({
  language,
  patient,
  onComplete,
  onSkipToHome,
}) => {
  // Step 1: Welcome (Page 2)
  // Step 2: Age (Page 3)
  // Step 3: Self-Rating (Page 4)
  // Step 4: Perfect Confirmation (Page 5)
  // Step 5: Assessment Intro (Page 6)
  // Step 6: Instructions (Page 7)
  // Step 7: Tutorial Active (Page 9)
  // Step 8: Practice Complete (Page 10)
  // Step 9: Result Announcement (Page 12)
  // Step 10: Scientific Curve Result (Page 13)
  // Step 11: Cognitive Profile Breakdown (Page 14)
  const [step, setStep] = useState<number>(1);
  const [selectedAge, setSelectedAge] = useState<number>(patient.age || 72);
  const [brainRating, setBrainRating] = useState<number>(3); // 1 to 5
  const [tutorialTapped, setTutorialTapped] = useState(false);

  // Progress Bar calculation (Steps 1 to 11)
  const progressPercent = Math.min(100, Math.round((step / 11) * 100));

  const speak = (text: string) => {
    voiceService.speak(text, language);
  };

  const nextStep = () => {
    voiceService.playGentleChime();
    setStep(prev => prev + 1);
  };

  return (
    <div className="min-h-screen w-full bg-[#060D1E] text-white flex flex-col items-center justify-between p-4 sm:p-6 select-none relative">
      {/* Top Header with Progress Bar matching Pages 2-6, 12-14 */}
      <div className="w-full max-w-md mx-auto pt-2 pb-4">
        {/* Progress track */}
        <div className="w-full h-1.5 rounded-full bg-slate-800/80 overflow-hidden mb-3">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>

        {/* Top bar controls */}
        <div className="flex items-center justify-between px-1">
          {step > 1 ? (
            <button
              onClick={() => setStep(prev => prev - 1)}
              className="p-2 rounded-full text-slate-400 hover:text-white"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          ) : (
            <div className="w-10"></div>
          )}

          <button
            onClick={onSkipToHome}
            className="text-xs font-semibold text-slate-400 hover:text-slate-200 px-3 py-1 rounded-full bg-slate-900 border border-slate-700/60"
          >
            Skip to Home →
          </button>
        </div>
      </div>

      {/* STEP 1: WELCOME SCREEN (Reference Page 2) */}
      {step === 1 && (
        <div className="w-full max-w-md flex flex-col items-center justify-center my-auto animate-fade-in">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white text-center mb-6 tracking-tight">
            {getTranslation(language, 'welcomeTitle')}
          </h1>

          <NeuroMascot
            mood="waving"
            size="xl"
            speechBubble={getTranslation(language, 'neuroIntro')}
            className="my-4"
          />

          <div className="w-full space-y-3 mt-8">
            <button
              onClick={() => {
                speak(getTranslation(language, 'howOld'));
                nextStep();
              }}
              className="w-full py-4 sm:py-5 rounded-full bg-[#0080FF] hover:bg-[#006CD9] text-white font-extrabold text-lg sm:text-xl shadow-lg shadow-blue-500/30 active:scale-[0.98] transition-all"
            >
              {getTranslation(language, 'getStarted')}
            </button>

            <button
              onClick={onSkipToHome}
              className="w-full py-3 text-slate-300 hover:text-white font-semibold text-base transition-colors"
            >
              {getTranslation(language, 'login')}
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: AGE SELECTION (Reference Page 3) */}
      {step === 2 && (
        <div className="w-full max-w-md flex flex-col items-center justify-center my-auto animate-fade-in">
          <NeuroMascot
            mood="pointing"
            size="lg"
            speechBubble={getTranslation(language, 'howOld')}
            className="mb-4"
          />

          {/* Age Wheel Selector matching Reference Page 3 */}
          <div className="w-full my-6 flex items-center justify-center space-x-3 sm:space-x-5 py-3">
            <button
              onClick={() => setSelectedAge(prev => Math.max(50, prev - 1))}
              className="text-slate-400 hover:text-white p-2"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>

            <span className="text-slate-500 font-bold text-xl sm:text-2xl">{selectedAge - 2}</span>
            <span className="text-slate-400 font-bold text-2xl sm:text-3xl">{selectedAge - 1}</span>

            {/* Active Selected Age Pill */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-blue-600/30 border-2 border-cyan-400 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.4)]">
              <span className="text-3xl sm:text-4xl font-extrabold text-white">{selectedAge}</span>
            </div>

            <span className="text-slate-400 font-bold text-2xl sm:text-3xl">{selectedAge + 1}</span>
            <span className="text-slate-500 font-bold text-xl sm:text-2xl">{selectedAge + 2}</span>

            <button
              onClick={() => setSelectedAge(prev => Math.min(100, prev + 1))}
              className="text-slate-400 hover:text-white p-2"
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          </div>

          <p className="text-sm sm:text-base text-slate-300 text-center mb-8 px-4">
            {getTranslation(language, 'ageComparison')}
          </p>

          <button
            onClick={() => {
              onComplete({ age: selectedAge });
              speak(getTranslation(language, 'rateBrain'));
              nextStep();
            }}
            className="w-full py-4 sm:py-5 rounded-full bg-[#0080FF] hover:bg-[#006CD9] text-white font-extrabold text-lg sm:text-xl shadow-lg shadow-blue-500/30 active:scale-[0.98] transition-all"
          >
            {getTranslation(language, 'continue')}
          </button>
        </div>
      )}

      {/* STEP 3: SELF-RATING BRAIN HEALTH (Reference Page 4) */}
      {step === 3 && (
        <div className="w-full max-w-md flex flex-col items-center justify-center my-auto animate-fade-in">
          <NeuroMascot
            mood="happy"
            size="lg"
            speechBubble={getTranslation(language, 'rateBrain')}
            className="mb-2"
          />

          <p className="text-sm text-slate-300 text-center mb-6">
            {getTranslation(language, 'rateSubtext')}
          </p>

          {/* 5-Step Mascot Rating Scale matching Reference Page 4 */}
          <div className="w-full my-4 px-2">
            <div className="flex items-center justify-between mb-4">
              {[1, 2, 3, 4, 5].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setBrainRating(lvl)}
                  className={`flex flex-col items-center transition-all ${
                    brainRating === lvl ? 'scale-125 -translate-y-1' : 'opacity-60 hover:opacity-100'
                  }`}
                >
                  <span className="text-3xl sm:text-4xl mb-1">
                    {lvl === 1 ? '🙁' : lvl === 2 ? '😐' : lvl === 3 ? '🙂' : lvl === 4 ? '😊' : '🌟'}
                  </span>
                  <div
                    className={`w-4 h-4 rounded-full border-2 ${
                      brainRating === lvl ? 'bg-cyan-400 border-white' : 'bg-slate-800 border-slate-600'
                    }`}
                  ></div>
                </button>
              ))}
            </div>

            <div className="flex justify-between text-xs sm:text-sm font-semibold text-slate-400 px-1">
              <span>{getTranslation(language, 'poor')}</span>
              <span>{getTranslation(language, 'excellent')}</span>
            </div>
          </div>

          <div className="w-full mt-8">
            <button
              onClick={() => {
                speak(getTranslation(language, 'perfectGreeting'));
                nextStep();
              }}
              className="w-full py-4 sm:py-5 rounded-full bg-[#0080FF] hover:bg-[#006CD9] text-white font-extrabold text-lg sm:text-xl shadow-lg shadow-blue-500/30 active:scale-[0.98] transition-all"
            >
              {getTranslation(language, 'continue')}
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: CONFIRMATION (Reference Page 5) */}
      {step === 4 && (
        <div className="w-full max-w-md flex flex-col items-center justify-center my-auto animate-fade-in">
          <NeuroMascot
            mood="waving"
            size="xl"
            speechBubble={getTranslation(language, 'perfectGreeting')}
            className="my-6"
          />

          <div className="w-full mt-8">
            <button
              onClick={() => {
                speak(getTranslation(language, 'discoverHelp'));
                nextStep();
              }}
              className="w-full py-4 sm:py-5 rounded-full bg-[#0080FF] hover:bg-[#006CD9] text-white font-extrabold text-lg sm:text-xl shadow-lg shadow-blue-500/30 active:scale-[0.98] transition-all"
            >
              {getTranslation(language, 'continue')}
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: ASSESSMENT INTRO (Reference Page 6) */}
      {step === 5 && (
        <div className="w-full max-w-md flex flex-col items-center justify-center my-auto animate-fade-in">
          <NeuroMascot
            mood="happy"
            size="md"
            speechBubble={getTranslation(language, 'discoverHelp')}
            className="mb-4"
          />

          {/* Normal Curve with Question Mark matching Page 6 */}
          <div className="w-full max-w-xs my-4 p-4 rounded-3xl bg-[#0F1E38]/60 border border-blue-500/20 flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-cyan-600/30 border border-cyan-400 flex items-center justify-center text-3xl font-extrabold text-cyan-300 mb-2 shadow-[0_0_20px_rgba(6,182,212,0.4)]">
              ?
            </div>
            <div className="w-full flex justify-between text-xs text-slate-400 font-bold px-4">
              <span>0</span>
              <span>50</span>
              <span>100</span>
            </div>
          </div>

          <p className="text-sm sm:text-base text-slate-200 text-center mb-8 px-4 font-medium">
            {getTranslation(language, 'testFirstStep')}
          </p>

          <button
            onClick={() => {
              speak(getTranslation(language, 'instructionMemory'));
              nextStep();
            }}
            className="w-full py-4 sm:py-5 rounded-full bg-[#0080FF] hover:bg-[#006CD9] text-white font-extrabold text-lg sm:text-xl shadow-lg shadow-blue-500/30 active:scale-[0.98] transition-all"
          >
            {getTranslation(language, 'letsCheckItOut')}
          </button>
        </div>
      )}

      {/* STEP 6: ASSESSMENT INSTRUCTIONS (Reference Page 7) */}
      {step === 6 && (
        <div className="w-full max-w-md flex flex-col items-center justify-between my-auto animate-fade-in bg-[#0B172E] p-6 rounded-3xl border border-blue-500/30 shadow-2xl">
          {/* Header with Visual Books / Object Card & Close '✕' */}
          <div className="w-full flex justify-between items-start mb-4">
            <div className="w-24 h-20 rounded-2xl bg-gradient-to-br from-amber-800 to-amber-950 border border-amber-500/40 flex items-center justify-center text-4xl shadow-md">
              📚
            </div>
            <button
              onClick={onSkipToHome}
              className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-white text-left w-full mb-3">
            {getTranslation(language, 'initialAssessmentTitle')}
          </h2>

          <div className="w-full bg-[#102242] p-4 rounded-2xl border border-blue-400/20 mb-6">
            <h4 className="text-base font-bold text-cyan-300 mb-2">
              {getTranslation(language, 'instructionTitle')}
            </h4>
            <p className="text-sm sm:text-base text-slate-200 leading-relaxed">
              {getTranslation(language, 'instructionMemory')}
            </p>
          </div>

          <p className="text-xs text-slate-400 text-center mb-6">
            {getTranslation(language, 'pressStartReady')}
          </p>

          <button
            onClick={() => {
              speak(getTranslation(language, 'tapSeenBefore'));
              nextStep();
            }}
            className="w-full py-4 sm:py-5 rounded-full bg-[#0080FF] hover:bg-[#006CD9] text-white font-extrabold text-lg sm:text-xl shadow-lg shadow-blue-500/30 active:scale-[0.98] transition-all"
          >
            {getTranslation(language, 'start')}
          </button>
        </div>
      )}

      {/* STEP 7: TUTORIAL / PRACTICE SCREEN (Reference Page 9) */}
      {step === 7 && (
        <div className="w-full max-w-md flex flex-col items-center justify-between my-auto animate-fade-in">
          {/* Top Tutorial Bar matching Page 9 */}
          <div className="w-full flex items-center justify-between px-4 py-2 bg-blue-900/60 rounded-2xl border border-blue-500/30 mb-6">
            <span className="text-base font-extrabold text-white tracking-wide">Tutorial</span>
            <span className="text-base font-bold text-cyan-300">2</span>
          </div>

          <h3 className="text-lg sm:text-xl font-black text-white text-center tracking-wider uppercase mb-6 px-2">
            {getTranslation(language, 'tapSeenBefore')}
          </h3>

          {/* Central Visual Object Card matching Page 9 */}
          <div
            onClick={() => {
              voiceService.playSuccessChime();
              setTutorialTapped(true);
              setTimeout(() => nextStep(), 600);
            }}
            className="w-full max-w-xs h-64 rounded-3xl bg-white p-6 shadow-2xl flex flex-col items-center justify-center cursor-pointer active:scale-95 transition-all border-4 border-cyan-400"
          >
            <span className="text-7xl mb-2">☕</span>
            <span className="text-slate-800 font-bold text-base">Assam Tea Cup</span>
            <span className="text-xs text-slate-500 mt-1 font-semibold">Tap when seen before</span>
          </div>

          <div className="mt-8 text-center text-xs text-slate-400">
            Tap the card to confirm your memory match
          </div>
        </div>
      )}

      {/* STEP 8: PRACTICE COMPLETE CONFIRMATION (Reference Page 10) */}
      {step === 8 && (
        <div className="w-full max-w-md flex flex-col items-center justify-center my-auto p-6 rounded-3xl bg-[#0F1E38] border border-blue-500/30 shadow-2xl animate-fade-in">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white text-center mb-8">
            {getTranslation(language, 'readyStartTest')}
          </h2>

          <div className="w-full space-y-4">
            <button
              onClick={() => {
                speak(getTranslation(language, 'firstResultTitle'));
                nextStep();
              }}
              className="w-full py-4 sm:py-5 rounded-full bg-[#0080FF] hover:bg-[#006CD9] text-white font-extrabold text-lg sm:text-xl shadow-lg shadow-blue-500/30 active:scale-[0.98] transition-all"
            >
              {getTranslation(language, 'yesStartTest')}
            </button>

            <button
              onClick={() => setStep(6)}
              className="w-full text-center text-slate-300 underline font-semibold text-sm hover:text-white"
            >
              {getTranslation(language, 'noRepeatPractice')}
            </button>
          </div>
        </div>
      )}

      {/* STEP 9: RESULT ANNOUNCEMENT (Reference Page 12) */}
      {step === 9 && (
        <div className="w-full max-w-md flex flex-col items-center justify-center my-auto animate-fade-in">
          <NeuroMascot
            mood="pointing"
            size="md"
            speechBubble={getTranslation(language, 'firstResultTitle')}
            className="mb-2"
          />

          {/* Holographic Brain with Memory Green Pill matching Page 12 */}
          <HolographicBrain highlightArea="memory" showBadges={true} size="md" className="my-2" />

          <p className="text-sm text-slate-300 text-center my-4 px-6 font-medium">
            {getTranslation(language, 'firstResultSubtext')}
          </p>

          <button
            onClick={() => {
              speak(getTranslation(language, 'averageForAge'));
              nextStep();
            }}
            className="w-full py-4 sm:py-5 rounded-full bg-[#0080FF] hover:bg-[#006CD9] text-white font-extrabold text-lg sm:text-xl shadow-lg shadow-blue-500/30 active:scale-[0.98] transition-all"
          >
            {getTranslation(language, 'discoverMyResult')}
          </button>
        </div>
      )}

      {/* STEP 10: SCIENTIFIC BELL CURVE SCORE (Reference Page 13) */}
      {step === 10 && (
        <div className="w-full max-w-md flex flex-col items-center justify-center my-auto animate-fade-in">
          <NeuroMascot
            mood="happy"
            size="sm"
            speechBubble={getTranslation(language, 'averageForAge')}
            className="mb-2"
          />

          {/* Bell Curve with Score 48 matching Page 13 */}
          <BellCurveChart score={48} showResearchBadges={true} className="my-2" />

          <div className="w-full mt-6">
            <button
              onClick={() => {
                speak(getTranslation(language, 'justBeginningTitle'));
                nextStep();
              }}
              className="w-full py-4 sm:py-5 rounded-full bg-[#0080FF] hover:bg-[#006CD9] text-white font-extrabold text-lg sm:text-xl shadow-lg shadow-blue-500/30 active:scale-[0.98] transition-all"
            >
              {getTranslation(language, 'continue')}
            </button>
          </div>
        </div>
      )}

      {/* STEP 11: COGNITIVE PROFILE BREAKDOWN (Reference Page 14) */}
      {step === 11 && (
        <div className="w-full max-w-md flex flex-col items-center justify-center my-auto animate-fade-in">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white text-center mb-2 tracking-tight">
            {getTranslation(language, 'justBeginningTitle')}
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 text-center mb-4 px-4 leading-relaxed">
            {getTranslation(language, 'justBeginningSubtext')}
          </p>

          <NeuroMascot mood="waving" size="sm" className="mb-2" />

          {/* 5 Cognitive Pillars Hologram Brain matching Page 14 */}
          <HolographicBrain highlightArea="all" showBadges={true} size="md" className="my-2" />

          <div className="w-full mt-6">
            <button
              onClick={onSkipToHome}
              className="w-full py-4 sm:py-5 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-extrabold text-lg sm:text-xl shadow-xl shadow-blue-500/40 active:scale-[0.98] transition-all"
            >
              {getTranslation(language, 'discoverFullProfile')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
