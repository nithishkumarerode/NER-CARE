import React from 'react';
import { Patient, GameType, GameSession } from '../../types';

// Import all 20 Level-Based Games
import { VillageMemoryGame } from './VillageMemoryGame';
import { MorningRoutineGame } from './MorningRoutineGame';
import { WhoDidWhatGame } from './WhoDidWhatGame';
import { MemoryHouseGame } from './MemoryHouseGame';
import { PackJourneyGame } from './PackJourneyGame';
import { BusRouteGame } from './BusRouteGame';
import { StoryRecallGame } from './StoryRecallGame';
import { SoundMemoryGame } from './SoundMemoryGame';
import { MemoryChainGame } from './MemoryChainGame';
import { SmartMarketGame } from './SmartMarketGame';
import { ThenAndNowGame } from './ThenAndNowGame';
import { FamilyTreeGame } from './FamilyTreeGame';
import { MemoryLockGame } from './MemoryLockGame';
import { GuideHomeGame } from './GuideHomeGame';
import { RoomChangesGame } from './RoomChangesGame';
import { FamiliarTuneGame } from './FamiliarTuneGame';
import { YesterdayTodayTomorrowGame } from './YesterdayTodayTomorrowGame';
import { SeasonMemoryGame } from './SeasonMemoryGame';
import { MemoryMapGame } from './MemoryMapGame';
import { MemoryDetectiveGame } from './MemoryDetectiveGame';

// Legacy game components
import { MemoryMatchGame } from './MemoryMatchGame';
import { RoutineRecallGame } from './RoutineRecallGame';
import { PatternGame } from './PatternGame';
import { AttentionGame } from './AttentionGame';
import { EmotionGame } from './EmotionGame';

interface GameRouterProps {
  gameType: GameType;
  user: Patient;
  onExit: () => void;
  onSessionComplete?: (session: GameSession) => void;
}

export const GameRouter: React.FC<GameRouterProps> = ({
  gameType,
  user,
  onExit,
  onSessionComplete
}) => {
  const language = user.language_pref;

  switch (gameType) {
    // 20 Standard Level-Based Cognitive Games
    case 'memory_village':
      return <VillageMemoryGame language={language} onBack={onExit} onCompleteSession={onSessionComplete} />;
    case 'morning_routine':
      return <MorningRoutineGame language={language} onBack={onExit} onCompleteSession={onSessionComplete} />;
    case 'who_did_what':
      return <WhoDidWhatGame language={language} onBack={onExit} onCompleteSession={onSessionComplete} />;
    case 'memory_house':
      return <MemoryHouseGame language={language} onBack={onExit} onCompleteSession={onSessionComplete} />;
    case 'pack_journey':
      return <PackJourneyGame language={language} onBack={onExit} onCompleteSession={onSessionComplete} />;
    case 'bus_route':
      return <BusRouteGame language={language} onBack={onExit} onCompleteSession={onSessionComplete} />;
    case 'story_recall':
      return <StoryRecallGame language={language} onBack={onExit} onCompleteSession={onSessionComplete} />;
    case 'sound_memory':
      return <SoundMemoryGame language={language} onBack={onExit} onCompleteSession={onSessionComplete} />;
    case 'memory_chain':
      return <MemoryChainGame language={language} onBack={onExit} onCompleteSession={onSessionComplete} />;
    case 'smart_market':
      return <SmartMarketGame language={language} onBack={onExit} onCompleteSession={onSessionComplete} />;
    case 'then_and_now':
      return <ThenAndNowGame language={language} onBack={onExit} onCompleteSession={onSessionComplete} />;
    case 'family_tree':
      return <FamilyTreeGame language={language} onBack={onExit} onCompleteSession={onSessionComplete} />;
    case 'memory_lock':
      return <MemoryLockGame language={language} onBack={onExit} onCompleteSession={onSessionComplete} />;
    case 'guide_home':
      return <GuideHomeGame language={language} onBack={onExit} onCompleteSession={onSessionComplete} />;
    case 'room_changes':
      return <RoomChangesGame language={language} onBack={onExit} onCompleteSession={onSessionComplete} />;
    case 'familiar_tune':
      return <FamiliarTuneGame language={language} onBack={onExit} onCompleteSession={onSessionComplete} />;
    case 'yesterday_today_tomorrow':
      return <YesterdayTodayTomorrowGame language={language} onBack={onExit} onCompleteSession={onSessionComplete} />;
    case 'season_memory':
      return <SeasonMemoryGame language={language} onBack={onExit} onCompleteSession={onSessionComplete} />;
    case 'memory_map':
      return <MemoryMapGame language={language} onBack={onExit} onCompleteSession={onSessionComplete} />;
    case 'memory_detective':
      return <MemoryDetectiveGame language={language} onBack={onExit} onCompleteSession={onSessionComplete} />;

    // Legacy fallback games
    case 'memory_match':
      return (
        <MemoryMatchGame
          language={language}
          onBack={onExit}
          onCompleteSession={onSessionComplete || (() => {})}
        />
      );
    case 'routine_recall':
      return (
        <RoutineRecallGame
          language={language}
          onBack={onExit}
          onCompleteSession={onSessionComplete || (() => {})}
        />
      );
    case 'pattern_recognition':
      return (
        <PatternGame
          language={language}
          onBack={onExit}
          onCompleteSession={onSessionComplete || (() => {})}
        />
      );
    case 'attention':
      return (
        <AttentionGame
          language={language}
          onBack={onExit}
          onCompleteSession={onSessionComplete || (() => {})}
        />
      );
    case 'emotion_recognition':
      return (
        <EmotionGame
          language={language}
          onBack={onExit}
          onCompleteSession={onSessionComplete || (() => {})}
        />
      );

    default:
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
          <p className="text-xl font-bold text-gray-700 mb-4">Game not found</p>
          <button
            onClick={onExit}
            className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold"
          >
            Return to Hub
          </button>
        </div>
      );
  }
};
