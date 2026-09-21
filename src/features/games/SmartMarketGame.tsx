import React, { useState, useEffect } from 'react';
import { Language, GameSession } from '../../types';
import { GameShell } from './engine/GameShell';
import { GameSessionResult } from './engine/types';
import { ScoreManager } from './engine/ScoreManager';
import { soundManager } from './engine/SoundManager';
import { adaptiveEngine } from '../../ml/adaptiveEngine';
import { Check, ShoppingCart } from 'lucide-react';

interface SmartMarketGameProps {
  language: Language;
  onBack: () => void;
  onCompleteSession?: (session: GameSession) => void;
}

interface MarketItem {
  id: string;
  name: Record<Language, string>;
  icon: string;
  category: string;
}

const MARKET_ITEMS: MarketItem[] = [
  { id: 'rice', name: { en: 'Aromatic Rice', hi: 'बासमती चावल', as: 'জহা চাউল', bn: 'বাসমতী চাল', lus: 'Buhfai' }, icon: '🌾', category: 'grains' },
  { id: 'tea', name: { en: 'CTC Assam Tea', hi: 'असम की चाय', as: 'অসমীয়া চাহপাত', bn: 'আসামের চা', lus: 'Thingpui hnah' }, icon: '☕', category: 'beverages' },
  { id: 'milk', name: { en: 'Fresh Cow Milk', hi: 'ताज़ा दूध', as: 'সতেজ গাখীৰ', bn: 'তাজা খাঁটি দুধ', lus: 'Bawnghnute' }, icon: '🥛', category: 'dairy' },
  { id: 'apples', name: { en: 'Sweet Apples', hi: 'मीठे सेब', as: 'মিঠা আপেল', bn: 'মিষ্টি আপেল', lus: 'Apple thlum' }, icon: '🍎', category: 'fruits' },
  { id: 'soap', name: { en: 'Scented Soap', hi: 'सुगंधित साबुन', as: 'সুগন্ধি চাবোন', bn: 'সুগন্ধী সাবান', lus: 'Sahbawn rimtui' }, icon: '🧼', category: 'care' },
  { id: 'lentils', name: { en: 'Yellow Dal (Lentils)', hi: 'पीली दाल', as: 'মগু দাইল', bn: 'মুগ ডাল', lus: 'Dal' }, icon: '🥣', category: 'grains' },
  { id: 'oil', name: { en: 'Mustard Oil', hi: 'सरसों का तेल', as: 'মিঠা তেল', bn: 'সর্ষের তেল', lus: 'Chawhmeh thau' }, icon: '🫗', category: 'cooking' },
  { id: 'bananas', name: { en: 'Malbhog Bananas', hi: 'पके केले', as: 'মালভোগ কল', bn: 'পাকা কলা', lus: 'Balhla' }, icon: '🍌', category: 'fruits' },
  { id: 'potatoes', name: { en: 'Fresh Potatoes', hi: 'आलू', as: 'আলু', bn: 'গোল আলু', lus: 'Alu' }, icon: '🥔', category: 'vegetables' },
  { id: 'honey', name: { en: 'Forest Honey', hi: 'शुद्ध शहद', as: 'মৌ-জোল', bn: 'খাঁটি মধু', lus: 'Khawizuk' }, icon: '🍯', category: 'sweets' },
  { id: 'ginger', name: { en: 'Fresh Ginger', hi: 'अदरक', as: 'আদা', bn: 'আদা', lus: 'Sawhthing' }, icon: '🫚', category: 'vegetables' },
  { id: 'bread', name: { en: 'Soft Loaf Bread', hi: 'नरम ब्रेड', as: 'ৰুটী', bn: 'পাউরুটি', lus: 'Chhang' }, icon: '🍞', category: 'bakery' },
];

