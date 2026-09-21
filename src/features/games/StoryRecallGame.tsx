import React, { useState, useEffect } from 'react';
import { Language, GameSession } from '../../types';
import { GameShell } from './engine/GameShell';
import { GameSessionResult } from './engine/types';
import { ScoreManager } from './engine/ScoreManager';
import { soundManager } from './engine/SoundManager';
import { adaptiveEngine } from '../../ml/adaptiveEngine';
import { voiceService } from '../../services/voiceService';
import { Check, Mic, Volume2 } from 'lucide-react';

interface StoryRecallGameProps {
  language: Language;
  onBack: () => void;
  onCompleteSession?: (session: GameSession) => void;
}

interface StoryData {
  title: Record<Language, string>;
  narrative: Record<Language, string>;
  question: Record<Language, string>;
  options: {
    id: string;
    text: Record<Language, string>;
    isCorrect: boolean;
  }[];
}

const STORIES: StoryData[] = [
  // Story 1 (Level 1)
  {
    title: { en: 'Grandpa’s Morning Tea', hi: 'दादाजी की सुबह की चाय', as: 'ককাৰ ৰাতিপুৱাৰ চাহ', bn: 'দাদুর সকালের চা', lus: 'Pu-a Zing Thingpui' },
    narrative: {
      en: 'This morning, Grandpa Bhaben went to the banyan tree tea stall. He met his friend Ramesh and drank hot ginger tea from a red cup.',
      hi: 'आज सुबह दादाजी भाबेन बरगद के पेड़ वाली चाय की दुकान पर गए। वे अपने मित्र रमेश से मिले और लाल कप में अदरक वाली गर्म चाय पी।',
      as: 'আজি পুৱা ককা ভবেনে বট গছৰ তলৰ চাহৰ দোকানলৈ গৈছিল। তেওঁ বন্ধু ৰমেশক লগ পালে আৰু ৰঙা কাপত আদা চাহ খালে।',
      bn: 'আজ সকালে দাদু বটগাছের নিচের চায়ের দোকানে গেলেন। তিনি বন্ধু রমেশের সাথে দেখা করে লাল কাপে গরম আদা চা খেলেন।',
      lus: 'Tukin chu Pu Bhabena thingpui dawrah a kal a, a ṭhian Ramesha a hmu a, no sen-ah thingpui a in.',
    },
    question: {
      en: 'What color was the cup Grandpa drank tea from?',
      hi: 'दादाजी ने किस रंग के कप में चाय पी?',
      as: 'ককাই কোন ৰঙৰ কাপত চাহ খাইছিল?',
      bn: 'দাদু কোন রঙের কাপে চা খেলেন?',
      lus: 'Eng rawng no-ah nge Pu Bhabena khan thingpui a in?',
    },
    options: [
      { id: 'opt_red', text: { en: 'Red Cup', hi: 'लाल कप', as: 'ৰঙা কাপ', bn: 'লাল কাপ', lus: 'No Sen' }, isCorrect: true },
      { id: 'opt_blue', text: { en: 'Blue Cup', hi: 'नीला कप', as: 'নীলা কাপ', bn: 'নীল কাপ', lus: 'No Pawl' }, isCorrect: false },
      { id: 'opt_yellow', text: { en: 'Yellow Cup', hi: 'पीला कप', as: 'Halodhiya Kap', bn: 'হলুদ কাপ', lus: 'No Eng' }, isCorrect: false },
    ],
  },
  // Story 2 (Level 2)
  {
    title: { en: 'Grandma’s Garden Bloom', hi: 'दादी का सुंदर बगीचा', as: 'আইতাৰ সুন্দৰ ফুলবাৰী', bn: 'দিদিমার সুন্দর বাগান', lus: 'Pi Huan Mawite' },
    narrative: {
      en: 'Grandmother Kalyani watered her yellow marigold plants at 8 AM. Her granddaughter Priya brought her a glass of cool lemon water.',
      hi: 'दादी कल्याणी ने सुबह 8 बजे गेंदे के पीले फूलों को पानी दिया। उनकी पोती प्रिया उनके लिए नींबू का ठंडा पानी लाई।',
      as: 'আইতা কল্যাণীয়ে পুৱা ৮ বজাত হালধীয়া গেন্ধাই ফুলত পানী দিছিল। নাতিনী প্ৰিয়াই তেওঁৰ বাবে এগিলাচ টেঙা পানী আনিলে।',
      bn: 'দিদিমা কল্যাণী সকাল ৮টায় হলুদ গাঁদা গাছে জল দিচ্ছিলেন। নাতনি প্রিয়া তাঁর জন্য ঠান্ডা লেবুর জল নিয়ে এল।',
      lus: 'Pi Kalyani-i chu zing dar 8-ah a pangpar huana pangpar tui a pe a. A tupa Priya-in tui vawt a rawn pe a ni.',
    },
    question: {
      en: 'What did granddaughter Priya bring for Grandma?',
      hi: 'पोती प्रिया दादी के लिए क्या लेकर आई?',
      as: 'নাতিনী প্ৰিয়াই আইতাৰ বাবে কি আনিছিল?',
      bn: 'নাতনি প্রিয়া দিদিমার জন্য কী নিয়ে এসেছিল?',
      lus: 'Priya-in a pi tan engnge a rawn ken?',
    },
    options: [
      { id: 'opt_lemon', text: { en: 'Cool Lemon Water', hi: 'ठंडा नींबू पानी', as: 'টেঙা পানী', bn: 'ঠান্ডা লেবুর জল', lus: 'Nimbu tui vawt' }, isCorrect: true },
      { id: 'opt_milk', text: { en: 'Warm Milk', hi: 'गर्म दूध', as: 'গৰম গাখীৰ', bn: 'গরম দুধ', lus: 'Bawnghnute lum' }, isCorrect: false },
      { id: 'opt_coconut', text: { en: 'Sweet Coconut', hi: 'नारियल पानी', as: 'নাৰিকল পানী', bn: 'ডাবের জল', lus: 'Dap tui' }, isCorrect: false },
    ],
  },
  // Story 3 (Level 3-4)
  {
    title: { en: 'Trip to the Weekly Bazaar', hi: 'साप्ताहिक हाट की यात्रा', as: 'সাপ্তাহিক বজাৰৰ যাত্ৰা', bn: 'সাপ্তাহিক হাটের সফর', lus: 'Bazar Kalna' },
    narrative: {
      en: 'On Sunday afternoon, uncle Pranab rode his bicycle to the river ghat. He met fisherman Dhiren and bought two fresh fish wrapped in banana leaves.',
      hi: 'रविवार दोपहर, प्रणब चाचा साइकिल से नदी घाट गए। वे मछुआरे धीरेन से मिले और केले के पत्तों में लिपटी दो ताज़ी मछलियाँ खरीदीं।',
      as: 'দেওবাৰে দুপৰীয়া প্ৰণব খুড়াই চাইকেলেৰে নদীৰ ঘাটলৈ গৈছিল। তেওঁ ধীৰেন মাছমৰীয়াক লগ পালে আৰু কলপাতত বান্ধি দুটা মাছ কিনিলে।',
      bn: 'রবিবার দুপুরে প্রণববাবু সাইকেল চেপে নদীর ঘাটে গেলেন। তিনি ধীরেন জেলের সাথে দেখা করে কলাপাতায় মোড়া দুটি তাজা মাছ কিনলেন।',
      lus: 'Pathianni chawhnu-ah Pranab-a chu lui kamah a kal a. Nghakuai chhuah Dhirena a hmu a, sangha pahnih hnah-a tuam a lei a ni.',
    },
    question: {
      en: 'How were the fresh fish wrapped?',
      hi: 'ताज़ी मछलियाँ किसमें लिपटी हुई थीं?',
      as: 'মাছকেইটা কিহত বন্ধা আছিল?',
      bn: 'তাজা মাছদুটি কীসে মোড়ানো ছিল?',
      lus: 'Sangha chu eng hnah-ah nge an tuam?',
    },
    options: [
      { id: 'opt_banana', text: { en: 'Banana Leaves', hi: 'केले के पत्ते', as: 'কলপাতত', bn: 'কলাপাতায়', lus: 'Hnah zangah' }, isCorrect: true },
      { id: 'opt_paper', text: { en: 'Old Newspaper', hi: 'समाचार पत्र', as: 'বাতৰিকাকতত', bn: 'খবরের কাগজে', lus: 'Chanchinbuah' }, isCorrect: false },
      { id: 'opt_cloth', text: { en: 'Cotton Cloth', hi: 'सूती कपड़ा', as: 'সুতাৰ কাপোৰত', bn: 'সুতির কাপড়ে', lus: 'Puan-ah' }, isCorrect: false },
    ],
  },
  // Story 4 (Level 5-6)
  {
    title: { en: 'The Festive Autumn Eve', hi: 'शरद ऋतु की शाम', as: 'শৰতৰ সোণালী সন্ধিয়া', bn: 'শরতের মনোরম সন্ধ্যা', lus: 'Fur Zan Thlifim' },
    narrative: {
      en: 'During the harvest festival, Arun wore his hand-woven white Kurta. At 6 PM, he walked with his bamboo cane to the village Namghar to light evening earthen lamps with his sister Mina.',
      hi: 'फसल उत्सव के दौरान अरुण ने हाथ से बुना सफेद कुर्ता पहना था। शाम 6 बजे वे अपनी बांस की छड़ी लेकर बहन मीना के साथ दीये जलाने नामघर गए।',
      as: 'উৎসৱৰ সময়ত অৰুণে হাতে বোৱা বগা কুৰ্তা পিন্ধিছিল। সন্ধিয়া ৬ বজাত তেওঁ বাঁহৰ লাখুটি লৈ ভনীয়েক মীনাৰ সৈতে নামঘৰত বন্তি জ্বলাবলৈ গৈছিল।',
      bn: 'উৎসবের সন্ধ্যায় অরুণবাবু হাতে বোনা সাদা কুর্তা পরেছিলেন। সন্ধ্যে ৬টায় তিনি বাঁশের লাঠি নিয়ে বোন মীনার সাথে প্রদীপ জ্বালাতে নামঘরে গিয়েছিলেন।',
      lus: 'Kut laia Arun-a chuan kawr var a ha a. Tlaiah a farnu Mina-i nen biakin-ah khawnvar chhi turin an kal a ni.',
    },
    question: {
      en: 'What time did Arun walk to light the evening lamps?',
      hi: 'अरुण दीये जलाने किस समय गए थे?',
      as: 'অৰুণে কিমান বজাত বন্তি জ্বলাবলৈ গৈছিল?',
      bn: 'অরুণবাবু ক’টার সময় প্রদীপ জ্বালাতে গিয়েছিলেন?',
      lus: 'Engtik hunah nge khawnvar chhi tura an kal?',
    },
    options: [
      { id: 'opt_6pm', text: { en: '6:00 PM Evening', hi: 'शाम 6:00 बजे', as: 'সন্ধিয়া ৬:০০ বজাত', bn: 'সন্ধ্যা ৬:০০ টায়', lus: 'Tlai dar 6:00' }, isCorrect: true },
      { id: 'opt_4pm', text: { en: '4:00 PM Afternoon', hi: 'दोपहर 4:00 बजे', as: 'দুপৰীয়া ৪:০০ বজাত', bn: 'বিকাল ৪:০০ টায়', lus: 'Chawhnu dar 4:00' }, isCorrect: false },
      { id: 'opt_8pm', text: { en: '8:00 PM Night', hi: 'रात 8:00 बजे', as: 'ৰাতি ৮:০০ বজাত', bn: 'রাত ৮:০০ টায়', lus: 'Zan dar 8:00' }, isCorrect: false },
    ],
  },
];

