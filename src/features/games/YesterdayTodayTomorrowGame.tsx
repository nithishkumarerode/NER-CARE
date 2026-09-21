import React, { useState, useEffect } from 'react';
import { Language, GameSession } from '../../types';
import { GameShell } from './engine/GameShell';
import { GameSessionResult } from './engine/types';
import { ScoreManager } from './engine/ScoreManager';
import { soundManager } from './engine/SoundManager';
import { adaptiveEngine } from '../../ml/adaptiveEngine';
import { Calendar, Check } from 'lucide-react';

interface YesterdayTodayTomorrowGameProps {
  language: Language;
  onBack: () => void;
  onCompleteSession?: (session: GameSession) => void;
}

type DayType = 'yesterday' | 'today' | 'tomorrow';

interface DayEvent {
  id: string;
  day: DayType;
  title: Record<Language, string>;
  icon: string;
}

const EVENTS_DATABASE: DayEvent[] = [
  // Yesterday
  { id: 'ev_bp', day: 'yesterday', title: { en: 'Blood Pressure Check at Clinic', hi: 'क्लिनिक में बीपी की जांच', as: 'ক্লিনিকত ৰক্তচাপ পৰীক্ষা', bn: 'ক্লিনিকে রক্তচাপ পরীক্ষা', lus: 'Thisen sang check' }, icon: '🩺' },
  { id: 'ev_pots', day: 'yesterday', title: { en: 'Watered Verandah Flowerpots', hi: 'गमलों में पानी दिया', as: 'বাৰাণ্ডাৰ ফুলত পানী দিয়া', bn: 'বারান্দার টবে জল দেওয়া', lus: 'Pangpar tui pek' }, icon: '🪴' },
  { id: 'ev_call', day: 'yesterday', title: { en: 'Phone Call with Grandson Rohan', hi: 'पोते रोहन से फोन पर बात', as: 'নাতি ৰোহনৰ লগত ফোনত কথা', bn: 'নাতি রোহনের সাথে ফোনে কথা', lus: 'Tupa biak' }, icon: '📞' },
  // Today
  { id: 'ev_bazaar', day: 'today', title: { en: 'Buy Fresh Vegetables at Bazaar', hi: 'बाज़ार से ताज़ी सब्ज़ियाँ लाना', as: 'বজাৰৰ পৰা সতেজ শাক-পাচলি অনা', bn: 'বাজার থেকে তাজা শাকসবজি আনা', lus: 'Bazar thlai lei' }, icon: '🥬' },
  { id: 'ev_water', day: 'today', title: { en: 'Drink 6 Glasses of Fresh Water', hi: 'दिन में 6 गिलास पानी पीना', as: 'দিনটোত ৬ গিলাচ বিশুদ্ধ পানী খোৱা', bn: 'দিনে ৬ গ্লাস জল খাওয়া', lus: 'Tui no 6 in' }, icon: '🥛' },
  { id: 'ev_game', day: 'today', title: { en: 'Brain Memory Exercise with Neuro', hi: 'न्यूरो के साथ स्मृति अभ्यास', as: 'নিউৰোৰ সৈতে স্মৃতিৰ অনুশীলন', bn: 'নিউরো-র সাথে ব্রেন গেম খেলা', lus: 'Thluak inzirna' }, icon: '🧠' },
  // Tomorrow
  { id: 'ev_temple', day: 'tomorrow', title: { en: 'Visit Namghar / Temple at 10 AM', hi: 'सुबह 10 बजे मंदिर जाना', as: 'পুৱা ১০ বজাত নামঘৰলৈ যোৱা', bn: 'সকাল ১০টায় মন্দিরে যাওয়া', lus: 'Biakin kal' }, icon: '🛕' },
  { id: 'ev_meds', day: 'tomorrow', title: { en: 'Restock Weekly Heart Medicine', hi: 'साप्ताहिक दवाई लाना', as: 'সপ্তাহৰ হৃদৰোগৰ দৰব অনা', bn: 'সাপ্তাহিক ওষুধ কেনা', lus: 'Damdawi lei' }, icon: '💊' },
  { id: 'ev_walk', day: 'tomorrow', title: { en: 'Evening Walk with Neighbor Ramesh', hi: 'पड़ोसी रमेश के साथ शाम की सैर', as: 'চুবুৰীয়া ৰমেশৰ লগত সন্ধিয়া খোজ কঢ়া', bn: 'প্রতিবেশী রমেশের সাথে সান্ধ্য ভ্রমণ', lus: 'Ṭhiante nen lenharh' }, icon: '🚶‍♂️' },
];

