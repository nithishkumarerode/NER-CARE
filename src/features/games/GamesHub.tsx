import React, { useState, useEffect } from 'react';
import { Clock, Play, Star, Sparkles, Filter, Award } from 'lucide-react';
import { Language, GameType, GameCategory, GameProgress } from '../../types';
import { GAME_DEFINITIONS } from './content/gameRegistry';
import { LocalDatabase } from '../../database/localDatabase';
import { NeuroMascot } from '../../components/mascot/NeuroMascot';

interface CategoryItem {
  id: GameCategory;
  icon: string;
  name: Record<Language, string>;
}

const CATEGORY_TABS: CategoryItem[] = [
  { id: 'memory', icon: '🧠', name: { en: 'Memory', hi: 'स्मृति', bn: 'স্মৃতি', as: 'স্মৃতি', lus: 'Hriatna' } },
  { id: 'attention', icon: '👀', name: { en: 'Attention', hi: 'ध्यान', bn: 'মনোযোগ', as: 'মনোযোগ', lus: 'Ngaihtuahna' } },
  { id: 'spatial', icon: '🗺️', name: { en: 'Spatial', hi: 'स्थानिक', bn: 'স্থানিক', as: 'স্থান সম্বন্ধীয়', lus: 'Hmun Hriatna' } },
  { id: 'auditory', icon: '🗣️', name: { en: 'Auditory', hi: 'श्रवण', bn: 'শ্রবণ', as: 'শ্রৱণ', lus: 'Hriat Theihna' } },
  { id: 'routine', icon: '🕰️', name: { en: 'Routine', hi: 'दिनचर्या', bn: 'রুটিন', as: 'দৈনন্দিন নিয়ম', lus: 'Nitin Nun' } },
  { id: 'reasoning', icon: '🧩', name: { en: 'Reasoning', hi: 'तर्कशक्ति', bn: 'যুক্তি', as: 'যুক্তি', lus: 'Ngaihtuah Thiamna' } },
];

interface GamesHubProps {
  language: Language;
  onSelectGame: (gameType: GameType) => void;
}

