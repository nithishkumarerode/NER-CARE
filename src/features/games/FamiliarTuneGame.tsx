import React, { useState, useEffect } from 'react';
import { Language, GameSession } from '../../types';
import { GameShell } from './engine/GameShell';
import { GameSessionResult } from './engine/types';
import { ScoreManager } from './engine/ScoreManager';
import { soundManager } from './engine/SoundManager';
import { adaptiveEngine } from '../../ml/adaptiveEngine';
import { Music, Play } from 'lucide-react';

interface FamiliarTuneGameProps {
  language: Language;
  onBack: () => void;
  onCompleteSession?: (session: GameSession) => void;
}

interface TuneNote {
  note: string;
  name: string;
  color: string;
  icon: string;
}

const NOTES: TuneNote[] = [
  { note: 'C4', name: 'Sa (C)', color: 'from-rose-600 to-red-500', icon: '🔴' },
  { note: 'D4', name: 'Re (D)', color: 'from-orange-600 to-amber-500', icon: '🟠' },
  { note: 'E4', name: 'Ga (E)', color: 'from-yellow-600 to-amber-400', icon: '🟡' },
  { note: 'F4', name: 'Ma (F)', color: 'from-emerald-600 to-green-500', icon: '🟢' },
  { note: 'G4', name: 'Pa (G)', color: 'from-cyan-600 to-blue-500', icon: '🔵' },
  { note: 'A4', name: 'Dha (A)', color: 'from-purple-600 to-indigo-500', icon: '🟣' },
  { note: 'C5', name: 'Tar Sa (High C)', color: 'from-pink-600 to-rose-400', icon: '⭐' },
];

