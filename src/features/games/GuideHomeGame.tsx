import React, { useState, useEffect } from 'react';
import { Language, GameSession } from '../../types';
import { GameShell } from './engine/GameShell';
import { GameSessionResult } from './engine/types';
import { ScoreManager } from './engine/ScoreManager';
import { soundManager } from './engine/SoundManager';
import { adaptiveEngine } from '../../ml/adaptiveEngine';
import { Check, Compass, ArrowRight } from 'lucide-react';

interface GuideHomeGameProps {
  language: Language;
  onBack: () => void;
  onCompleteSession?: (session: GameSession) => void;
}

interface Landmark {
  id: string;
  name: Record<Language, string>;
  icon: string;
}

const LANDMARKS_POOL: Landmark[] = [
  { id: 'temple', name: { en: 'White Shiva Temple', hi: 'शिव मंदिर', as: 'শিৱ মন্দিৰ', bn: 'শিব মন্দির', lus: 'Biakin' }, icon: '🛕' },
  { id: 'tea_stall', name: { en: 'Corner Tea Stall', hi: 'चाय की दुकान', as: 'চাহৰ দোকান', bn: 'চায়ের দোকান', lus: 'Thingpui dawr' }, icon: '☕' },
  { id: 'banyan', name: { en: 'Grand Banyan Tree', hi: 'विशाल बरगद', as: 'ডাঙৰ বট গছ', bn: 'বিশাল বটগাছ', lus: 'Thingpui lian' }, icon: '🌳' },
  { id: 'pond', name: { en: 'Village Lily Pond', hi: 'कमल का तालाब', as: 'পুখুৰী', bn: 'পুকুর', lus: 'Dil' }, icon: '🌸' },
  { id: 'wooden_bridge', name: { en: 'Bamboo Bridge', hi: 'बांस का पुल', as: 'বাঁহৰ সাঁকো', bn: 'বাঁশের সাঁকো', lus: 'Lei' }, icon: '🌉' },
  { id: 'post_office', name: { en: 'Village Post Office', hi: 'डाकघर', as: 'ডাকঘৰ', bn: 'ডাকঘর', lus: 'Post Office' }, icon: '📮' },
  { id: 'paddy_field', name: { en: 'Golden Paddy Field', hi: 'धान का खेत', as: 'সোণালী ধাননি পথাৰ', bn: 'ধানক্ষেত', lus: 'Buh hmun' }, icon: '🌾' },
  { id: 'home', name: { en: 'Home Sweet Home', hi: 'प्यारा घर', as: 'আপোন ঘৰখনি', bn: 'নিজের বাড়ি', lus: 'Kan In' }, icon: '🏡' },
];

