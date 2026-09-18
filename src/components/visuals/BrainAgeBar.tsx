import React from 'react';
import { AlertTriangle, Sparkles, CheckCircle2 } from 'lucide-react';

interface BrainAgeBarProps {
  brainAge?: number;
  isUnlocked?: boolean;
  onActionClick?: () => void;
  className?: string;
}

export const BrainAgeBar: React.FC<BrainAgeBarProps> = ({
  brainAge = 68,
  isUnlocked = false,
  onActionClick,
  className = '',
}) => {
  return (
    <div className={`p-5 rounded-3xl bg-[#0E1A33] border border-blue-500/20 text-white shadow-xl ${className}`}>
      {/* Title & Description matching Page 18 */}
      <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-2">
        Discover your Brain Age
      </h3>
      <p className="text-sm text-slate-300 leading-relaxed mb-6">
        Brain Age measures your actual cognitive performance against people your age. Training 15 min. a day can reduce it by 2-3 years in 8 weeks.
      </p>

      {/* Silhouettes & Age Bubble matching Page 18 */}
      <div className="relative my-6 px-2 flex flex-col items-center">
        {/* Highlighted Age Bubble */}
        <div className="relative -top-2 flex flex-col items-center animate-pulse" style={{ animationDuration: '3s' }}>
          <div className="px-3.5 py-1 rounded-xl bg-white text-emerald-700 font-extrabold text-lg shadow-lg border border-emerald-300">
            {brainAge}
          </div>
          <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-white"></div>
        </div>

        {/* Silhouette Heads Row */}
        <div className="w-full flex items-end justify-between px-4 sm:px-8 py-2">
          {/* Young head 1 (bright green) */}
          <div className="w-8 h-10 opacity-90">
            <svg viewBox="0 0 32 40" fill="#22C55E">
              <path d="M16 2 C9 2 5 7 5 14 C5 19 8 22 10 24 L10 32 L22 32 L22 24 C26 21 27 16 27 14 C27 7 23 2 16 2 Z" />
            </svg>
          </div>

          {/* Young head 2 (emerald green) */}
          <div className="w-9 h-11 opacity-90 scale-105">
            <svg viewBox="0 0 32 40" fill="#10B981">
              <path d="M16 2 C9 2 5 7 5 14 C5 19 8 22 10 24 L10 32 L22 32 L22 24 C26 21 27 16 27 14 C27 7 23 2 16 2 Z" />
            </svg>
          </div>

          {/* Mid head 3 (teal) */}
          <div className="w-10 h-12 opacity-80">
            <svg viewBox="0 0 32 40" fill="#0EA5E9">
              <path d="M16 2 C9 2 5 7 5 14 C5 19 8 22 10 24 L10 32 L22 32 L22 24 C26 21 27 16 27 14 C27 7 23 2 16 2 Z" />
            </svg>
          </div>

          {/* Mature head 4 (slate blue) */}
          <div className="w-10 h-12 opacity-60">
            <svg viewBox="0 0 32 40" fill="#64748B">
              <path d="M16 2 C9 2 5 7 5 14 C5 19 8 22 10 24 L10 32 L22 32 L22 24 C26 21 27 16 27 14 C27 7 23 2 16 2 Z" />
            </svg>
          </div>

          {/* Elder head 5 (silver slate) */}
          <div className="w-10 h-12 opacity-40">
            <svg viewBox="0 0 32 40" fill="#94A3B8">
              <path d="M16 2 C9 2 5 7 5 14 C5 19 8 22 10 24 L10 32 L22 32 L22 24 C26 21 27 16 27 14 C27 7 23 2 16 2 Z" />
            </svg>
          </div>
        </div>

        {/* Progress Bar below silhouettes */}
        <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden mt-1">
          <div
            className="h-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 rounded-full"
            style={{ width: isUnlocked ? '65%' : '35%' }}
          ></div>
        </div>
      </div>

      {/* Notice Banner */}
      {!isUnlocked ? (
        <div className="flex items-start space-x-2.5 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs sm:text-sm mb-4">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <p>There is still not enough data. Your Brain Age is unlocked after your initial assessment.</p>
        </div>
      ) : (
        <div className="flex items-start space-x-2.5 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 text-xs sm:text-sm mb-4">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <p>Brain Age active! Your daily training keeps your neuro-circuits resilient.</p>
        </div>
      )}

      {/* Action Button */}
      <button
        onClick={onActionClick}
        className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-base shadow-lg shadow-emerald-900/40 active:scale-[0.98] transition-all flex items-center justify-center space-x-2"
      >
        <Sparkles className="w-5 h-5" />
        <span>{isUnlocked ? 'Train to Lower Brain Age' : 'Complete Initial Assessment'}</span>
      </button>
    </div>
  );
};
