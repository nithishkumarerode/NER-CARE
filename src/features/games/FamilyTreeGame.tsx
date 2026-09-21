import React, { useState, useEffect } from 'react';
import { Language, GameSession } from '../../types';
import { GameShell } from './engine/GameShell';
import { GameSessionResult } from './engine/types';
import { ScoreManager } from './engine/ScoreManager';
import { soundManager } from './engine/SoundManager';
import { adaptiveEngine } from '../../ml/adaptiveEngine';
import { Check } from 'lucide-react';

interface FamilyTreeGameProps {
  language: Language;
  onBack: () => void;
  onCompleteSession?: (session: GameSession) => void;
}

interface FamilyMember {
  id: string;
  name: string;
  relation: Record<Language, string>;
  hobby: Record<Language, string>;
  hobbyIcon: string;
  avatar: string;
}

const FAMILY_MEMBERS: FamilyMember[] = [
  { id: 'dadu', name: 'Dadu (Bhaben)', relation: { en: 'Grandfather', hi: 'दादाजी', as: 'ককা', bn: 'দাদু', lus: 'Pu' }, hobby: { en: 'Tending Garden Flowers', hi: 'बगीचे में फूल लगाना', as: 'ফুলবাৰীৰ যত্ন লোৱা', bn: 'বাগানের ফুলের যত্ন নেওয়া', lus: 'Pangpar enkawl' }, hobbyIcon: '🌱', avatar: '👴' },
  { id: 'aita', name: 'Aita (Kalyani)', relation: { en: 'Grandmother', hi: 'दादीजी', as: 'আইতা', bn: 'দিদিমা', lus: 'Pi' }, hobby: { en: 'Baking Traditional Pitha', hi: 'पारंपरिक पकवान बनाना', as: 'ঘৰুৱা পিঠা বনোৱা', bn: 'ঐতিহ্যবাহী পিঠে বানানো', lus: 'Chhang siam' }, hobbyIcon: '🥮', avatar: '👵' },
  { id: 'baba', name: 'Baba (Pranab)', relation: { en: 'Father', hi: 'पिताजी', as: 'দেউতা', bn: 'বাবা', lus: 'Pa' }, hobby: { en: 'Reading Morning News', hi: 'सुबह का अखबार पढ़ना', as: 'ৰাতিপুৱাৰ বাতৰি পঢ়া', bn: 'সকালের খবরের কাগজ পড়া', lus: 'Chanchinbu chhiar' }, hobbyIcon: '📰', avatar: '👨' },
  { id: 'ma', name: 'Ma (Ananya)', relation: { en: 'Mother', hi: 'माताजी', as: 'মা', bn: 'মা', lus: 'Nu' }, hobby: { en: 'Weaving Handloom Cloth', hi: 'हथकरघा बुनाई', as: 'তাঁতশালত কাপোৰ বোৱা', bn: 'হাঁততাঁতে কাপড় বোনা', lus: 'Puan tah' }, hobbyIcon: '🧵', avatar: '👩' },
  { id: 'rahul', name: 'Rahul', relation: { en: 'Elder Son', hi: 'बड़ा बेटा', as: 'ডাঙৰ পুত্ৰ', bn: 'বড় ছেলে', lus: 'Fapa upa zawk' }, hobby: { en: 'Playing Bamboo Flute', hi: 'बांसुरी बजाना', as: 'বাঁহী বজোৱা', bn: 'বাঁশি বাজানো', lus: 'Rawchhem tum' }, hobbyIcon: '🪈', avatar: '👦' },
  { id: 'priya', name: 'Priya', relation: { en: 'Daughter', hi: 'बेटी', as: 'জীয়াৰী', bn: 'মেয়ে', lus: 'Fanu' }, hobby: { en: 'Painting Local Birds', hi: 'पक्षियों के चित्र बनाना', as: 'চৰাইৰ ছবি অঁকা', bn: 'পাখির ছবি আঁকা', lus: 'Sava lem ziah' }, hobbyIcon: '🎨', avatar: '👧' },
  { id: 'rohan', name: 'Rohan', relation: { en: 'Young Grandson', hi: 'छोटा पोता', as: 'সৰু নাতি', bn: 'ছোট নাতি', lus: 'Tupa te' }, hobby: { en: 'Flying Colorful Kites', hi: 'पतंग उड़ाना', as: 'চিলাই উৰুওৱা', bn: 'রঙিন ঘুড়ি ওড়ানো', lus: 'Lenglawng thlawhtir' }, hobbyIcon: '🪁', avatar: '🧒' },
  { id: 'maya', name: 'Maya', relation: { en: 'Little Granddaughter', hi: 'छोटी पोती', as: 'সৰু নাতিনী', bn: 'ছোট নাতনি', lus: 'Tunu te' }, hobby: { en: 'Listening to Bedtime Tales', hi: 'कहानियाँ सुनना', as: 'সাধুকথা শুনা', bn: 'গল্প শোনা', lus: 'Thawnthu ngaihthlak' }, hobbyIcon: '📖', avatar: '👧' },
];

