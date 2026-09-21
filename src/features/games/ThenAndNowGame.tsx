import React, { useState, useEffect } from 'react';
import { Language, GameSession } from '../../types';
import { GameShell } from './engine/GameShell';
import { GameSessionResult } from './engine/types';
import { ScoreManager } from './engine/ScoreManager';
import { soundManager } from './engine/SoundManager';
import { adaptiveEngine } from '../../ml/adaptiveEngine';
import { Check } from 'lucide-react';

interface ThenAndNowGameProps {
  language: Language;
  onBack: () => void;
  onCompleteSession?: (session: GameSession) => void;
}

interface SceneItem {
  id: string;
  name: Record<Language, string>;
  icon: string;
}

const POOL_ITEMS: SceneItem[] = [
  { id: 'lamp', name: { en: 'Brass Lamp', hi: 'पीतल का दीपक', as: 'পিতলৰ চাকি', bn: 'পিতলের প্রদীপ', lus: 'Khawnvar' }, icon: '🪔' },
  { id: 'chair', name: { en: 'Cane Chair', hi: 'बेंत की कुर्सी', as: 'বেতৰ চকী', bn: 'বেতের চেয়ার', lus: 'Ṭhutthleng' }, icon: '🪑' },
  { id: 'tea_cup', name: { en: 'Tea Cup', hi: 'चाय का कप', as: 'চাহৰ কাপ', bn: 'চায়ের কাপ', lus: 'No' }, icon: '☕' },
  { id: 'clock', name: { en: 'Grandfather Clock', hi: 'पुरानी घड़ी', as: 'পুৰণি ঘড়ী', bn: 'প্রাচীন ঘড়ি', lus: 'Sana' }, icon: '🕰️' },
  { id: 'book', name: { en: 'Story Book', hi: 'कहानी की किताब', as: 'সাধুৰ কিতাপ', bn: 'গল্পের বই', lus: 'Lehkhabu' }, icon: '📖' },
  { id: 'flower', name: { en: 'Marigold Blossom', hi: 'गेंदे का फूल', as: 'গেন্ধাই ফুল', bn: 'গাঁদা ফুল', lus: 'Pangpar' }, icon: '🌼' },
  { id: 'hat', name: { en: 'Sun Hat / Jaapi', hi: 'टोपी', as: 'জাপি', bn: 'টুপি', lus: 'Lukhuk' }, icon: '👒' },
  { id: 'radio', name: { en: 'Radio Set', hi: 'रेडियो', as: 'ৰেডিঅ’', bn: 'রেডিও', lus: 'Radio' }, icon: '📻' },
  // Alternatives for changes
  { id: 'candle', name: { en: 'Wax Candle', hi: 'मोमबत्ती', as: 'মমবাতি', bn: 'মোমবাতি', lus: 'Mombati' }, icon: '🕯️' },
  { id: 'stool', name: { en: 'Wooden Stool', hi: 'लकड़ी की चौकी', as: 'পীৰা', bn: 'পিঁড়ে', lus: 'Ṭhutna' }, icon: '🪵' },
  { id: 'rose', name: { en: 'Red Rose', hi: 'गुलाब', as: 'গোলাপ', bn: 'গোলাপ', lus: 'Ros pangpar' }, icon: '🌹' },
  { id: 'bell', name: { en: 'Prayer Bell', hi: 'घंटी', as: 'ঘণ্টা', bn: 'ঘণ্টা', lus: 'Darkhing' }, icon: '🔔' },
];

