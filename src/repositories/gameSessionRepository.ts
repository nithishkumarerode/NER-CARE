import { LocalDatabase } from '../database/localDatabase';
import { GameSession, CognitiveProfile } from '../types';
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

    const memorySessions = sessions.filter(s => s.game_type === 'memory_match' || s.game_type === 'routine_recall');
    const attentionSessions = sessions.filter(s => s.game_type === 'attention' || s.game_type === 'pattern_recognition');
    
    const avgScore = Math.round(sessions.reduce((acc, s) => acc + s.score, 0) / sessions.length);
    const memScore = memorySessions.length > 0 
      ? Math.round(memorySessions.reduce((acc, s) => acc + s.score, 0) / memorySessions.length)
      : 52;
    const attScore = attentionSessions.length > 0
      ? Math.round(attentionSessions.reduce((acc, s) => acc + s.score, 0) / attentionSessions.length)
      : 48;

    return {
      overallScore: avgScore,
      memoryScore: memScore,
      attentionScore: attScore,
      perceptionScore: Math.min(95, Math.round(avgScore * 0.92)),
      reasoningScore: Math.min(95, Math.round(avgScore * 0.88)),
      coordinationScore: Math.min(95, Math.round(avgScore * 0.9)),
      unlockedPercentage: Math.min(100, 4 + sessions.length * 8),
      brainAge: Math.max(50, 72 - Math.round(sessions.length * 0.8)),
    };
  }
}

export const gameSessionRepository = new GameSessionRepository();
