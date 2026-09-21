import React, { useState, useEffect } from 'react';
import { Language, GameSession } from '../../types';
import { GameShell } from './engine/GameShell';
import { GameSessionResult } from './engine/types';
import { ScoreManager } from './engine/ScoreManager';
import { soundManager } from './engine/SoundManager';
import { adaptiveEngine } from '../../ml/adaptiveEngine';
import { ArrowRight, Check, Lock, Unlock } from 'lucide-react';

interface MemoryLockGameProps {
  language: Language;
  onBack: () => void;
  onCompleteSession?: (session: GameSession) => void;
}

interface LockSymbol {
  id: string;
  icon: string;
  name: Record<Language, string>;
}

const LOCK_SYMBOLS: LockSymbol[] = [
  { id: 'flower', icon: '🌸', name: { en: 'Lotus', hi: 'कमल', as: 'পদুম', bn: 'পদ্ম', lus: 'Pangpar' } },
  { id: 'bird', icon: '🐦', name: { en: 'Bird', hi: 'पक्षी', as: 'চৰাই', bn: 'পাখি', lus: 'Sava' } },
  { id: 'bell', icon: '🔔', name: { en: 'Bell', hi: 'घंटी', as: 'ঘণ্টা', bn: 'ঘণ্টা', lus: 'Darkhing' } },
  { id: 'house', icon: '🏠', name: { en: 'House', hi: 'घर', as: 'ঘৰ', bn: 'বাড়ি', lus: 'In' } },
  { id: 'star', icon: '⭐', name: { en: 'Star', hi: 'तारा', as: 'তৰা', bn: 'তারা', lus: 'Arsi' } },
  { id: 'tea', icon: '🍵', name: { en: 'Tea', hi: 'चाय', as: 'চাহ', bn: 'চা', lus: 'Thingpui' } },
  { id: 'sun', icon: '☀️', name: { en: 'Sun', hi: 'सूर्य', as: 'সূৰ্য্য', bn: 'সূর্য', lus: 'Ni' } },
  { id: 'leaf', icon: '🌿', name: { en: 'Leaf', hi: 'पत्ता', as: 'পাত', bn: 'পাতা', lus: 'Hnah' } },
];

