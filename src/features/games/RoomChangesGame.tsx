import React, { useState, useEffect } from 'react';
import { Language, GameSession } from '../../types';
import { GameShell } from './engine/GameShell';
import { GameSessionResult } from './engine/types';
import { ScoreManager } from './engine/ScoreManager';
import { soundManager } from './engine/SoundManager';
import { adaptiveEngine } from '../../ml/adaptiveEngine';
import { Check } from 'lucide-react';

interface RoomChangesGameProps {
  language: Language;
  onBack: () => void;
  onCompleteSession?: (session: GameSession) => void;
}

interface RoomItem {
  id: string;
  name: Record<Language, string>;
  icon: string;
}

const ROOM_OBJECTS: RoomItem[] = [
  { id: 'clock', name: { en: 'Wall Clock', hi: 'दीवार घड़ी', as: 'বেৰৰ ঘড়ী', bn: 'দেওয়াল ঘড়ি', lus: 'Sana' }, icon: '🕰️' },
  { id: 'chair', name: { en: 'Rocking Chair', hi: 'आराम कुर्सी', as: 'আৰাম চকী', bn: 'আরামকেদারা', lus: 'Ṭhutthleng' }, icon: '🪑' },
  { id: 'lamp', name: { en: 'Reading Lamp', hi: 'दीपक / लैंप', as: 'পঢ়া চাকি', bn: 'টেবিল ল্যাম্প', lus: 'Khawnvar' }, icon: '🛋️' },
  { id: 'plant', name: { en: 'Fern Plant', hi: 'फूलदान', as: 'ফুলৰ টাব', bn: 'ফুলের টব', lus: 'Pangpar bawm' }, icon: '🪴' },
  { id: 'frame', name: { en: 'Photo Frame', hi: 'तस्वीर', as: 'ছবিৰ ফ্ৰেম', bn: 'ছবির ফ্রেম', lus: 'Thlalak' }, icon: '🖼️' },
  { id: 'radio', name: { en: 'Tea Radio', hi: 'रेडियो', as: 'ৰেডিঅ’', bn: 'রেডিও', lus: 'Radio' }, icon: '📻' },
  { id: 'tea', name: { en: 'Hot Tea Cup', hi: 'चाय का कप', as: 'চাহৰ কাপ', bn: 'চায়ের কাপ', lus: 'Thingpui no' }, icon: '☕' },
  { id: 'book', name: { en: 'Holy Book', hi: 'किताब', as: 'কিতাপ', bn: 'বই', lus: 'Lehkhabu' }, icon: '📖' },
  // Replacements
  { id: 'fan', name: { en: 'Hand Fan', hi: 'हाथ का पंखा', as: 'বিচনী', bn: 'হাতপাখা', lus: 'Thlifim zapna' }, icon: '🪭' },
  { id: 'cushion', name: { en: 'Soft Cushion', hi: 'तकिया', as: 'গাৰু', bn: 'বালিশ', lus: 'Lukhuk' }, icon: '🛋️' },
  { id: 'candle', name: { en: 'Burning Candle', hi: 'मोमबत्ती', as: 'মমবাতি', bn: 'মোমবাতি', lus: 'Mombati' }, icon: '🕯️' },
  { id: 'bell', name: { en: 'Temple Bell', hi: 'घंटी', as: 'ঘণ্টা', bn: 'ঘণ্টা', lus: 'Darkhing' }, icon: '🔔' },
];