export const YesterdayTodayTomorrowGame: React.FC<YesterdayTodayTomorrowGameProps> = ({
  language,
  onBack,
  onCompleteSession,
}) => {
  const [level, setLevel] = useState<number>(1);
  const [phase, setPhase] = useState<'study' | 'quiz'>('study');
  const [activeEvents, setActiveEvents] = useState<DayEvent[]>([]);
  const [targetEvent, setTargetEvent] = useState<DayEvent | null>(null);
  const [targetDay, setTargetDay] = useState<DayType>('tomorrow');
  const [options, setOptions] = useState<DayEvent[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [attempts, setAttempts] = useState(0);
  const [result, setResult] = useState<GameSessionResult | null>(null);

  const initLevel = (lvl: number) => {
    // Level 1: 3 events (1 each day), Level 2: 4, Level 3: 5, Level 4: 6, Level 5: 7, Level 6: 9
    const countPerDay = lvl <= 2 ? 1 : lvl <= 4 ? 2 : 3;

    const yEvents = EVENTS_DATABASE.filter((e) => e.day === 'yesterday').slice(0, countPerDay);
    const tEvents = EVENTS_DATABASE.filter((e) => e.day === 'today').slice(0, countPerDay);
    const mEvents = EVENTS_DATABASE.filter((e) => e.day === 'tomorrow').slice(0, countPerDay);

    const fullSchedule = [...yEvents, ...tEvents, ...mEvents];
    setActiveEvents(fullSchedule);

    // Pick a random day to quiz on
    const days: DayType[] = ['yesterday', 'today', 'tomorrow'];
    const askDay = days[Math.floor(Math.random() * days.length)];
    setTargetDay(askDay);

    const dayTarget = fullSchedule.find((e) => e.day === askDay)!;
    setTargetEvent(dayTarget);

    // Options: target + 2 distractors from other days
    const otherChoices = fullSchedule.filter((e) => e.id !== dayTarget.id).sort(() => Math.random() - 0.5).slice(0, 2);
    setOptions([dayTarget, ...otherChoices].sort(() => Math.random() - 0.5));

    setPhase('study');
    setSelectedId(null);
    setAttempts(0);
    setResult(null);
    setStartTime(Date.now());
  };

  useEffect(() => {
    initLevel(level);
  }, [level]);

  const handleSelectOption = (eventId: string) => {
    if (selectedId !== null || !targetEvent) return;
    setSelectedId(eventId);

    const isCorrect = eventId === targetEvent.id;
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
        gameId: 'yesterday_today_tomorrow',
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

  const dayNames: Record<DayType, Record<Language, string>> = {
    yesterday: { en: 'Yesterday', hi: 'कल (बीता हुआ)', as: 'যোৱাকালী', bn: 'গতকাল', lus: 'Nimin' },
    today: { en: 'Today', hi: 'आज', as: 'আজি', bn: 'আজ', lus: 'Vawiin' },
    tomorrow: { en: 'Tomorrow', hi: 'कल (आने वाला)', as: 'কাইলৈ', bn: 'আগামীকাল', lus: 'Naktuk' },
  };

  const instructions: Record<Language, string> = {
    en: phase === 'study'
      ? 'Study your activities for Yesterday, Today, and Tomorrow. Tap "Ready" when memorized.'
      : `What was planned for ${dayNames[targetDay][language] || dayNames[targetDay].en}?`,
    hi: phase === 'study'
      ? 'कल, आज और कल की गतिविधियों को याद रखें।'
      : `${dayNames[targetDay][language] || dayNames[targetDay].hi} के लिए क्या योजना थी?`,
    as: phase === 'study'
      ? 'যোৱাকালী, আজি আৰু কাইলৈৰ কামবোৰ মনত ৰাখক।'
      : `${dayNames[targetDay][language] || dayNames[targetDay].as}ৰ বাবে কি কৰিবলগীয়া আছিল?`,
    bn: phase === 'study'
      ? 'গতকাল, আজ ও আগামীকালের কাজের তালিকাটি মনে রাখুন।'
      : `${dayNames[targetDay][language] || dayNames[targetDay].bn}-এর জন্য কী পরিকল্পনা ছিল?`,
    lus: phase === 'study'
      ? 'Nimin, Vawiin leh Naktuk thiltih tur te hi uluk takin en rawh.'
      : `${dayNames[targetDay][language] || dayNames[targetDay].lus} atan engnge ruahman?`,
  };

  return (
    <GameShell
      gameId="yesterday_today_tomorrow"
      title="Yesterday–Today–Tomorrow"
      category="routine"
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
          <div className="w-full max-w-md space-y-3.5">
            {(['yesterday', 'today', 'tomorrow'] as DayType[]).map((day) => {
              const itemsForDay = activeEvents.filter((e) => e.day === day);
              if (itemsForDay.length === 0) return null;

              const badgeColors = {
                yesterday: 'bg-slate-800 text-slate-300 border-slate-600',
                today: 'bg-blue-900/60 text-cyan-300 border-cyan-400/40',
                tomorrow: 'bg-emerald-900/60 text-emerald-300 border-emerald-400/40',
              }[day];

              return (
                <div key={day} className="p-3 rounded-2xl bg-[#0B1528] border border-slate-700/80 shadow">
                  <div className="flex items-center gap-2 mb-2 pb-1 border-b border-slate-800">
                    <span className={`px-2.5 py-0.5 rounded-full border text-xs font-black uppercase ${badgeColors}`}>
                      {dayNames[day][language] || dayNames[day].en}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    {itemsForDay.map((e) => (
                      <div key={e.id} className="flex items-center gap-2.5 text-left text-sm font-semibold text-white">
                        <span className="text-xl">{e.icon}</span>
                        <span>{e.title[language] || e.title.en}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            <button
              type="button"
              onClick={() => setPhase('quiz')}
              className="w-full mt-3 min-h-[52px] rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 text-white font-extrabold text-lg shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 active:scale-95 transition"
            >
              <Check className="w-5 h-5 stroke-[2.5]" />
              <span>I Remember My Schedule!</span>
            </button>
          </div>
        ) : (
          <div className="w-full max-w-md space-y-4">
            <div className="p-4 rounded-3xl bg-[#0B1528] border-2 border-cyan-400/70 text-center shadow-xl">
              <span className="text-4xl block mb-1">📅 ❓</span>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Question:</span>
              <h3 className="text-xl font-black text-cyan-300 mt-1">
                What was planned for {dayNames[targetDay][language] || dayNames[targetDay].en}?
              </h3>
            </div>

            <div className="space-y-2.5">
              {options.map((opt) => {
                const isSelected = selectedId === opt.id;
                const isCorrect = targetEvent?.id === opt.id;

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
                    className={`w-full min-h-[60px] p-3.5 rounded-2xl border-2 font-bold text-base text-left transition-all flex items-center gap-3 active:scale-95 shadow ${btnStyle}`}
                  >
                    <span className="text-3xl">{opt.icon}</span>
                    <span className="flex-1">{opt.title[language] || opt.title.en}</span>
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