export const MemoryLockGame: React.FC<MemoryLockGameProps> = ({
  language,
  onBack,
  onCompleteSession,
}) => {
  const [level, setLevel] = useState<number>(1);
  const [phase, setPhase] = useState<'study' | 'dial'>('study');
  const [lockCombination, setLockCombination] = useState<LockSymbol[]>([]);
  const [dialedSymbols, setDialedSymbols] = useState<LockSymbol[]>([]);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [attempts, setAttempts] = useState(0);
  const [result, setResult] = useState<GameSessionResult | null>(null);

  const initLevel = (lvl: number) => {
    // Level 1: 3 symbols, Level 2: 4, Level 3: 5, Level 4: 6, Level 5: 7, Level 6: 8
    const len = Math.min(8, lvl + 2);
    const pool = [...LOCK_SYMBOLS].sort(() => Math.random() - 0.5);
    const combo = pool.slice(0, len);

    setLockCombination(combo);
    setDialedSymbols([]);
    setPhase('study');
    setAttempts(0);
    setResult(null);
    setStartTime(Date.now());
  };

  useEffect(() => {
    initLevel(level);
  }, [level]);

  const handleDialSymbol = (symbol: LockSymbol) => {
    if (phase !== 'dial' || result !== null) return;
    soundManager.playNote('C5', 0.15);

    const nextDialed = [...dialedSymbols, symbol];
    setDialedSymbols(nextDialed);

    const currentIdx = nextDialed.length - 1;
    if (nextDialed[currentIdx].id !== lockCombination[currentIdx].id) {
      // Wrong symbol in lock
      soundManager.playGentleFeedback();
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);

      setTimeout(() => {
        const adaptive = adaptiveEngine.evaluate({
          accuracy: 0.5,
          reactionTime: Math.max(1000, Date.now() - startTime),
          errorRate: 0.5,
          completionRate: 0.7,
          currentLevel: level,
        });

        const res = ScoreManager.calculateResult({
          gameId: 'memory_lock',
          level,
          correctAnswers: nextDialed.length - 1,
          totalQuestions: lockCombination.length,
          attempts: newAttempts,
          startTime,
          adaptiveLevel: adaptive.newLevel,
        });
        setResult(res);
      }, 1000);
      return;
    }

    // Unlocked successfully!
    if (nextDialed.length === lockCombination.length) {
      soundManager.playSuccessChime();
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);

      setTimeout(() => {
        const adaptive = adaptiveEngine.evaluate({
          accuracy: 1.0,
          reactionTime: Math.max(1000, Date.now() - startTime),
          errorRate: 0,
          completionRate: 1.0,
          currentLevel: level,
        });

        const res = ScoreManager.calculateResult({
          gameId: 'memory_lock',
          level,
          correctAnswers: lockCombination.length,
          totalQuestions: lockCombination.length,
          attempts: newAttempts,
          startTime,
          adaptiveLevel: adaptive.newLevel,
        });
        setResult(res);
      }, 1000);
    }
  };

  const instructions: Record<Language, string> = {
    en: phase === 'study'
      ? `Remember the secret lock sequence of ${lockCombination.length} symbols. Tap "Ready" to unlock.`
      : `Enter the combination symbols in order (${dialedSymbols.length} of ${lockCombination.length}).`,
    hi: phase === 'study'
      ? `इन ${lockCombination.length} प्रतीकों के ताले के क्रम को याद रखें।`
      : `उसी क्रम में प्रतीकों को दबाकर ताला खोलें (${dialedSymbols.length}/${lockCombination.length})।`,
    as: phase === 'study'
      ? `এই ${lockCombination.length}টা প্ৰতীকৰ ক্ৰম মনত ৰাখক। সাজু হ’লে "মই সাজু" টিপক।`
      : `প্ৰতীকবোৰ ক্ৰম অনুসৰি টিপি তলাটো খোলক (${dialedSymbols.length}/${lockCombination.length})।`,
    bn: phase === 'study'
      ? `এই ${lockCombination.length}টি চিহ্নের সঠিক ক্রমটি মনে রাখুন। তৈরি হলে "প্রস্তুত" চাপুন।`
      : `ক্রম অনুসারে চিহ্নগুলিতে চাপ দিয়ে তালাটি খুলুন (${dialedSymbols.length}/${lockCombination.length})।`,
    lus: phase === 'study'
      ? `Tala hawnna entirna lem ${lockCombination.length} te hi uluk takin vawng rawh.`
      : `A indawtin tala hawnna lem te hi hmet rawh (${dialedSymbols.length}/${lockCombination.length}).`,
  };

  return (
    <GameShell
      gameId="memory_lock"
      title="Memory Lock"
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
        {phase === 'study' ? (
          <div className="w-full max-w-md space-y-4">
            <div className="p-5 rounded-3xl bg-[#0B1528] border-2 border-cyan-400/60 shadow-2xl text-center">
              <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-blue-900/40 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
                <Lock className="w-7 h-7" />
              </div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-3">
                Chest Combination Code:
              </span>

              <div className="flex flex-wrap items-center justify-center gap-2">
                {lockCombination.map((sym, idx) => (
                  <React.Fragment key={idx}>
                    <div className="w-14 h-14 rounded-2xl bg-[#060D1E] border-2 border-cyan-400/40 flex flex-col items-center justify-center text-2xl shadow">
                      <span>{sym.icon}</span>
                    </div>
                    {idx < lockCombination.length - 1 && (
                      <ArrowRight className="w-4 h-4 text-cyan-400" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setPhase('dial')}
              className="w-full mt-4 min-h-[52px] rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 text-white font-extrabold text-lg shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 active:scale-95 transition"
            >
              <Unlock className="w-5 h-5" />
              <span>Ready to Open the Lock!</span>
            </button>
          </div>
        ) : (
          <div className="w-full max-w-md space-y-4">
            {/* Lock Slots Display */}
            <div className="p-4 rounded-3xl bg-[#0B1528] border border-slate-700 flex items-center justify-center gap-2.5 shadow-lg">
              {lockCombination.map((_, idx) => {
                const entered = dialedSymbols[idx];
                return (
                  <div
                    key={idx}
                    className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center text-2xl transition-all ${
                      entered
                        ? 'bg-blue-900 border-cyan-400 text-white scale-105'
                        : 'bg-slate-900 border-dashed border-slate-700 text-slate-600'
                    }`}
                  >
                    {entered ? entered.icon : '🔒'}
                  </div>
                );
              })}
            </div>

            {/* Dialpad Symbol Buttons (min 56px touch target) */}
            <div className="grid grid-cols-4 gap-2.5">
              {LOCK_SYMBOLS.map((sym) => (
                <button
                  key={sym.id}
                  type="button"
                  onClick={() => handleDialSymbol(sym)}
                  className="min-h-[64px] p-2 rounded-2xl bg-[#0B1528] hover:bg-[#101E3A] border border-slate-700/80 hover:border-cyan-400 active:scale-90 transition flex flex-col items-center justify-center gap-1 shadow"
                >
                  <span className="text-3xl">{sym.icon}</span>
                  <span className="text-[10px] font-bold text-slate-300 line-clamp-1">
                    {sym.name[language] || sym.name.en}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </GameShell>
  );
};
