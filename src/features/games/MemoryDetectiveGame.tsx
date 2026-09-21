import React, { useState, useEffect } from 'react';
import { Language, GameSession } from '../../types';
import { GameShell } from './engine/GameShell';
import { GameSessionResult } from './engine/types';
import { ScoreManager } from './engine/ScoreManager';
import { soundManager } from './engine/SoundManager';
import { adaptiveEngine } from '../../ml/adaptiveEngine';
import { Check, Eye, HelpCircle } from 'lucide-react';

interface MemoryDetectiveGameProps {
  language: Language;
  onBack: () => void;
  onCompleteSession?: (session: GameSession) => void;
}

interface DetectiveScenario {
  passage: Record<Language, string>;
  questions: {
    question: Record<Language, string>;
    options: {
      id: string;
      text: Record<Language, string>;
      isCorrect: boolean;
    }[];
    hint: Record<Language, string>;
  }[];
}

const SCENARIOS: Record<number, DetectiveScenario> = {
  1: {
    passage: {
      en: "At 5:00 PM, Arun walked to the village market wearing a blue shirt. He bought 3 red apples and returned home by the green bus.",
      hi: "शाम 5:00 बजे, अरुण नीली कमीज पहनकर गांव के बाजार गया। उसने 3 लाल सेब खरीदे और हरी बस से घर लौटा।",
      bn: "বিকাল ৫:০০ টায় অরুণ নীল শার্ট পরে গ্রামের বাজারে গিয়েছিলেন। তিনি ৩টি লাল আপেল কিনে সবুজ বাসে বাড়ি ফিরে আসেন।",
      as: "আবেলি ৫:০০ বজাত অৰুণে নীলা চোলা পিন্ধি গাঁৱৰ বজাৰলৈ গৈছিল। তেওঁ ৩টা ৰঙা আপেল কিনি সেউজীয়া বাছেৰে ঘৰলৈ উভতি আহিল।",
      lus: "Tlai dar 5:00-ah Arun-a chu kawr pawl ha in khaw dawrah a kal a. Theihai sen 3 leiin bus hringin inah a haw leh a."
    },
    questions: [
      {
        question: {
          en: "What color shirt was Arun wearing?",
          hi: "अरुण ने किस रंग की कमीज पहनी थी?",
          bn: "অরুণ কোন রঙের শার্ট পরেছিলেন?",
          as: "অৰুণে কি ৰঙৰ চোলা পিন্ধিছিল?",
          lus: "Arun-a khan eng rawng kawr nge a hak?"
        },
        options: [
          { id: 'opt_blue', text: { en: 'Blue Shirt', hi: 'नीली कमीज', bn: 'নীল শার্ট', as: 'নীলা চোলা', lus: 'Kawr pawl' }, isCorrect: true },
          { id: 'opt_yellow', text: { en: 'Yellow Shirt', hi: 'पीली कमीज', bn: 'হলুদ শার্ট', as: 'হালধীয়া চোলা', lus: 'Kawr eng' }, isCorrect: false },
          { id: 'opt_white', text: { en: 'White Shirt', hi: 'सफेद कमीज', bn: 'সাদা শার্ট', as: 'বগা চোলা', lus: 'Kawr var' }, isCorrect: false },
        ],
        hint: {
          en: "Think of the sky or ocean color Arun wore.",
          hi: "आकाश या समुद्र के रंग को याद करें।",
          bn: "আকাশের রঙের কথা ভাবুন।",
          as: "আকাশৰ ৰঙৰ কথা মনত পেলাওক।",
          lus: "Van rawng ang kha ngaihtuah rawh."
        }
      }
    ]
  },
  2: {
    passage: {
      en: "Grandmother Mary put on her spectacles at 8:00 AM, went to the herb garden with a wooden basket, and picked fresh mint leaves for morning tea.",
      hi: "दादी मैरी ने सुबह 8:00 बजे अपना चश्मा पहना, लकड़ी की टोकरी लेकर जड़ी-बूटी के बगीचे में गईं, और सुबह की चाय के लिए ताज़ा पुदीने की पत्तियां तोड़ीं।",
      bn: "ঠাকুমা মেরি সকাল ৮:০০ টায় চশমা পরে কাঠের ঝুড়ি নিয়ে ভেষজ বাগানে যান এবং সকালের চায়ের জন্য তাজা পুদিনা পাতা তোলেন।",
      as: "আইতা মেৰীয়ে ৰাতিপুৱা ৮:০০ বজাত চশমা পিন্ধি কাঠৰ পাচি লৈ শাক-পাচলিৰ বাগিচালৈ গৈ পুৱাৰ চাহৰ বাবে সতেজ পুদিনা চিঙিলে।",
      lus: "Pi Mary-i chu zing dar 8:00-ah mitthlaleng vuahin huanah thing bawm kengin a kal a, thingpui atan pudina hnah a lo thlia."
    },
    questions: [
      {
        question: {
          en: "What kind of basket was Grandmother carrying?",
          hi: "दादी कैसी टोकरी ले जा रही थीं?",
          bn: "ঠাকুমা কী ধরণের ঝুড়ি নিয়ে যাচ্ছিলেন?",
          as: "আইতাই কেনেকুৱা পাচি লৈ গৈছিল?",
          lus: "Pi Mary-i khan eng ang bawm nge a ken?"
        },
        options: [
          { id: 'opt_wood', text: { en: 'Wooden Basket', hi: 'लकड़ी की टोकरी', bn: 'কাঠের ঝুড়ি', as: 'কাঠৰ পাচি', lus: 'Thing bawm' }, isCorrect: true },
          { id: 'opt_plastic', text: { en: 'Plastic Bag', hi: 'प्लास्टिक की थैली', bn: 'প্লাস্টিকের ব্যাগ', as: 'প্লাষ্টিকৰ বেগ', lus: 'Plastik bag' }, isCorrect: false },
          { id: 'opt_steel', text: { en: 'Steel Bowl', hi: 'स्टील का कटोरा', bn: 'স্টিল বাটি', as: 'ষ্টিলৰ বাটি', lus: 'Thir thleng' }, isCorrect: false },
        ],
        hint: {
          en: "It was crafted from wood.",
          hi: "यह लकड़ी से बनी थी।",
          bn: "এটি কাঠ দিয়ে তৈরি ছিল।",
          as: "ই কাঠৰে তৈয়াৰী আছিল।",
          lus: "Thing hmanga siam a ni."
        }
      }
    ]
  },
  3: {
    passage: {
      en: "Uncle Tashi rode his yellow bicycle across the bamboo suspension bridge at 2:00 PM to collect eye drops from Dr. Laltha's clinic.",
      hi: "चाचा ताशी दोपहर 2:00 बजे अपनी पीली साइकिल से बांस के झूला पुल को पार कर गए और डॉ. लालथा से आंखों की दवा लाए।",
      bn: "কাকা তাশি দুপুর ২:০০ টায় তাঁর হলুদ সাইকেল চালিয়ে বাঁশের ঝুলন্ত সেতু পার হয়ে চোখের ড্রপ আনতে ক্লিনিকে যান।",
      as: "খুড়া তাশিয়ে দুপৰীয়া ২:০০ বজাত তেওঁৰ হালধীয়া চাইকেলেৰে বাঁহৰ দলংখন পাৰ হৈ চকুৰ ঔষধ আনিবলৈ ক্লিনিকলৈ গৈছিল।",
      lus: "Pu Tashi-a chuan chhun dar 2:00-ah a thir bicycle eng khalh in mau lei a zawh a, mit damdawi a la."
    },
    questions: [
      {
        question: {
          en: "What was the bridge made of?",
          hi: "पुल किस चीज़ से बना था?",
          bn: "সেতুটি কী দিয়ে তৈরি ছিল?",
          as: "দলংখন কিহেৰে তৈয়াৰী আছিল?",
          lus: "Lei chu eng hmanga siam nge?"
        },
        options: [
          { id: 'opt_bamboo', text: { en: 'Bamboo', hi: 'बांस', bn: 'বাঁশ', as: 'বাঁহ', lus: 'Mau' }, isCorrect: true },
          { id: 'opt_stone', text: { en: 'Stone', hi: 'पत्थर', bn: 'পাথর', as: 'শিল', lus: 'Lung' }, isCorrect: false },
          { id: 'opt_iron', text: { en: 'Iron cable', hi: 'लोहे के तार', bn: 'লোহার তার', as: 'লোৰ তাঁৰ', lus: 'Thir hrui' }, isCorrect: false },
        ],
        hint: {
          en: "Traditional North-Eastern bamboo.",
          hi: "पूर्वोत्तर का पारंपरिक बांस।",
          bn: "ঐতিহ্যবাহী উত্তর-পূর্বের বাঁশ।",
          as: "পৰম্পৰাগত বাঁহ।",
          lus: "Hmarchhak mau hman lar."
        }
      }
    ]
  },
  4: {
    passage: {
      en: "Farmer Bora and his daughter Rupa went to the paddy field on Tuesday. Bora wore a conical Japi hat. Rupa carried warm tea and pitha cakes in her tiffin.",
      hi: "किसान बोरा और उनकी बेटी रूपा मंगलवार को धान के खेत में गए। बोरा ने जापी टोपी पहनी थी और रूपा टिफिन में गर्म चाय और पीठा लाई थी।",
      bn: "কৃষক বরা ও কন্যা রূপা মঙ্গলবার ধানখেতে যান। বরা জাপি টুপি পরেছিলেন। রূপা টিফিনে চা ও পিঠে এনেছিলেন।",
      as: "কৃষক বৰা আৰু জীয়ৰী ৰূপা মঙলবাৰে পথাৰলৈ গৈছিল। বৰাই জাপি পিন্ধিছিল আৰু ৰূপাই টিফিনত চাহ আৰু পিঠা আনিছিল।",
      lus: "Farmer Bora leh a fanu Rupa-i chu Thawhlehni ah buh hmunah an kal a. Bora-an Japi lukhum a khum a, Rupa-in pitha a keng."
    },
    questions: [
      {
        question: {
          en: "What snack did Rupa bring in her tiffin?",
          hi: "रूपा अपने टिफिन में क्या नाश्ता लाई थी?",
          bn: "রূপা তাঁর টিফিনে কী খাবার এনেছিলেন?",
          as: "ৰূপাই টিফিনত কি জলপান আনিছিল?",
          lus: "Rupa-in tiffin-ah eng chhang nge a ken?"
        },
        options: [
          { id: 'opt_pitha', text: { en: 'Pitha Cakes', hi: 'पीठा', bn: 'পিঠে', as: 'পিঠা', lus: 'Pitha' }, isCorrect: true },
          { id: 'opt_biscuit', text: { en: 'Biscuits', hi: 'बिस्कुट', bn: 'বিস্কুট', as: 'বিস্কুট', lus: 'Biskut' }, isCorrect: false },
          { id: 'opt_bread', text: { en: 'Bread', hi: 'ब्रेड', bn: 'পাউরুটি', as: 'ৰুটী', lus: 'Chhang' }, isCorrect: false },
        ],
        hint: {
          en: "Traditional rice sweet cake.",
          hi: "चावल का पारंपरिक पीठा।",
          bn: "ঐতিহ্যবাহী চালের পিঠে।",
          as: "সুস্বাদু পিঠা।",
          lus: "Buhfai pitha."
        }
      }
    ]
  },
  5: {
    passage: {
      en: "On Sunday afternoon, teacher Lalita caught the 3:15 train to Silchar with her red leather purse. Sitting beside her was Master Ziona, who carried a new wooden flute for his grandson.",
      hi: "रविवार दोपहर, शिक्षिका ललिता लाल पर्स लेकर सिलचर के लिए 3:15 की ट्रेन में बैठीं। उनके पास मास्टर ज़िओना अपने पोते के लिए नई लकड़ी की बांसुरी लिए बैठे थे।",
      bn: "রবিবার দুপুরে শিক্ষিকা ললিতা লাল পার্স নিয়ে ৩:১৫ এর শিলচর ট্রেনে উঠলেন। পাশে মাস্টার জিওনা নাতির জন্য কাঠের বাঁশি নিয়ে বসেছিলেন।",
      as: "দেওবাৰে শিক্ষয়িত্ৰী ললিতাই ৰঙা বেগ লৈ ৩:১৫ বজাৰ শিলচৰ ৰে'লত উঠিল। ওচৰতে মাষ্টাৰ জিওনাই নাতিয়েকৰ বাবে বাঁহী লৈ বহিছিল।",
      lus: "Pathianni chawhnuah zirtirtu Lalita-i purse sen kengin dar 3:15 Silchar rel-ah a chuang a. Master Ziona-an thing tawtawrawt a keng."
    },
    questions: [
      {
        question: {
          en: "Where was teacher Lalita traveling to?",
          hi: "शिक्षिका ललिता कहाँ की यात्रा कर रही थीं?",
          bn: "শিক্ষিকা ললিতা কোথায় যাচ্ছিলেন?",
          as: "শিক্ষয়িত্ৰী ললিতা ক'লৈ গৈছিল?",
          lus: "Lalita-i kha khawiah nge a kal dawn?"
        },
        options: [
          { id: 'opt_silchar', text: { en: 'Silchar', hi: 'सिलचर', bn: 'শিলচর', as: 'শিলচৰ', lus: 'Silchar' }, isCorrect: true },
          { id: 'opt_guwahati', text: { en: 'Guwahati', hi: 'गुवाहाटी', bn: 'গুয়াহাটি', as: 'গুৱাহাটী', lus: 'Guwahati' }, isCorrect: false },
          { id: 'opt_aizawl', text: { en: 'Aizawl', hi: 'आइजोल', bn: 'আইজল', as: 'আইজল', lus: 'Aizawl' }, isCorrect: false },
        ],
        hint: {
          en: "The historic Barak Valley city.",
          hi: "बराक घाटी का शहर सिलचर।",
          bn: "বরাক উপত্যকার শহর শিলচর।",
          as: "বৰাকৰ চহৰ শিলচৰ।",
          lus: "Silchar khawpui."
        }
      }
    ]
  },
  6: {
    passage: {
      en: "At Champhai autumn fair, artisan Sangpuia displayed 12 handwoven shawls. At 4:30 PM, retired nurse Pari visited carrying an indigo umbrella. She purchased 2 chevron shawls and gifted him ginger cookies before rain fell at 5:00 PM.",
      hi: "चम्फाई मेले में सांगपुइया ने 12 शॉल प्रदर्शित किए। शाम 4:30 बजे नर्स परी नीले छाते के साथ आईं। उन्होंने 2 शॉल खरीदे और 5:00 बजे बारिश से पहले अदरक कुकीज़ भेंट कीं।",
      bn: "চাম্ফাই মেলায় সাংপুইয়া ১২টি শাল দেখান। বিকেল ৪:৩০ এ নার্স পারি নীল ছাতা নিয়ে এসে ২টি শাল কেনেন এবং ৫:০০ টায় বৃষ্টির আগে আদা কুকিজ উপহার দেন।",
      as: "চাম্ফাই মেলাত চাংপুইয়াই ১২ খন চাদৰ দেখুৱালে। আবেলি ৪:৩০ বজাত নাৰ্ছ পাৰিয়ে দুখন চাদৰ কিনিলে আৰু ৫:০০ বজাত বৰষুণৰ আগতে আদা বিস্কুট উপহাৰ দিলে।",
      lus: "Champhai kut-ah Sangpuia chuan puanthem 12 a pho a. Tlai dar 4:30-ah nurse Pari-in puanthem 2 a lei a, dar 5:00 ruah sur hmain ginger biskut a pe."
    },
    questions: [
      {
        question: {
          en: "What thoughtful gift did nurse Pari give to Sangpuia?",
          hi: "नर्स परी ने सांगपुइया को क्या उपहार दिया?",
          bn: "নার্স পারি সাংপুইয়াকে কী উপহার দিয়েছিলেন?",
          as: "পাৰিয়ে চাংপুইয়াক কি উপহাৰ দিলে?",
          lus: "Pari-in Sangpuia eng nge a pek?"
        },
        options: [
          { id: 'opt_cookies', text: { en: 'Ginger Cookies', hi: 'अदरक कुकीज़', bn: 'আদা কুকিজ', as: 'আদা বিস্কুট', lus: 'Ginger biskut' }, isCorrect: true },
          { id: 'opt_apples', text: { en: 'Apples', hi: 'सेब', bn: 'আপেল', as: 'আপেল', lus: 'Theihai' }, isCorrect: false },
          { id: 'opt_tea', text: { en: 'Tea Leaves', hi: 'चाय पत्ती', bn: 'চা পাতা', as: 'চাহ পাত', lus: 'Thingpui hnah' }, isCorrect: false },
        ],
        hint: {
          en: "Homemade warm ginger cookies.",
          hi: "घर की बनी अदरक की कुकीज़।",
          bn: "ঘরোয়া আদা কুকিজ।",
          as: "ঘৰুৱা আদা বিস্কুট।",
          lus: "In a siam ginger biskut."
        }
      }
    ]
  }
};

