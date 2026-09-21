import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { ArrowLeft, Volume2, Pause, Play, RotateCcw, Award, CheckCircle2, Home, ArrowRight, Sparkles } from 'lucide-react';
import { Language, GameType, GameCategory } from '../../../types';
import { voiceService } from '../../../services/voiceService';
import { soundManager } from './SoundManager';
import { GameSessionResult } from './types';
import { gameSessionRepository } from '../../../repositories/gameSessionRepository';
import { LocalDatabase } from '../../../database/localDatabase';
import { ScoreManager } from './ScoreManager';

interface GameShellProps {
  gameId: GameType;
  title: string;
  category: GameCategory;
  level: number;
  totalLevels?: number;
  instruction: string;
  voicePrompt: string;
  language: Language;
  onBack: () => void;
  onLevelChange: (lvl: number) => void;
  onRestartLevel: () => void;
  result: GameSessionResult | null;
  onNextLevel?: () => void;
  onPlayAgain?: () => void;
  children: React.ReactNode;
}

export const GameShell: React.FC<GameShellProps> = ({
  gameId,
  title,
  category,
  level,
  totalLevels = 6,
  instruction,
  voicePrompt,
  language,
  onBack,
  onLevelChange,
  onRestartLevel,
  result,
  onNextLevel,
  onPlayAgain,
  children,
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [hasAnnouncedIntro, setHasAnnouncedIntro] = useState(false);

  // Announce voice instruction automatically on level entry
  useEffect(() => {
    setIsPaused(false);
    handleSpeak();
  }, [level, instruction]);

  // Handle result celebration and persistence
  useEffect(() => {
    if (result) {
      if (result.isVictory) {
        soundManager.playSuccessChime();
        try {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.6 },
          });
        } catch (e) {}
      } else {
        soundManager.playGentleFeedback();
      }

      // Persist session to repository & offline database
      gameSessionRepository.recordSession({
        patient_id: 'pat_ner_001',
        game_type: gameId,
        score: result.score,
        accuracy: result.accuracy,
        reaction_time: result.reactionTime,
        error_count: result.incorrectAnswers,
        difficulty_level: level,
        timestamp: new Date().toISOString(),
      });

      // Update level progress in local database
      LocalDatabase.saveGameProgress({
        gameId,
        highestLevel: result.isVictory ? Math.min(totalLevels, level + 1) : level,
        bestScore: result.score,
        bestAccuracy: result.accuracy,
        sessionsCompleted: 1,
        lastPlayed: new Date().toISOString(),
        adaptiveLevel: result.adaptiveLevel,
      });

      // Speak warm feedback
      const feedbackText = result.feedback[language] || result.feedback.en;
      voiceService.speak(feedbackText, language);
    }
  }, [result]);

  const handleSpeak = () => {
    if (isSpeaking) return;
    setIsSpeaking(true);
    voiceService.speak(voicePrompt || instruction, language).then(() => {
      setIsSpeaking(false);
    });
  };

  const categoryLabels: Record<GameCategory, { label: string; icon: string; color: string }> = {
    memory: { label: 'Memory', icon: '🧠', color: 'bg-blue-900/60 text-cyan-300 border-blue-400/30' },
    attention: { label: 'Attention', icon: '👀', color: 'bg-teal-900/60 text-emerald-300 border-teal-400/30' },
    spatial: { label: 'Spatial', icon: '🗺️', color: 'bg-indigo-900/60 text-indigo-300 border-indigo-400/30' },
    auditory: { label: 'Auditory', icon: '🔔', color: 'bg-purple-900/60 text-pink-300 border-purple-400/30' },
    routine: { label: 'Routine', icon: '🌅', color: 'bg-amber-900/60 text-amber-300 border-amber-400/30' },
    reasoning: { label: 'Reasoning', icon: '🧩', color: 'bg-rose-900/60 text-rose-300 border-rose-400/30' },
  };

  const catMeta = categoryLabels[category] || categoryLabels.memory;

  return (
    <div className="min-h-screen bg-[#060D1E] text-white flex flex-col justify-between select-none">
      {/* Top Header */}
      <header className="w-full max-w-2xl mx-auto px-4 pt-3 pb-2">
        <div className="flex items-center justify-between mb-2">
          {/* Back Button (48px touch target) */}
          <button
            onClick={() => {
              voiceService.stopSpeaking();
              onBack();
            }}
            className="min-w-[48px] min-h-[48px] px-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700 active:scale-95 text-slate-200 border border-slate-600 flex items-center justify-center gap-2 transition"
            aria-label="Back to Games"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-bold text-sm hidden sm:inline">Games</span>
          </button>

          {/* Title & Category */}
          <div className="text-center px-2 flex-1">
            <h1 className="text-lg sm:text-xl font-extrabold text-white tracking-tight line-clamp-1">
              {title}
            </h1>
            <div className="flex items-center justify-center gap-2 mt-0.5">
              <span className={`px-2 py-0.5 rounded-full border text-[11px] font-bold flex items-center gap-1 ${catMeta.color}`}>
                <span>{catMeta.icon}</span>
                <span>{catMeta.label}</span>
              </span>
              <span className="text-xs text-slate-400 font-semibold">
                Level {level} of {totalLevels}
              </span>
            </div>
          </div>

          {/* Pause / Resume Button */}
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="min-w-[48px] min-h-[48px] p-2.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700 active:scale-95 text-slate-300 border border-slate-600 flex items-center justify-center transition"
            aria-label={isPaused ? 'Resume Game' : 'Pause Game'}
          >
            {isPaused ? <Play className="w-5 h-5 text-emerald-400" /> : <Pause className="w-5 h-5" />}
          </button>
        </div>

        {/* Level Indicator Pills */}
        <div className="flex items-center justify-between gap-1.5 mt-2 bg-[#0B1528] p-1.5 rounded-2xl border border-slate-700/60">
          {Array.from({ length: totalLevels }, (_, i) => i + 1).map((lvl) => {
            const isCurrent = lvl === level;
            return (
              <button
                key={lvl}
                onClick={() => {
                  voiceService.stopSpeaking();
                  onLevelChange(lvl);
                }}
                className={`flex-1 min-h-[36px] rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center ${
                  isCurrent
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md shadow-cyan-500/25 ring-2 ring-cyan-300/40'
                    : 'bg-slate-800/60 hover:bg-slate-700 text-slate-400'
                }`}
              >
                L{lvl}
              </button>
            );
          })}
        </div>

        {/* Accessible Progress Bar */}
        <div className="w-full h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-300"
            style={{ width: `${(level / totalLevels) * 100}%` }}
          />
        </div>

        {/* Instructions Card with Audio Read-Aloud Button */}
        <div className="mt-3 p-3.5 rounded-2xl bg-[#0B1528] border border-blue-400/25 flex items-center justify-between gap-3 shadow-md">
          <div className="text-left flex-1">
            <p className="text-sm sm:text-base font-semibold text-slate-100 leading-snug">
              {instruction}
            </p>
          </div>
          <button
            onClick={handleSpeak}
            className={`min-w-[48px] min-h-[48px] px-3 rounded-xl border flex items-center justify-center gap-1.5 transition active:scale-95 flex-shrink-0 ${
              isSpeaking
                ? 'bg-cyan-500 text-slate-950 border-cyan-300 animate-pulse font-bold'
                : 'bg-blue-600/30 border-blue-400/40 text-cyan-300 hover:bg-blue-600/50 hover:text-white font-medium'
            }`}
            title="Read instructions aloud"
            aria-label="Listen to voice guidance"
          >
            <Volume2 className="w-5 h-5" />
            <span className="text-xs font-bold hidden sm:inline">
              {isSpeaking ? 'Listening' : 'Listen'}
            </span>
          </button>
        </div>
      </header>

      {/* Main Game Content Viewport */}
      <main className="w-full max-w-2xl mx-auto px-4 py-2 flex-1 flex flex-col justify-center relative">
        {isPaused ? (
          <div className="py-12 text-center bg-[#0B1528] border border-slate-700/80 rounded-3xl p-6 shadow-2xl space-y-5 animate-fade-in">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-900/40 border border-blue-500/30 flex items-center justify-center text-3xl">
              ⏸️
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">Activity Paused</h3>
              <p className="text-slate-300 text-sm mt-1 max-w-sm mx-auto">
                Take a calm breath. Inhale gently and continue when you feel ready.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setIsPaused(false)}
                className="min-h-[50px] px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 text-white font-extrabold text-base shadow-lg shadow-cyan-500/25 flex items-center gap-2"
              >
                <Play className="w-5 h-5" />
                <span>Resume Activity</span>
              </button>
              <button
                onClick={() => {
                  setIsPaused(false);
                  onRestartLevel();
                }}
                className="min-h-[50px] px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-base flex items-center gap-2 border border-slate-600"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Restart Level</span>
              </button>
            </div>
          </div>
        ) : (
          children
        )}
      </main>

      {/* Footer Controls */}
      <footer className="w-full max-w-2xl mx-auto px-4 py-3 flex items-center justify-between text-xs text-slate-400">
        <button
          onClick={onRestartLevel}
          className="flex items-center gap-1.5 py-2 px-3 rounded-xl bg-slate-800/60 hover:bg-slate-700 text-slate-300 active:scale-95 transition"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Restart Level</span>
        </button>

        <span className="text-slate-500 font-medium">CogniCare NER • Activity Mode</span>
      </footer>

      {/* Universal Result Modal */}
      {result && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-md bg-[#0B1528] border-2 border-cyan-400/70 rounded-3xl p-6 sm:p-7 shadow-2xl shadow-cyan-900/40 text-center space-y-5 animate-scale-in">
            {/* Mascot / Celebration Badge */}
            <div className="relative inline-block">
              <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-4xl shadow-xl shadow-cyan-500/30 border border-cyan-300/40 animate-bounce">
                {result.isVictory ? '🌟' : '🌱'}
              </div>
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                {result.isVictory ? 'Wonderful Work!' : 'Good Effort!'}
              </h2>
              <p className="text-cyan-300 text-base sm:text-lg font-bold mt-1">
                Level {result.level} Complete
              </p>
              <p className="text-slate-300 text-sm mt-2 max-w-xs mx-auto">
                {result.feedback[language] || result.feedback.en}
              </p>
            </div>

            {/* Score Grid Cards */}
            <div className="grid grid-cols-3 gap-2.5 bg-[#060D1E] p-3.5 rounded-2xl border border-slate-700/80">
              <div className="p-2 text-center">
                <span className="text-[11px] text-slate-400 font-bold block">Score</span>
                <span className="text-2xl font-black text-cyan-400">{result.score}%</span>
              </div>
              <div className="p-2 text-center border-x border-slate-700/70">
                <span className="text-[11px] text-slate-400 font-bold block">Accuracy</span>
                <span className="text-2xl font-black text-white">
                  {Math.round(result.accuracy * 100)}%
                </span>
              </div>
              <div className="p-2 text-center">
                <span className="text-[11px] text-slate-400 font-bold block">Time</span>
                <span className="text-2xl font-black text-emerald-400">
                  {ScoreManager.formatTime(result.timeTakenSeconds)}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-1">
              {level < totalLevels && onNextLevel && (
                <button
                  type="button"
                  onClick={() => {
                    voiceService.stopSpeaking();
                    onNextLevel();
                  }}
                  className="w-full min-h-[54px] rounded-2xl bg-gradient-to-r from-blue-600 via-cyan-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-extrabold text-lg shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 active:scale-95 transition"
                >
                  <span>Next Level (Level {level + 1})</span>
                  <ArrowRight className="w-5 h-5 stroke-[2.5]" />
                </button>
              )}

              <div className="flex items-center gap-2.5">
                {onPlayAgain && (
                  <button
                    type="button"
                    onClick={() => {
                      voiceService.stopSpeaking();
                      onPlayAgain();
                    }}
                    className="flex-1 min-h-[48px] rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm flex items-center justify-center gap-2 border border-slate-600 active:scale-95 transition"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Play Again</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    voiceService.stopSpeaking();
                    onBack();
                  }}
                  className="flex-1 min-h-[48px] rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm flex items-center justify-center gap-2 border border-slate-600 active:scale-95 transition"
                >
                  <Home className="w-4 h-4" />
                  <span>Game Hub</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
