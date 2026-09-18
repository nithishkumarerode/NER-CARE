import React from 'react';
import { Sparkles, Brain, Clock, Zap, Play, CheckCircle2, ChevronRight } from 'lucide-react';
import { Language, GameType } from '../../types';
import { NeuroMascot } from '../../components/mascot/NeuroMascot';
import { getTranslation } from '../../locales/translations';

interface GamesHubProps {
  language: Language;
  onSelectGame: (gameType: GameType) => void;
}

export const GamesHub: React.FC<GamesHubProps> = ({
  language,
  onSelectGame,
}) => {
  const games = [
    {
      id: 'memory_match' as GameType,
      title: 'Memory Match',
      desc: 'Pair regional symbols and Assam tea motifs',
      icon: '🧠',
      badge: 'Memory',
      duration: '5 min',
      difficulty: 'Gentle',
      color: 'from-blue-600 to-sky-500',
    },
    {
      id: 'routine_recall' as GameType,
      title: 'Routine Recall',
      desc: 'Remember the order of morning activities',
      icon: '🌅',
      badge: 'Daily Living',
      duration: '4 min',
      difficulty: 'Comfortable',
      color: 'from-amber-600 to-orange-500',
    },
    {
      id: 'pattern_recognition' as GameType,
      title: 'Pattern Recognition',
      desc: 'Complete the visual color & fruit sequence',
      icon: '🔵',
      badge: 'Reasoning',
      duration: '3 min',
      difficulty: 'Adaptive',
      color: 'from-indigo-600 to-blue-500',
    },
    {
      id: 'attention' as GameType,
      title: 'Attention Focus',
      desc: 'Spot familiar objects among everyday items',
      icon: '☕',
      badge: 'Attention',
      duration: '4 min',
      difficulty: 'Gentle',
      color: 'from-teal-600 to-emerald-500',
    },
    {
      id: 'emotion_recognition' as GameType,
      title: 'Emotion Connection',
      desc: 'Recognize warm human feelings and expressions',
      icon: '😊',
      badge: 'Perception',
      duration: '3 min',
      difficulty: 'Easy',
      color: 'from-rose-600 to-pink-500',
    },
  ];

  return (
    <div className="w-full max-w-md mx-auto px-4 pb-28 pt-2 select-none animate-fade-in">
      {/* Page Title & Stats matching Page 19 */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Cognitive Games
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm mt-0.5">
            Personalized Brain Training
          </p>
        </div>

        {/* Dumbbells 3D Icon Graphic */}
        <div className="w-12 h-12 rounded-2xl bg-blue-900/40 border border-blue-500/30 flex items-center justify-center text-2xl shadow-inner">
          🏋️‍♂️
        </div>
      </div>

      {/* Unlocked Games Progress Bar matching Page 19 ("Unlocked games 4/66") */}
      <div className="p-4 rounded-2xl bg-[#0F1E38] border border-blue-500/20 mb-5 shadow-lg">
        <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-slate-200 mb-2">
          <span>Active Cognitive Activities</span>
          <span className="text-cyan-400">5 / 5 Available</span>
        </div>
        <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
          <div className="h-full w-full bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full"></div>
        </div>
      </div>

      {/* Recommended Spotlight Card matching Page 19 */}
      <div className="p-4 rounded-3xl bg-gradient-to-r from-[#122548] to-[#0D1C36] border border-blue-400/30 mb-6 flex items-center justify-between shadow-xl">
        <div className="flex items-center space-x-3.5">
          <div className="w-14 h-14 rounded-2xl bg-cyan-950 border border-cyan-400/40 flex items-center justify-center text-3xl shadow-md">
            🦅
          </div>
          <div>
            <span className="text-[11px] font-bold text-cyan-300 uppercase tracking-wider">
              Recommended for you
            </span>
            <h3 className="text-lg font-bold text-white">Tea Garden Explorer</h3>
            <p className="text-xs text-slate-300">Stimulate visual memory</p>
          </div>
        </div>

        <button
          onClick={() => onSelectGame('memory_match')}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-md active:scale-95 transition-all"
        >
          Play
        </button>
      </div>

      {/* Game Cards List */}
      <div className="space-y-3.5">
        {games.map((game) => (
          <div
            key={game.id}
            onClick={() => onSelectGame(game.id)}
            className="p-4 rounded-3xl bg-[#0E1A33] hover:bg-[#142444] border border-blue-500/25 transition-all duration-200 active:scale-[0.98] cursor-pointer shadow-lg flex items-center justify-between"
          >
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 rounded-2xl bg-[#14264A] border border-blue-400/30 flex items-center justify-center text-3xl shadow-inner">
                {game.icon}
              </div>
              <div className="text-left">
                <div className="flex items-center space-x-2">
                  <h4 className="text-base sm:text-lg font-bold text-white">{game.title}</h4>
                  <span className="px-2 py-0.5 rounded-md bg-blue-900/60 border border-blue-400/30 text-[10px] font-extrabold text-cyan-300 uppercase">
                    {game.badge}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5 line-clamp-1">{game.desc}</p>
                <div className="flex items-center space-x-3 text-[11px] text-slate-400 mt-1 font-medium">
                  <span className="flex items-center space-x-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{game.duration}</span>
                  </span>
                  <span>•</span>
                  <span className="text-emerald-400 font-semibold">{game.difficulty}</span>
                </div>
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelectGame(game.id);
              }}
              aria-label={`Start ${game.title}`}
              className="w-11 h-11 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center active:scale-95 transition-all shadow-md shrink-0 ml-2"
            >
              <Play className="w-5 h-5 fill-current ml-0.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Mascot Feedback Card matching Page 19 */}
      <div className="mt-8 p-5 rounded-3xl bg-[#0F1E38]/80 border border-blue-500/20 flex items-center justify-between">
        <div className="text-left pr-2">
          <h4 className="text-base font-bold text-white mb-1">Gentle Mind Training</h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            Every minute of brain engagement supports neuroplasticity and daily independence.
          </p>
        </div>
        <NeuroMascot mood="happy" size="sm" className="shrink-0" />
      </div>
    </div>
  );
};
