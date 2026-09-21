import React, { useState, useEffect } from 'react';
import { Language, GameSession } from '../../types';
import { GameShell } from './engine/GameShell';
import { GameSessionResult } from './engine/types';
import { ScoreManager } from './engine/ScoreManager';
import { soundManager } from './engine/SoundManager';
import { adaptiveEngine } from '../../ml/adaptiveEngine';
import { Check, ArrowUp, ArrowDown, Sparkles } from 'lucide-react';

interface MorningRoutineGameProps {
  language: Language;
  onBack: () => void;
  onCompleteSession?: (session: GameSession) => void;
}

interface RoutineStep {
  id: string;
  order: number;
  icon: string;
  title: Record<Language, string>;
  isDistractor?: boolean;
}

const ALL_ROUTINE_STEPS: RoutineStep[] = [
  { id: 'step_wake', order: 1, icon: '🌅', title: { en: 'Wake Up with Dawn', hi: 'सुबह जागना', as: 'পুৱা সাৰ পোৱা', bn: 'ভোরে ঘুম থেকে ওঠা', lus: 'Zing thawh' } },
  { id: 'step_brush', order: 2, icon: '🪥', title: { en: 'Brush Teeth & Wash Face', hi: 'दांत साफ़ करना व मुँह धोना', as: 'দাঁত ঘঁহা আৰু মুখ ধোৱা', bn: 'দাঁত মাজা ও মুখ ধোয়া', lus: 'Ha nawh leh hmai phih' } },
  { id: 'step_tea', order: 3, icon: '☕', title: { en: 'Warm Morning Tea', hi: 'सुबह की गर्म चाय', as: 'গৰম ৰাতিপুৱাৰ চাহ', bn: 'সকালের গরম চা', lus: 'Thingpui in' } },
  { id: 'step_bath', order: 4, icon: '🚿', title: { en: 'Refreshing Bath', hi: 'ताज़गी भरा स्नान', as: 'গা ধোৱা', bn: 'স্নান করা', lus: 'Inbual' } },
  { id: 'step_breakfast', order: 5, icon: '🍲', title: { en: 'Nourishing Breakfast', hi: 'पौष्टिक नाश्ता', as: 'পুষ্টিকৰ জলপান', bn: 'পুষ্টিকর প্রাতরাশ', lus: 'Tukṭhuan ei' } },
  { id: 'step_newspaper', order: 6, icon: '📰', title: { en: 'Read News & Listen Radio', hi: 'समाचार पत्र पढ़ना', as: 'বাতৰিকাকত পঢ়া', bn: 'সংবাদপত্র পড়া', lus: 'Chanchinbu chhiar' } },
  { id: 'step_walk', order: 7, icon: '🚶‍♂️', title: { en: 'Gentle Garden Stroll', hi: 'बगीचे में टहलना', as: 'বাৰীত খোজ কঢ়া', bn: 'বাগানে একটু হাঁটা', lus: 'Huan vahvel' } },
  { id: 'step_medicine', order: 8, icon: '💊', title: { en: 'Morning Medicine & Water', hi: 'सुबह की दवा और पानी', as: 'পুৱাৰ দৰব আৰু পানী', bn: 'সকালের ওষুধ ও জল', lus: 'Zing damdawi ei' } },
  { id: 'step_water_plants', order: 9, icon: '🌱', title: { en: 'Water Potted Plants', hi: 'पौधों को पानी देना', as: 'ফুল-গছত পানী দিয়া', bn: 'গাছে জল দেওয়া', lus: 'Thingphun tui peh' } },
  { id: 'step_relax', order: 10, icon: '🧘', title: { en: 'Peaceful Breathing & Rest', hi: 'शांत विश्राम', as: 'শান্ত বিশ্ৰাম', bn: 'শান্ত বিশ্রাম', lus: 'Chawlh hahdam' } },
  // Distractors for level 6
  { id: 'dist_movie', order: 99, icon: '🎬', isDistractor: true, title: { en: 'Watch Late Night Movie', hi: 'देर रात सिनेमा देखना', as: 'নিশা দেৰিকৈ চিনেমা চোৱা', bn: 'দের রাতে সিনেমা দেখা', lus: 'Zanlai film en' } },
  { id: 'dist_sleep', order: 99, icon: '🌙', isDistractor: true, title: { en: 'Go to Sleep for Night', hi: 'रात में सोने जाना', as: 'নিশা শুবলৈ যোৱা', bn: 'রাতে ঘুমাতে যাওয়া', lus: 'Zanah mut' } },
];

