import React, { useState } from 'react';
import { Sparkles, Play, Activity, Gamepad2, Heart, Droplets, Calendar, Pill, Plus, Check, Mic, ArrowRight } from 'lucide-react';
import { Language, Patient, Reminder } from '../../types';
import { NeuroMascot } from '../../components/mascot/NeuroMascot';
import { HolographicBrain } from '../../components/visuals/HolographicBrain';
import { getTranslation } from '../../locales/translations';
import { patientRepository } from '../../repositories/patientRepository';
import { reminderRepository } from '../../repositories/reminderRepository';
import { voiceService } from '../../services/voiceService';

interface HomeDashboardProps {
  language: Language;
  patient: Patient;
  nextReminder: Reminder | null;
  onStartTraining: () => void;
  onOpenAssess: () => void;
  onOpenFreeTraining: () => void;
  onOpenMindfulness: () => void;
  onOpenVoiceAssistant: () => void;
  onViewReminders: () => void;
  onPatientUpdate: (patient: Patient) => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  language,
  patient,
  nextReminder,
  onStartTraining,
  onOpenAssess,
  onOpenFreeTraining,
  onOpenMindfulness,
  onOpenVoiceAssistant,
  onViewReminders,
  onPatientUpdate,
}) => {
  const [justDrankWater, setJustDrankWater] = useState(false);

  const handleDrinkWater = (e: React.MouseEvent) => {
    e.stopPropagation();
    voiceService.playSuccessChime();
    setJustDrankWater(true);
    const updated = patientRepository.incrementWater();
    onPatientUpdate(updated);
    voiceService.speak('Good job staying hydrated. A glass of fresh water refreshes the brain.', language);
    setTimeout(() => setJustDrankWater(false), 2000);
  };

  const handleMarkTaken = (e: React.MouseEvent, reminderId: string) => {
    e.stopPropagation();
    voiceService.playSuccessChime();
    reminderRepository.markStatus(reminderId, 'taken');
    voiceService.speak('Medicine marked as taken. Well done!', language);
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 pb-28 pt-1 select-none animate-fade-in">
      {/* Top Greeting Section matching Reference Page 15 */}
      <div className="flex items-start justify-between mb-6">
        <div className="max-w-[240px]">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            {getTranslation(language, 'welcomeTitle').split('!')[0]}!
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-1.5 leading-relaxed">
            Let's discover how your mind is doing today and help it stay sharp for years to come.
          </p>
        </div>

        {/* Floating Neuro Mascot matching Reference Page 15 top right */}
        <div className="shrink-0 -mt-2">
          <NeuroMascot mood="waving" size="sm" />
        </div>
      </div>

      {/* QUICK STATUS STRIP: Next Reminder + Water Tracker */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        {/* Next Reminder Card */}
        <div
          onClick={onViewReminders}
          className="p-3.5 rounded-3xl bg-[#0E1B33] border border-blue-500/30 shadow-lg cursor-pointer hover:border-cyan-400/50 active:scale-98 transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-2xl">💊</span>
            <span className="text-[10px] font-bold text-cyan-300 uppercase px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-800">
              {nextReminder ? nextReminder.time : 'Today'}
            </span>
          </div>
          <div className="mt-2">
            <h4 className="text-xs font-semibold text-slate-400">Next Reminder</h4>
            <p className="text-sm font-bold text-white line-clamp-1">
              {nextReminder ? nextReminder.title : 'Medicine on track'}
            </p>
          </div>
        </div>

        {/* Hydration Tracker Card */}
        <div
          onClick={handleDrinkWater}
          className="p-3.5 rounded-3xl bg-gradient-to-br from-[#0B253D] to-[#0A1A2E] border border-cyan-500/30 shadow-lg cursor-pointer hover:border-cyan-400 active:scale-98 transition-all flex flex-col justify-between relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-2xl">💧</span>
            <button
              onClick={handleDrinkWater}
              className="w-7 h-7 rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black flex items-center justify-center shadow-md active:scale-90 transition-all"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
            </button>
          </div>
          <div className="mt-2">
            <h4 className="text-xs font-semibold text-slate-300">Daily Water</h4>
            <p className="text-sm font-extrabold text-cyan-200">
              {patient.water_intake} / {patient.water_target} Glasses
            </p>
          </div>
          {justDrankWater && (
            <div className="absolute inset-0 bg-cyan-500/90 text-slate-950 font-bold text-xs flex items-center justify-center animate-fade-in">
              +1 Glass Drank! 💧
            </div>
          )}
        </div>
      </div>

      {/* CARD 1: HERO CARD - YOUR FIRST TRAINING SESSION (Reference Page 15) */}
      <div className="relative p-6 rounded-3xl bg-gradient-to-b from-[#10244C] to-[#0D1B36] border border-blue-400/30 mb-5 shadow-2xl overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute -top-10 -right-10 w-36 h-36 bg-blue-500/20 rounded-full blur-2xl"></div>

        {/* Top Tag matching Page 15 */}
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-900/60 border border-blue-400/30 text-blue-300 text-[11px] font-bold tracking-wide uppercase mb-3">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>{getTranslation(language, 'firstSessionTitle')}</span>
        </div>

        <div className="flex items-start justify-between">
          <div className="pr-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug">
              {getTranslation(language, 'firstSessionTitle')}
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 mb-5 leading-relaxed">
              {getTranslation(language, 'firstSessionSub')}
            </p>
          </div>

          {/* 3D Blue Dumbbells Visual matching Page 15 */}
          <div className="w-20 h-20 shrink-0 flex items-center justify-center text-5xl drop-shadow-xl animate-float">
            🏋️‍♂️
          </div>
        </div>

        {/* Start Button matching Page 15 */}
        <button
          onClick={onStartTraining}
          className="w-full py-4 rounded-2xl bg-[#0080FF] hover:bg-[#006CD9] text-white font-extrabold text-lg shadow-lg shadow-blue-600/30 active:scale-[0.98] transition-all flex items-center justify-center space-x-2"
        >
          <Play className="w-5 h-5 fill-current" />
          <span>{getTranslation(language, 'startFirstSession')}</span>
        </button>
      </div>

      {/* CARD 2: UNDERSTAND YOUR BRAIN HEALTH (Reference Page 15) */}
      <div className="p-5 sm:p-6 rounded-3xl bg-[#0E1A33] border border-blue-500/20 mb-5 shadow-xl flex items-center justify-between">
        <div className="pr-3">
          <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {getTranslation(language, 'understandBrainHealth')}
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 mb-4 leading-relaxed">
            {getTranslation(language, 'assessSkills')}
          </p>

          <button
            onClick={onOpenAssess}
            className="px-6 py-2.5 rounded-2xl bg-white text-slate-950 hover:bg-slate-100 font-extrabold text-sm sm:text-base shadow-md active:scale-95 transition-all"
          >
            {getTranslation(language, 'test')}
          </button>
        </div>

        {/* Holographic glowing brain on podium matching Page 15 */}
        <div className="shrink-0 scale-75 -mr-4">
          <HolographicBrain size="sm" highlightArea="all" />
        </div>
      </div>

      {/* CARD 3: FREE TRAINING MODE (Reference Page 15 & 16) */}
      <div className="p-5 sm:p-6 rounded-3xl bg-[#0E1A33] border border-blue-500/20 mb-5 shadow-xl flex items-center justify-between">
        <div>
          <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {getTranslation(language, 'freeTrainingMode')}
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 mb-4">
            {getTranslation(language, 'chooseExercises')}
          </p>

          <button
            onClick={onOpenFreeTraining}
            className="px-6 py-2.5 rounded-2xl bg-white text-slate-950 hover:bg-slate-100 font-extrabold text-sm sm:text-base shadow-md active:scale-95 transition-all"
          >
            {getTranslation(language, 'play')}
          </button>
        </div>

        {/* 3D Gamepad visual matching Page 16 */}
        <div className="shrink-0 text-6xl drop-shadow-xl animate-float" style={{ animationDelay: '1s' }}>
          🎮
        </div>
      </div>

      {/* CARD 4: MINDFULNESS (Reference Page 16) */}
      <div className="p-5 sm:p-6 rounded-3xl bg-[#0E1A33] border border-blue-500/20 mb-6 shadow-xl flex items-center justify-between">
        <div>
          <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {getTranslation(language, 'mindfulness')}
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 mb-4">
            {getTranslation(language, 'mindfulnessSub')}
          </p>

          <button
            onClick={onOpenMindfulness}
            className="px-6 py-2.5 rounded-2xl bg-white text-slate-950 hover:bg-slate-100 font-extrabold text-sm sm:text-base shadow-md active:scale-95 transition-all"
          >
            {getTranslation(language, 'relax')}
          </button>
        </div>

        {/* Zen stones visual matching Page 16 */}
        <div className="shrink-0 text-6xl drop-shadow-xl animate-float" style={{ animationDelay: '2s' }}>
          🪨
        </div>
      </div>

      {/* Floating Voice Assistant Trigger Banner */}
      <div
        onClick={onOpenVoiceAssistant}
        className="p-4 rounded-3xl bg-gradient-to-r from-blue-900/70 to-indigo-950/80 border border-cyan-400/40 shadow-xl flex items-center justify-between cursor-pointer hover:border-cyan-300 active:scale-98 transition-all"
      >
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-full bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center text-cyan-300 shadow-inner">
            <Mic className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h4 className="text-base font-bold text-white">Voice Assistant</h4>
            <p className="text-xs text-slate-300">Tap to speak in your language</p>
          </div>
        </div>
        <ArrowRight className="w-5 h-5 text-cyan-400 mr-1" />
      </div>
    </div>
  );
};
