import React, { useState, useEffect } from 'react';
import { Language, GameSession } from '../../types';
import { GameShell } from './engine/GameShell';
import { GameSessionResult } from './engine/types';
import { ScoreManager } from './engine/ScoreManager';
import { soundManager } from './engine/SoundManager';
import { adaptiveEngine } from '../../ml/adaptiveEngine';
import { Volume2, Play, RotateCcw } from 'lucide-react';

interface SoundMemoryGameProps {
  language: Language;
  onBack: () => void;
  onCompleteSession?: (session: GameSession) => void;
}

type SoundType = 'bell' | 'bird' | 'train' | 'water' | 'wind' | 'drum';

interface SoundCard {
  id: SoundType;
  name: Record<Language, string>;
  icon: string;
  color: string;
}

const SOUNDS: SoundCard[] = [
  { id: 'bell', name: { en: 'Temple Bell', hi: 'मंदिर की घंटी', as: 'মন্দিৰৰ ঘণ্টা', bn: 'মন্দিরের ঘণ্টা', lus: 'Darkhing' }, icon: '🔔', color: 'from-amber-500 to-yellow-600' },
  { id: 'bird', name: { en: 'Singing Bird', hi: 'पक्षी की चहचहाहट', as: 'চৰাইৰ মাত', bn: 'পাখির ডাক', lus: 'Sava zai' }, icon: '🐦', color: 'from-emerald-500 to-teal-600' },
  { id: 'train', name: { en: 'Steam Train', hi: 'रेल की सीटी', as: 'ৰে’লৰ হুইচেল', bn: 'ট্রেনের বাঁশি', lus: 'Rel' }, icon: '🚂', color: 'from-blue-500 to-indigo-600' },
  { id: 'water', name: { en: 'River Water', hi: 'नदी की कलकल', as: 'নৈৰ পানী', bn: 'নদীর জলধারা', lus: 'Tui luang' }, icon: '💧', color: 'from-cyan-500 to-sky-600' },
  { id: 'wind', name: { en: 'Bamboo Chimes', hi: 'बांस की पवन घंटी', as: 'বাঁহৰ সংগীত', bn: 'বাঁশের সুর', lus: 'Thlifim ri' }, icon: '🎐', color: 'from-purple-500 to-pink-600' },
  { id: 'drum', name: { en: 'Festive Drum', hi: 'उत्सव का ढोल', as: 'উৎসৱৰ ঢোল', bn: 'উৎসবের ঢাক', lus: 'Khuang ri' }, icon: '🥁', color: 'from-rose-500 to-red-600' },
];

