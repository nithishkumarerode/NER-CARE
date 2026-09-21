import React, { useState, useEffect } from 'react';
import { Language, GameSession } from '../../types';
import { GameShell } from './engine/GameShell';
import { GameSessionResult } from './engine/types';
import { ScoreManager } from './engine/ScoreManager';
import { soundManager } from './engine/SoundManager';
import { adaptiveEngine } from '../../ml/adaptiveEngine';
import { Check, Eye, HelpCircle } from 'lucide-react';

interface WhoDidWhatGameProps {
  language: Language;
  onBack: () => void;
  onCompleteSession?: (session: GameSession) => void;
}

interface PersonAction {
  person: string;
  avatar: string;
  action: Record<Language, string>;
  icon: string;
}

const PEOPLE_DATABASE: PersonAction[] = [
  { person: 'Ravi', avatar: '👨‍🌾', icon: '🛍️', action: { en: 'Went to the Village Market', hi: 'गाँव के बाज़ार गया', as: 'গাঁৱৰ বজাৰলৈ গৈছিল', bn: 'গ্রামের বাজারে গিয়েছিলেন', lus: 'Bazar-ah a kal' } },
  { person: 'Sita', avatar: '👵', icon: '🛕', action: { en: 'Offered Prayers at Temple', hi: 'मंदिर में प्रार्थना की', as: 'মন্দিৰত প্ৰাৰ্থনা কৰিছিল', bn: 'মন্দিরে পুজো দিয়েছিলেন', lus: 'Biakin-ah a ṭawngṭai' } },
  { person: 'Mohan', avatar: '👴', icon: '🥬', action: { en: 'Bought Fresh Green Vegetables', hi: 'ताज़ी हरी सब्ज़ियाँ खरीदीं', as: 'সতেজ শাক-পাচলি কিনিছিল', bn: 'তাজা শাকসবজি কিনেছিলেন', lus: 'Thlai tharlam a lei' } },
  { person: 'Anita', avatar: '👩‍⚕️', icon: '🏥', action: { en: 'Visited the Health Clinic', hi: 'स्वास्थ्य केंद्र गई थी', as: 'স্বাস্থ্য কেন্দ্ৰলৈ গৈছিল', bn: 'স্বাস্থ্যকেন্দ্রে গিয়েছিলেন', lus: 'Damdawi in-ah a kal' } },
  { person: 'Bhaben', avatar: '👴', icon: '🌱', action: { en: 'Tended to the Vegetable Garden', hi: 'बगीचे की देखभाल की', as: 'বাৰীৰ ফুল-শাকৰ যত্ন লৈছিল', bn: 'বাগানের পরিচর্যা করেছিলেন', lus: 'Huan a enkawl' } },
  { person: 'Mina', avatar: '👩', icon: '📚', action: { en: 'Borrowed Books from Library', hi: 'पुस्तकालय से पुस्तक लाई', as: 'পুথিভঁৰালৰ পৰা কিতাপ আনিছিল', bn: 'গ্রন্থাগার থেকে বই এনেছিলেন', lus: 'Library aṭangin lehkhabu a hawh' } },
  { person: 'Pranab', avatar: '👨', icon: '☕', action: { en: 'Drank Morning Assam Tea', hi: 'सुबह की असम चाय पी', as: 'ৰাতিপুৱাৰ অসম চাহ খাইছিল', bn: 'সকালের আসাম চা খেয়েছিলেন', lus: 'Thingpui tui tak a in' } },
  { person: 'Kalyani', avatar: '👵', icon: '🥮', action: { en: 'Prepared Steaming Rice Cakes', hi: 'गरमा-गरम पकवान बनाए', as: 'গৰম ভাপত দিয়া পিঠা বনাইছিল', bn: 'গরম ভাপা পিঠে বানিয়েছিলেন', lus: 'Chhang tui tak a siam' } },
];

