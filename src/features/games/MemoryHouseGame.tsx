import React, { useState, useEffect } from 'react';
import { Language, GameSession } from '../../types';
import { GameShell } from './engine/GameShell';
import { GameSessionResult } from './engine/types';
import { ScoreManager } from './engine/ScoreManager';
import { soundManager } from './engine/SoundManager';
import { adaptiveEngine } from '../../ml/adaptiveEngine';
import { Check, Home } from 'lucide-react';

interface MemoryHouseGameProps {
  language: Language;
  onBack: () => void;
  onCompleteSession?: (session: GameSession) => void;
}

interface Room {
  id: string;
  name: Record<Language, string>;
  icon: string;
}

interface HouseObject {
  id: string;
  name: Record<Language, string>;
  icon: string;
  room: string;
}

const ROOMS: Room[] = [
  { id: 'kitchen', name: { en: 'Kitchen', hi: 'रसोईघर', as: 'ৰান্ধনীশাল', bn: 'রান্নাঘর', lus: 'Chhanchhiahna' }, icon: '🍳' },
  { id: 'living', name: { en: 'Living Room', hi: 'बैठक कक्ष', as: 'বহাকোঠা', bn: 'বৈঠকখানা', lus: 'Ṭhutkhawmna' }, icon: '🛋️' },
  { id: 'bedroom', name: { en: 'Bedroom', hi: 'शयनकक्ष', as: 'শোৱনি কোঠা', bn: 'শোয়ার ঘর', lus: 'Mutna pindan' }, icon: '🛏️' },
  { id: 'garden', name: { en: 'Garden Verandah', hi: 'बगीचा / बरामदा', as: 'বাৰী / বাৰাণ্ডা', bn: 'বাগান ও বারান্দা', lus: 'Huan leh kawt' }, icon: '🪴' },
  { id: 'bathroom', name: { en: 'Bathroom', hi: 'स्नानघर', as: 'গা-ধোৱা ঘৰ', bn: 'স্নানাগার', lus: 'Inbualna' }, icon: '🚿' },
];

const HOUSE_OBJECTS: Omit<HouseObject, 'room'>[] = [
  { id: 'medicine_box', name: { en: 'Daily Medicine Box', hi: 'दवाई का डिब्बा', as: 'দৰবৰ বাকচ', bn: 'ওষুধের বাক্স', lus: 'Damdawi bawm' }, icon: '💊' },
  { id: 'wall_clock', name: { en: 'Brass Clock', hi: 'दीवार घड़ी', as: 'বেৰৰ ঘড়ী', bn: 'দেওয়াল ঘড়ি', lus: 'Bang sana' }, icon: '🕰️' },
  { id: 'radio', name: { en: 'Vintage Radio', hi: 'रेडियो', as: 'ৰেডিঅ’', bn: 'রেডিও', lus: 'Radio' }, icon: '📻' },
  { id: 'glasses', name: { en: 'Reading Glasses', hi: 'पढ़ने का चश्मा', as: 'পঢ়া চশমা', bn: 'পড়ার চশমা', lus: 'Darthlalang' }, icon: '👓' },
  { id: 'tea_pot', name: { en: 'Clay Teapot', hi: 'मिट्टी की केतली', as: 'মাটিৰ চাহৰ কেটলি', bn: 'মাটির চায়ের কেটলি', lus: 'Thingpui bel' }, icon: '🫖' },
  { id: 'towel', name: { en: 'Clean Towel', hi: 'तौलिया', as: 'গামোচা', bn: 'তোয়ালে', lus: 'Hruhna' }, icon: '🧺' },
  { id: 'watering_can', name: { en: 'Watering Can', hi: 'पानी का फव्वारा', as: 'পানী দিয়া পাত্ৰ', bn: 'জল দেওয়ার পাত্র', lus: 'Tui pekna' }, icon: '🚿' },
  { id: 'umbrella', name: { en: 'Black Umbrella', hi: 'छाता', as: 'ছাতি', bn: 'ছাতা', lus: 'Nihlih' }, icon: '☂️' },
  { id: 'prayer_book', name: { en: 'Holy Prayer Book', hi: 'प्रार्थना पुस्तिका', as: 'নামঘোষা কিতাপ', bn: 'প্রার্থনার বই', lus: 'Lehkhabu' }, icon: '📖' },
];

