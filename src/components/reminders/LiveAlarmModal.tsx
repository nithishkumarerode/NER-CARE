import React, { useEffect } from 'react';
import { Pill, Droplets, Utensils, Footprints, Brain, Calendar, Clock, Volume2, Check, BellRing } from 'lucide-react';
import { Reminder, Language } from '../../types';
import { voiceService } from '../../services/voiceService';
import { getTranslation } from '../../locales/translations';

interface LiveAlarmModalProps {
  reminder: Reminder | null;
  language: Language;
  isOpen: boolean;
  onTaken: (reminderId: string) => void;
  onSnooze: (reminderId: string) => void;
  onClose: () => void;
}

export const LiveAlarmModal: React.FC<LiveAlarmModalProps> = ({
  reminder,
  language,
  isOpen,
  onTaken,
  onSnooze,
  onClose,
}) => {
  useEffect(() => {
    if (isOpen && reminder) {
      // Play soothing chime
      voiceService.playAlarmSound();

      // Trigger soft vibration where supported
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate([250, 150, 250]);
        } catch (e) {}
      }

      // Voice announcement
      const speakText = `${reminder.title}. ${reminder.dosage || ''}. ${getTranslation(language, 'taken')}`;
      voiceService.speak(speakText, language);
    }
  }, [isOpen, reminder, language]);

  if (!isOpen || !reminder) return null;

  const getIcon = () => {
    switch (reminder.type) {
      case 'medicine':
        return <Pill className="w-16 h-16 text-emerald-400 animate-bounce" />;
      case 'hydration':
        return <Droplets className="w-16 h-16 text-cyan-400 animate-bounce" />;
      case 'food':
        return <Utensils className="w-16 h-16 text-amber-400 animate-bounce" />;
      case 'exercise':
        return <Footprints className="w-16 h-16 text-blue-400 animate-bounce" />;
      case 'brain':
        return <Brain className="w-16 h-16 text-purple-400 animate-bounce" />;
      default:
        return <Calendar className="w-16 h-16 text-sky-400 animate-bounce" />;
    }
  };

  const handleSpeak = () => {
    const text = `${reminder.title}. ${reminder.dosage || ''}`;
    voiceService.speak(text, language);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      <div className="w-full max-w-md rounded-3xl bg-gradient-to-b from-[#13233E] to-[#0B1527] border-2 border-cyan-400/50 p-6 sm:p-8 shadow-2xl flex flex-col items-center text-center">
        {/* Pulsing Icon Bubble */}
        <div className="relative mb-4 flex items-center justify-center">
          <div className="w-24 h-24 rounded-full bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.4)]">
            {getIcon()}
          </div>
          <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-amber-500 flex items-center justify-center text-slate-950 font-black">
            <BellRing className="w-4 h-4 animate-spin" style={{ animationDuration: '4s' }} />
          </div>
        </div>

        {/* Reminder Category & Time */}
        <span className="px-3.5 py-1 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-300 text-xs sm:text-sm font-bold uppercase tracking-wider mb-2">
          {reminder.type.toUpperCase()} TIME
        </span>

        <h2 className="text-3xl font-extrabold text-white tracking-tight mb-1">
          {reminder.time}
        </h2>

        <p className="text-xl sm:text-2xl font-bold text-slate-100 mb-2">
          {reminder.title}
        </p>

        {reminder.dosage && (
          <p className="text-base sm:text-lg text-cyan-200 font-medium bg-cyan-900/30 px-4 py-1.5 rounded-xl border border-cyan-500/20 mb-5">
            {reminder.dosage}
          </p>
        )}

        {/* Voice Readout Button */}
        <button
          onClick={handleSpeak}
          className="flex items-center space-x-2 px-5 py-2 rounded-full bg-slate-800/80 border border-slate-600 text-slate-200 hover:text-white mb-6 active:scale-95 transition-all text-sm font-semibold"
        >
          <Volume2 className="w-4 h-4 text-cyan-400" />
          <span>{getTranslation(language, 'listenPrompt')}</span>
        </button>

        {/* Big Action Buttons */}
        <div className="w-full space-y-3">
          {/* Taken Button */}
          <button
            onClick={() => onTaken(reminder.reminder_id)}
            className="w-full py-4 sm:py-5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-extrabold text-xl shadow-lg shadow-emerald-900/50 active:scale-[0.98] transition-all flex items-center justify-center space-x-2"
          >
            <Check className="w-6 h-6 stroke-[3]" />
            <span>✓ {getTranslation(language, 'taken')}</span>
          </button>

          {/* Snooze Button */}
          <button
            onClick={() => onSnooze(reminder.reminder_id)}
            className="w-full py-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600 text-slate-300 font-bold text-base active:scale-[0.98] transition-all flex items-center justify-center space-x-2"
          >
            <Clock className="w-5 h-5 text-amber-400" />
            <span>⏰ {getTranslation(language, 'snooze')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
