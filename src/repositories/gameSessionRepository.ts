import { LocalDatabase } from '../database/localDatabase';
import { GameSession, CognitiveProfile, GameType } from '../types';
import { syncRepository } from './syncRepository';

export class GameSessionRepository {
  public getSessions(): GameSession[] {
    return LocalDatabase.getSessions();
  }

  public recordSession(sessionData: Omit<GameSession, 'session_id' | 'sync_status'>): GameSession {
    const sessions = this.getSessions();
    const newSession: GameSession = {
      ...sessionData,
      session_id: 'sess_' + Math.random().toString(36).substring(2, 9),
      sync_status: 'pending'
    };
    const updated = [newSession, ...sessions];
    LocalDatabase.saveSessions(updated);
    syncRepository.enqueue('game_session', newSession.session_id, 'create', newSession);
    return newSession;
  }

  public getCognitiveProfile(): CognitiveProfile {
    const sessions = this.getSessions();
    if (sessions.length === 0) {
      return {
        overallScore: 48,
        memoryScore: 50,
        attentionScore: 45,
        perceptionScore: 42,
        reasoningScore: 40,
        coordinationScore: 46,
        unlockedPercentage: 4,
        brainAge: 68,
      };
    }

    const memoryTypes: GameType[] = [
      'memory_village', 'memory_house', 'pack_journey', 'memory_chain', 
      'smart_market', 'then_and_now', 'memory_lock', 'room_changes', 'memory_match'
    ];
    const attentionTypes: GameType[] = ['attention', 'who_did_what', 'familiar_tune'];
    const spatialTypes: GameType[] = ['guide_home', 'memory_map', 'bus_route'];
    const auditoryTypes: GameType[] = ['sound_memory', 'story_recall'];
    const routineTypes: GameType[] = ['morning_routine', 'routine_recall', 'yesterday_today_tomorrow', 'season_memory'];
    const reasoningTypes: GameType[] = ['pattern_recognition', 'family_tree', 'memory_detective', 'emotion_recognition'];

    const memorySessions = sessions.filter(s => memoryTypes.includes(s.game_type));
    const attentionSessions = sessions.filter(s => attentionTypes.includes(s.game_type));
    const spatialSessions = sessions.filter(s => spatialTypes.includes(s.game_type));
    const reasoningSessions = sessions.filter(s => reasoningTypes.includes(s.game_type));

    const avgScore = Math.round(sessions.reduce((acc, s) => acc + s.score, 0) / sessions.length);
    const getAvg = (list: GameSession[], fallback: number) => 
      list.length > 0 ? Math.round(list.reduce((acc, s) => acc + s.score, 0) / list.length) : fallback;

    return {
      overallScore: avgScore,
      memoryScore: getAvg(memorySessions, 52),
      attentionScore: getAvg(attentionSessions, 48),
      perceptionScore: getAvg(spatialSessions, Math.min(95, Math.round(avgScore * 0.92))),
      reasoningScore: getAvg(reasoningSessions, Math.min(95, Math.round(avgScore * 0.88))),
      coordinationScore: Math.min(95, Math.round(avgScore * 0.9)),
      unlockedPercentage: Math.min(100, Math.max(10, sessions.length * 5)),
      brainAge: Math.max(50, 72 - Math.round(sessions.length * 0.5)),
    };
  }
}

export const gameSessionRepository = new GameSessionRepository();
