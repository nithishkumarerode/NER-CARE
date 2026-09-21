import React, { useState, useEffect } from 'react';
import { Language, GameSession } from '../../types';
import { GameShell } from './engine/GameShell';
import { GameSessionResult } from './engine/types';
import { ScoreManager } from './engine/ScoreManager';
import { soundManager } from './engine/SoundManager';
import { adaptiveEngine } from '../../ml/adaptiveEngine';
import { Check, ArrowRight } from 'lucide-react';

interface BusRouteGameProps {
  language: Language;
  onBack: () => void;
  onCompleteSession?: (session: GameSession) => void;
}

interface BusStop {
  id: string;
  name: Record<Language, string>;
  icon: string;
}

const ALL_BUS_STOPS: BusStop[] = [
  { id: 'stop_home', name: { en: 'Home Village', hi: 'गाँव का घर', as: 'আপোন গাঁও', bn: 'আপন গ্রাম', lus: 'In Khua' }, icon: '🏡' },
  { id: 'stop_tea', name: { en: 'Tea Garden Crossing', hi: 'चाय बागान मोड़', as: 'চাহ বাগিচাৰ আলিবাট', bn: 'চা বাগান মোড়', lus: 'Thingpui huan kawn' }, icon: '☕' },
  { id: 'stop_market', name: { en: 'Weekly Bazaar', hi: 'साप्ताहिक हाट', as: 'সাপ্তাহিক বজাৰ', bn: 'সাপ্তাহিক হাট', lus: 'Kut Bazar' }, icon: '🛍️' },
  { id: 'stop_hospital', name: { en: 'District Hospital', hi: 'ज़िला अस्पताल', as: 'জিলা চিকিৎসালয়', bn: 'জেলা হাসপাতাল', lus: 'Damdawi in' }, icon: '🏥' },
  { id: 'stop_station', name: { en: 'Railway Junction', hi: 'रेलवे जंक्शन', as: 'ৰে’ল ষ্টেচন', bn: 'রেলওয়ে জংশন', lus: 'Rel dinna' }, icon: '🚂' },
  { id: 'stop_ghat', name: { en: 'River Ghat / Ferry', hi: 'नदी घाट', as: 'নৈৰ ঘাট', bn: 'নদীর ঘাট', lus: 'Lui kam' }, icon: '⛵' },
  { id: 'stop_school', name: { en: 'Primary School', hi: 'प्राथमिक विद्यालय', as: 'প্ৰাথমিক বিদ্যালয়', bn: 'প্রাথমিক বিদ্যালয়', lus: 'Zirlai Sikul' }, icon: '🏫' },
  { id: 'stop_town', name: { en: 'City Center Clocktower', hi: 'शहर का घंटाघर', as: 'নগৰৰ ঘড়ীঘৰ', bn: 'শহরের ক্লকটাওয়ার', lus: 'Khawpui Laili' }, icon: '🏙️' },
];

