import { GameType, GameCategory, Language } from '../../../types';

export interface GameDefinition {
  id: GameType;
  title: Record<Language, string>;
  category: GameCategory;
  icon: string;
  duration: string;
  description: Record<Language, string>;
  totalLevels: number; // Always 6
  skillFocus: Record<Language, string>;
}

export interface GameLevelConfig {
  level: number;
  name: Record<Language, string>;
  instruction: Record<Language, string>;
  voicePrompt: Record<Language, string>;
  observationTimeSeconds?: number;
  itemCount: number;
  timeLimitSeconds?: number;
}

export interface GameSessionResult {
  gameId: GameType;
  level: number;
  score: number;
  accuracy: number; // 0 to 1
  attempts: number;
  correctAnswers: number;
  incorrectAnswers: number;
  reactionTime: number; // ms
  timeTakenSeconds: number;
  adaptiveLevel: number;
  isVictory: boolean;
  feedback: Record<Language, string>;
}
