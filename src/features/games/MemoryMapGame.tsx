import React, { useState, useEffect } from 'react';
import { Language, GameSession } from '../../types';
import { GameShell } from './engine/GameShell';
import { GameSessionResult } from './engine/types';
import { ScoreManager } from './engine/ScoreManager';
import { soundManager } from './engine/SoundManager';
import { adaptiveEngine } from '../../ml/adaptiveEngine';
import { Check, Compass } from 'lucide-react';

interface MemoryMapGameProps {
  language: Language;
  onBack: () => void;
  onCompleteSession?: (session: GameSession) => void;
}

interface MapLocation {
  id: string;
  name: Record<Language, string>;
  icon: string;
  gridRow: number; // 0, 1, 2 (North, Center, South)
  gridCol: number; // 0, 1, 2 (West, Center, East)
}

const POOL_LOCATIONS = [
  { id: 'school', name: { en: 'Primary School', hi: 'प्राथमिक विद्यालय', as: 'প্ৰাথমিক বিদ্যালয়', bn: 'প্রাথমিক বিদ্যালয়', lus: 'Sikul' }, icon: '🏫' },
  { id: 'hospital', name: { en: 'District Hospital', hi: 'अस्पताल', as: 'চিকিৎসালয়', bn: 'হাসপাতাল', lus: 'Damdawi in' }, icon: '🏥' },
  { id: 'market', name: { en: 'Fish & Veg Bazaar', hi: 'बाज़ार', as: 'বজাৰ', bn: 'বাজার', lus: 'Bazar' }, icon: '🐟' },
  { id: 'temple', name: { en: 'Temple Shrine', hi: 'मंदिर', as: 'মন্দিৰ', bn: 'মন্দির', lus: 'Biakin' }, icon: '🛕' },
  { id: 'bus_stand', name: { en: 'Bus Stand', hi: 'बस स्टैंड', as: 'বাছ আস্থান', bn: 'বাসস্ট্যান্ড', lus: 'Bus dinna' }, icon: '🚌' },
  { id: 'post_office', name: { en: 'Post Office', hi: 'डाकघर', as: 'ডাকঘৰ', bn: 'ডাকঘর', lus: 'Post Office' }, icon: '📮' },
  { id: 'ferry', name: { en: 'River Ferry Ghat', hi: 'नदी घाट', as: 'নৈ ঘাট', bn: 'নদী ঘাট', lus: 'Lui lawng dinna' }, icon: '⛵' },
  { id: 'park', name: { en: 'Green Park', hi: 'उद्यान / पार्क', as: 'উদ্যান', bn: 'পার্ক', lus: 'Park' }, icon: '🌳' },
];