export const WhoDidWhatGame: React.FC<WhoDidWhatGameProps> = ({
  language,
  onBack,
  onCompleteSession,
}) => {
  const [level, setLevel] = useState<number>(1);
  const [phase, setPhase] = useState<'study' | 'quiz'>('study');
  const [activePairs, setActivePairs] = useState<PersonAction[]>([]);
  const [questionPair, setQuestionPair] = useState<PersonAction | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [attempts, setAttempts] = useState(0);
  const [result, setResult] = useState<GameSessionResult | null>(null);

  const initLevel = (lvl: number) => {
    // Level 1: 2 pairs, Level 2: 3 pairs, Level 3: 4, Level 4: 5, Level 5: 6, Level 6: 7
    const count = Math.min(8, lvl + 1);
    const chosen = [...PEOPLE_DATABASE].sort(() => Math.random() - 0.5).slice(0, count);
    setActivePairs(chosen);

    const target = chosen[Math.floor(Math.random() * chosen.length)];
    setQuestionPair(target);

    // Options: all persons in this round + possible distractor
    const choices = chosen.map((p) => p.person).sort(() => Math.random() - 0.5);
    setOptions(choices);

    setPhase('study');
    setSelectedAnswer(null);
    setAttempts(0);
    setResult(null);
    setStartTime(Date.now());
  };

  useEffect(() => {
    initLevel(level);
  }, [level]);

  const handleSelectOption = (personName: string) => {
    if (selectedAnswer !== null || !questionPair) return;
    setSelectedAnswer(personName);

    const isCorrect = personName === questionPair.person;
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
        gameId: 'who_did_what',
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
      ? 'Remember who did what activity today. Tap "Ready" when memorized.'
      : `Who ${questionPair?.action[language] || questionPair?.action.en}? Tap the right friend.`,
    hi: phase === 'study'
      ? 'याद रखें कि किसने कौन सा काम किया। याद होने पर "तैयार" पर स्पर्श करें।'
      : `${questionPair?.action[language] || questionPair?.action.hi} किसने किया था? सही व्यक्ति चुनें।`,
    as: phase === 'study'
      ? 'মনত ৰাখক কোনে কি কাম কৰিছিল। মনত থাকিলে "মই সাজু" টিপক।'
      : `কোনে ${questionPair?.action[language] || questionPair?.action.as}? সঠিক মানুহজন বাছক।`,
    bn: phase === 'study'
      ? 'মনে রাখুন কে কী কাজ করেছিলেন। মনে রাখা হলে "প্রস্তুত" চাপুন।'
      : `কে ${questionPair?.action[language] || questionPair?.action.bn}? সঠিক বন্ধুকে বেছে নিন।`,
    lus: phase === 'study'
      ? 'Tuin nge engnge ti tih uluk takin en rawh.'
      : `Tuin nge he thil hi ti: ${questionPair?.action[language] || questionPair?.action.lus}?`,
  };

  return (
    <GameShell
      gameId="who_did_what"
      title="Who Did What?"
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
        {phase === 'study' ? (
          <div className="w-full max-w-md space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {activePairs.map((item) => (
                <div
                  key={item.person}
                  className="p-3.5 rounded-2xl bg-[#0B1528] border-2 border-slate-700 flex items-center gap-3 shadow-md"
                >
                  <div className="w-12 h-12 rounded-2xl bg-blue-950 border border-cyan-400/40 flex items-center justify-center text-3xl">
                    {item.avatar}
                  </div>
                  <div className="text-left flex-1">
                    <span className="text-base font-extrabold text-white block">{item.person}</span>
                    <span className="text-xs font-semibold text-cyan-300 flex items-center gap-1 mt-0.5">
                      <span>{item.icon}</span>
                      <span className="line-clamp-1">{item.action[language] || item.action.en}</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setPhase('quiz')}
              className="w-full mt-4 min-h-[52px] rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 text-white font-extrabold text-lg shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 active:scale-95 transition"
            >
              <Check className="w-5 h-5 stroke-[2.5]" />
              <span>I Have Memorized Them!</span>
            </button>
          </div>
        ) : (
          <div className="w-full max-w-md space-y-4">
            {/* Question Card */}
            {questionPair && (
              <div className="p-4 rounded-3xl bg-[#0B1528] border-2 border-cyan-400/70 text-center shadow-xl">
                <span className="text-4xl block mb-2">{questionPair.icon}</span>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Question:</span>
                <h3 className="text-lg sm:text-xl font-black text-cyan-300 mt-1">
                  Who {questionPair.action[language] || questionPair.action.en}?
                </h3>
              </div>
            )}

            {/* Answer Choices (min 50px touch targets) */}
            <div className="grid grid-cols-2 gap-3">
              {options.map((name) => {
                const isSelected = selectedAnswer === name;
                const isCorrect = questionPair?.person === name;

                let btnStyle = 'bg-[#0B1528] border-slate-700/80 text-white hover:border-cyan-400/60 hover:bg-[#101D38]';
                if (selectedAnswer !== null) {
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
                    key={name}
                    type="button"
                    onClick={() => handleSelectOption(name)}
                    disabled={selectedAnswer !== null}
                    className={`min-h-[60px] p-3 rounded-2xl border-2 font-black text-lg transition-all flex items-center justify-center gap-2 active:scale-95 shadow-md ${btnStyle}`}
                  >
                    <span>{name}</span>
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
