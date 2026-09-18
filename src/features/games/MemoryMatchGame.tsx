import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { ArrowLeft, Sparkles, Volume2, RotateCcw, Award } from 'lucide-react';
import { Language, GameSession } from '../../types';
import { voiceService } from '../../services/voiceService';
import { adaptiveEngine } from '../../ml/adaptiveEngine';
import { gameSessionRepository } from '../../repositories/gameSessionRepository';
import { getTranslation } from '../../locales/translations';

interface MemoryMatchGameProps {
  language: Language;
  onBack: () => void;
  onCompleteSession: (session: GameSession) => void;
}

interface CardItem {
  id: number;
  symbol: string;
  name: string;
  matched: boolean;
}

const REGIONAL_ITEMS = [
  { symbol: '☕', name: 'Assam Tea Cup' },
  { symbol: '🦅', name: 'Hornbill Bird' },
  { symbol: '🔔', name: 'Prayer Bell' },
  { symbol: '🌸', name: 'Lotus Flower' },
  { symbol: '🏺', name: 'Water Pitcher' },
  { symbol: '🧺', name: 'Bamboo Basket' },
];

export const MemoryMatchGame: React.FC<MemoryMatchGameProps> = ({
  language,
  onBack,
  onCompleteSession,
}) => {
  const [level, setLevel] = useState<number>(1);
  const [cards, setCards] = useState<CardItem[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [isLocked, setIsLocked] = useState(false);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [attempts, setAttempts] = useState(0);
  const [errors, setErrors] = useState(0);
  const [gameWon, setGameWon] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string>('');

  // Initialize game board based on level
  const initBoard = (currentLevel: number) => {
    // Level 1: 4 cards (2 pairs), Level 2: 6 cards (3 pairs), Level 3: 8 cards (4 pairs)
    const pairCount = currentLevel === 1 ? 2 : currentLevel === 2 ? 3 : 4;
    const selectedItems = REGIONAL_ITEMS.slice(0, pairCount);
    const deck = [...selectedItems, ...selectedItems]
      .sort(() => Math.random() - 0.5)
      .map((item, index) => ({
        id: index,
        symbol: item.symbol,
        name: item.name,
        matched: false,
      }));

    setCards(deck);
    setFlippedIndices([]);
    setIsLocked(false);
    setAttempts(0);
    setErrors(0);
    setGameWon(false);
    setFeedbackMessage('');
    setStartTime(Date.now());

    // Announce instruction
    voiceService.speak(getTranslation(language, 'instructionMemory'), language);
  };

  useEffect(() => {
    initBoard(level);
  }, [level]);

  const handleCardClick = (index: number) => {
    if (isLocked) return;
    if (cards[index].matched) return;
    if (flippedIndices.includes(index)) return;

    // Gentle tap tone
    voiceService.playTone(587.33, 100, 'sine', 0.08);

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      setIsLocked(true);
      setAttempts((prev) => prev + 1);

      const [firstIdx, secondIdx] = newFlipped;
      const firstCard = cards[firstIdx];
      const secondCard = cards[secondIdx];

      if (firstCard.symbol === secondCard.symbol) {
        // Match found!
        voiceService.playSuccessChime();
        setFeedbackMessage(getTranslation(language, 'wonderful'));

        setTimeout(() => {
          setCards((prev) =>
            prev.map((c, i) => (i === firstIdx || i === secondIdx ? { ...c, matched: true } : c))
          );
          setFlippedIndices([]);
          setIsLocked(false);

          // Check if all are matched
          const totalMatched = cards.filter((c) => c.matched).length + 2;
          if (totalMatched === cards.length) {
            handleGameWin();
          }
        }, 500);
      } else {
        // Not a match - dignified gentle message
        setErrors((prev) => prev + 1);
        voiceService.playGentleChime();
        setFeedbackMessage(getTranslation(language, 'tryAnotherOne'));

        setTimeout(() => {
          setFlippedIndices([]);
          setIsLocked(false);
          setFeedbackMessage('');
        }, 1200);
      }
    }
  };

  const handleGameWin = () => {
    setGameWon(true);
    const totalTimeMs = Math.max(1200, Date.now() - startTime);

    // Trigger celebration confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#38BDF8', '#34D399', '#FBBF24', '#0080FF'],
      });
    } catch (e) {}

    voiceService.playSuccessChime();
    voiceService.speak(`${getTranslation(language, 'wonderful')} ${getTranslation(language, 'completedToday')}`, language);

    // AI Adaptive difficulty evaluation
    const accuracy = Math.max(0.4, (attempts + 1 - errors) / Math.max(1, attempts + 1));
    const adaptiveResult = adaptiveEngine.evaluate({
      accuracy,
      reactionTime: Math.round(totalTimeMs / Math.max(1, attempts + 1)),
      errorRate: errors / Math.max(1, attempts + 1),
      completionRate: 1.0,
      currentLevel: level,
    });

    // Record session
    const session = gameSessionRepository.recordSession({
      patient_id: 'pat_ner_001',
      game_type: 'memory_match',
      score: Math.min(100, Math.round(accuracy * 100)),
      accuracy,
      reaction_time: Math.round(totalTimeMs / Math.max(1, attempts + 1)),
      error_count: errors,
      difficulty_level: level,
      timestamp: new Date().toISOString(),
    });

    onCompleteSession(session);

    // Update level gradually
    if (adaptiveResult.adjustment === 'increased' && level < 3) {
      setTimeout(() => setLevel(level + 1), 3500);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 flex flex-col items-center select-none animate-fade-in">
      {/* Header Bar */}
      <div className="w-full flex items-center justify-between mb-4">
        <button
          onClick={onBack}
          aria-label="Go Back"
          className="w-12 h-12 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-200 active:scale-95 transition-all"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        <div className="flex flex-col items-center">
          <h2 className="text-xl font-bold text-white tracking-tight">
            {getTranslation(language, 'initialAssessmentTitle')}
          </h2>
          <span className="text-xs font-semibold text-cyan-400">
            Level {level} • {cards.length / 2} Pairs
          </span>
        </div>

        <button
          onClick={() => initBoard(level)}
          aria-label="Restart Activity"
          className="w-12 h-12 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-200 active:scale-95 transition-all"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>

      {/* Visual Instruction Banner matching Page 9 */}
      <div className="w-full mb-5 px-4 py-3 rounded-2xl bg-blue-950/60 border border-blue-500/30 text-center shadow-lg">
        <p className="text-xs sm:text-sm font-bold uppercase tracking-wider text-cyan-300">
          {getTranslation(language, 'tapSeenBefore')}
        </p>
      </div>

      {/* Encouraging Feedback Pill */}
      {feedbackMessage && (
        <div className="mb-4 px-4 py-1.5 rounded-full bg-emerald-950 border border-emerald-400 text-emerald-300 font-bold text-sm sm:text-base animate-bounce">
          {feedbackMessage}
        </div>
      )}

      {/* Memory Cards Grid matching high-contrast, large touch targets */}
      <div
        className={`w-full grid gap-3 sm:gap-4 my-2 ${
          cards.length <= 4 ? 'grid-cols-2 max-w-xs' : 'grid-cols-2 sm:grid-cols-3 max-w-sm'
        }`}
      >
        {cards.map((card, index) => {
          const isFlipped = flippedIndices.includes(index) || card.matched;

          return (
            <button
              key={card.id}
              onClick={() => handleCardClick(index)}
              disabled={isLocked || card.matched}
              aria-label={isFlipped ? card.name : `Card ${index + 1}`}
              className={`h-28 sm:h-32 rounded-3xl p-2 flex flex-col items-center justify-center transition-all duration-300 active:scale-95 shadow-lg border-2 ${
                card.matched
                  ? 'bg-emerald-950/80 border-emerald-400/80 shadow-emerald-500/20'
                  : isFlipped
                  ? 'bg-gradient-to-b from-blue-700 to-sky-600 border-cyan-300 shadow-cyan-500/30 scale-102'
                  : 'bg-[#102242] border-blue-500/30 hover:border-cyan-400/50'
              }`}
            >
              {isFlipped ? (
                <div className="flex flex-col items-center">
                  <span className="text-4xl sm:text-5xl mb-1">{card.symbol}</span>
                  <span className="text-[11px] font-bold text-white text-center line-clamp-1">
                    {card.name}
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center">
                  <Sparkles className="w-8 h-8 text-blue-400/60" />
                  <span className="text-xs font-semibold text-slate-400 mt-1">Tap</span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Success Celebration Card */}
      {gameWon && (
        <div className="w-full mt-5 p-5 rounded-3xl bg-gradient-to-b from-[#132B45] to-[#0A172A] border-2 border-emerald-400/60 text-center shadow-2xl animate-fade-in">
          <Award className="w-12 h-12 text-amber-400 mx-auto mb-2" />
          <h3 className="text-2xl font-extrabold text-white mb-1">
            {getTranslation(language, 'wonderful')}
          </h3>
          <p className="text-slate-200 text-sm mb-4">
            {getTranslation(language, 'completedToday')}
          </p>

          <button
            onClick={() => initBoard(level)}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white font-extrabold text-lg shadow-lg active:scale-[0.98] transition-all"
          >
            {getTranslation(language, 'continue')}
          </button>
        </div>
      )}
    </div>
  );
};
