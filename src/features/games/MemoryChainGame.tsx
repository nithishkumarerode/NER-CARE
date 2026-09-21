import React, { useState, useEffect } from 'react';
import { Language, GameSession } from '../../types';
import { GameShell } from './engine/GameShell';
import { GameSessionResult } from './engine/types';
import { ScoreManager } from './engine/ScoreManager';
import { soundManager } from './engine/SoundManager';
import { adaptiveEngine } from '../../ml/adaptiveEngine';
import { ArrowRight, Check } from 'lucide-react';

interface MemoryChainGameProps {
  language: Language;
  onBack: () => void;
  onCompleteSession?: (session: GameSession) => void;
}

interface ChainItem {
  id: string;
  name: Record<Language, string>;
  icon: string;
}

const CHAIN_POOL: ChainItem[] = [
  { id: 'apple', name: { en: 'Red Apple', hi: 'सेब', as: 'আপেল', bn: 'আপেল', lus: 'Apple' }, icon: '🍎' },
  { id: 'milk', name: { en: 'Fresh Milk', hi: 'दूध', as: 'গাখীৰ', bn: 'দুধ', lus: 'Bawnghnute' }, icon: '🥛' },
  { id: 'newspaper', name: { en: 'Daily News', hi: 'अखबार', as: 'বাতৰিকাকত', bn: 'সংবাদপত্র', lus: 'Chanchinbu' }, icon: '📰' },
  { id: 'tea', name: { en: 'Assam Tea', hi: 'चाय', as: 'চাহ', bn: 'চা', lus: 'Thingpui' }, icon: '☕' },
  { id: 'flower', name: { en: 'Pink Lotus', hi: 'कमल फूल', as: 'পদুম ফুল', bn: 'পদ্মফুল', lus: 'Pangpar' }, icon: '🌸' },
  { id: 'bell', name: { en: 'Bronze Bell', hi: 'घंटी', as: 'ঘণ্টা', bn: 'ঘণ্টা', lus: 'Darkhing' }, icon: '🔔' },
  { id: 'banana', name: { en: 'Ripe Banana', hi: 'केला', as: 'কল', bn: 'কলা', lus: 'Balhla' }, icon: '🍌' },
  { id: 'bread', name: { en: 'Loaf of Bread', hi: 'रोटी', as: 'ৰুটী', bn: 'রুটি', lus: 'Chhang' }, icon: '🍞' },
  { id: 'spectacles', name: { en: 'Spectacles', hi: 'चश्मा', as: 'চশমা', bn: 'চশমা', lus: 'Darthlalang' }, icon: '👓' },
  { id: 'key', name: { en: 'Brass Key', hi: 'चाबी', as: 'চাবি', bn: 'চাবি', lus: 'Chabi' }, icon: '🗝️' },
];

