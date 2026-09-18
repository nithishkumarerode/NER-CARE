export interface DifficultyMetrics {
  accuracy: number; // 0 to 1
  reactionTime: number; // ms
  errorRate: number; // 0 to 1
  completionRate: number; // 0 to 1
  currentLevel: number; // 1 to 3
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
   * Follows FRD formula:
   * Score = 0.5 * accuracy + 0.2 * normalizedReactionTime + 0.2 * completionRate + 0.1 * consistency
   */
  public evaluate(metrics: DifficultyMetrics): AdaptiveResult {
    // Normalize reaction time: < 1500ms is ideal (1.0), > 4000ms is 0.2
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
    let reasoning = 'Current difficulty is balanced for comfortable engagement.';

    if (performanceScore > 0.82 && metrics.accuracy >= 0.8) {
      if (metrics.currentLevel < 3) {
        newLevel = metrics.currentLevel + 1;
        adjustment = 'increased';
        reasoning = 'High mastery demonstrated. Gently increasing challenge to keep synapses active.';
      } else {
        reasoning = 'Excellent mastery! Maintaining peak training level.';
      }
    } else if (performanceScore < 0.52 || metrics.accuracy < 0.5) {
      if (metrics.currentLevel > 1) {
        newLevel = metrics.currentLevel - 1;
        adjustment = 'decreased';
        reasoning = 'Reducing challenge slightly to ensure a calm, relaxed, and dignified experience.';
      } else {
        reasoning = 'Maintaining foundational pace for maximum comfort and reassurance.';
      }
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