export const BusRouteGame: React.FC<BusRouteGameProps> = ({
  language,
  onBack,
  onCompleteSession,
}) => {
  const [level, setLevel] = useState<number>(1);
  const [phase, setPhase] = useState<'study' | 'quiz'>('study');
  const [currentRoute, setCurrentRoute] = useState<BusStop[]>([]);
  const [targetStop, setTargetStop] = useState<BusStop | null>(null);
  const [precedingStop, setPrecedingStop] = useState<BusStop | null>(null);
  const [options, setOptions] = useState<BusStop[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [attempts, setAttempts] = useState(0);
  const [result, setResult] = useState<GameSessionResult | null>(null);

  const initLevel = (lvl: number) => {
    // Level 1: 3 stops, Level 2: 4, Level 3: 5, Level 4: 6, Level 5: 7, Level 6: 8
    const stopCount = Math.min(8, lvl + 2);
    const route = ALL_BUS_STOPS.slice(0, stopCount);
    setCurrentRoute(route);

    // Pick target: any stop from index 1 to end
    const targetIdx = 1 + Math.floor(Math.random() * (route.length - 1));
    const target = route[targetIdx];
    const preceding = route[targetIdx - 1];
    setTargetStop(target);
    setPrecedingStop(preceding);

    // Multiple choices
    const choices = [...ALL_BUS_STOPS]
      .filter((s) => s.id !== preceding.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    if (!choices.some((c) => c.id === target.id)) {
      choices[0] = target;
    }
    setOptions(choices.sort(() => Math.random() - 0.5));

    setPhase('study');
    setSelectedId(null);
    setAttempts(0);
    setResult(null);
    setStartTime(Date.now());
  };

  useEffect(() => {
    initLevel(level);
  }, [level]);

  const handleSelectAnswer = (stopId: string) => {
    if (selectedId !== null || !targetStop) return;
    setSelectedId(stopId);

    const isCorrect = stopId === targetStop.id;
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
        gameId: 'bus_route',
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
    en: phase === 'study'
      ? `Remember the sequence of these ${currentRoute.length} bus stops along the green road.`
      : `What stop came immediately after ${precedingStop?.name[language] || precedingStop?.name.en}?`,
    hi: phase === 'study'
      ? `सड़क के इन ${currentRoute.length} बस स्टॉप के क्रम को याद रखें।`
      : `${precedingStop?.name[language] || precedingStop?.name.hi} के तुरंत बाद कौन सा स्टॉप आया था?`,
    as: phase === 'study'
      ? `বাছ যাত্ৰাৰ এই ${currentRoute.length}টা ষ্টপৰ ক্ৰম মনত ৰাখক।`
      : `${precedingStop?.name[language] || precedingStop?.name.as}ৰ ঠিক পিছত কোনটো ষ্টপ আহিছিল?`,
    bn: phase === 'study'
      ? `বাস যাত্রার এই ${currentRoute.length}টি স্টপের ক্রম ভালো করে মনে রাখুন।`
      : `${precedingStop?.name[language] || precedingStop?.name.bn}-এর ঠিক পরেই কোন স্টপটি এসেছিল?`,
    lus: phase === 'study'
      ? `Bus dinna ${currentRoute.length} te hi an indawt dan hria rawh.`
      : `${precedingStop?.name[language] || precedingStop?.name.lus} hnuai chiah a thlen hmun chu engnge?`,
  };

  return (
    <GameShell
      gameId="bus_route"
      title="Bus Route Memory"
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
          <div className="w-full max-w-md space-y-4">
            <div className="space-y-2">
              {currentRoute.map((stop, idx) => (
                <div
                  key={stop.id}
                  className="p-3 rounded-2xl bg-[#0B1528] border border-slate-700/80 flex items-center gap-3 shadow-md"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-900/60 border border-cyan-400/40 text-cyan-300 font-black text-sm flex items-center justify-center">
                    {idx + 1}
                  </div>
                  <span className="text-2xl">{stop.icon}</span>
                  <span className="text-sm sm:text-base font-bold text-white text-left flex-1">
                    {stop.name[language] || stop.name.en}
                  </span>
                  {idx < currentRoute.length - 1 && (
                    <ArrowRight className="w-4 h-4 text-slate-500" />
                  )}
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setPhase('quiz')}
              className="w-full mt-4 min-h-[52px] rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 text-white font-extrabold text-lg shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 active:scale-95 transition"
            >
              <Check className="w-5 h-5 stroke-[2.5]" />
              <span>I Remember the Bus Route!</span>
            </button>
          </div>
        ) : (
          <div className="w-full max-w-md space-y-4">
            {precedingStop && (
              <div className="p-4 rounded-3xl bg-[#0B1528] border-2 border-cyan-400/70 text-center shadow-xl">
                <span className="text-4xl block mb-1">🚌 ➡️ ❓</span>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">After this stop:</span>
                <h3 className="text-xl font-black text-cyan-300 mt-1">
                  {precedingStop.icon} {precedingStop.name[language] || precedingStop.name.en}
                </h3>
              </div>
            )}

            <div className="grid grid-cols-1 gap-2.5">
              {options.map((stop) => {
                const isSelected = selectedId === stop.id;
                const isCorrect = targetStop?.id === stop.id;

                let btnStyle = 'bg-[#0B1528] border-slate-700/80 text-white hover:border-cyan-400/60 hover:bg-[#101D38]';
                if (selectedId !== null) {
                  if (isSelected) {
                    btnStyle = isCorrect
                      ? 'bg-emerald-900/80 border-emerald-400 text-emerald-200 ring-2 ring-emerald-300'
                      : 'bg-rose-900/80 border-rose-400 text-rose-200 ring-2 ring-rose-300';
                  } else if (isCorrect) {
                    btnStyle = 'bg-emerald-900/50 border-emerald-500 text-emerald-200';
                  }
                }

                return (
                  <button
                    key={stop.id}
                    type="button"
                    onClick={() => handleSelectAnswer(stop.id)}
                    disabled={selectedId !== null}
                    className={`min-h-[58px] p-3 rounded-2xl border-2 font-bold text-base transition-all flex items-center gap-3 active:scale-95 shadow-md ${btnStyle}`}
                  >
                    <span className="text-2xl">{stop.icon}</span>
                    <span className="flex-1 text-left">{stop.name[language] || stop.name.en}</span>
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