export const MemoryChainGame: React.FC<MemoryChainGameProps> = ({
  language,
  onBack,
  onCompleteSession,
}) => {
  const [level, setLevel] = useState<number>(1);
  const [phase, setPhase] = useState<'study' | 'recreate'>('study');
  const [chain, setChain] = useState<ChainItem[]>([]);
  const [choices, setChoices] = useState<ChainItem[]>([]);
  const [userChain, setUserChain] = useState<ChainItem[]>([]);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [attempts, setAttempts] = useState(0);
  const [result, setResult] = useState<GameSessionResult | null>(null);

  const initLevel = (lvl: number) => {
    // Level 1: 2 items, Level 2: 3, Level 3: 4, Level 4: 5, Level 5: 6, Level 6: 8
    const chainLength = Math.min(8, lvl + 1);
    const shuffled = [...CHAIN_POOL].sort(() => Math.random() - 0.5);
    const selectedChain = shuffled.slice(0, chainLength);

    // Multiple choices include chain + distractors
    const distractorCount = lvl <= 2 ? 2 : 4;
    const allChoices = [...selectedChain, ...shuffled.slice(chainLength, chainLength + distractorCount)]
      .sort(() => Math.random() - 0.5);

    setChain(selectedChain);
    setChoices(allChoices);
    setUserChain([]);
    setPhase('study');
    setAttempts(0);
    setResult(null);
    setStartTime(Date.now());
  };

  useEffect(() => {
    initLevel(level);
  }, [level]);

  const handleTapChoice = (item: ChainItem) => {
    if (phase !== 'recreate' || result !== null) return;
    soundManager.playNote('F4', 0.15);

    const nextChain = [...userChain, item];
    setUserChain(nextChain);

    const currentIdx = nextChain.length - 1;
    // Check if correct
    if (nextChain[currentIdx].id !== chain[currentIdx].id) {
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
          gameId: 'memory_chain',
          level,
          correctAnswers: nextChain.length - 1,
          totalQuestions: chain.length,
          attempts: newAttempts,
          startTime,
          adaptiveLevel: adaptive.newLevel,
        });
        setResult(res);
      }, 1000);
      return;
    }

    // Victory if complete chain matched
    if (nextChain.length === chain.length) {
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
          gameId: 'memory_chain',
          level,
          correctAnswers: chain.length,
          totalQuestions: chain.length,
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
      ? `Memorize the exact chain of ${chain.length} items. Tap "Ready" to recreate it.`
      : `Recreate the chain link by link (${userChain.length} of ${chain.length} completed).`,
    hi: phase === 'study'
      ? `इन ${chain.length} वस्तुओं की श्रृंखला को याद रखें। फिर "तैयार" दबाएँ।`
      : `श्रृंखला को एक-एक करके उसी क्रम में जोड़ें (${userChain.length}/${chain.length})।`,
    as: phase === 'study'
      ? `এই ${chain.length} বিধ বস্তুৰ শিকলিটো মনত ৰাখক। সাজু হ’লে "মই সাজু" টিপক।`
      : `ক্ৰম অনুসৰি শিকলিটো আকৌ সজাওক (${userChain.length}/${chain.length})।`,
    bn: phase === 'study'
      ? `এই ${chain.length}টি জিনিসের শৃঙ্খলটি মনে রাখুন। তৈরি হলে "প্রস্তুত" চাপুন।`
      : `পরপর স্পর্শ করে শৃঙ্খলটি সম্পূর্ণ করুন (${userChain.length}/${chain.length})।`,
    lus: phase === 'study'
      ? `Thil ${chain.length} inzawm dan hi uluk takin vawng rawh.`
      : `A indawtin thil te hi hmet chhuak rawh (${userChain.length}/${chain.length}).`,
  };

  return (
    <GameShell
      gameId="memory_chain"
      title="Memory Chain"
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
            <div className="p-4 rounded-3xl bg-[#0B1528] border-2 border-cyan-400/50 shadow-xl">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block text-center mb-3">
                Memory Chain Sequence:
              </span>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {chain.map((item, idx) => (
                  <React.Fragment key={item.id}>
                    <div className="p-3 rounded-2xl bg-[#060D1E] border border-cyan-400/30 flex flex-col items-center min-w-[70px] shadow">
                      <span className="text-3xl">{item.icon}</span>
                      <span className="text-[10px] font-bold text-slate-200 mt-1 text-center line-clamp-1">
                        {item.name[language] || item.name.en}
                      </span>
                    </div>
                    {idx < chain.length - 1 && (
                      <ArrowRight className="w-4 h-4 text-cyan-400" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setPhase('recreate')}
              className="w-full mt-4 min-h-[52px] rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 text-white font-extrabold text-lg shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 active:scale-95 transition"
            >
              <Check className="w-5 h-5 stroke-[2.5]" />
              <span>I Remember the Chain!</span>
            </button>
          </div>
        ) : (
          <div className="w-full max-w-md space-y-4">
            {/* User Recreated Chain Display */}
            <div className="p-3.5 rounded-2xl bg-[#0B1528] border border-slate-700/80 min-h-[76px] flex items-center justify-center gap-2 flex-wrap">
              {chain.map((_, idx) => {
                const filled = userChain[idx];
                return (
                  <div
                    key={idx}
                    className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center text-2xl transition-all ${
                      filled
                        ? 'bg-blue-900/80 border-cyan-400 text-white shadow'
                        : 'bg-slate-900 border-dashed border-slate-700 text-slate-600'
                    }`}
                  >
                    {filled ? filled.icon : idx + 1}
                  </div>
                );
              })}
            </div>

            {/* Tap from choices (min 48px touch target) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {choices.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleTapChoice(item)}
                  className="min-h-[72px] p-2.5 rounded-2xl bg-[#0B1528] hover:bg-[#101E3A] border border-slate-700/80 hover:border-cyan-400/60 active:scale-95 transition flex flex-col items-center justify-center gap-1 shadow"
                >
                  <span className="text-2xl">{item.icon}</span>
                  <span className="text-xs font-bold text-slate-200 line-clamp-1">
                    {item.name[language] || item.name.en}
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