export const StoryRecallGame: React.FC<StoryRecallGameProps> = ({
  language,
  onBack,
  onCompleteSession,
}) => {
  const [level, setLevel] = useState<number>(1);
  const [phase, setPhase] = useState<'listen' | 'quiz'>('listen');
  const [currentStory, setCurrentStory] = useState<StoryData>(STORIES[0]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isReadingAloud, setIsReadingAloud] = useState(false);
  const [isVoiceListening, setIsVoiceListening] = useState(false);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [attempts, setAttempts] = useState(0);
  const [result, setResult] = useState<GameSessionResult | null>(null);

  const initLevel = (lvl: number) => {
    const idx = Math.min(STORIES.length - 1, Math.floor((lvl - 1) / 1.5));
    const story = STORIES[idx];
    setCurrentStory(story);
    setPhase('listen');
    setSelectedId(null);
    setAttempts(0);
    setResult(null);
    setStartTime(Date.now());
  };

  useEffect(() => {
    initLevel(level);
  }, [level]);

  const handleReadAloudStory = () => {
    if (isReadingAloud) return;
    setIsReadingAloud(true);
    voiceService.speak(currentStory.narrative[language] || currentStory.narrative.en, language).then(() => {
      setIsReadingAloud(false);
    });
  };

  const handleSelectOption = (optId: string) => {
    if (selectedId !== null) return;
    setSelectedId(optId);

    const chosen = currentStory.options.find((o) => o.id === optId);
    const isCorrect = chosen?.isCorrect || false;
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
        gameId: 'story_recall',
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

  const handleVoiceAnswer = () => {
    if (isVoiceListening) return;
    setIsVoiceListening(true);
    voiceService.listenOnce(
      (text) => {
        setIsVoiceListening(false);
        const clean = text.toLowerCase();
        // Match spoken phrase against option texts
        const matched = currentStory.options.find((opt) => {
          const optText = (opt.text[language] || opt.text.en).toLowerCase();
          return clean.includes(optText) || optText.includes(clean);
        });
        if (matched) {
          handleSelectOption(matched.id);
        } else {
          // If spoke first option keyword
          handleSelectOption(currentStory.options[0].id);
        }
      },
      () => setIsVoiceListening(false),
      () => setIsVoiceListening(false)
    );
  };

  const instructions: Record<Language, string> = {
    en: phase === 'listen'
      ? 'Read or listen to this heartwarming folk story. Tap "Ready" to test your recall.'
      : currentStory.question[language] || currentStory.question.en,
    hi: phase === 'listen'
      ? 'इस सुंदर कहानी को पढ़ें या सुनें। याद होने पर "तैयार" पर स्पर्श करें।'
      : currentStory.question[language] || currentStory.question.hi,
    as: phase === 'listen'
      ? 'এই সুন্দৰ সাধুটো পঢ়ক বা শুনক। মনত ৰাখি "মই সাজু" টিপক।'
      : currentStory.question[language] || currentStory.question.as,
    bn: phase === 'listen'
      ? 'সুন্দর গল্পটি পড়ুন বা শুনুন। তৈরি হলে "প্রস্তুত" চাপুন।'
      : currentStory.question[language] || currentStory.question.bn,
    lus: phase === 'listen'
      ? 'Thawnthu tawi hi chhiar emaw ngaithla rawh. Inpeih hunah "Ka inpeih" hmet rawh.'
      : currentStory.question[language] || currentStory.question.lus,
  };

  return (
    <GameShell
      gameId="story_recall"
      title="Story Recall"
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
        {phase === 'listen' ? (
          <div className="w-full max-w-md space-y-4">
            <div className="p-5 rounded-3xl bg-[#0B1528] border-2 border-cyan-400/40 shadow-xl space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-sm font-black text-cyan-300 uppercase tracking-wide">
                  {currentStory.title[language] || currentStory.title.en}
                </span>
                <button
                  type="button"
                  onClick={handleReadAloudStory}
                  className={`p-2 rounded-xl border flex items-center gap-1.5 transition active:scale-95 ${
                    isReadingAloud
                      ? 'bg-cyan-500 text-slate-950 border-cyan-300 animate-pulse'
                      : 'bg-blue-600/30 border-blue-400/40 text-cyan-300 hover:bg-blue-600/50'
                  }`}
                  aria-label="Listen to narration"
                >
                  <Volume2 className="w-4 h-4" />
                  <span className="text-xs font-bold">Narrate</span>
                </button>
              </div>

              <p className="text-base sm:text-lg font-medium text-slate-100 leading-relaxed text-left">
                "{currentStory.narrative[language] || currentStory.narrative.en}"
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                voiceService.stopSpeaking();
                setPhase('quiz');
              }}
              className="w-full mt-3 min-h-[52px] rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 text-white font-extrabold text-lg shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 active:scale-95 transition"
            >
              <Check className="w-5 h-5 stroke-[2.5]" />
              <span>I Remember the Story!</span>
            </button>
          </div>
        ) : (
          <div className="w-full max-w-md space-y-4">
            {/* Question Banner */}
            <div className="p-4 rounded-3xl bg-[#0B1528] border-2 border-cyan-400/70 text-center shadow-xl">
              <span className="text-3xl block mb-1">📖 ❓</span>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Recall Question:</span>
              <h3 className="text-lg sm:text-xl font-black text-cyan-300 mt-1">
                {currentStory.question[language] || currentStory.question.en}
              </h3>
            </div>

            {/* Answer Options */}
            <div className="space-y-2.5">
              {currentStory.options.map((opt) => {
                const isSelected = selectedId === opt.id;
                let btnStyle = 'bg-[#0B1528] border-slate-700/80 text-white hover:border-cyan-400/60 hover:bg-[#101D38]';
                if (selectedId !== null) {
                  if (isSelected) {
                    btnStyle = opt.isCorrect
                      ? 'bg-emerald-900/80 border-emerald-400 text-emerald-200 ring-2 ring-emerald-300'
                      : 'bg-rose-900/80 border-rose-400 text-rose-200 ring-2 ring-rose-300';
                  } else if (opt.isCorrect) {
                    btnStyle = 'bg-emerald-900/50 border-emerald-500 text-emerald-200';
                  }
                }

                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleSelectOption(opt.id)}
                    disabled={selectedId !== null}
                    className={`w-full min-h-[56px] p-3.5 rounded-2xl border-2 font-bold text-base text-left transition-all flex items-center justify-between active:scale-95 shadow-md ${btnStyle}`}
                  >
                    <span>{opt.text[language] || opt.text.en}</span>
                    {selectedId !== null && opt.isCorrect && <Check className="w-5 h-5 text-emerald-300" />}
                  </button>
                );
              })}
            </div>

            {/* Voice Answer Option Button */}
            <button
              type="button"
              onClick={handleVoiceAnswer}
              disabled={selectedId !== null}
              className={`w-full py-3 rounded-2xl border flex items-center justify-center gap-2 transition ${
                isVoiceListening
                  ? 'bg-cyan-500 text-slate-950 border-cyan-300 animate-pulse font-bold'
                  : 'bg-slate-800/80 border-slate-600 text-cyan-300 hover:bg-slate-700'
              }`}
            >
              <Mic className="w-4 h-4" />
              <span className="text-sm font-semibold">
                {isVoiceListening ? 'Listening... Speak your answer' : '🎙️ Speak Your Answer'}
              </span>
            </button>
          </div>
        )}
      </div>
    </GameShell>
  );
};
