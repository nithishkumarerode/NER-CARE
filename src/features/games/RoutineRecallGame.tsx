import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { ArrowLeft, RotateCcw, Check, Sparkles, Award } from 'lucide-react';
import { Language, GameSession } from '../../types';
import { voiceService } from '../../services/voiceService';
import { gameSessionRepository } from '../../repositories/gameSessionRepository';
import { getTranslation } from '../../locales/translations';

interface RoutineRecallGameProps {
  language: Language;
  onBack: () => void;
  onCompleteSession: (session: GameSession) => void;
}

interface RoutineStep {
  id: number;
  order: number;
  icon: string;
  title: string;
  desc: string;
}

const MASTER_ROUTINE: RoutineStep[] = [
  { id: 1, order: 1, icon: '🌅', title: 'Wake Up & Sunlight', desc: 'Fresh morning air' },
  { id: 2, order: 2, icon: '🪥', title: 'Brush & Wash', desc: 'Clean teeth and face' },
  { id: 3, order: 3, icon: '☕', title: 'Morning Tea', desc: 'Warm cup of Assam tea' },
  { id: 4, order: 4, icon: '💊', title: 'Morning Medicine', desc: 'Take with water' },
  { id: 5, order: 5, icon: '🚶', title: 'Gentle Walk', desc: 'Light garden stroll' },
];

export const RoutineRecallGame: React.FC<RoutineRecallGameProps> = ({
  language,
  onBack,
  onCompleteSession,
}) => {
  const [shuffledSteps, setShuffledSteps] = useState<RoutineStep[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<number[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [feedback, setFeedback] = useState<string>('');
  const [startTime, setStartTime] = useState<number>(Date.now());

  const initGame = () => {
    // Pick 4 steps for clean elderly engagement
    const currentSteps = MASTER_ROUTINE.slice(0, 4);
    const shuffled = [...currentSteps].sort(() => Math.random() - 0.5);
    setShuffledSteps(shuffled);
    setSelectedOrder([]);
    setIsCompleted(false);
    setFeedback('');
    setStartTime(Date.now());

    voiceService.speak('Arrange your morning routine in order from first to last.', language);
  };

  useEffect(() => {
    initGame();
  }, []);

  const handleSelectStep = (step: RoutineStep) => {
    if (selectedOrder.includes(step.id) || isCompleted) return;

    voiceService.playTone(523.25 + selectedOrder.length * 80, 120, 'sine', 0.1);

    const nextOrder = [...selectedOrder, step.id];
    setSelectedOrder(nextOrder);

    // If all steps selected, evaluate
    if (nextOrder.length === shuffledSteps.length) {
      let isCorrect = true;
      for (let i = 0; i < nextOrder.length; i++) {
        const item = shuffledSteps.find(s => s.id === nextOrder[i]);
        if (item && item.order !== i + 1) {
          isCorrect = false;
          break;
        }
      }

      if (isCorrect) {
        setIsCompleted(true);
        setFeedback(getTranslation(language, 'wonderful'));
        voiceService.playSuccessChime();
        try {
          confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
        } catch (e) {}

        const session = gameSessionRepository.recordSession({
          patient_id: 'pat_ner_001',
          game_type: 'routine_recall',
          score: 95,
          accuracy: 1.0,
          reaction_time: Date.now() - startTime,
          error_count: 0,
          difficulty_level: 1,
          timestamp: new Date().toISOString(),
        });
        onCompleteSession(session);
      } else {
        setFeedback(getTranslation(language, 'tryAnotherOne'));
        voiceService.playGentleChime();
        setTimeout(() => {
          setSelectedOrder([]);
          setFeedback('');
        }, 1600);
      }
    }
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
          <h2 className="text-xl font-bold text-white tracking-tight">Daily Routine Recall</h2>
          <span className="text-xs font-semibold text-cyan-400">Step {selectedOrder.length + 1} of 4</span>
        </div>

        <button
          onClick={initGame}
          aria-label="Restart Activity"
          className="w-12 h-12 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-200 active:scale-95 transition-all"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>

      {/* Instruction */}
      <div className="w-full mb-4 px-4 py-3 rounded-2xl bg-blue-950/60 border border-blue-500/30 text-center shadow-lg">
        <p className="text-xs sm:text-sm font-bold uppercase tracking-wider text-cyan-300">
          Tap activities in their natural daily order
        </p>
      </div>

      {/* Feedback banner */}
      {feedback && (
        <div className="mb-3 px-4 py-1.5 rounded-full bg-emerald-950 border border-emerald-400 text-emerald-300 font-bold text-sm animate-bounce">
          {feedback}
        </div>
      )}

      {/* Ordered Timeline Preview */}
      <div className="w-full mb-4 flex items-center justify-center space-x-2 py-2 px-3 bg-slate-900/60 rounded-2xl border border-slate-700/50 min-h-[52px]">
        {selectedOrder.map((id, index) => {
          const step = shuffledSteps.find(s => s.id === id);
          return (
            <div
              key={id}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-blue-600 text-white text-sm font-bold shadow animate-scale-in"
            >
              <span>{index + 1}.</span>
              <span>{step?.icon}</span>
              <span className="text-xs hidden sm:inline">{step?.title.split(' ')[0]}</span>
            </div>
          );
        })}
        {selectedOrder.length === 0 && (
          <span className="text-xs text-slate-400 font-medium">Your sequence will appear here</span>
        )}
      </div>

      {/* Step Cards to Tap */}
      <div className="w-full space-y-3">
        {shuffledSteps.map((step) => {
          const isSelected = selectedOrder.includes(step.id);
          const orderIdx = selectedOrder.indexOf(step.id);

          return (
            <button
              key={step.id}
              onClick={() => handleSelectStep(step)}
              disabled={isSelected || isCompleted}
              className={`w-full p-4 rounded-2xl border-2 flex items-center justify-between transition-all duration-300 active:scale-98 ${
                isSelected
                  ? 'bg-emerald-950/70 border-emerald-500/60 opacity-80'
                  : 'bg-[#102242] border-blue-500/30 hover:border-cyan-400/50 shadow-md'
              }`}
            >
              <div className="flex items-center space-x-3.5">
                <span className="text-3xl sm:text-4xl">{step.icon}</span>
                <div className="text-left">
                  <h4 className="text-base sm:text-lg font-bold text-white">{step.title}</h4>
                  <p className="text-xs text-slate-300">{step.desc}</p>
                </div>
              </div>

              {isSelected && (
                <div className="w-8 h-8 rounded-full bg-emerald-500 text-slate-950 font-black flex items-center justify-center text-sm">
                  #{orderIdx + 1}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Completion Modal */}
      {isCompleted && (
        <div className="w-full mt-5 p-5 rounded-3xl bg-gradient-to-b from-[#132B45] to-[#0A172A] border-2 border-emerald-400/60 text-center shadow-2xl animate-fade-in">
          <Award className="w-12 h-12 text-amber-400 mx-auto mb-2" />
          <h3 className="text-2xl font-extrabold text-white mb-1">
            {getTranslation(language, 'wonderful')}
          </h3>
          <p className="text-slate-200 text-sm mb-4">
            You successfully recalled your daily morning sequence!
          </p>

          <button
            onClick={initGame}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white font-extrabold text-lg shadow-lg active:scale-[0.98] transition-all"
          >
            {getTranslation(language, 'continue')}
          </button>
        </div>
      )}
    </div>
  );
};