export const FamilyTreeGame: React.FC<FamilyTreeGameProps> = ({
  language,
  onBack,
  onCompleteSession,
}) => {
  const [level, setLevel] = useState<number>(1);
  const [phase, setPhase] = useState<'study' | 'quiz'>('study');
  const [activeFamily, setActiveFamily] = useState<FamilyMember[]>([]);
  const [targetMember, setTargetMember] = useState<FamilyMember | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [attempts, setAttempts] = useState(0);
  const [result, setResult] = useState<GameSessionResult | null>(null);

  const initLevel = (lvl: number) => {
    // Level 1: 3 members, Level 2: 4, Level 3: 5, Level 4: 6, Level 5: 7, Level 6: 8
    const count = Math.min(8, lvl + 2);
    const members = FAMILY_MEMBERS.slice(0, count);
    setActiveFamily(members);

    const target = members[Math.floor(Math.random() * members.length)];
    setTargetMember(target);

    // Options are member names
    const choices = members.map((m) => m.name).sort(() => Math.random() - 0.5);
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

  const handleSelectAnswer = (name: string) => {
    if (selectedAnswer !== null || !targetMember) return;
    setSelectedAnswer(name);

    const isCorrect = name === targetMember.name;
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
        gameId: 'family_tree',
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
      ? `Learn these ${activeFamily.length} beloved family members and their favorite activities.`
      : `Who enjoys ${targetMember?.hobby[language] || targetMember?.hobby.en}? Tap the right family member.`,
    hi: phase === 'study'
      ? `परिवार के इन ${activeFamily.length} प्रिय सदस्यों और उनके प्रिय शौकों को याद रखें।`
      : `${targetMember?.hobby[language] || targetMember?.hobby.hi} किसे पसंद है? सही सदस्य चुनें।`,
    as: phase === 'study'
      ? `পৰিয়ালৰ এই ${activeFamily.length}জন মৰমৰ সদস্য আৰু তেওঁলোকৰ চখবোৰ মনত ৰাখক।`
      : `কাৰ প্ৰিয় চখ ${targetMember?.hobby[language] || targetMember?.hobby.as}? সঠিক মানুহজন বাছক।`,
    bn: phase === 'study'
      ? `পরিবারের এই ${activeFamily.length} জন সদস্য ও তাঁদের প্রিয় শখের কথা মনে রাখুন।`
      : `কার প্রিয় শখ ${targetMember?.hobby[language] || targetMember?.hobby.bn}? সঠিক সদস্যকে বেছে নিন।`,
    lus: phase === 'study'
      ? `Chhungkaw member ${activeFamily.length} te leh an thil ngainat te uluk takin en rawh.`
      : `Tuin nge he thil hi nuam ti: ${targetMember?.hobby[language] || targetMember?.hobby.lus}?`,
  };

  return (
    <GameShell
      gameId="family_tree"
      title="Family Memory Tree"
      category="reasoning"
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {activeFamily.map((m) => (
                <div
                  key={m.id}
                  className="p-3 rounded-2xl bg-[#0B1528] border-2 border-slate-700/80 flex items-center gap-3 shadow-md"
                >
                  <div className="w-12 h-12 rounded-2xl bg-blue-950 border border-cyan-400/40 flex items-center justify-center text-3xl">
                    {m.avatar}
                  </div>
                  <div className="text-left flex-1">
                    <span className="text-sm font-extrabold text-white block">{m.name}</span>
                    <span className="text-[11px] text-slate-400 block font-semibold">
                      {m.relation[language] || m.relation.en}
                    </span>
                    <span className="text-xs text-cyan-300 flex items-center gap-1 font-semibold mt-0.5">
                      <span>{m.hobbyIcon}</span>
                      <span className="line-clamp-1">{m.hobby[language] || m.hobby.en}</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setPhase('quiz')}
              className="w-full mt-3 min-h-[52px] rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 text-white font-extrabold text-lg shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 active:scale-95 transition"
            >
              <Check className="w-5 h-5 stroke-[2.5]" />
              <span>I Remember the Family Tree!</span>
            </button>
          </div>
        ) : (
          <div className="w-full max-w-md space-y-4">
            {targetMember && (
              <div className="p-4 rounded-3xl bg-[#0B1528] border-2 border-cyan-400/70 text-center shadow-xl">
                <span className="text-4xl block mb-1">{targetMember.hobbyIcon}</span>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Who enjoys this?</span>
                <h3 className="text-lg sm:text-xl font-black text-cyan-300 mt-1">
                  "{targetMember.hobby[language] || targetMember.hobby.en}"
                </h3>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2.5">
              {options.map((name) => {
                const isSelected = selectedAnswer === name;
                const isCorrect = targetMember?.name === name;

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
                    onClick={() => handleSelectAnswer(name)}
                    disabled={selectedAnswer !== null}
                    className={`min-h-[58px] p-2.5 rounded-2xl border-2 font-bold text-base transition-all flex items-center justify-center active:scale-95 shadow-md ${btnStyle}`}
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
