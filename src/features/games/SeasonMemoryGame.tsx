import React, { useState, useEffect } from 'react';
import { Language, GameSession } from '../../types';
import { GameShell } from './engine/GameShell';
import { GameSessionResult } from './engine/types';
import { ScoreManager } from './engine/ScoreManager';
import { soundManager } from './engine/SoundManager';
import { adaptiveEngine } from '../../ml/adaptiveEngine';
import { Check, ArrowUp, ArrowDown } from 'lucide-react';

interface SeasonMemoryGameProps {
  language: Language;
  onBack: () => void;
  onCompleteSession?: (session: GameSession) => void;
}

interface SeasonStage {
  id: string;
  order: number;
  seasonName: Record<Language, string>;
  activityName: Record<Language, string>;
  icon: string;
}

const SEASON_CYCLE: SeasonStage[] = [
  { id: 'st_spring1', order: 1, seasonName: { en: 'Spring', hi: 'वसंत', as: 'বসন্ত', bn: 'বসন্ত', lus: 'Ṭhal' }, activityName: { en: 'Orchids Bloom & Weaving Gamosa', hi: 'फूल खिलना और बुनाई', as: 'কপৌ ফুল ফুলা আৰু গামোচা বোৱা', bn: 'ফুল ফোটা ও তাঁত বোনা', lus: 'Pangpar par chhuah' }, icon: '🌸' },
  { id: 'st_spring2', order: 2, seasonName: { en: 'Spring New Year', hi: 'नववर्ष उत्सव', as: 'ৰঙালী বিহুৰ আনন্দ', bn: 'নববর্ষ উৎসব', lus: 'Kut thar lawm' }, activityName: { en: 'Village Dhol & Buffalo Horn Flute', hi: 'ढोल और बांसुरी की धुन', as: 'ঢোল আৰু পেঁপাৰ সুৰ', bn: 'ঢোল ও বাঁশির সুর', lus: 'Khuang leh rawchhem' }, icon: '🪈' },
  { id: 'st_monsoon1', order: 3, seasonName: { en: 'Early Monsoon', hi: 'वर्षा का आगमन', as: 'বাৰিষাৰ বৰষুণ', bn: 'বর্ষার আগমন', lus: 'Fur ṭan' }, activityName: { en: 'Rains Nourish the Green Hills', hi: 'पहाड़ों पर बारिश', as: 'পাহাৰত বৰষুণ আৰু নৈ উপচি পৰা', bn: 'পাহাড়ে বৃষ্টির ধারা', lus: 'Tlanga ruah sur' }, icon: '🌧️' },
  { id: 'st_monsoon2', order: 4, seasonName: { en: 'Monsoon Sowing', hi: 'धान की रोपाई', as: 'পথাৰত কঠীয়া ৰোৱা', bn: 'ধানের চারা রোপণ', lus: 'Buh tuh hun' }, activityName: { en: 'Transplanting Green Paddy Seedlings', hi: 'धान की हरी पौध लगाना', as: 'সেউজীয়া ধানৰ ৰোৱনী কাম', bn: 'সবুজ ধানের চারা লাগানো', lus: 'Buh chi tuh' }, icon: '🌱' },
  { id: 'st_autumn1', order: 5, seasonName: { en: 'Golden Autumn', hi: 'शरद ऋतु', as: 'সোণালী শৰৎ', bn: 'সোনালী শরৎ', lus: 'Pawl hun' }, activityName: { en: 'Paddy Heads Turn Golden in Breeze', hi: 'धान की बालियाँ सुनहरी होना', as: 'সোণালী ধানৰ শীৰ দোঁ খাই পৰা', bn: 'ধানের শিষ সোনালী হওয়া', lus: 'Buh hmin hun' }, icon: '🌾' },
  { id: 'st_autumn2', order: 6, seasonName: { en: 'Autumn Light', hi: 'आकाश दीया उत्सव', as: 'আকাশ বন্তি জ্বলোৱা', bn: 'আকাশ প্রদীপ জ্বালানো', lus: 'Khawnvar eng' }, activityName: { en: 'Lighting Earthen Lamps in Fields', hi: 'खेतों में दीप जलाना', as: 'পথাৰত আকাশ বন্তি জ্বলোৱা', bn: 'ক্ষেতে প্রদীপ জ্বালানো', lus: 'Kawtlaia meichher' }, icon: '🪔' },
  { id: 'st_winter1', order: 7, seasonName: { en: 'Winter Harvest', hi: 'फसल की कटाई', as: 'আঘোণৰ ধান কটা', bn: 'ধান কাটা ও নবান্ন', lus: 'Buh seng hun' }, activityName: { en: 'Reaping Golden Rice into Granaries', hi: 'खलिहान में अनाज भरना', as: 'ভঁৰাললৈ সোণালী ধান চপোৱা', bn: 'গোলায় ধান তোলা', lus: 'Buh in chhung luh' }, icon: '🧺' },
  { id: 'st_winter2', order: 8, seasonName: { en: 'Magh Winter Feast', hi: 'शीतकालीन भोज', as: 'মাঘৰ ভোগালী ভোজ', bn: 'শীতের নবান্ন ভোজ', lus: 'Thlasik Ruai' }, activityName: { en: 'Bonfire Meji & Steaming Rice Cakes', hi: 'अलाव और गरम पकवान', as: 'মেজিৰ জুঁই আৰু তিলপিঠা', bn: 'আগুনের মেজি ও পিঠেপুলি', lus: 'Mei lum ai leh chhang' }, icon: '🔥' },
];