export const MemoryHouseGame: React.FC<MemoryHouseGameProps> = ({
  language,
  onBack,
  onCompleteSession,
}) => {
  const [level, setLevel] = useState<number>(1);
  const [phase, setPhase] = useState<'study' | 'quiz'>('study');
  const [activeRooms, setActiveRooms] = useState<Room[]>([]);
  const [placedObjects, setPlacedObjects] = useState<HouseObject[]>([]);
  const [targetObject, setTargetObject] = useState<HouseObject | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [result, setResult] = useState<GameSessionResult | null>(null);

  const initLevel = (lvl: number) => {
    // Level 1: 2 rooms, 3 items; Level 2: 3 rooms, 4 items; Level 3: 4 rooms, 5 items; Level 4: 5 rooms, 6 items; Level 5: 5 rooms, 8 items
    const roomCount = Math.min(5, Math.max(2, lvl + 1));
    const objectCount = Math.min(9, lvl + 2);

    const rooms = ROOMS.slice(0, roomCount);
    setActiveRooms(rooms);

    const objects = [...HOUSE_OBJECTS].sort(() => Math.random() - 0.5).slice(0, objectCount);
    const assigned: HouseObject[] = objects.map((obj, idx) => ({
      ...obj,
      room: rooms[idx % rooms.length].id,
    }));

    setPlacedObjects(assigned);
    const target = assigned[Math.floor(Math.random() * assigned.length)];
    setTargetObject(target);

    setPhase('study');
    setSelectedRoom(null);
    setAttempts(0);
    setResult(null);
    setStartTime(Date.now());
  };

  useEffect(() => {
    initLevel(level);
  }, [level]);

  const handleSelectRoom = (roomId: string) => {
    if (selectedRoom !== null || !targetObject) return;
    setSelectedRoom(roomId);

    const isCorrect = roomId === targetObject.room;
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
        gameId: 'memory_house',
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
      ? 'Remember where each item is placed in the house. Tap "Ready" when done.'
      : `Which room was the ${targetObject?.name[language] || targetObject?.name.en} in?`,
    hi: phase === 'study'
      ? 'याद रखें कि घर के किस कमरे में कौन सी चीज़ रखी है।'
      : `${targetObject?.name[language] || targetObject?.name.hi} किस कमरे में रखी थी?`,
    as: phase === 'study'
      ? 'ঘৰৰ কোনটো কোঠাত কি সামগ্ৰী আছিল মনত ৰাখক।'
      : `${targetObject?.name[language] || targetObject?.name.as} কোনটো কোঠাত আছিল?`,
    bn: phase === 'study'
      ? 'ঘরের কোন অংশে কোন জিনিসটি রাখা আছে ভালো করে লক্ষ্য করুন।'
      : `${targetObject?.name[language] || targetObject?.name.bn} কোন ঘরে ছিল?`,
    lus: phase === 'study'
      ? 'In chhunga bungraw awmna uluk takin en rawh.'
      : `Khawi pindan-ah nge ${targetObject?.name[language] || targetObject?.name.lus} awm?`,
  };

  return (
    <GameShell
      gameId="memory_house"
      title="Memory House"
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
          <div className="w-full max-w-md space-y-3">
            <div className="space-y-3">
              {activeRooms.map((room) => {
                const itemsInRoom = placedObjects.filter((o) => o.room === room.id);
                return (
                  <div
                    key={room.id}
                    className="p-3.5 rounded-2xl bg-[#0B1528] border border-slate-700/80 shadow-md"
                  >
                    <div className="flex items-center gap-2 mb-2 pb-1.5 border-b border-slate-800">
                      <span className="text-2xl">{room.icon}</span>
                      <h4 className="text-base font-extrabold text-cyan-300">
                        {room.name[language] || room.name.en}
                      </h4>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {itemsInRoom.map((item) => (
                        <span
                          key={item.id}
                          className="px-3 py-1.5 rounded-xl bg-[#060D1E] border border-slate-700 text-xs sm:text-sm font-bold text-slate-200 flex items-center gap-1.5 shadow-sm"
                        >
                          <span className="text-lg">{item.icon}</span>
                          <span>{item.name[language] || item.name.en}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setPhase('quiz')}
              className="w-full mt-4 min-h-[52px] rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 text-white font-extrabold text-lg shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 active:scale-95 transition"
            >
              <Check className="w-5 h-5 stroke-[2.5]" />
              <span>I Remember the Rooms!</span>
            </button>
          </div>
        ) : (
          <div className="w-full max-w-md space-y-4">
            {/* Target Item Quiz Banner */}
            {targetObject && (
              <div className="p-4 rounded-3xl bg-[#0B1528] border-2 border-cyan-400/80 text-center shadow-xl">
                <span className="text-5xl block mb-2">{targetObject.icon}</span>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Where was this kept?</span>
                <h3 className="text-xl font-black text-cyan-300 mt-1">
                  {targetObject.name[language] || targetObject.name.en}
                </h3>
              </div>
            )}

            {/* Room Selection Buttons (min 52px target) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {activeRooms.map((room) => {
                const isSelected = selectedRoom === room.id;
                const isCorrect = targetObject?.room === room.id;

                let btnStyle = 'bg-[#0B1528] border-slate-700/80 text-white hover:border-cyan-400/60 hover:bg-[#101D38]';
                if (selectedRoom !== null) {
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
                    key={room.id}
                    type="button"
                    onClick={() => handleSelectRoom(room.id)}
                    disabled={selectedRoom !== null}
                    className={`min-h-[58px] p-3 rounded-2xl border-2 font-bold text-base transition-all flex items-center justify-center gap-2.5 active:scale-95 shadow-md ${btnStyle}`}
                  >
                    <span className="text-2xl">{room.icon}</span>
                    <span>{room.name[language] || room.name.en}</span>
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