export const GuideHomeGame: React.FC<GuideHomeGameProps> = ({
  language,
  onBack,
  onCompleteSession,
}) => {
  const [level, setLevel] = useState<number>(1);
  const [phase, setPhase] = useState<'study' | 'navigate'>('study');
  const [route, setRoute] = useState<Landmark[]>([]);
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);
  const [choices, setChoices] = useState<Landmark[]>([]);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [attempts, setAttempts] = useState(0);
  const [result, setResult] = useState<GameSessionResult | null>(null);

  const initLevel = (lvl: number) => {
    // Length: L1: 3, L2: 4, L3: 5, L4: 6, L5: 7, L6: 8
    const len = Math.min(8, lvl + 2);
    // Home is always the destination
    const intermediate = LANDMARKS_POOL.filter((l) => l.id !== 'home').sort(() => Math.random() - 0.5).slice(0, len - 1);
    const fullRoute = [...intermediate, LANDMARKS_POOL.find((l) => l.id === 'home')!];

    setRoute(fullRoute);
    setCurrentStepIdx(0);
    setPhase('study');
    setAttempts(0);
    setResult(null);
    setStartTime(Date.now());
  };

  useEffect(() => {
    initLevel(level);
  }, [level]);

  // When moving to navigation or changing step, generate choices for the next step
  const setupStepChoices = (nextIdx: number) => {
    const correctNext = route[nextIdx];
    const distractorCandidates = LANDMARKS_POOL.filter((l) => l.id !== correctNext.id).sort(() => Math.random() - 0.5);
    const pool = [correctNext, distractorCandidates[0], distractorCandidates[1]].sort(() => Math.random() - 0.5);
    setChoices(pool);
  };

  const handleStartNavigation = () => {
    setPhase('navigate');
    setCurrentStepIdx(0);
    setupStepChoices(1);
  };

  const handlePickNext = (picked: Landmark) => {
    if (result !== null) return;
    const targetIdx = currentStepIdx + 1;
    const isCorrect = picked.id === route[targetIdx].id;
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    if (isCorrect) {
      soundManager.playNote('B4', 0.15);
      const nextStep = targetIdx;
      setCurrentStepIdx(nextStep);

      // Check if reached destination!
      if (nextStep >= route.length - 1) {
        soundManager.playSuccessChime();

        setTimeout(() => {
          const adaptive = adaptiveEngine.evaluate({
            accuracy: 1.0,
            reactionTime: Math.max(1000, Date.now() - startTime),
            errorRate: 0,
            completionRate: 1.0,
            currentLevel: level,
          });

          const res = ScoreManager.calculateResult({
            gameId: 'guide_home',
            level,
            correctAnswers: route.length - 1,
            totalQuestions: route.length - 1,
            attempts: newAttempts,
            startTime,
            adaptiveLevel: adaptive.newLevel,
          });
          setResult(res);
        }, 800);
      } else {
        setupStepChoices(nextStep + 1);
      }
    } else {
      // Wrong turn
      soundManager.playGentleFeedback();

      setTimeout(() => {
        const adaptive = adaptiveEngine.evaluate({
          accuracy: 0.5,
          reactionTime: Math.max(1000, Date.now() - startTime),
          errorRate: 0.5,
          completionRate: 0.7,
          currentLevel: level,
        });

        const res = ScoreManager.calculateResult({
          gameId: 'guide_home',
          level,
          correctAnswers: currentStepIdx,
          totalQuestions: route.length - 1,
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
      ? `Study the landmarks along your peaceful path home (${route.length} stops). Tap "Ready" to walk.`
      : `You are at ${route[currentStepIdx]?.name[language] || route[currentStepIdx]?.name.en}. What is the next landmark on your path home?`,
    hi: phase === 'study'
      ? `घर जाने के मार्ग के इन ${route.length} पड़ावों को याद रखें। फिर "तैयार" दबाएँ।`
      : `आप ${route[currentStepIdx]?.name[language] || route[currentStepIdx]?.name.hi} पर हैं। घर की राह का अगला पड़ाव कौन सा है?`,
    as: phase === 'study'
      ? `ঘৰলৈ যোৱা বাটৰ এই ${route.length}টা স্থান মনত ৰাখক। তাৰ পিছত "মই সাজু" টিপক।`
      : `আপুনি এতিয়া ${route[currentStepIdx]?.name[language] || route[currentStepIdx]?.name.as}ত আছে। পিছৰ স্থানটো কি আছিল বাছক।`,
    bn: phase === 'study'
      ? `বাড়ি ফেরার পথের এই ${route.length}টি ল্যান্ডমার্ক মনে রাখুন। তৈরি হলে "প্রস্তুত" চাপুন।`
      : `আপনি এখন ${route[currentStepIdx]?.name[language] || route[currentStepIdx]?.name.bn}-এ আছেন। পরবর্তী ল্যান্ডমার্ক কোনটি?`,
    lus: phase === 'study'
      ? `In panna kawng hmun ${route.length} te hi uluk takin en rawh.`
      : `Hemi hnuai a thlenna tur hmun dik thlang rawh.`,
  };

  return (
    <GameShell
      gameId="guide_home"
      title="Guide Me Home"
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
            <div className="p-4 rounded-3xl bg-[#0B1528] border-2 border-cyan-400/50 shadow-xl">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block text-center mb-3">
                🧭 Path to Home ({route.length} landmarks)
              </span>

              <div className="space-y-2">
                {route.map((lm, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl bg-[#060D1E] border border-slate-700/80 flex items-center gap-3 shadow-sm"
                  >
                    <div className="w-7 h-7 rounded-full bg-blue-900/60 border border-cyan-400/40 text-cyan-300 font-bold text-xs flex items-center justify-center">
                      {idx + 1}
                    </div>
                    <span className="text-2xl">{lm.icon}</span>
                    <span className="text-sm font-bold text-white flex-1 text-left">
                      {lm.name[language] || lm.name.en}
                    </span>
                    {idx < route.length - 1 && (
                      <ArrowRight className="w-4 h-4 text-slate-600" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={handleStartNavigation}
              className="w-full mt-3 min-h-[52px] rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 text-white font-extrabold text-lg shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 active:scale-95 transition"
            >
              <Compass className="w-5 h-5" />
              <span>I Remember the Path!</span>
            </button>
          </div>
        ) : (
          <div className="w-full max-w-md space-y-4">
            {/* Current Location Display */}
            <div className="p-4 rounded-3xl bg-[#0B1528] border-2 border-cyan-400/70 text-center shadow-xl">
              <span className="text-4xl block mb-1">{route[currentStepIdx]?.icon}</span>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Current Location (Stop {currentStepIdx + 1} of {route.length}):
              </span>
              <h3 className="text-xl font-black text-cyan-300 mt-1">
                {route[currentStepIdx]?.name[language] || route[currentStepIdx]?.name.en}
              </h3>
            </div>

            {/* Which way next options (min 56px touch target) */}
            <div className="space-y-2.5">
              <span className="text-xs font-bold text-slate-400 block text-left px-1">
                Which landmark comes next?
              </span>
              {choices.map((lm) => (
                <button
                  key={lm.id}
                  type="button"
                  onClick={() => handlePickNext(lm)}
                  className="w-full min-h-[58px] p-3.5 rounded-2xl bg-[#0B1528] hover:bg-[#101E3A] border border-slate-700 hover:border-cyan-400 active:scale-95 transition flex items-center gap-3 shadow-md text-left"
                >
                  <span className="text-2xl">{lm.icon}</span>
                  <span className="text-base font-bold text-white flex-1">
                    {lm.name[language] || lm.name.en}
                  </span>
                  <ArrowRight className="w-4 h-4 text-cyan-400" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </GameShell>
  );
};