export const SeasonMemoryGame: React.FC<SeasonMemoryGameProps> = ({
  language,
  onBack,
  onCompleteSession,
}) => {
  const [level, setLevel] = useState<number>(1);
  const [activeStages, setActiveStages] = useState<SeasonStage[]>([]);
  const [userOrder, setUserOrder] = useState<SeasonStage[]>([]);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [attempts, setAttempts] = useState(0);
  const [result, setResult] = useState<GameSessionResult | null>(null);

  const initLevel = (lvl: number) => {
    // Level 1: 3 stages, Level 2: 4, Level 3: 5, Level 4: 6, Level 5: 7, Level 6: 8
    const count = Math.min(8, lvl + 2);
    const selected = SEASON_CYCLE.slice(0, count);

    setActiveStages(selected);
    // Shuffle order for user to sort
    setUserOrder([...selected].sort(() => Math.random() - 0.5));
    setAttempts(0);
    setResult(null);
    setStartTime(Date.now());
  };

  useEffect(() => {
    initLevel(level);
  }, [level]);

  const moveItem = (idx: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= userOrder.length) return;

    soundManager.playNote('G4', 0.15);
    const updated = [...userOrder];
    const temp = updated[idx];
    updated[idx] = updated[targetIdx];
    updated[targetIdx] = temp;
    setUserOrder(updated);
  };

  const handleVerify = () => {
    soundManager.playGentleFeedback();
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    let correctCount = 0;
    for (let i = 0; i < userOrder.length; i++) {
      if (userOrder[i].order === activeStages[i].order) {
        correctCount++;
      }
    }

    const total = activeStages.length;
    const accuracy = total > 0 ? correctCount / total : 1;
    const isVictory = accuracy >= 0.7 || correctCount >= total - 1;

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
      gameId: 'season_memory',
      level,
      correctAnswers: correctCount,
      totalQuestions: total,
      attempts: newAttempts,
      startTime,
      adaptiveLevel: adaptive.newLevel,
    });

    setResult(res);
  };

  const instructions: Record<Language, string> = {
    en: 'Arrange the seasonal farming and celebration stages in their natural annual order.',
    hi: 'ऋतुओं के अनुसार कृषि और त्योहारों के चरणों को उनके प्राकृतिक क्रम में व्यवस्थित करें।',
    as: 'ঋতু অনুসৰি খেতি আৰু উৎসৱৰ পৰ্যায়বোৰ প্ৰাকৃতিক ক্ৰমত সজাওক।',
    bn: 'ঋতুভিত্তিক কৃষি ও উৎসবের পর্যায়গুলি তাদের প্রাকৃতিক ক্রমানুসারে সাজান।',
    lus: 'Sik leh sa inthlak dan indawtin heng thiltih te hi rem rawh.',
  };

  return (
    <GameShell
      gameId="season_memory"
      title="Season Memory"
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
        <div className="w-full max-w-md space-y-2.5 my-2">
          {userOrder.map((stage, idx) => (
            <div
              key={stage.id}
              className="p-3 sm:p-3.5 rounded-2xl bg-[#0B1528] border border-slate-700 flex items-center justify-between shadow-md"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-900/60 border border-cyan-400/40 text-cyan-300 font-bold text-sm flex items-center justify-center">
                  {idx + 1}
                </div>
                <span className="text-2xl">{stage.icon}</span>
                <div className="text-left">
                  <span className="text-xs font-black text-cyan-300 uppercase block">
                    {stage.seasonName[language] || stage.seasonName.en}
                  </span>
                  <span className="text-sm font-bold text-white block">
                    {stage.activityName[language] || stage.activityName.en}
                  </span>
                </div>
              </div>

              {/* Move up / down arrows */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => moveItem(idx, 'up')}
                  disabled={idx === 0}
                  className="w-11 h-11 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-cyan-300 flex items-center justify-center border border-slate-600 active:scale-95 transition"
                >
                  <ArrowUp className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => moveItem(idx, 'down')}
                  disabled={idx === userOrder.length - 1}
                  className="w-11 h-11 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-cyan-300 flex items-center justify-center border border-slate-600 active:scale-95 transition"
                >
                  <ArrowDown className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={handleVerify}
          className="w-full max-w-md mt-4 min-h-[54px] rounded-2xl bg-gradient-to-r from-blue-600 via-cyan-600 to-cyan-500 hover:from-blue-500 text-white font-extrabold text-lg shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 active:scale-95 transition"
        >
          <Check className="w-5 h-5 stroke-[2.5]" />
          <span>Confirm Seasonal Cycle</span>
        </button>
      </div>
    </GameShell>
  );
};