export const SmartMarketGame: React.FC<SmartMarketGameProps> = ({
  language,
  onBack,
  onCompleteSession,
}) => {
  const [level, setLevel] = useState<number>(1);
  const [phase, setPhase] = useState<'list' | 'market'>('list');
  const [shoppingList, setShoppingList] = useState<MarketItem[]>([]);
  const [shelfItems, setShelfItems] = useState<MarketItem[]>([]);
  const [cartIds, setCartIds] = useState<string[]>([]);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [attempts, setAttempts] = useState(0);
  const [result, setResult] = useState<GameSessionResult | null>(null);

  const initLevel = (lvl: number) => {
    // Level 1: 3 items, Level 2: 4, Level 3: 5, Level 4: 7, Level 5: 9, Level 6: 10
    const listCount = lvl === 1 ? 3 : lvl === 2 ? 4 : lvl === 3 ? 5 : lvl === 4 ? 7 : lvl === 5 ? 9 : 10;
    const shuffled = [...MARKET_ITEMS].sort(() => Math.random() - 0.5);
    const targetList = shuffled.slice(0, listCount);

    // Shelf items = all available items
    setShoppingList(targetList);
    setShelfItems([...MARKET_ITEMS].sort(() => Math.random() - 0.5));
    setCartIds([]);
    setPhase('list');
    setAttempts(0);
    setResult(null);
    setStartTime(Date.now());
  };

  useEffect(() => {
    initLevel(level);
  }, [level]);

  const toggleCartItem = (id: string) => {
    if (phase !== 'market' || result !== null) return;
    soundManager.playNote('A4', 0.15);

    if (cartIds.includes(id)) {
      setCartIds(cartIds.filter((it) => it !== id));
    } else {
      setCartIds([...cartIds, id]);
    }
  };

  const handleFinishCheckout = () => {
    soundManager.playGentleFeedback();
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    const targetIds = shoppingList.map((i) => i.id);
    let correctCount = 0;
    let falseCount = 0;

    cartIds.forEach((id) => {
      if (targetIds.includes(id)) {
        correctCount++;
      } else {
        falseCount++;
      }
    });

    const total = shoppingList.length;
    const accuracy = total > 0 ? Math.max(0, (correctCount - falseCount * 0.5) / total) : 1;
    const isVictory = correctCount >= Math.ceil(total * 0.7);

    if (isVictory) {
      soundManager.playSuccessChime();
    }

    const adaptive = adaptiveEngine.evaluate({
      accuracy,
      reactionTime: Math.max(1000, Date.now() - startTime),
      errorRate: 1 - accuracy,
      completionRate: 1.0,
      currentLevel: level,
    });

    const res = ScoreManager.calculateResult({
      gameId: 'smart_market',
      level,
      correctAnswers: correctCount,
      totalQuestions: total,
      attempts: newAttempts,
      startTime,
      adaptiveLevel: adaptive.newLevel,
    });

    setResult(res);
  };

  const instructions: Record<Language, string> = {
    en: phase === 'list'
      ? `Study this bazaar grocery list of ${shoppingList.length} items. Tap "Ready" to enter the market.`
      : `Tap the ${shoppingList.length} items that were on your grocery list (${cartIds.length} chosen).`,
    hi: phase === 'list'
      ? `बाज़ार की खरीदारी सूची में ये ${shoppingList.length} वस्तुएँ हैं। याद रखने के बाद "तैयार" दबाएँ।`
      : `अपनी सूची की ${shoppingList.length} वस्तुओं को टोकरी में रखें (${cartIds.length} चुनीं)।`,
    as: phase === 'list'
      ? `বজাৰৰ ফৰ্দখনৰ এই ${shoppingList.length} বিধ বস্তু মনত ৰাখক। তাৰ পিছত "মই সাজু" টিপক।`
      : `ফৰ্দখনত থকা ${shoppingList.length} বিধ বস্তু বাছি লওক (${cartIds.length} বাছিলে)।`,
    bn: phase === 'list'
      ? `বাজারের ফর্দের এই ${shoppingList.length}টি জিনিস মনে রাখুন। তৈরি হলে "প্রস্তুত" চাপুন।`
      : `তালিকায় থাকা ${shoppingList.length}টি জিনিস থলিতে ভরুন (${cartIds.length}টি নেওয়া হয়েছে)।`,
    lus: phase === 'list'
      ? `Dawra thil lei tur ${shoppingList.length} te hi uluk takin en rawh.`
      : `I list-a thil awm te kha thlang rawh (${cartIds.length}/${shoppingList.length}).`,
  };

  return (
    <GameShell
      gameId="smart_market"
      title="Smart Market"
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
        {phase === 'list' ? (
          <div className="w-full max-w-md space-y-4">
            <div className="p-4 rounded-3xl bg-[#0B1528] border-2 border-cyan-400/50 shadow-xl">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block text-center mb-2">
                📋 Today's Grocery List ({shoppingList.length} items)
              </span>
              <div className="grid grid-cols-2 gap-2.5">
                {shoppingList.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-2xl bg-[#060D1E] border border-slate-700/80 flex items-center gap-2.5 shadow-sm"
                  >
                    <span className="text-2xl">{item.icon}</span>
                    <span className="text-xs sm:text-sm font-bold text-white text-left line-clamp-1">
                      {item.name[language] || item.name.en}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setPhase('market')}
              className="w-full mt-3 min-h-[52px] rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 text-white font-extrabold text-lg shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 active:scale-95 transition"
            >
              <ShoppingCart className="w-5 h-5" />
              <span>Enter the Market</span>
            </button>
          </div>
        ) : (
          <div className="w-full max-w-md space-y-4">
            <div className="flex items-center justify-between px-2 text-xs font-bold text-slate-300">
              <span>In Cart: {cartIds.length} of {shoppingList.length} items</span>
              <span className="text-cyan-400">Tap items on shelves</span>
            </div>

            {/* Market Shelves Grid (min 48px touch targets) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {shelfItems.map((item) => {
                const isInCart = cartIds.includes(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleCartItem(item.id)}
                    className={`min-h-[76px] p-2.5 rounded-2xl border-2 flex flex-col items-center justify-center gap-1 transition-all active:scale-95 shadow ${
                      isInCart
                        ? 'bg-gradient-to-tr from-blue-900 to-cyan-900 border-cyan-400 ring-2 ring-cyan-300 text-white scale-105'
                        : 'bg-[#0B1528] border-slate-700 hover:border-slate-500 text-slate-300'
                    }`}
                  >
                    <span className="text-3xl">{item.icon}</span>
                    <span className="text-xs font-bold text-center line-clamp-1">
                      {item.name[language] || item.name.en}
                    </span>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={handleFinishCheckout}
              disabled={cartIds.length === 0}
              className="w-full mt-3 min-h-[54px] rounded-2xl bg-gradient-to-r from-blue-600 via-cyan-600 to-cyan-500 hover:from-blue-500 disabled:opacity-40 text-white font-extrabold text-lg shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 active:scale-95 transition"
            >
              <Check className="w-5 h-5 stroke-[2.5]" />
              <span>Checkout My Groceries</span>
            </button>
          </div>
        )}
      </div>
    </GameShell>
  );
};
