import React, { useState, useEffect } from 'react';
import { Language, GameSession } from '../../types';
import { GameShell } from './engine/GameShell';
import { GameSessionResult } from './engine/types';
import { ScoreManager } from './engine/ScoreManager';
import { soundManager } from './engine/SoundManager';
import { adaptiveEngine } from '../../ml/adaptiveEngine';
import { Check, Eye, HelpCircle } from 'lucide-react';

interface VillageMemoryGameProps {
  language: Language;
  onBack: () => void;
  onCompleteSession?: (session: GameSession) => void;
}

interface VillageObject {
  id: string;
  name: Record<Language, string>;
  icon: string;
  gridPos: number; // 0 to 15 (4x4 grid)
}

const VILLAGE_ITEMS: Omit<VillageObject, 'gridPos'>[] = [
  { id: 'tea_stall', name: { en: 'Tea Stall', hi: 'चाय की दुकान', as: 'চাহৰ দোকান', bn: 'চায়ের দোকান', lus: 'Thingpuidawr' }, icon: '☕' },
  { id: 'banyan_tree', name: { en: 'Banyan Tree', hi: 'बरगद का पेड़', as: 'বট গছ', bn: 'বটগাছ', lus: 'Thingpui' }, icon: '🌳' },
  { id: 'village_bus', name: { en: 'Green Bus', hi: 'हरी बस', as: 'সেউজীয়া বাছ', bn: 'সবুজ বাস', lus: 'Bus Hring' }, icon: '🚌' },
  { id: 'peaceful_house', name: { en: 'Clay House', hi: 'मिट्टी का घर', as: 'মাটিৰ ঘৰ', bn: 'মাটির ঘর', lus: 'In' }, icon: '🏠' },
  { id: 'water_well', name: { en: 'Village Well', hi: 'गाँव का कुआँ', as: 'গাঁৱৰ কুঁৱা', bn: 'গ্রামের পাতকুয়ো', lus: 'Tui Khur' }, icon: '🪣' },
  { id: 'bicycle', name: { en: 'Elder’s Bicycle', hi: 'साइकिल', as: 'চাইকেল', bn: 'সাইকেল', lus: 'Thirte' }, icon: '🚲' },
  { id: 'temple', name: { en: 'Village Temple', hi: 'मंदिर', as: 'মন্দিৰ', bn: 'গ্রাম্য মন্দির', lus: 'Biakin' }, icon: '🛕' },
  { id: 'post_box', name: { en: 'Red Postbox', hi: 'डाकघर का डिब्बा', as: 'ডাক পেৰা', bn: 'ডাকবাক্স', lus: 'Lehkhathawn Bawm' }, icon: '📮' },
  { id: 'country_boat', name: { en: 'Wooden Boat', hi: 'नाव', as: 'নাও', bn: 'নৌকো', lus: 'Lawng' }, icon: '⛵' },
  { id: 'lotus_pond', name: { en: 'Lotus Pond', hi: 'कमल का तालाब', as: 'পদ্ম পুখুৰী', bn: 'পদ্মপুকুর', lus: 'Dil' }, icon: '🌸' },
  { id: 'market_stall', name: { en: 'Vegetable Stall', hi: 'सब्ज़ी की दुकान', as: 'শাক-পাচলিৰ দোকান', bn: 'সবজি দোকান', lus: 'Thlai Dawr' }, icon: '🧺' },
  { id: 'lamp_post', name: { en: 'Street Lamp', hi: 'सड़क की बत्ती', as: 'বাতিস্তম্ভ', bn: 'রাস্তার আলো', lus: 'Khawlai Khawnvar' }, icon: '🏮' },
];

