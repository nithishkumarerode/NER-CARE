import React from 'react';
import { TrendingUp, Award, Brain, Clock, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';
import { Language, Patient, CognitiveProfile } from '../../types';
import { HolographicBrain } from '../../components/visuals/HolographicBrain';
import { BrainAgeBar } from '../../components/visuals/BrainAgeBar';
import { BellCurveChart } from '../../components/visuals/BellCurveChart';
import { getTranslation } from '../../locales/translations';

interface ProgressScreenProps {
  language: Language;
  patient: Patient;
  profile: CognitiveProfile;
  onStartAssessment: () => void;
  onTrainSkills: () => void;
}

export const ProgressScreen: React.FC<ProgressScreenProps> = ({
  language,
  patient,
  profile,
  onStartAssessment,
  onTrainSkills,
}) => {
  return (
    <div className="w-full max-w-md mx-auto px-4 pb-28 pt-2 select-none animate-fade-in">
      {/* Title Header matching Page 17 */}
      <div className="mb-4">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          {getTranslation(language, 'cognitiveHealth')}
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 mt-1">
          Complete daily activities to strengthen neural resilience.
        </p>
      </div>

      {/* Path Milestone Visual with glowing brain checkpoints matching Page 17 */}
      <div className="relative p-5 rounded-3xl bg-[#0C1933] border border-blue-500/25 mb-5 shadow-xl overflow-hidden">
        {/* Curving path line */}
        <div className="flex items-center justify-between px-3 py-2">
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-emerald-500 text-slate-950 font-black flex items-center justify-center text-sm shadow-[0_0_15px_rgba(16,185,129,0.5)]">
              ✓
            </div>
            <span className="text-[10px] font-bold text-emerald-400 mt-1">Day 1</span>
          </div>

          <div className="flex-1 h-1 bg-gradient-to-r from-emerald-500 to-cyan-400 mx-2 rounded-full"></div>

          <div className="flex flex-col items-center">
            <div className="w-11 h-11 rounded-full bg-cyan-500 text-slate-950 font-black flex items-center justify-center text-base shadow-[0_0_20px_rgba(6,182,212,0.6)] animate-pulse">
              🧠
            </div>
            <span className="text-[10px] font-bold text-cyan-300 mt-1">Today</span>
          </div>

          <div className="flex-1 h-1 bg-slate-800 mx-2 rounded-full"></div>

          <div className="flex flex-col items-center opacity-40">
            <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs text-slate-400">
              3
            </div>
            <span className="text-[10px] font-medium text-slate-400 mt-1">Day 3</span>
          </div>
        </div>
      </div>

      {/* Skills Card with Glowing Holographic Brain matching Page 17 */}
      <div className="p-6 rounded-3xl bg-gradient-to-b from-[#102244] to-[#0A162C] border border-blue-400/30 mb-5 shadow-2xl flex flex-col items-center text-center">
        <div className="w-full flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Brain className="w-6 h-6 text-cyan-400" />
            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {getTranslation(language, 'skills')}
            </h3>
          </div>
          <span className="text-xs font-bold text-emerald-400 px-2.5 py-1 rounded-full bg-emerald-950 border border-emerald-500/40">
            Active
          </span>
        </div>

        <p className="text-xs sm:text-sm text-slate-300 mb-4 text-left leading-relaxed">
          {getTranslation(language, 'skillsSub')}
        </p>

        {/* Center Holographic Brain Visual */}
        <HolographicBrain size="md" highlightArea="memory" showBadges={true} className="my-2" />

        {/* Train Your Skills Button matching Page 17 */}
        <button
          onClick={onTrainSkills}
          className="w-full mt-5 py-4 rounded-2xl bg-[#0080FF] hover:bg-[#006CD9] text-white font-extrabold text-lg shadow-lg shadow-blue-600/30 active:scale-[0.98] transition-all"
        >
          {getTranslation(language, 'trainYourSkills')}
        </button>
      </div>

      {/* Test Your Brain Card matching Page 18 top */}
      <div className="p-5 rounded-3xl bg-[#0E1A33] border border-blue-500/20 mb-5 shadow-xl flex items-center justify-between">
        <div className="pr-3">
          <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wide">
            5 COGNITIVE DOMAINS
          </span>
          <h4 className="text-lg sm:text-xl font-bold text-white mt-0.5">Test your brain</h4>
          <p className="text-xs text-slate-300 mt-1 mb-3">
            Discover your personalized neuro profile
          </p>
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>5 - 10 min</span>
          </div>
        </div>

        <button
          onClick={onStartAssessment}
          className="px-5 py-2.5 rounded-2xl bg-[#0080FF] hover:bg-[#006CD9] text-white font-extrabold text-sm shadow-md active:scale-95 transition-all shrink-0"
        >
          {getTranslation(language, 'start')}
        </button>
      </div>

      {/* Brain Age Silhouette Card matching Page 18 */}
      <BrainAgeBar
        brainAge={profile.brainAge || 68}
        isUnlocked={true}
        onActionClick={onTrainSkills}
        className="mb-5"
      />

      {/* Bell Curve Normal Distribution Score */}
      <div className="p-5 rounded-3xl bg-[#0E1A33] border border-blue-500/20 shadow-xl flex flex-col items-center text-center">
        <h4 className="text-base font-bold text-white mb-2">Age-Standardized Cognitive Index</h4>
        <BellCurveChart score={profile.overallScore || 52} showResearchBadges={true} />
      </div>
    </div>
  );
};
