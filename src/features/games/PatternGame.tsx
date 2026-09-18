import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { ArrowLeft, RotateCcw, Award, Check } from 'lucide-react';
import { Language, GameSession } from '../../types';
import { voiceService } from '../../services/voiceService';
import { gameSessionRepository } from '../../repositories/gameSessionRepository';
import { getTranslation } from '../../locales/translations';

interface PatternGameProps {
  language: Language;
  onBack: () => void;
  onCompleteSession: (session: GameSession) => void;
}

interface PatternQuestion {
  sequence: string[];
  options: string[];
  correct: string;
  hint: string;
}

const PATTERNS: PatternQuestion[] = [
  { sequence: ['🔵', '🟡', '🔵', '🟡'], options: ['🔵', '🟡', '🟢', '🔴'], correct: '🔵', hint: 'Alternating blue and yellow' },
  { sequence: ['🌸', '🍃', '🌸', '🍃'], options: ['🌸', '🍃', '🍇', '🌻'], correct: '🌸', hint: 'Flower, leaf, flower...' },
  { sequence: ['☕', '☕', '💧', '☕', '☕'], options: ['☕', '💧', '🍲', '🍎'], correct: '💧', hint: 'Two teas, one water, two teas...' },
  { sequence: ['🔴', '🟢', '🔴', '🟢'], options: ['🔴', '🟢', '🟡', '🟣'], correct: '🔴', hint: 'Red, green, red, green...' },
];

export const PatternGame: React.FC<PatternGameProps> = ({
  language,
  onBack,
  onCompleteSession,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [feedback, setFeedback] = useState<string>('');
  const [startTime, setStartTime] = useState<number>(Date.now());

  const currentPattern = PATTERNS[currentIndex];

  useEffect(() => {
    voiceService.speak('What comes next in the pattern? Tap the correct symbol.', language);
  }, [currentIndex]);

  const handleSelectOption = (opt: string) => {
    if (isCompleted) return;

    if (opt === currentPattern.correct) {
      voiceService.playSuccessChime();
      setFeedback(getTranslation(language, 'wonderful'));
      setScore(prev => prev + 1);

      setTimeout(() => {
        if (currentIndex < PATTERNS.length - 1) {
          setCurrentIndex(prev => prev + 1);
          setFeedback('');
        } else {
          handleWin();
        }
      }, 1000);
    } else {
      voiceService.playGentleChime();
      setFeedback(getTranslation(language, 'tryAnotherOne'));
      setTimeout(() => setFeedback(''), 1400);
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
      game_type: 'pattern_recognition',
      score: 90,
      accuracy: 0.9,
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
          <h2 className="text-xl font-bold text-white tracking-tight">Pattern Recognition</h2>
          <span className="text-xs font-semibold text-cyan-400">Pattern {currentIndex + 1} of {PATTERNS.length}</span>
        </div>

        <button
          onClick={() => { setCurrentIndex(0); setIsCompleted(false); }}
          aria-label="Restart Activity"
          className="w-12 h-12 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-200 active:scale-95 transition-all"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>

      {/* Instruction */}
      <div className="w-full mb-4 px-4 py-3 rounded-2xl bg-blue-950/60 border border-blue-500/30 text-center shadow-lg">
        <p className="text-xs sm:text-sm font-bold uppercase tracking-wider text-cyan-300">
          What symbol completes the sequence?
        </p>
      </div>

      {feedback && (
        <div className="mb-4 px-4 py-1.5 rounded-full bg-emerald-950 border border-emerald-400 text-emerald-300 font-bold text-sm animate-bounce">
          {feedback}
        </div>
      )}

      {/* Visual Sequence Card */}
      <div className="w-full p-6 my-2 rounded-3xl bg-[#0E1B33] border-2 border-blue-500/30 flex items-center justify-center space-x-3 shadow-xl">
        {currentPattern.sequence.map((item, idx) => (
          <span key={idx} className="text-4xl sm:text-5xl animate-scale-in">
            {item}
          </span>
        ))}
        {/* The Question Mark slot */}
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-blue-600/30 border-2 border-dashed border-cyan-400 flex items-center justify-center text-2xl font-black text-cyan-300 animate-pulse">
          ?
        </div>
      </div>

      {/* Choice Options */}
      <p className="text-slate-300 text-sm font-semibold my-4">Choose the next one:</p>
      <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
        {currentPattern.options.map((opt, idx) => (
          <button
            key={idx}
            onClick={() => handleSelectOption(opt)}
            disabled={isCompleted}
            className="h-24 rounded-2xl bg-[#122345] hover:bg-[#1A315F] border-2 border-blue-500/40 hover:border-cyan-400 flex items-center justify-center text-5xl active:scale-95 transition-all shadow-md"
          >
            {opt}
          </button>
        ))}
      </div>

      {/* Win Modal */}
      {isCompleted && (
        <div className="w-full mt-6 p-5 rounded-3xl bg-gradient-to-b from-[#132B45] to-[#0A172A] border-2 border-emerald-400/60 text-center shadow-2xl animate-fade-in">
          <Award className="w-12 h-12 text-amber-400 mx-auto mb-2" />
          <h3 className="text-2xl font-extrabold text-white mb-1">
            {getTranslation(language, 'wonderful')}
          </h3>
          <p className="text-slate-200 text-sm mb-4">
            You completed all visual patterns with great clarity!
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