export const MemoryMapGame: React.FC<MemoryMapGameProps> = ({
  language,
  onBack,
  onCompleteSession,
}) => {
  const [level, setLevel] = useState<number>(1);
  const [phase, setPhase] = useState<'study' | 'quiz'>('study');
  const [placedLocs, setPlacedLocs] = useState<MapLocation[]>([]);
  const [targetLoc, setTargetLoc] = useState<MapLocation | null>(null);
  const [referenceLoc, setReferenceLoc] = useState<MapLocation | null>(null);
  const [directionWord, setDirectionWord] = useState<string>('North');
  const [options, setOptions] = useState<MapLocation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [attempts, setAttempts] = useState(0);
  const [result, setResult] = useState<GameSessionResult | null>(null);

  const initLevel = (lvl: number) => {
    // 3 to 7 locations placed on a 3x3 grid (9 cells)
    const count = Math.min(8, lvl + 2);
    const chosen = [...POOL_LOCATIONS].sort(() => Math.random() - 0.5).slice(0, count);

    // Pick unique cells (row, col)
    const cells: [number, number][] = [];
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        cells.push([r, c]);
      }
    }
    cells.sort(() => Math.random() - 0.5);

    const assigned: MapLocation[] = chosen.map((item, idx) => ({
      ...item,
      gridRow: cells[idx][0],
      gridCol: cells[idx][1],
    }));

    // Find a pair with clear cardinal relationship (North/South or East/West)
    let ref = assigned[0];
    let tgt = assigned[1];
    let dir = 'East';

    for (let i = 0; i < assigned.length; i++) {
      for (let j = 0; j < assigned.length; j++) {
        if (i === j) continue;
        if (assigned[i].gridRow < assigned[j].gridRow && assigned[i].gridCol === assigned[j].gridCol) {
          ref = assigned[j];
          tgt = assigned[i];
          dir = 'North';
          break;
        } else if (assigned[i].gridRow > assigned[j].gridRow && assigned[i].gridCol === assigned[j].gridCol) {
          ref = assigned[j];
          tgt = assigned[i];
          dir = 'South';
          break;
        } else if (assigned[i].gridCol > assigned[j].gridCol && assigned[i].gridRow === assigned[j].gridRow) {
          ref = assigned[j];
          tgt = assigned[i];
          dir = 'East';
          break;
        }
      }
      if (dir === 'North' || dir === 'South') break;
    }

    setPlacedLocs(assigned);
    setReferenceLoc(ref);
    setTargetLoc(tgt);
    setDirectionWord(dir);

    // Options: target + 2 distractors
    const otherChoices = assigned.filter((l) => l.id !== tgt.id).slice(0, 2);
    setOptions([tgt, ...otherChoices].sort(() => Math.random() - 0.5));

    setPhase('study');
    setSelectedId(null);
    setAttempts(0);
    setResult(null);
    setStartTime(Date.now());
  };

  useEffect(() => {
    initLevel(level);
  }, [level]);

  const handleSelectOption = (locId: string) => {
    if (selectedId !== null || !targetLoc) return;
    setSelectedId(locId);

    const isCorrect = locId === targetLoc.id;
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    if (isCorrect) {
      soundManager.playSuccessChime();
    } else {
      soundManager.playGentleFeedback();
    }

    setTimeout(() => {
      const adaptive = adaptiveEngine.evaluate({
        accuracy: isCorrect ? 1.0 : 0.4,
        reactionTime: Math.max(1000, Date.now() - startTime),
        errorRate: isCorrect ? 0 : 0.6,
        completionRate: 1.0,
        currentLevel: level,
      });

      const res = ScoreManager.calculateResult({
        gameId: 'memory_map',
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

  const directionTranslations: Record<string, Record<Language, string>> = {
    North: { en: 'North (⬆️)', hi: 'उत्तर (⬆️)', as: 'উত্তৰ দিশে (⬆️)', bn: 'উত্তর দিকে (⬆️)', lus: 'Hmar lam (⬆️)' },
    South: { en: 'South (⬇️)', hi: 'दक्षिण (⬇️)', as: 'দক্ষিণ দিশে (⬇️)', bn: 'দক্ষিণ দিকে (⬇️)', lus: 'Chhim lam (⬇️)' },
    East: { en: 'East (➡️)', hi: 'पूर्व (➡️)', as: 'পূব দিশে (➡️)', bn: 'পূর্ব দিকে (➡️)', lus: 'Khawchhak lam (➡️)' },
    West: { en: 'West (⬅️)', hi: 'पश्चिम (⬅️)', as: 'পশ্চিম দিশে (⬅️)', bn: 'পশ্চিম দিকে (⬅️)', lus: 'Khawthlang lam (⬅️)' },
  };

  const instructions: Record<Language, string> = {
    en: phase === 'study'
      ? `Study this 3x3 neighborhood map carefully. Notice North ⬆️ at the top.`
      : `What location was ${directionTranslations[directionWord]?.en} of the ${referenceLoc?.name[language] || referenceLoc?.name.en}?`,
    hi: phase === 'study'
      ? `इस 3x3 मोहल्ले के नक्शे को ध्यान से देखें। ऊपर उत्तर ⬆️ दिशा है।`
      : `${referenceLoc?.name[language] || referenceLoc?.name.hi} के ${directionTranslations[directionWord]?.hi} क्या था?`,
    as: phase === 'study'
      ? `চুবুৰিৰ এই মানচিত্ৰখন ভালদৰে চাওক। ওপৰৰ ফাল উত্তৰ ⬆️ দিশ।`
      : `${referenceLoc?.name[language] || referenceLoc?.name.as}ৰ ${directionTranslations[directionWord]?.as} কি আছিল?`,
    bn: phase === 'study'
      ? `পাড়ার এই ৩x৩ মানচিত্রটি ভালো করে দেখুন। উপরের দিকে উত্তর ⬆️।`
      : `${referenceLoc?.name[language] || referenceLoc?.name.bn}-এর ${directionTranslations[directionWord]?.bn} কী ছিল?`,
    lus: phase === 'study'
      ? `Hmun lem 3x3 hi uluk takin en rawh. Chunglam chu Hmar lam ⬆️ a ni.`
      : `${referenceLoc?.name[language] || referenceLoc?.name.lus} aṭanga ${directionTranslations[directionWord]?.lus} a awm kha engnge?`,
  };

  return (
    <GameShell
      gameId="memory_map"
      title="Memory Map"
      category="spatial"
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
          <div className="w-full max-w-sm space-y-3">
            {/* Compass Rose Indicator */}
            <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-cyan-300">
              <Compass className="w-4 h-4 text-cyan-400" />
              <span>North ⬆️ • South ⬇️ • East ➡️ • West ⬅️</span>
            </div>

            {/* 3x3 Neighborhood Map */}
            <div className="grid grid-cols-3 gap-2 aspect-square bg-[#0B1528] p-2.5 rounded-3xl border-2 border-cyan-400/50 shadow-2xl">
              {Array.from({ length: 9 }).map((_, idx) => {
                const r = Math.floor(idx / 3);
                const c = idx % 3;
                const item = placedLocs.find((l) => l.gridRow === r && l.gridCol === c);

                return (
                  <div
                    key={idx}
                    className={`rounded-2xl border-2 p-1.5 flex flex-col items-center justify-center gap-1 text-center transition-all ${
                      item
                        ? 'bg-gradient-to-tr from-blue-950 to-cyan-950 border-cyan-400/40 shadow'
                        : 'bg-[#060D1E] border-slate-800'
                    }`}
                  >
                    {item ? (
                      <>
                        <span className="text-3xl">{item.icon}</span>
                        <span className="text-[10px] font-bold text-white line-clamp-1 leading-tight">
                          {item.name[language] || item.name.en}
                        </span>
                      </>
                    ) : (
                      <span className="text-slate-700 text-xs">•</span>
                    )}
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setPhase('quiz')}
              className="w-full mt-3 min-h-[52px] rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 text-white font-extrabold text-lg shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 active:scale-95 transition"
            >
              <Check className="w-5 h-5 stroke-[2.5]" />
              <span>I Remember the Map Layout!</span>
            </button>
          </div>
        ) : (
          <div className="w-full max-w-sm space-y-4">
            {referenceLoc && (
              <div className="p-4 rounded-3xl bg-[#0B1528] border-2 border-cyan-400/70 text-center shadow-xl">
                <span className="text-4xl block mb-1">{referenceLoc.icon}</span>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Directional Recall Question:
                </span>
                <h3 className="text-lg font-black text-cyan-300 mt-1">
                  What was {directionTranslations[directionWord]?.[language] || directionWord} of{' '}
                  <span className="text-white">{referenceLoc.name[language] || referenceLoc.name.en}</span>?
                </h3>
              </div>
            )}

            <div className="space-y-2.5">
              {options.map((opt) => {
                const isSelected = selectedId === opt.id;
                const isCorrect = targetLoc?.id === opt.id;

                let btnStyle = 'bg-[#0B1528] border-slate-700 text-white hover:border-cyan-400';
                if (selectedId !== null) {
                  if (isSelected) {
                    btnStyle = isCorrect
                      ? 'bg-emerald-900 border-emerald-400 text-emerald-200 ring-2 ring-emerald-300'
                      : 'bg-rose-900 border-rose-400 text-rose-200 ring-2 ring-rose-300';
                  } else if (isCorrect) {
                    btnStyle = 'bg-emerald-900/50 border-emerald-500 text-emerald-200';
                  }
                }

                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleSelectOption(opt.id)}
                    disabled={selectedId !== null}
                    className={`w-full min-h-[58px] p-3 rounded-2xl border-2 font-bold text-base transition-all flex items-center gap-3 active:scale-95 shadow ${btnStyle}`}
                  >
                    <span className="text-3xl">{opt.icon}</span>
                    <span className="text-left flex-1">{opt.name[language] || opt.name.en}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </GameShell>
  );
};