export const MorningRoutineGame: React.FC<MorningRoutineGameProps> = ({
  language,
  onBack,
  onCompleteSession,
}) => {
  const [level, setLevel] = useState<number>(1);
  const [currentSteps, setCurrentSteps] = useState<RoutineStep[]>([]);
  const [userOrder, setUserOrder] = useState<RoutineStep[]>([]);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [attempts, setAttempts] = useState(0);
  const [result, setResult] = useState<GameSessionResult | null>(null);

  const initLevel = (lvl: number) => {
    // Level 1: 4 steps, Level 2: 5 steps, Level 3: 6, Level 4: 7, Level 5: 8, Level 6: 8 + 2 distractors
    const targetCount = lvl === 1 ? 4 : lvl === 2 ? 5 : lvl === 3 ? 6 : lvl === 4 ? 7 : 8;
    let selected = ALL_ROUTINE_STEPS.filter((s) => !s.isDistractor).slice(0, targetCount);

    if (lvl === 6) {
      const distractors = ALL_ROUTINE_STEPS.filter((s) => s.isDistractor);
      selected = [...selected.slice(0, 6), ...distractors];
    }

    setCurrentSteps(selected);
    // Shuffle initial user order
    setUserOrder([...selected].sort(() => Math.random() - 0.5));
    setAttempts(0);
    setResult(null);
    setStartTime(Date.now());
  };

  useEffect(() => {
    initLevel(level);
  }, [level]);

  // Swap step up or down
  const moveStep = (idx: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= userOrder.length) return;

    soundManager.playNote('E4', 0.15);
    const updated = [...userOrder];
    const temp = updated[idx];
    updated[idx] = updated[targetIdx];
    updated[targetIdx] = temp;
    setUserOrder(updated);
  };

  const handleCheckOrder = () => {
    soundManager.playGentleFeedback();
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    // Count correct relative positions
    let correctCount = 0;
    const validCount = currentSteps.filter((s) => !s.isDistractor).length;

    for (let i = 0; i < userOrder.length; i++) {
      if (level === 6 && userOrder[i].isDistractor) {
        // Distractor placed in morning sequence is incorrect
        continue;
      }
      if (i < validCount && userOrder[i].order === i + 1) {
        correctCount++;
      }
    }

    const accuracy = validCount > 0 ? correctCount / validCount : 1;
    const isVictory = accuracy >= 0.75 || correctCount >= validCount - 1;

    if (isVictory) {
      soundManager.playSuccessChime();
    }

    const adaptive = adaptiveEngine.evaluate({
      accuracy,
      reactionTime: Math.max(1000, Date.now() - startTime),
      errorRate: 1 - accuracy,
      completionRate: 1.0,
      currentLevel: level,
    });

    const res = ScoreManager.calculateResult({
      gameId: 'morning_routine',
      level,
      correctAnswers: correctCount,
      totalQuestions: validCount,
      attempts: newAttempts,
      startTime,
      adaptiveLevel: adaptive.newLevel,
    });

    setResult(res);
  };

  const instructions: Record<Language, string> = {
    en: level === 6
      ? 'Arrange morning activities in order. Exclude night activities!'
      : 'Use the arrows to put your morning routine in the natural chronological order.',
    hi: level === 6
      ? 'सुबह की गतिविधियों को क्रम में रखें। रात के कामों को नीचे रखें!'
      : 'तीरों का उपयोग करके सुबह की दिनचर्या को स्वाभाविक क्रम में व्यवस्थित करें।',
    as: level === 6
      ? 'ৰাতিপুৱাৰ কামবোৰ ক্ৰমত সজাওক। ৰাতিৰ কামবোৰ বাদ দিয়ক!'
      : 'কাঁড় চিহ্ন ব্যৱহাৰ কৰি ৰাতিপুৱাৰ কামবোৰ ক্ৰম অনুসৰি সজাওক।',
    bn: level === 6
      ? 'সকালের কাজগুলি পরপর সাজান। রাতের কাজগুলি বাদ দিন!'
      : 'তীর চিহ্ন ব্যবহার করে সকালের কাজের স্বাভাবিক ক্রম সাজান।',
    lus: 'Heng thiltih te hi a indawt turin arrow hmangin rem rawh.',
  };

  return (
    <GameShell
      gameId="morning_routine"
      title="Complete My Morning"
      category="routine"
      level={level}
      instruction={instructions[language]}
      voicePrompt={instructions[language]}
      language={language}
      onBack={onBack}
      onLevelChange={(lvl) => setLevel(lvl)}
      onRestartLevel={() => initLevel(level)}
      result={result}
      onNextLevel={() => setLevel((prev) => Math.min(6, prev + 1))}
      onPlayAgain={() => initLevel(level)}
    >
      <div className="w-full flex flex-col items-center">
        {/* Sequence List */}
        <div className="w-full max-w-md space-y-2.5 my-2">
          {userOrder.map((step, idx) => (
            <div
              key={step.id}
              className="p-3 sm:p-3.5 rounded-2xl bg-[#0B1528] border border-slate-700/80 flex items-center justify-between shadow-md transition-all"
            >
              <div className="flex items-center gap-3">
                {/* Step Number Circle */}
                <div className="w-8 h-8 rounded-full bg-blue-900/60 border border-blue-400/40 text-cyan-300 font-black text-sm flex items-center justify-center">
                  {idx + 1}
                </div>
                <span className="text-2xl">{step.icon}</span>
                <span className="text-sm sm:text-base font-bold text-white text-left">
                  {step.title[language] || step.title.en}
                </span>
              </div>

              {/* Up / Down Controls (min 48px touch target) */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => moveStep(idx, 'up')}
                  disabled={idx === 0}
                  className="w-11 h-11 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-slate-800 text-cyan-300 flex items-center justify-center border border-slate-600 active:scale-95 transition"
                  aria-label="Move Up"
                >
                  <ArrowUp className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => moveStep(idx, 'down')}
                  disabled={idx === userOrder.length - 1}
                  className="w-11 h-11 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-slate-800 text-cyan-300 flex items-center justify-center border border-slate-600 active:scale-95 transition"
                  aria-label="Move Down"
                >
                  <ArrowDown className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Check Answer Button */}
        <button
          type="button"
          onClick={handleCheckOrder}
          className="w-full max-w-md mt-4 min-h-[54px] rounded-2xl bg-gradient-to-r from-blue-600 via-cyan-600 to-cyan-500 hover:from-blue-500 text-white font-extrabold text-lg shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 active:scale-95 transition"
        >
          <Check className="w-5 h-5 stroke-[2.5]" />
          <span>Confirm Routine Order</span>
        </button>
      </div>
    </GameShell>
  );
};