export const MemoryDetectiveGame: React.FC<MemoryDetectiveGameProps> = ({
  language,
  onBack,
  onCompleteSession,
}) => {
  const [level, setLevel] = useState<number>(1);
  const [phase, setPhase] = useState<'study' | 'quiz'>('study');
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [result, setResult] = useState<GameSessionResult | null>(null);
  const [showHint, setShowHint] = useState<boolean>(false);

  const scenario = SCENARIOS[level] || SCENARIOS[1];
  const questionObj = scenario.questions[0];

  useEffect(() => {
    initLevel(level);
  }, [level]);

  const initLevel = (lvl: number) => {
    setPhase('study');
    setSelectedOptionId(null);
    setShowHint(false);
    setResult(null);
    setStartTime(Date.now());
    soundManager.playTone(523.25, 0.15, 'sine', 0.12);
  };

  const handleSelectOption = (optId: string) => {
    if (selectedOptionId !== null || result) return;
    setSelectedOptionId(optId);

    const chosen = questionObj.options.find(o => o.id === optId);
    const isCorrect = chosen?.isCorrect ?? false;

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
        gameId: 'memory_detective',
        level,
        correctAnswers: isCorrect ? 1 : 0,
        totalQuestions: 1,
        attempts: 1,
        startTime,
        adaptiveLevel: adaptive.newLevel,
      });

      setResult(res);
    }, 800);
  };

  const instructions: Record<Language, string> = {
    en: phase === 'study'
      ? 'Read the short case carefully and remember key details like colors, names, and times.'
      : 'Now select the correct deduction based on what you read.',
    hi: phase === 'study'
      ? 'कहानी को ध्यान से पढ़ें और रंग, नाम, समय जैसे विवरण याद रखें।'
      : 'अब प्रश्न का सही उत्तर चुनें।',
    as: phase === 'study'
      ? 'ঘটনাটো মন দি পঢ়ক আৰু ৰং, নাম, সময় আদি কথা মনত ৰাখক।'
      : 'এতিয়া প্ৰশ্নটোৰ সঠিক উত্তৰ বাছি লওক।',
    bn: phase === 'study'
      ? 'ঘটনাটি মন দিয়ে পড়ুন এবং রঙ, নাম, সময় ইত্যাদি মনে রাখুন।'
      : 'এখন প্রশ্নের সঠিক উত্তর নির্বাচন করুন।',
    lus: phase === 'study'
      ? 'Chanchin tawi hi ngun takin chhiar la, thil rawng, hming, hun te hre reng rawh.'
      : 'Zawhna hnuaiah chhanna dik ber thlang rawh.',
  };

  return (
    <GameShell
      gameId="memory_detective"
      title="Memory Detective"
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
      <div className="w-full flex flex-col items-center select-none py-2">
        {phase === 'study' ? (
          <div className="w-full max-w-xl bg-white/90 dark:bg-slate-900/90 border-2 border-indigo-400/40 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col items-center text-center animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-200 text-xs font-black uppercase tracking-wider mb-4">
              <span>🕵️</span>
              <span>Case File • Level {level}</span>
            </div>

            <div className="bg-amber-50/80 dark:bg-slate-800/80 border border-amber-200 dark:border-slate-700 rounded-2xl p-6 text-gray-800 dark:text-slate-100 text-lg sm:text-xl font-medium leading-relaxed my-2 shadow-inner text-left w-full">
              <span className="text-3xl font-serif text-amber-700 mr-2">"</span>
              {scenario.passage[language]}
              <span className="text-3xl font-serif text-amber-700 ml-2">"</span>
            </div>

            <button
              onClick={() => {
                soundManager.playTone(440, 0.1, 'sine', 0.1);
                setPhase('quiz');
              }}
              className="mt-6 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl font-bold text-lg shadow-lg active:scale-95 transition-all flex items-center gap-2"
            >
              <Eye className="w-5 h-5" />
              <span>{language === 'hi' ? 'मैं उत्तर देने के लिए तैयार हूँ →' : language === 'as' ? 'মই উত্তৰ দিবলৈ সাজু →' : language === 'bn' ? 'আমি উত্তর দিতে প্রস্তুত →' : language === 'lus' ? 'Chhan ka inpeih e →' : 'I am Ready to Answer →'}</span>
            </button>
          </div>
        ) : (
          <div className="w-full max-w-xl bg-white/95 dark:bg-slate-900/95 border-2 border-indigo-400/40 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col items-center animate-fade-in">
            <div className="w-full flex items-center justify-between text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400 mb-4">
              <span>Investigation Clue</span>
              <button
                onClick={() => {
                  soundManager.playTone(392, 0.1, 'sine', 0.1);
                  setShowHint(prev => !prev);
                }}
                className="text-amber-600 dark:text-amber-400 font-bold hover:underline flex items-center gap-1"
              >
                <HelpCircle className="w-4 h-4" />
                <span>{showHint ? 'Hide Clue' : 'View Clue'}</span>
              </button>
            </div>

            {showHint && (
              <div className="w-full bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 rounded-xl p-3 text-amber-900 dark:text-amber-200 text-sm mb-4">
                <strong>Clue:</strong> {questionObj.hint[language]}
              </div>
            )}

            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white text-center mb-6">
              {questionObj.question[language]}
            </h3>

            <div className="grid grid-cols-1 gap-3.5 w-full">
              {questionObj.options.map(opt => {
                const isSelected = selectedOptionId === opt.id;
                let btnStyle = "bg-indigo-50/70 dark:bg-slate-800 text-gray-800 dark:text-slate-100 border-indigo-200 dark:border-slate-700 hover:border-indigo-400";
                if (isSelected) {
                  btnStyle = opt.isCorrect
                    ? "bg-emerald-600 text-white border-emerald-500 scale-[1.02]"
                    : "bg-rose-600 text-white border-rose-500";
                }

                return (
                  <button
                    key={opt.id}
                    onClick={() => handleSelectOption(opt.id)}
                    className={`w-full p-4 rounded-2xl text-base sm:text-lg font-bold border-2 transition-all shadow-sm active:scale-95 flex items-center justify-between px-6 min-h-[60px] ${btnStyle}`}
                  >
                    <span>{opt.text[language]}</span>
                    {isSelected && opt.isCorrect && <Check className="w-6 h-6 text-white" />}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => {
                soundManager.playTone(392, 0.1, 'sine', 0.1);
                setPhase('study');
              }}
              className="mt-6 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              ← Read story again
            </button>
          </div>
        )}
      </div>
    </GameShell>
  );
};