export const ThenAndNowGame: React.FC<ThenAndNowGameProps> = ({
  language,
  onBack,
  onCompleteSession,
}) => {
  const [level, setLevel] = useState<number>(1);
  const [phase, setPhase] = useState<'then' | 'now'>('then');
  const [sceneA, setSceneA] = useState<SceneItem[]>([]);
  const [sceneB, setSceneB] = useState<SceneItem[]>([]);
  const [changedIndices, setChangedIndices] = useState<number[]>([]);
  const [userSelectedIndices, setUserSelectedIndices] = useState<number[]>([]);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [attempts, setAttempts] = useState(0);
  const [result, setResult] = useState<GameSessionResult | null>(null);

  const initLevel = (lvl: number) => {
    // Total items: L1: 4, L2: 5, L3: 6, L4: 6, L5: 8, L6: 8
    const totalCount = lvl <= 2 ? 4 : lvl <= 4 ? 6 : 8;
    // Number of changes: L1: 1, L2: 2, L3: 3, L4: 4, L5: 5, L6: 5
    const changesCount = Math.min(5, Math.max(1, lvl));

    const shuffled = [...POOL_ITEMS.slice(0, 8)].sort(() => Math.random() - 0.5);
    const baseScene = shuffled.slice(0, totalCount);

    // Pick indices that will change in Scene B
    const allIndices = Array.from({ length: totalCount }, (_, i) => i).sort(() => Math.random() - 0.5);
    const indicesToChange = allIndices.slice(0, changesCount);

    // Replacement pool from alternatives
    const altPool = [...POOL_ITEMS.slice(8)].sort(() => Math.random() - 0.5);

    const modifiedScene = baseScene.map((item, idx) => {
      if (indicesToChange.includes(idx)) {
        const replacement = altPool.pop() || POOL_ITEMS[POOL_ITEMS.length - 1];
        return replacement;
      }
      return item;
    });

    setSceneA(baseScene);
    setSceneB(modifiedScene);
    setChangedIndices(indicesToChange);
    setUserSelectedIndices([]);
    setPhase('then');
    setAttempts(0);
    setResult(null);
    setStartTime(Date.now());
  };

  useEffect(() => {
    initLevel(level);
  }, [level]);

  const toggleSelectIndex = (idx: number) => {
    if (phase !== 'now' || result !== null) return;
    soundManager.playNote('D4', 0.15);

    if (userSelectedIndices.includes(idx)) {
      setUserSelectedIndices(userSelectedIndices.filter((i) => i !== idx));
    } else {
      setUserSelectedIndices([...userSelectedIndices, idx]);
    }
  };

  const handleVerifyChanges = () => {
    soundManager.playGentleFeedback();
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    let correctHits = 0;
    let falseHits = 0;

    userSelectedIndices.forEach((idx) => {
      if (changedIndices.includes(idx)) {
        correctHits++;
      } else {
        falseHits++;
      }
    });

    const expected = changedIndices.length;
    const accuracy = expected > 0 ? Math.max(0, (correctHits - falseHits * 0.5) / expected) : 1;
    const isVictory = correctHits >= Math.ceil(expected * 0.7);

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
      gameId: 'then_and_now',
      level,
      correctAnswers: correctHits,
      totalQuestions: expected,
      attempts: newAttempts,
      startTime,
      adaptiveLevel: adaptive.newLevel,
    });

    setResult(res);
  };

  const instructions: Record<Language, string> = {
    en: phase === 'then'
      ? 'Study Scene A ("THEN") carefully. Tap "Ready" to see the updated room.'
      : `Tap the ${changedIndices.length} item(s) that changed or were replaced in Scene B ("NOW").`,
    hi: phase === 'then'
      ? 'दृश्य A ("तब") को ध्यान से देखें। फिर "तैयार" दबाकर नया दृश्य देखें।'
      : `दृश्य B ("अब") में जो ${changedIndices.length} वस्तुएँ बदली हैं, उन पर स्पर्श करें।`,
    as: phase === 'then'
      ? 'প্ৰথম ছবিখন ("তেতিয়া") ভালদৰে চাওক। নতুন ছবিখন চাবলৈ "মই সাজু" টিপক।'
      : `দ্বিতীয় ছবিখনত সলনি হোৱা ${changedIndices.length} বিধ বস্তুত স্পৰ্শ কৰক।`,
    bn: phase === 'then'
      ? 'প্রথম দৃশ্যটি ("তখন") ভালো করে দেখুন। তৈরি হলে "প্রস্তুত" চাপুন।'
      : `দ্বিতীয় দৃশ্যে ("এখন") পরিবর্তিত হওয়া ${changedIndices.length}টি জিনিসে স্পর্শ করুন।`,
    lus: phase === 'then'
      ? 'Thlalak A hi uluk takin en rawh. Thlalak thar en turin "Ka inpeih" hmet rawh.'
      : `Thlalak B-a thil inthlak danglam ${changedIndices.length} te kha thlang rawh.`,
  };

  return (
    <GameShell
      gameId="then_and_now"
      title="Then & Now"
      category="attention"
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
        {phase === 'then' ? (
          <div className="w-full max-w-md space-y-4">
            <div className="p-4 rounded-3xl bg-[#0B1528] border-2 border-cyan-400/50 shadow-xl">
              <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider block text-center mb-3">
                📷 SCENE A — THEN (Original Setup)
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {sceneA.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl bg-[#060D1E] border border-slate-700/80 flex flex-col items-center justify-center gap-1 shadow-sm"
                  >
                    <span className="text-3xl">{item.icon}</span>
                    <span className="text-[11px] font-bold text-white text-center line-clamp-1">
                      {item.name[language] || item.name.en}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setPhase('now')}
              className="w-full mt-3 min-h-[52px] rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 text-white font-extrabold text-lg shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 active:scale-95 transition"
            >
              <Check className="w-5 h-5 stroke-[2.5]" />
              <span>Show Me Scene B ("NOW")</span>
            </button>
          </div>
        ) : (
          <div className="w-full max-w-md space-y-4">
            <div className="flex items-center justify-between px-2 text-xs font-bold text-slate-300">
              <span className="text-amber-300 font-extrabold">📷 SCENE B — NOW</span>
              <span className="text-cyan-400">
                Selected {userSelectedIndices.length} of {changedIndices.length} changes
              </span>
            </div>

            {/* Scene B items - user taps which ones changed */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {sceneB.map((item, idx) => {
                const isSelected = userSelectedIndices.includes(idx);
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => toggleSelectIndex(idx)}
                    className={`min-h-[85px] p-3 rounded-2xl border-2 flex flex-col items-center justify-center gap-1 transition-all active:scale-95 shadow ${
                      isSelected
                        ? 'bg-gradient-to-tr from-amber-900/90 to-yellow-900 border-amber-400 ring-2 ring-amber-300 text-white scale-105'
                        : 'bg-[#0B1528] border-slate-700 hover:border-slate-500 text-slate-300'
                    }`}
                  >
                    <span className="text-3xl">{item.icon}</span>
                    <span className="text-[11px] font-bold text-center line-clamp-1">
                      {item.name[language] || item.name.en}
                    </span>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={handleVerifyChanges}
              disabled={userSelectedIndices.length === 0}
              className="w-full mt-3 min-h-[54px] rounded-2xl bg-gradient-to-r from-blue-600 via-cyan-600 to-cyan-500 hover:from-blue-500 disabled:opacity-40 text-white font-extrabold text-lg shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 active:scale-95 transition"
            >
              <Check className="w-5 h-5 stroke-[2.5]" />
              <span>Confirm Detected Changes</span>
            </button>
          </div>
        )}
      </div>
    </GameShell>
  );
};
