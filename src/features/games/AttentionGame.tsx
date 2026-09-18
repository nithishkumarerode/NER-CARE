import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { ArrowLeft, RotateCcw, Award } from 'lucide-react';
import { Language, GameSession } from '../../types';
import { voiceService } from '../../services/voiceService';
import { gameSessionRepository } from '../../repositories/gameSessionRepository';
import { getTranslation } from '../../locales/translations';

interface AttentionGameProps {
  language: Language;
  onBack: () => void;
  onCompleteSession: (session: GameSession) => void;
}

interface Round {
  target: { symbol: string; name: string };
  grid: { id: number; symbol: string; isTarget: boolean }[];
}

const ROUNDS: Round[] = [
  {
    target: { symbol: '☕', name: 'Assam Tea Cup' },
    grid: [
      { id: 1, symbol: '🍎', isTarget: false },
      { id: 2, symbol: '🌸', isTarget: false },
      { id: 3, symbol: '☕', isTarget: true },
      { id: 4, symbol: '🧺', isTarget: false },
      { id: 5, symbol: '🔔', isTarget: false },
      { id: 6, symbol: '🏺', isTarget: false },
    ],
  },
  {
    target: { symbol: '🔔', name: 'Prayer Bell' },
    grid: [
      { id: 1, symbol: '🏺', isTarget: false },
      { id: 2, symbol: '🔔', isTarget: true },
      { id: 3, symbol: '☕', isTarget: false },
      { id: 4, symbol: '🦅', isTarget: false },
      { id: 5, symbol: '🌸', isTarget: false },
      { id: 6, symbol: '🍎', isTarget: false },
    ],
  },
  {
    target: { symbol: '🌸', name: 'Lotus Flower' },
    grid: [
      { id: 1, symbol: '🧺', isTarget: false },
      { id: 2, symbol: '🍎', isTarget: false },
      { id: 3, symbol: '🦅', isTarget: false },
      { id: 4, symbol: '🌸', isTarget: true },
      { id: 5, symbol: '☕', isTarget: false },
      { id: 6, symbol: '🔔', isTarget: false },
    ],
  },
];

export const AttentionGame: React.FC<AttentionGameProps> = ({
  language,
  onBack,
  onCompleteSession,
}) => {
  const [roundIdx, setRoundIdx] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [feedback, setFeedback] = useState<string>('');
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [roundStart, setRoundStart] = useState<number>(Date.now());

  const currentRound = ROUNDS[roundIdx];

  useEffect(() => {
    setRoundStart(Date.now());
    voiceService.speak(`Find the ${currentRound.target.name}. Tap it on the screen.`, language);
  }, [roundIdx]);

  const handleTap = (isTarget: boolean) => {
    if (isCompleted) return;

    if (isTarget) {
      voiceService.playSuccessChime();
      setFeedback(getTranslation(language, 'wonderful'));

      setTimeout(() => {
        if (roundIdx < ROUNDS.length - 1) {
          setRoundIdx(prev => prev + 1);
          setFeedback('');
        } else {
          handleWin();
        }
      }, 900);
    } else {
      voiceService.playGentleChime();
      setFeedback(getTranslation(language, 'tryAnotherOne'));
      setTimeout(() => setFeedback(''), 1200);
    }
  };

  const handleWin = () => {
    setIsCompleted(true);
    setFeedback(getTranslation(language, 'wonderful'));
    try {
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    } catch (e) {}

    const session = gameSessionRepository.recordSession({
      patient_id: 'pat_ner_001',
      game_type: 'attention',
      score: 95,
      accuracy: 0.95,
      reaction_time: Date.now() - startTime,
      error_count: 0,
      difficulty_level: 1,
      timestamp: new Date().toISOString(),
    });
    onCompleteSession(session);
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 flex flex-col items-center select-none animate-fade-in">
      {/* Header */}
      <div className="w-full flex items-center justify-between mb-4">
        <button
          onClick={onBack}
          aria-label="Go Back"
          className="w-12 h-12 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-200 active:scale-95 transition-all"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        <div className="flex flex-col items-center">
          <h2 className="text-xl font-bold text-white tracking-tight">Attention Focus</h2>
          <span className="text-xs font-semibold text-cyan-400">Target {roundIdx + 1} of {ROUNDS.length}</span>
        </div>

        <button
          onClick={() => { setRoundIdx(0); setIsCompleted(false); }}
          aria-label="Restart Activity"
          className="w-12 h-12 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-200 active:scale-95 transition-all"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>

      {/* Target Visual Prompt */}
      <div className="w-full p-4 mb-4 rounded-3xl bg-gradient-to-r from-blue-900/60 to-cyan-900/40 border-2 border-cyan-400/40 flex items-center justify-center space-x-4 shadow-xl">
        <div className="w-16 h-16 rounded-2xl bg-cyan-950 border border-cyan-400/50 flex items-center justify-center text-4xl shadow-inner">
          {currentRound.target.symbol}
        </div>
        <div className="text-left">
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-300">Find the target:</span>
          <h3 className="text-xl font-extrabold text-white">{currentRound.target.name}</h3>
        </div>
      </div>

      {feedback && (
        <div className="mb-4 px-4 py-1.5 rounded-full bg-emerald-950 border border-emerald-400 text-emerald-300 font-bold text-sm animate-bounce">
          {feedback}
        </div>
      )}

      {/* Grid of Objects to Scan */}
      <div className="grid grid-cols-3 gap-3.5 w-full my-2">
        {currentRound.grid.map((item) => (
          <button
            key={item.id}
            onClick={() => handleTap(item.isTarget)}
            disabled={isCompleted}
            className="h-28 rounded-2xl bg-[#102242] hover:bg-[#1A315F] border-2 border-blue-500/30 hover:border-cyan-400 flex items-center justify-center text-5xl active:scale-95 transition-all shadow-lg"
          >
            {item.symbol}
          </button>
        ))}
      </div>

      {/* Completion */}
      {isCompleted && (
        <div className="w-full mt-6 p-5 rounded-3xl bg-gradient-to-b from-[#132B45] to-[#0A172A] border-2 border-emerald-400/60 text-center shadow-2xl animate-fade-in">
          <Award className="w-12 h-12 text-amber-400 mx-auto mb-2" />
          <h3 className="text-2xl font-extrabold text-white mb-1">
            {getTranslation(language, 'wonderful')}
          </h3>
          <p className="text-slate-200 text-sm mb-4">
            You spotted every target with excellent visual precision!
          </p>

          <button
            onClick={onBack}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white font-extrabold text-lg shadow-lg active:scale-[0.98] transition-all"
          >
            {getTranslation(language, 'continue')}
          </button>
        </div>
      )}
    </div>
  );
};
