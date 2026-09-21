import React, { useState, useEffect } from 'react';
import { Language, GameSession } from '../../types';
import { GameShell } from './engine/GameShell';
import { GameSessionResult } from './engine/types';
import { ScoreManager } from './engine/ScoreManager';
import { soundManager } from './engine/SoundManager';
import { adaptiveEngine } from '../../ml/adaptiveEngine';
import { Check } from 'lucide-react';

interface PackJourneyGameProps {
  language: Language;
  onBack: () => void;
  onCompleteSession?: (session: GameSession) => void;
}

interface PackItem {
  id: string;
  name: Record<Language, string>;
  icon: string;
}

const ALL_PACK_ITEMS: PackItem[] = [
  { id: 'item_clothes', name: { en: 'Warm Clothes', hi: 'गर्म कपड़े', as: 'উমাল কাপোৰ', bn: 'গরম জামাকাপড়', lus: 'Kawr lum' }, icon: '🧥' },
  { id: 'item_medicine', name: { en: 'Daily Medicine', hi: 'दवाइयाँ', as: 'প্ৰয়োজনীয় দৰব', bn: 'প্রয়োজনীয় ওষুধ', lus: 'Damdawi' }, icon: '💊' },
  { id: 'item_brush', name: { en: 'Toothbrush', hi: 'टूथब्रश', as: 'দাঁতঘঁহা ব্ৰাছ', bn: 'টুথব্রাশ', lus: 'Ha nawhna' }, icon: '🪥' },
  { id: 'item_water', name: { en: 'Water Bottle', hi: 'पानी की बोतल', as: 'পানীৰ বটল', bn: 'জলের বোতল', lus: 'Tui thawl' }, icon: '🍶' },
  { id: 'item_book', name: { en: 'Reading Book', hi: 'किताब', as: 'পঢ়া কিতাপ', bn: 'পড়ার বই', lus: 'Lehkhabu' }, icon: '📖' },
  { id: 'item_shoes', name: { en: 'Walking Shoes', hi: 'जूते', as: 'জোতা', bn: 'জুতো', lus: 'Pangpar pheikhawk' }, icon: '👟' },
  { id: 'item_towel', name: { en: 'Cotton Towel', hi: 'तौलिया', as: 'গামোচা', bn: 'গামছা/তোয়ালে', lus: 'Hruhna puan' }, icon: '🧺' },
  { id: 'item_umbrella', name: { en: 'Rain Umbrella', hi: 'छाता', as: 'ছাতি', bn: 'ছাতা', lus: 'Nihlih' }, icon: '☂️' },
  { id: 'item_torch', name: { en: 'Torch / Flashlight', hi: 'टॉर्च', as: 'টৰ্চলাইট', bn: 'টর্চলাইট', lus: 'Khawnvar' }, icon: '🔦' },
  { id: 'item_slippers', name: { en: 'Soft Slippers', hi: 'चप्पल', as: 'চেন্দেল', bn: 'চটি জুতো', lus: 'Chapal' }, icon: '🩴' },
  { id: 'item_soap', name: { en: 'Bathing Soap', hi: 'साबुन', as: 'গা-ধোৱা চাবোন', bn: 'সাবান', lus: 'Sahbawn' }, icon: '🧼' },
  { id: 'item_glasses', name: { en: 'Spectacles', hi: 'चश्मा', as: 'চশমা', bn: 'চশমা', lus: 'Darthlalang' }, icon: '👓' },
  // Distractors
  { id: 'dist_comb', name: { en: 'Hair Comb', hi: 'कंघी', as: 'ফণী', bn: 'চিরুনি', lus: 'Samkhuih' }, icon: '🪮' },
  { id: 'dist_clock', name: { en: 'Wall Clock', hi: 'दीवार घड़ी', as: 'ঘড়ী', bn: 'দেওয়াল ঘড়ি', lus: 'Sana' }, icon: '🕰️' },
  { id: 'dist_plant', name: { en: 'Flower Pot', hi: 'गमला', as: 'ফুলৰ টাব', bn: 'ফুলের টব', lus: 'Pangpar bawm' }, icon: '🪴' },
];

