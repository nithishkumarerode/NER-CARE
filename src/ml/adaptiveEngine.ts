export interface DifficultyMetrics {
  accuracy: number; // 0 to 1
  reactionTime: number; // ms
  errorRate: number; // 0 to 1
  completionRate: number; // 0 to 1
  currentLevel: number; // 1 to 6
  maxLevel?: number; // defaults to 6
}

export interface AdaptiveResult {
  newLevel: number;
  performanceScore: number;
  reasoning: string;
  isMLInferred: boolean;
  adjustment: 'increased' | 'maintained' | 'decreased';
}

export class AdaptiveDifficultyEngine {
  /**
   * Evaluates cognitive gameplay session and computes adaptive difficulty
   * Follows prompt formula:
   * Score = 0.5 * accuracy + 0.2 * normalizedReactionTime + 0.2 * completionRate + 0.1 * consistency
   *
   * Rules:
   * - accuracy >= 85% AND completionRate >= 80% -> increase difficulty slightly
   * - accuracy 60-84% -> maintain difficulty
   * - accuracy < 60% -> reduce difficulty slightly or repeat current level
   */
  public evaluate(metrics: DifficultyMetrics): AdaptiveResult {
    const maxLevel = metrics.maxLevel || 6;
    // Normalize reaction time: < 1500ms is ideal (1.0), > 5000ms is 0.2
    const normalizedReaction = Math.max(0.1, Math.min(1.0, 1.0 - (metrics.reactionTime - 1000) / 4000));
    const consistency = Math.max(0, 1.0 - metrics.errorRate);

    const performanceScore = (
      0.5 * metrics.accuracy +
      0.2 * normalizedReaction +
      0.2 * metrics.completionRate +
      0.1 * consistency
    );

    let newLevel = metrics.currentLevel;
    let adjustment: 'increased' | 'maintained' | 'decreased' = 'maintained';
    let reasoning = 'Great steady effort! Continuing at this comfortable level.';

    if (metrics.accuracy >= 0.85 && metrics.completionRate >= 0.8) {
      if (metrics.currentLevel < maxLevel) {
        newLevel = metrics.currentLevel + 1;
        adjustment = 'increased';
        reasoning = 'High mastery demonstrated! Progressing gently to the next level.';
      } else {
        reasoning = 'Outstanding mastery! You have completed all 6 levels with distinction.';
      }
    } else if (metrics.accuracy < 0.6) {
      if (metrics.currentLevel > 1) {
        newLevel = metrics.currentLevel - 1;
        adjustment = 'decreased';
        reasoning = 'Pacing adjusted to keep you relaxed and confident. Every attempt helps your mind.';
      } else {
        reasoning = 'Maintaining foundational pace for maximum comfort, reassurance, and steady practice.';
      }
    } else {
      adjustment = 'maintained';
      reasoning = 'Solid performance! Practice reinforces neural pathways. Continuing at this level.';
    }

    return {
      newLevel,
      performanceScore: Math.round(performanceScore * 100),
      reasoning,
      isMLInferred: true,
      adjustment
    };
  }
}

export const adaptiveEngine = new AdaptiveDifficultyEngine();
