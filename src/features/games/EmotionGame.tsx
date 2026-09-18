import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { ArrowLeft, RotateCcw, Award } from 'lucide-react';
import { Language, GameSession } from '../../types';
import { voiceService } from '../../services/voiceService';
import { gameSessionRepository } from '../../repositories/gameSessionRepository';
import { getTranslation } from '../../locales/translations';

interface EmotionGameProps {
  language: Language;
  onBack: () => void;
  onCompleteSession: (session: GameSession) => void;
}

interface EmotionQuestion {
  emoji: string;
  name: string;
  options: string[];
  correct: string;
}

const EMOTIONS: EmotionQuestion[] = [
  { emoji: '😊', name: 'Smiling Friend', options: ['Happy', 'Angry', 'Sad'], correct: 'Happy' },
  { emoji: '😌', name: 'Calm Breathing', options: ['Peaceful', 'Scared', 'Hungry'], correct: 'Peaceful' },
  { emoji: '😮', name: 'Surprised Face', options: ['Surprised', 'Sleepy', 'Confused'], correct: 'Surprised' },
  { emoji: '🥰', name: 'Loving Family', options: ['Loved & Blessed', 'Angry', 'Cold'], correct: 'Loved & Blessed' },
];

export const EmotionGame: React.FC<EmotionGameProps> = ({
  language,
  onBack,
  onCompleteSession,
}) => {
  const [index, setIndex] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [feedback, setFeedback] = useState<string>('');
  const [startTime, setStartTime] = useState<number>(Date.now());

  const current = EMOTIONS[index];

  useEffect(() => {
    voiceService.speak(`How is this person feeling? Tap the feeling that matches.`, language);
  }, [index]);

  const handleSelect = (choice: string) => {
    if (isCompleted) return;

    if (choice === current.correct) {
      voiceService.playSuccessChime();
      setFeedback(getTranslation(language, 'wonderful'));

      setTimeout(() => {
        if (index < EMOTIONS.length - 1) {
          setIndex(prev => prev + 1);
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
      game_type: 'emotion_recognition',
      score: 95,
      accuracy: 1.0,
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
          <h2 className="text-xl font-bold text-white tracking-tight">Emotion Connection</h2>
          <span className="text-xs font-semibold text-cyan-400">Card {index + 1} of {EMOTIONS.length}</span>
        </div>

        <button
          onClick={() => { setIndex(0); setIsCompleted(false); }}
          aria-label="Restart Activity"
          className="w-12 h-12 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-200 active:scale-95 transition-all"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>

      {/* Instruction */}
      <div className="w-full mb-4 px-4 py-3 rounded-2xl bg-blue-950/60 border border-blue-500/30 text-center shadow-lg">
        <p className="text-xs sm:text-sm font-bold uppercase tracking-wider text-cyan-300">
          How does this person feel?
        </p>
      </div>

      {feedback && (
        <div className="mb-4 px-4 py-1.5 rounded-full bg-emerald-950 border border-emerald-400 text-emerald-300 font-bold text-sm animate-bounce">
          {feedback}
        </div>
      )}

      {/* Big Face Visual */}
      <div className="w-44 h-44 my-4 rounded-full bg-[#112344] border-4 border-cyan-400/40 flex items-center justify-center text-8xl shadow-2xl shadow-cyan-500/20 animate-float">
        {current.emoji}
      </div>

      {/* Option Choices */}
      <div className="w-full space-y-3 mt-4">
        {current.options.map((opt, idx) => (
          <button
            key={idx}
            onClick={() => handleSelect(opt)}
            disabled={isCompleted}
            className="w-full py-4 px-6 rounded-2xl bg-[#102242] hover:bg-[#1A315F] border-2 border-blue-500/40 hover:border-cyan-400 text-lg sm:text-xl font-bold text-white active:scale-98 transition-all shadow-md text-left flex items-center justify-between"
          >
            <span>{opt}</span>
            <span className="text-sm text-cyan-400 font-semibold">Select →</span>
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
            You recognized all warm human expressions with heartfelt empathy!
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