export const PackJourneyGame: React.FC<PackJourneyGameProps> = ({
  language,
  onBack,
  onCompleteSession,
}) => {
  const [level, setLevel] = useState<number>(1);
  const [phase, setPhase] = useState<'study' | 'pack'>('study');
  const [targetList, setTargetList] = useState<PackItem[]>([]);
  const [displayPool, setDisplayPool] = useState<PackItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [attempts, setAttempts] = useState(0);
  const [result, setResult] = useState<GameSessionResult | null>(null);

  const initLevel = (lvl: number) => {
    // Target item count: L1: 4, L2: 5, L3: 6, L4: 7, L5: 8, L6: 10
    const targetCount = lvl === 1 ? 4 : lvl === 2 ? 5 : lvl === 3 ? 6 : lvl === 4 ? 7 : lvl === 5 ? 8 : 10;
    const poolCount = targetCount + (lvl <= 2 ? 2 : lvl <= 4 ? 4 : 5);

    const shuffled = [...ALL_PACK_ITEMS].sort(() => Math.random() - 0.5);
    const targets = shuffled.slice(0, targetCount);
    const pool = shuffled.slice(0, poolCount).sort(() => Math.random() - 0.5);

    setTargetList(targets);
    setDisplayPool(pool);
    setSelectedIds([]);
    setPhase('study');
    setAttempts(0);
    setResult(null);
    setStartTime(Date.now());
  };

  useEffect(() => {
    initLevel(level);
  }, [level]);

  const toggleSelect = (id: string) => {
    if (phase !== 'pack' || result !== null) return;
    soundManager.playNote('G4', 0.15);

    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleFinishPacking = () => {
    soundManager.playGentleFeedback();
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    // Calculate accuracy: how many selected were in targetList
    const targetIds = targetList.map((t) => t.id);
    let correctPacks = 0;
    let falsePacks = 0;

    selectedIds.forEach((id) => {
      if (targetIds.includes(id)) {
        correctPacks++;
      } else {
        falsePacks++;
      }
    });

    const totalExpected = targetList.length;
    const accuracy = totalExpected > 0 ? Math.max(0, (correctPacks - falsePacks * 0.5) / totalExpected) : 1;
    const isVictory = correctPacks >= Math.ceil(totalExpected * 0.7);

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
      gameId: 'pack_journey',
      level,
      correctAnswers: correctPacks,
      totalQuestions: totalExpected,
      attempts: newAttempts,
      startTime,
      adaptiveLevel: adaptive.newLevel,
    });

    setResult(res);
  };

  const instructions: Record<Language, string> = {
    en: phase === 'study'
      ? `You are visiting family! Remember these ${targetList.length} items to pack.`
      : `Select the ${targetList.length} items that were on your packing list.`,
    hi: phase === 'study'
      ? `आप परिजनों से मिलने जा रहे हैं! याद रखें कि ये ${targetList.length} वस्तुएँ पैक करनी हैं।`
      : `उन ${targetList.length} वस्तुओं को चुनें जो आपकी पैकिंग सूची में थीं।`,
    as: phase === 'study'
      ? `আপুনি আত্মীয়ৰ ঘৰলৈ যাব! টোপোলাত ভৰাব লগা এই ${targetList.length} বিধ বস্তু মনত ৰাখক।`
      : `তালিকাখনত থকা ${targetList.length} বিধ বস্তু বাছি উলিয়াওক।`,
    bn: phase === 'study'
      ? `আপনি পরিবারের সাথে দেখা করতে যাচ্ছেন! সাথে নেওয়ার এই ${targetList.length}টি জিনিস মনে রাখুন।`
      : `তালিকায় থাকা সেই ${targetList.length}টি জিনিস নির্বাচন করুন।`,
    lus: phase === 'study'
      ? `Zinna atana ken tur heng thil ${targetList.length} te hi hria rawh.`
      : `I thil ken tur thlang chhuak rawh (${selectedIds.length}/${targetList.length}).`,
  };

  return (
    <GameShell
      gameId="pack_journey"
      title="Pack for the Journey"
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
            <div className="grid grid-cols-2 gap-3">
              {targetList.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl bg-[#0B1528] border-2 border-cyan-400/50 flex items-center gap-3 shadow-md"
                >
                  <span className="text-3xl">{item.icon}</span>
                  <span className="text-sm font-bold text-white text-left">
                    {item.name[language] || item.name.en}
                  </span>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setPhase('pack')}
              className="w-full mt-4 min-h-[52px] rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 text-white font-extrabold text-lg shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 active:scale-95 transition"
            >
              <Check className="w-5 h-5 stroke-[2.5]" />
              <span>I Remember the Packing List!</span>
            </button>
          </div>
        ) : (
          <div className="w-full max-w-md space-y-4">
            <div className="flex items-center justify-between px-2 text-xs font-bold text-slate-300">
              <span>Selected: {selectedIds.length} of {targetList.length} items</span>
              <span className="text-cyan-400">Tap to toggle</span>
            </div>

            {/* Grid of items to pack (min 48px touch targets) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {displayPool.map((item) => {
                const isSelected = selectedIds.includes(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleSelect(item.id)}
                    className={`min-h-[72px] p-2.5 rounded-2xl border-2 flex flex-col items-center justify-center gap-1 transition-all active:scale-95 shadow ${
                      isSelected
                        ? 'bg-gradient-to-tr from-blue-900 to-cyan-900 border-cyan-400 ring-2 ring-cyan-300 text-white scale-105'
                        : 'bg-[#0B1528] border-slate-700/80 text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    <span className="text-2xl">{item.icon}</span>
                    <span className="text-[11px] font-bold line-clamp-1 text-center">
                      {item.name[language] || item.name.en}
                    </span>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={handleFinishPacking}
              disabled={selectedIds.length === 0}
              className="w-full mt-4 min-h-[54px] rounded-2xl bg-gradient-to-r from-blue-600 via-cyan-600 to-cyan-500 hover:from-blue-500 disabled:opacity-40 text-white font-extrabold text-lg shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 active:scale-95 transition"
            >
              <Check className="w-5 h-5 stroke-[2.5]" />
              <span>Finished Packing My Bag</span>
            </button>
          </div>
        )}
      </div>
    </GameShell>
  );
};
