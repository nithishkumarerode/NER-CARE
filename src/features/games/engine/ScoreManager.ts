import { Language } from '../../../types';
import { GameSessionResult } from './types';

export class ScoreManager {
  /**
   * Calculates elderly-friendly score emphasizing accuracy, completion, and gentle effort
   */
  public static calculateResult(params: {
    gameId: any;
    level: number;
    correctAnswers: number;
    totalQuestions: number;
    attempts: number;
    startTime: number;
    adaptiveLevel: number;
  }): GameSessionResult {
    const { gameId, level, correctAnswers, totalQuestions, attempts, startTime, adaptiveLevel } = params;
    const timeTakenSeconds = Math.max(1, Math.round((Date.now() - startTime) / 1000));
    const accuracy = totalQuestions > 0 ? Math.min(1, Math.max(0, correctAnswers / totalQuestions)) : 1;
    const incorrectAnswers = Math.max(0, attempts - correctAnswers);
    
    // Reaction time per attempt in ms
    const reactionTime = attempts > 0 ? Math.round((timeTakenSeconds * 1000) / attempts) : 2000;

    // Score: Base 50-80 from accuracy + 15 level bonus + 5 effort bonus
    const baseScore = Math.round(accuracy * 75);
    const levelBonus = Math.min(15, level * 2.5);
    const completionBonus = correctAnswers >= totalQuestions ? 10 : 5;
    const finalScore = Math.min(100, Math.max(20, Math.round(baseScore + levelBonus + completionBonus)));

    const isVictory = accuracy >= 0.6 || correctAnswers >= Math.ceil(totalQuestions * 0.5);

    const feedback: Record<Language, string> = {
      en: accuracy >= 0.85
        ? 'Outstanding memory work! Your mind is alert and sharp.'
        : accuracy >= 0.6
        ? 'Very well done! Regular practice keeps your neurons connected.'
        : 'Good effort! Every exercise nourishes your brain vitality.',
      hi: accuracy >= 0.85
        ? 'शानदार प्रदर्शन! आपका दिमाग सक्रिय और चौकस है।'
        : accuracy >= 0.6
        ? 'बहुत बढ़िया! अभ्यास आपके मन को स्वस्थ रखता है।'
        : 'अच्छा प्रयास! हर अभ्यास आपके मस्तिष्क के लिए लाभकारी है।',
      as: accuracy >= 0.85
        ? 'চমৎকাৰ প্ৰদৰ্শন! আপোনাৰ মন অতি সক্ৰিয় হৈ আছে।'
        : accuracy >= 0.6
        ? 'বৰ সুন্দৰ! নিয়মিত অভ্যাসে মন সতেজ কৰি ৰাখে।'
        : 'ভাল প্ৰয়াস! প্ৰতিটো অনুশীলনে মনৰ শক্তি বৃদ্ধি কৰে।',
      bn: accuracy >= 0.85
        ? 'অসাধারণ প্রচেষ্টা! আপনার স্মৃতিশক্তি খুবই সজাগ।'
        : accuracy >= 0.6
        ? 'খুব ভালো! নিয়মিত অনুশীলন মনকে সতেজ রাখে।'
        : 'ভালো চেষ্টা! প্রতিটি খেলাই মনকে সক্রিয় রাখতে সাহায্য করে।',
      lus: accuracy >= 0.85
        ? 'I ti ṭha hle mai! I rilru a fiah ṭha hle.'
        : accuracy >= 0.6
        ? 'I ti ṭha e! Inzir ziahna hian hriatna a vawng ṭha.'
        : 'Ṭha takin i ti! Heng inzirna hian thluak a ti harhvang ṭhin.',
    };

    return {
      gameId,
      level,
      score: finalScore,
      accuracy,
      attempts,
      correctAnswers,
      incorrectAnswers,
      reactionTime,
      timeTakenSeconds,
      adaptiveLevel,
      isVictory,
      feedback,
    };
  }

  public static formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }
}