export const RoomChangesGame: React.FC<RoomChangesGameProps> = ({
  language,
  onBack,
  onCompleteSession,
}) => {
  const [level, setLevel] = useState<number>(1);
  const [phase, setPhase] = useState<'observe' | 'spot'>('observe');
  const [initialRoom, setInitialRoom] = useState<RoomItem[]>([]);
  const [changedRoom, setChangedRoom] = useState<RoomItem[]>([]);
  const [changedIndices, setChangedIndices] = useState<number[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [attempts, setAttempts] = useState(0);
  const [result, setResult] = useState<GameSessionResult | null>(null);

  const initLevel = (lvl: number) => {
    // Total items: 4 to 8
    const totalItems = lvl <= 2 ? 4 : lvl <= 4 ? 6 : 8;
    const changeCount = Math.min(totalItems - 1, Math.max(1, lvl));

    const pool = [...ROOM_OBJECTS.slice(0, 8)].sort(() => Math.random() - 0.5);
    const baseItems = pool.slice(0, totalItems);

    const indices = Array.from({ length: totalItems }, (_, i) => i).sort(() => Math.random() - 0.5);
    const toChange = indices.slice(0, changeCount);

    const altPool = [...ROOM_OBJECTS.slice(8)].sort(() => Math.random() - 0.5);
    const altered = baseItems.map((item, idx) => {
      if (toChange.includes(idx)) {
        return altPool.pop() || ROOM_OBJECTS[ROOM_OBJECTS.length - 1];
      }
      return item;
    });

    setInitialRoom(baseItems);
    setChangedRoom(altered);
    setChangedIndices(toChange);
    setSelectedIndices([]);
    setPhase('observe');
    setAttempts(0);
    setResult(null);
    setStartTime(Date.now());
  };

  useEffect(() => {
    initLevel(level);
  }, [level]);

  const toggleSelect = (idx: number) => {
    if (phase !== 'spot' || result !== null) return;
    soundManager.playNote('E4', 0.15);

    if (selectedIndices.includes(idx)) {
      setSelectedIndices(selectedIndices.filter((i) => i !== idx));
    } else {
      setSelectedIndices([...selectedIndices, idx]);
    }
  };

  const handleVerify = () => {
    soundManager.playGentleFeedback();
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    let hits = 0;
    let falseHits = 0;

    selectedIndices.forEach((idx) => {
      if (changedIndices.includes(idx)) {
        hits++;
      } else {
        falseHits++;
      }
    });

    const expected = changedIndices.length;
    const accuracy = expected > 0 ? Math.max(0, (hits - falseHits * 0.5) / expected) : 1;
    const isVictory = hits >= Math.ceil(expected * 0.7);

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
      gameId: 'room_changes',
      level,
      correctAnswers: hits,
      totalQuestions: expected,
      attempts: newAttempts,
      startTime,
      adaptiveLevel: adaptive.newLevel,
    });

    setResult(res);
  };

  const instructions: Record<Language, string> = {
    en: phase === 'observe'
      ? 'Observe your cozy room setup carefully. Tap "Ready" when memorized.'
      : `Tap the ${changedIndices.length} item(s) that changed or moved in your room.`,
    hi: phase === 'observe'
      ? 'अपने कमरे की व्यवस्था को ध्यान से देखें। फिर "तैयार" दबाएँ।'
      : `कमरे में बदली हुई ${changedIndices.length} वस्तुओं को स्पर्श करें।`,
    as: phase === 'observe'
      ? 'কোঠাৰ সজ্জাটো মন দি চাওক। মনত ৰাখি "মই সাজু" টিপক।'
      : `কোঠাটোত সলনি হোৱা ${changedIndices.length} বিধ বস্তুত স্পৰ্শ কৰক।`,
    bn: phase === 'observe'
      ? 'ঘরের সাজসজ্জা ভালো করে লক্ষ্য করুন। তৈরি হলে "প্রস্তুত" চাপুন।'
      : `ঘরে পরিবর্তিত হওয়া ${changedIndices.length}টি জিনিসে স্পর্শ করুন।`,
    lus: phase === 'observe'
      ? 'Pindan chhung enkual la, vawng rawh.'
      : `Thil inthlak danglam ${changedIndices.length} te kha thlang rawh.`,
  };

  return (
    <GameShell
      gameId="room_changes"
      title="What Changed in My Room?"
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
        {phase === 'observe' ? (
          <div className="w-full max-w-md space-y-4">
            <div className="p-4 rounded-3xl bg-[#0B1528] border-2 border-cyan-400/50 shadow-xl">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block text-center mb-3">
                🏡 Original Room Setup ({initialRoom.length} items)
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {initialRoom.map((item, idx) => (
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
              onClick={() => setPhase('spot')}
              className="w-full mt-3 min-h-[52px] rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 text-white font-extrabold text-lg shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 active:scale-95 transition"
            >
              <Check className="w-5 h-5 stroke-[2.5]" />
              <span>I Have Memorized the Room!</span>
            </button>
          </div>
        ) : (
          <div className="w-full max-w-md space-y-4">
            <div className="flex items-center justify-between px-2 text-xs font-bold text-slate-300">
              <span className="text-amber-300 font-extrabold">Room Now</span>
              <span className="text-cyan-400">
                Selected: {selectedIndices.length} of {changedIndices.length} changes
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {changedRoom.map((item, idx) => {
                const isSelected = selectedIndices.includes(idx);
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => toggleSelect(idx)}
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
              onClick={handleVerify}
              disabled={selectedIndices.length === 0}
              className="w-full mt-3 min-h-[54px] rounded-2xl bg-gradient-to-r from-blue-600 via-cyan-600 to-cyan-500 hover:from-blue-500 disabled:opacity-40 text-white font-extrabold text-lg shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 active:scale-95 transition"
            >
              <Check className="w-5 h-5 stroke-[2.5]" />
              <span>Confirm Changed Items</span>
            </button>
          </div>
        )}
      </div>
    </GameShell>
  );
};