export const SoundMemoryGame: React.FC<SoundMemoryGameProps> = ({
  language,
  onBack,
  onCompleteSession,
}) => {
  const [level, setLevel] = useState<number>(1);
  const [sequence, setSequence] = useState<SoundType[]>([]);
  const [isPlayingSeq, setIsPlayingSeq] = useState(false);
  const [activeHighlight, setActiveHighlight] = useState<SoundType | null>(null);
  const [userTaps, setUserTaps] = useState<SoundType[]>([]);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [attempts, setAttempts] = useState(0);
  const [result, setResult] = useState<GameSessionResult | null>(null);

  const initLevel = (lvl: number) => {
    // Level 1: 3 sounds, Level 2: 4, Level 3: 5, Level 4: 6, Level 5: 7, Level 6: 8
    const seqLength = Math.min(8, lvl + 2);
    const pool: SoundType[] = ['bell', 'bird', 'train', 'water', 'wind', 'drum'];
    const newSeq: SoundType[] = [];

    for (let i = 0; i < seqLength; i++) {
      const pick = pool[Math.floor(Math.random() * pool.length)];
      newSeq.push(pick);
    }

    setSequence(newSeq);
    setUserTaps([]);
    setAttempts(0);
    setResult(null);
    setStartTime(Date.now());

    // Play sequence automatically
    playSequence(newSeq);
  };

  useEffect(() => {
    initLevel(level);
  }, [level]);

  const playSequence = async (seq: SoundType[]) => {
    if (isPlayingSeq) return;
    setIsPlayingSeq(true);
    setUserTaps([]);

    for (let i = 0; i < seq.length; i++) {
      const snd = seq[i];
      setActiveHighlight(snd);
      soundManager.playSoundEffect(snd);
      await new Promise((r) => setTimeout(r, 700));
      setActiveHighlight(null);
      await new Promise((r) => setTimeout(r, 250));
    }

    setIsPlayingSeq(false);
  };

  const handleSoundTap = (snd: SoundType) => {
    if (isPlayingSeq || result !== null) return;
    soundManager.playSoundEffect(snd);
    const nextTaps = [...userTaps, snd];
    setUserTaps(nextTaps);

    const currIdx = nextTaps.length - 1;
    // Check if correct so far
    if (nextTaps[currIdx] !== sequence[currIdx]) {
      // Mistake made
      soundManager.playGentleFeedback();
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);

      setTimeout(() => {
        const adaptive = adaptiveEngine.evaluate({
          accuracy: 0.5,
          reactionTime: Math.max(1000, Date.now() - startTime),
          errorRate: 0.5,
          completionRate: 0.8,
          currentLevel: level,
        });

        const res = ScoreManager.calculateResult({
          gameId: 'sound_memory',
          level,
          correctAnswers: nextTaps.length - 1,
          totalQuestions: sequence.length,
          attempts: newAttempts,
          startTime,
          adaptiveLevel: adaptive.newLevel,
        });
        setResult(res);
      }, 1000);
      return;
    }

    // If completed whole sequence!
    if (nextTaps.length === sequence.length) {
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
          gameId: 'sound_memory',
          level,
          correctAnswers: sequence.length,
          totalQuestions: sequence.length,
          attempts: newAttempts,
          startTime,
          adaptiveLevel: adaptive.newLevel,
        });
        setResult(res);
      }, 1000);
    }
  };

  const instructions: Record<Language, string> = {
    en: isPlayingSeq
      ? 'Listen & watch the sound sequence...'
      : `Tap the sound buttons in the exact order you heard (${userTaps.length} of ${sequence.length}).`,
    hi: isPlayingSeq
      ? 'ध्वनि के क्रम को ध्यान से सुनें और देखें...'
      : `सुने गए क्रम में ध्वनियों को स्पर्श करें (${userTaps.length}/${sequence.length})।`,
    as: isPlayingSeq
      ? 'শব্দৰ ক্ৰমটো মন দি শুনক আৰু চাওক...'
      : `শুনা ক্ৰম অনুসৰি শব্দবোৰত স্পৰ্শ কৰক (${userTaps.length}/${sequence.length})।`,
    bn: isPlayingSeq
      ? 'শব্দগুলির ক্রম মন দিয়ে শুনুন ও দেখুন...'
      : `শুনেছেন যে ক্রমে, সেই ক্রমে স্পর্শ করুন (${userTaps.length}/${sequence.length})।`,
    lus: isPlayingSeq
      ? 'Ri inzantir hi uluk takin ngaithla rawh...'
      : `I hriat dan indawtin ri te hi hmet rawh (${userTaps.length}/${sequence.length}).`,
  };

  return (
    <GameShell
      gameId="sound_memory"
      title="Sound Memory"
      category="auditory"
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
        {/* Status & Replay Control */}
        <div className="flex items-center justify-between w-full max-w-sm mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-300">
              Progress: {userTaps.length} / {sequence.length} sounds
            </span>
          </div>

          <button
            type="button"
            onClick={() => playSequence(sequence)}
            disabled={isPlayingSeq}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-cyan-300 border border-slate-600 active:scale-95 text-xs font-bold transition flex items-center gap-1.5"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Replay Sounds</span>
          </button>
        </div>

        {/* 6 Sound Instrument Buttons (min 64px touch target) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 w-full max-w-sm">
          {SOUNDS.map((snd) => {
            const isLit = activeHighlight === snd.id;

            return (
              <button
                key={snd.id}
                type="button"
                onClick={() => handleSoundTap(snd.id)}
                disabled={isPlayingSeq}
                className={`min-h-[85px] p-3 rounded-2xl border-2 flex flex-col items-center justify-center gap-1.5 transition-all duration-200 active:scale-90 shadow-lg ${
                  isLit
                    ? 'bg-gradient-to-tr from-cyan-400 to-blue-500 text-slate-950 border-white ring-4 ring-cyan-300 scale-105 animate-pulse'
                    : 'bg-[#0B1528] border-slate-700 hover:border-cyan-400/60 text-white'
                }`}
              >
                <span className="text-3xl">{snd.icon}</span>
                <span className="text-xs font-black tracking-tight text-center">
                  {snd.name[language] || snd.name.en}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </GameShell>
  );
};