export const FamiliarTuneGame: React.FC<FamiliarTuneGameProps> = ({
  language,
  onBack,
  onCompleteSession,
}) => {
  const [level, setLevel] = useState<number>(1);
  const [sequence, setSequence] = useState<TuneNote[]>([]);
  const [targetNote, setTargetNote] = useState<TuneNote | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeHighlight, setActiveHighlight] = useState<string | null>(null);
  const [options, setOptions] = useState<TuneNote[]>([]);
  const [selectedNote, setSelectedNote] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [attempts, setAttempts] = useState(0);
  const [result, setResult] = useState<GameSessionResult | null>(null);

  const initLevel = (lvl: number) => {
    // Length of played motif: L1: 3, L2: 4, L3: 5, L4: 6, L5: 7, L6: 8
    const len = Math.min(7, lvl + 2);
    // Predictable pentatonic melodies
    const motifs = [
      ['C4', 'D4', 'E4', 'G4'],
      ['E4', 'D4', 'C4', 'D4'],
      ['G4', 'E4', 'G4', 'A4'],
      ['C4', 'E4', 'G4', 'C5'],
      ['A4', 'G4', 'E4', 'D4'],
      ['C4', 'D4', 'E4', 'G4', 'A4', 'C5'],
    ];

    const chosenMotif = motifs[Math.min(motifs.length - 1, lvl - 1)];
    const fullNotes: TuneNote[] = chosenMotif.map((n) => NOTES.find((item) => item.note === n)!);

    const prefix = fullNotes.slice(0, fullNotes.length - 1);
    const target = fullNotes[fullNotes.length - 1];

    setSequence(prefix);
    setTargetObject(target);
    setTargetNote(target);

    // Options: target + 2 other notes
    const otherNotes = NOTES.filter((n) => n.note !== target.note).sort(() => Math.random() - 0.5).slice(0, 2);
    const choices = [target, ...otherNotes].sort(() => Math.random() - 0.5);
    setOptions(choices);

    setSelectedNote(null);
    setAttempts(0);
    setResult(null);
    setStartTime(Date.now());

    playMelody(prefix);
  };

  const setTargetObject = (t: TuneNote) => {
    setTargetNote(t);
  };

  useEffect(() => {
    initLevel(level);
  }, [level]);

  const playMelody = async (seq: TuneNote[]) => {
    if (isPlaying) return;
    setIsPlaying(true);

    for (let i = 0; i < seq.length; i++) {
      const noteItem = seq[i];
      setActiveHighlight(noteItem.note);
      soundManager.playNote(noteItem.note, 0.45);
      await new Promise((r) => setTimeout(r, 600));
      setActiveHighlight(null);
      await new Promise((r) => setTimeout(r, 100));
    }

    setIsPlaying(false);
  };

  const handleSelectNote = (choice: TuneNote) => {
    if (selectedNote !== null || isPlaying || !targetNote) return;
    setSelectedNote(choice.note);
    soundManager.playNote(choice.note, 0.5);

    const isCorrect = choice.note === targetNote.note;
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
        gameId: 'familiar_tune',
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
    en: isPlaying
      ? 'Listen closely to the gentle melodic bells...'
      : 'Which chime note completes this melody? Tap the missing final bell.',
    hi: isPlaying
      ? 'मधुर सुरों को ध्यान से सुनें...'
      : 'इस धुन को कौन सा सुर पूरा करता है? सही घंटी पर स्पर्श करें।',
    as: isPlaying
      ? 'মধুৰ সুৰীয়া ঘণ্টাবোৰ মন দি শুনক...'
      : 'এই সুৰটি কোনটো সুৰে সম্পূৰ্ণ কৰিব? শেষৰ ঘণ্টাটো বাছক।',
    bn: isPlaying
      ? 'মিষ্টি সুরের ঘণ্টাগুলি মন দিয়ে শুনুন...'
      : 'কোন স্বরটি এই সুরটিকে সম্পূর্ণ করবে? শেষ ঘণ্টাটি নির্বাচন করুন।',
    lus: isPlaying
      ? 'Rimawi thluk hi uluk takin ngaithla rawh...'
      : 'A tawpna tur ri dik tak chu thlang rawh.',
  };

  return (
    <GameShell
      gameId="familiar_tune"
      title="Complete the Familiar Tune"
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
        {/* Replay Button */}
        <div className="flex items-center justify-between w-full max-w-sm mb-4">
          <span className="text-xs font-bold text-slate-300">
            Motif: {sequence.length} notes + [ ? ]
          </span>
          <button
            type="button"
            onClick={() => playMelody(sequence)}
            disabled={isPlaying}
            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-cyan-300 border border-slate-600 active:scale-95 text-xs font-bold transition flex items-center gap-1.5"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Replay Tune</span>
          </button>
        </div>

        {/* Melody Sequence Visual Display */}
        <div className="p-4 rounded-3xl bg-[#0B1528] border-2 border-cyan-400/50 shadow-xl w-full max-w-sm mb-5 text-center">
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {sequence.map((n, idx) => {
              const isLit = activeHighlight === n.note;
              return (
                <div
                  key={idx}
                  className={`w-12 h-14 rounded-2xl border-2 flex flex-col items-center justify-center transition-all ${
                    isLit
                      ? 'bg-cyan-400 text-slate-950 border-white ring-4 ring-cyan-300 scale-110 shadow-lg'
                      : 'bg-[#060D1E] border-slate-700 text-white'
                  }`}
                >
                  <span className="text-lg">{n.icon}</span>
                  <span className="text-[10px] font-black mt-0.5">{n.note}</span>
                </div>
              );
            })}

            {/* The Missing Final Note slot */}
            <div className="w-12 h-14 rounded-2xl bg-amber-950/40 border-2 border-dashed border-amber-400 text-amber-300 flex flex-col items-center justify-center font-black animate-pulse">
              <span className="text-lg">❓</span>
              <span className="text-[10px]">Next</span>
            </div>
          </div>
        </div>

        {/* 3 Choices to complete the tune (min 60px touch target) */}
        <div className="w-full max-w-sm space-y-2.5">
          <span className="text-xs font-bold text-slate-400 block text-left px-1">
            Tap the chime that finishes the melody:
          </span>
          <div className="grid grid-cols-3 gap-2.5">
            {options.map((opt) => {
              const isSelected = selectedNote === opt.note;
              const isCorrect = targetNote?.note === opt.note;

              let btnStyle = 'bg-[#0B1528] border-slate-700 text-white hover:border-cyan-400';
              if (selectedNote !== null) {
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
                  key={opt.note}
                  type="button"
                  onClick={() => handleSelectNote(opt)}
                  disabled={selectedNote !== null || isPlaying}
                  className={`min-h-[72px] p-2.5 rounded-2xl border-2 font-bold text-sm transition-all flex flex-col items-center justify-center gap-1 active:scale-95 shadow ${btnStyle}`}
                >
                  <span className="text-2xl">{opt.icon}</span>
                  <span className="text-xs font-black">{opt.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </GameShell>
  );
};