export const VillageMemoryGame: React.FC<VillageMemoryGameProps> = ({
  language,
  onBack,
  onCompleteSession,
}) => {
  const [level, setLevel] = useState<number>(1);
  const [phase, setPhase] = useState<'observe' | 'question'>('observe');
  const [placedItems, setPlacedItems] = useState<VillageObject[]>([]);
  const [targetItem, setTargetItem] = useState<VillageObject | null>(null);
  const [selectedPos, setSelectedPos] = useState<number | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [countdown, setCountdown] = useState<number>(15);
  const [result, setResult] = useState<GameSessionResult | null>(null);

  // Initialize level
  const initLevel = (lvl: number) => {
    // Level 1: 4 objects, Level 2: 5 objects, Level 3: 6, Level 4: 7, Level 5: 8, Level 6: 10
    const count = Math.min(12, lvl + 3);
    const shuffledItems = [...VILLAGE_ITEMS].sort(() => Math.random() - 0.5).slice(0, count);

    // Pick unique positions on a 4x4 (16 cells) grid
    const positions = Array.from({ length: 16 }, (_, i) => i).sort(() => Math.random() - 0.5);
    const assigned: VillageObject[] = shuffledItems.map((item, idx) => ({
      ...item,
      gridPos: positions[idx],
    }));

    setPlacedItems(assigned);
    setTargetItem(assigned[Math.floor(Math.random() * assigned.length)]);
    setPhase('observe');
    setSelectedPos(null);
    setAttempts(0);
    setCorrectCount(0);
    setResult(null);
    setStartTime(Date.now());

    // Observation countdown based on level
    const timeSec = lvl <= 2 ? 15 : lvl <= 4 ? 12 : 10;
    setCountdown(timeSec);
  };

  useEffect(() => {
    initLevel(level);
  }, [level]);

  // Countdown timer in observe phase
  useEffect(() => {
    if (phase !== 'observe') return;
    if (countdown <= 0) {
      setPhase('question');
      return;
    }
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [phase, countdown]);

  const handleTileClick = (pos: number) => {
    if (phase !== 'question' || !targetItem || selectedPos !== null) return;
    setSelectedPos(pos);
    const isCorrect = pos === targetItem.gridPos;
    const newAttempts = attempts + 1;
    const newCorrect = isCorrect ? correctCount + 1 : correctCount;
    setAttempts(newAttempts);
    setCorrectCount(newCorrect);

    if (isCorrect) {
      soundManager.playSuccessChime();
    } else {
      soundManager.playGentleFeedback();
    }

    // Wrap up session
    setTimeout(() => {
      const adaptive = adaptiveEngine.evaluate({
        accuracy: isCorrect ? 1.0 : 0.4,
        reactionTime: Math.max(1000, Date.now() - startTime),
        errorRate: isCorrect ? 0 : 0.6,
        completionRate: 1.0,
        currentLevel: level,
      });

      const res = ScoreManager.calculateResult({
        gameId: 'memory_village',
        level,
        correctAnswers: isCorrect ? 1 : 0,
        totalQuestions: 1,
        attempts: newAttempts,
        startTime,
        adaptiveLevel: adaptive.newLevel,
      });

      setResult(res);
    }, 1200);
  };

  const instructions: Record<Language, string> = {
    en: phase === 'observe'
      ? `Study the village map carefully (${countdown}s remaining). Remember where each place is.`
      : `Where was the ${targetItem?.name[language] || targetItem?.name.en} located? Tap the correct spot.`,
    hi: phase === 'observe'
      ? `गाँव के नक्शे को ध्यान से देखें (${countdown} सेकेण्ड शेष)। याद रखें कि कौन सी चीज़ कहाँ है।`
      : `${targetItem?.name[language] || targetItem?.name.hi} कहाँ थी? सही स्थान पर स्पर्श करें।`,
    as: phase === 'observe'
      ? `গাঁৱৰ মানচিত্ৰখন মন দি চাওক (${countdown} ছেকেণ্ড বাকী)। কোনটো বস্তু ক’ত আছে মনত ৰাখক।`
      : `${targetItem?.name[language] || targetItem?.name.as} ক’ত আছিল? সঠিক ঠাইত স্পৰ্শ কৰক।`,
    bn: phase === 'observe'
      ? `গ্রামের মানচিত্রটি মন দিয়ে দেখুন (${countdown} সেকেন্ড বাকি)। কোথায় কী আছে মনে রাখুন।`
      : `${targetItem?.name[language] || targetItem?.name.bn} কোথায় ছিল? সঠিক স্থানে স্পর্শ করুন।`,
    lus: phase === 'observe'
      ? `Khaw lem hi uluk takin en rawh (${countdown}s a la awm). Bungraw awmna hria rawh.`
      : `${targetItem?.name[language] || targetItem?.name.lus} awmna zawn chhuak rawh.`,
  };

  return (
    <GameShell
      gameId="memory_village"
      title="My Village, My Memory"
      category="memory"
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
        {/* Phase Badge & Ready Button */}
        <div className="flex items-center justify-between w-full max-w-sm mb-3">
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
              phase === 'observe' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 animate-pulse' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
            }`}>
              {phase === 'observe' ? `👁️ Memorize (${countdown}s)` : '❓ Locate the Landmark'}
            </span>
          </div>

          {phase === 'observe' && (
            <button
              onClick={() => setPhase('question')}
              className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-xs font-bold transition flex items-center gap-1.5 shadow"
            >
              <span>I'm Ready!</span>
              <Check className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Question Target Highlight Card */}
        {phase === 'question' && targetItem && (
          <div className="w-full max-w-sm p-3 mb-3 bg-[#0B1528] rounded-2xl border-2 border-cyan-400/60 flex items-center justify-center gap-3 shadow-lg">
            <span className="text-3xl">{targetItem.icon}</span>
            <div className="text-left">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Find Location:</span>
              <span className="text-lg font-black text-cyan-300">{targetItem.name[language] || targetItem.name.en}</span>
            </div>
          </div>
        )}

        {/* 4x4 Village Map Grid */}
        <div className="grid grid-cols-4 gap-2.5 w-full max-w-sm aspect-square bg-[#0B1528]/80 p-3 rounded-3xl border border-slate-700/80 shadow-2xl">
          {Array.from({ length: 16 }).map((_, idx) => {
            const item = placedItems.find((it) => it.gridPos === idx);
            const isTarget = targetItem?.gridPos === idx;
            const isSelected = selectedPos === idx;

            let tileStyle = 'bg-[#0E1A33] border-slate-700/60 text-slate-400';

            if (phase === 'observe' && item) {
              tileStyle = 'bg-gradient-to-tr from-blue-950 to-cyan-950 border-cyan-400/40 shadow-sm';
            } else if (phase === 'question' && selectedPos !== null) {
              if (isSelected) {
                tileStyle = isTarget
                  ? 'bg-emerald-900/80 border-emerald-400 ring-2 ring-emerald-300 scale-105'
                  : 'bg-rose-900/80 border-rose-400 ring-2 ring-rose-300';
              } else if (isTarget) {
                tileStyle = 'bg-emerald-900/40 border-emerald-500/60';
              }
            }

            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleTileClick(idx)}
                disabled={phase !== 'question' || selectedPos !== null}
                className={`w-full h-full rounded-2xl border-2 flex flex-col items-center justify-center transition-all duration-200 active:scale-95 ${tileStyle}`}
              >
                {phase === 'observe' && item ? (
                  <>
                    <span className="text-2xl sm:text-3xl">{item.icon}</span>
                    <span className="text-[9px] font-bold text-slate-200 mt-1 line-clamp-1 px-1">
                      {item.name[language] || item.name.en}
                    </span>
                  </>
                ) : phase === 'question' && selectedPos !== null && item ? (
                  <>
                    <span className="text-2xl sm:text-3xl">{item.icon}</span>
                    <span className="text-[9px] font-bold text-white mt-1 line-clamp-1 px-1">
                      {item.name[language] || item.name.en}
                    </span>
                  </>
                ) : (
                  <span className="text-xs text-slate-600 font-bold">•</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </GameShell>
  );
};