export const GamesHub: React.FC<GamesHubProps> = ({
  language,
  onSelectGame,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [gameProgressMap, setGameProgressMap] = useState<Record<string, GameProgress>>({});

  const langKey = (['en', 'hi', 'bn', 'as', 'lus'].includes(language) ? language : 'en') as 'en' | 'hi' | 'bn' | 'as' | 'lus';

  useEffect(() => {
    const allProgress = LocalDatabase.getAllGameProgress();
    setGameProgressMap(allProgress || {});
  }, []);

  const filteredGames = selectedCategory === 'all'
    ? GAME_DEFINITIONS
    : GAME_DEFINITIONS.filter(g => g.category === selectedCategory);

  const completedGamesCount = Object.values(gameProgressMap).filter(p => p.highestLevel > 1).length;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pb-28 pt-2 select-none animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Memora Cognitive Games
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold">
              20 Activities
            </span>
          </div>
          <p className="text-slate-300 text-xs sm:text-sm mt-0.5">
            Level-based brain training designed for North Eastern Region seniors
          </p>
        </div>

        {/* Global Progress Pill */}
        <div className="flex items-center gap-3 bg-[#0F1E38] border border-blue-500/30 rounded-2xl px-4 py-2.5 shadow-md self-start sm:self-auto">
          <div className="w-10 h-10 rounded-xl bg-blue-900/60 flex items-center justify-center text-xl shadow-inner">
            🏆
          </div>
          <div className="text-left">
            <span className="text-[10px] uppercase font-bold text-cyan-300 tracking-wider">Progress</span>
            <div className="text-sm font-black text-white">
              {completedGamesCount} / 20 <span className="text-xs font-normal text-slate-400">Mastered</span>
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 scrollbar-none mb-6">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-2 rounded-2xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all border ${
            selectedCategory === 'all'
              ? 'bg-blue-600 text-white border-blue-400 shadow-lg scale-105'
              : 'bg-[#0E1A33] text-slate-300 border-blue-500/20 hover:bg-[#14264A]'
          }`}
        >
          🌟 All (20)
        </button>

        {CATEGORY_TABS.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-2xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all border flex items-center gap-1.5 ${
              selectedCategory === cat.id
                ? 'bg-blue-600 text-white border-blue-400 shadow-lg scale-105'
                : 'bg-[#0E1A33] text-slate-300 border-blue-500/20 hover:bg-[#14264A]'
            }`}
          >
            <span>{cat.icon}</span>
            <span>{cat.name[langKey]}</span>
          </button>
        ))}
      </div>

      {/* Spotlight Recommended Card */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-[#122548] via-[#0E203E] to-[#0A182F] border border-blue-400/30 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-cyan-950/80 border border-cyan-400/40 flex items-center justify-center text-4xl shadow-md shrink-0">
            🏡
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-extrabold text-cyan-300 uppercase tracking-wider">
                🌟 Recommended Activity
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-900/60 text-blue-200 border border-blue-400/30 font-bold">
                6 Levels
              </span>
            </div>
            <h3 className="text-xl font-bold text-white mt-0.5">My Village, My Memory</h3>
            <p className="text-xs text-slate-300 mt-1 max-w-md">
              Study authentic North-Eastern village scenes, tea stalls, and local landmarks to boost visual and spatial recall.
            </p>
          </div>
        </div>

        <button
          onClick={() => onSelectGame('memory_village')}
          className="px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-sm sm:text-base shadow-lg active:scale-95 transition-all self-start sm:self-auto flex items-center gap-2"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>Play Now</span>
        </button>
      </div>

      {/* 20 Game Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredGames.map((game, index) => {
          const progress = gameProgressMap[game.id];
          const highestLevel = progress?.highestLevel || 1;
          const bestScore = progress?.bestScore || 0;

          return (
            <div
              key={game.id}
              onClick={() => onSelectGame(game.id as GameType)}
              className="p-4 rounded-3xl bg-[#0E1A33] hover:bg-[#142444] border border-blue-500/25 transition-all duration-200 active:scale-[0.98] cursor-pointer shadow-lg flex flex-col justify-between group"
            >
              <div className="flex items-start space-x-3.5">
                <div className="w-14 h-14 rounded-2xl bg-[#14264A] border border-blue-400/30 flex items-center justify-center text-3xl shadow-inner shrink-0 group-hover:scale-105 transition-transform">
                  {game.icon}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center justify-between gap-1">
                    <h4 className="text-base font-bold text-white truncate">
                      {index + 1}. {game.title[langKey]}
                    </h4>
                    <span className="px-2 py-0.5 rounded-md bg-blue-900/60 border border-blue-400/30 text-[10px] font-extrabold text-cyan-300 uppercase shrink-0">
                      {game.category}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                    {game.description[langKey]}
                  </p>
                </div>
              </div>

              {/* Card Footer: Level Indicators & Action */}
              <div className="mt-4 pt-3 border-t border-blue-900/40 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5, 6].map(lvl => (
                      <span
                        key={lvl}
                        className={`w-2.5 h-2.5 rounded-full ${
                          lvl <= highestLevel
                            ? 'bg-emerald-400'
                            : 'bg-slate-700'
                        }`}
                        title={`Level ${lvl}`}
                      />
                    ))}
                  </div>
                  <span className="text-[11px] font-bold text-slate-300 ml-1">
                    Lvl {highestLevel}/6
                  </span>
                  {bestScore > 0 && (
                    <span className="text-[10px] text-amber-400 font-semibold flex items-center gap-0.5 ml-1">
                      <Star className="w-3 h-3 fill-amber-400" />
                      {bestScore}
                    </span>
                  )}
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectGame(game.id as GameType);
                  }}
                  aria-label={`Start ${game.title[langKey]}`}
                  className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Start</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Reassuring NeuroMascot Advice */}
      <div className="mt-8 p-5 rounded-3xl bg-[#0F1E38]/90 border border-blue-500/20 flex items-center justify-between shadow-lg">
        <div className="text-left pr-3">
          <h4 className="text-base font-bold text-white mb-1">Encouraging Everyday Engagement</h4>
          <p className="text-xs text-slate-300 leading-relaxed max-w-xl">
            Gentle exercises build neuro-connections at your own comfortable pace. No rush, no pressure—every minute spent engaging supports active memory and independence.
          </p>
        </div>
        <NeuroMascot mood="happy" size="sm" className="shrink-0" />
      </div>
    </div>
  );
};
