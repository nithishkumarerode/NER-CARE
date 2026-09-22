import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, X, Sparkles, MessageSquare } from 'lucide-react';
import { Language } from '../../types';
import { voiceService } from '../../services/voiceService';
import { getTranslation } from '../../locales/translations';

interface VoiceAssistantModalProps {
  isOpen: boolean;
  language: Language;
  onClose: () => void;
  onCommand: (command: string) => void;
}

export const VoiceAssistantModal: React.FC<VoiceAssistantModalProps> = ({
  isOpen,
  language,
  onClose,
  onCommand,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [statusMessage, setStatusMessage] = useState('Tap the microphone to speak');

  useEffect(() => {
    if (isOpen) {
      voiceService.speak(getTranslation(language, 'howCanIHelp'), language);
      setStatusMessage('Listening for your voice...');
      startListening();
    } else {
      setIsListening(false);
    }
  }, [isOpen]);

  const startListening = () => {
    setIsListening(true);
    setTranscript('');

    voiceService.listenOnce(
      (text) => {
        setIsListening(false);
        setTranscript(text);
        processCommand(text);
      },
      (err) => {
        setIsListening(false);
        setStatusMessage('Speech recognition paused. Tap any shortcut below.');
      }
    );
  };

  const processCommand = (cmd: string) => {
    const lower = cmd.toLowerCase();
    if (lower.includes('game') || lower.includes('play') || lower.includes('memory')) {
      voiceService.speak('Starting your Memory Match game.', language);
      setTimeout(() => {
        onCommand('game:memory_match');
        onClose();
      }, 1000);
    } else if (lower.includes('water') || lower.includes('drink')) {
      voiceService.speak('Adding a glass of water to your daily hydration.', language);
      setTimeout(() => {
        onCommand('action:water');
        onClose();
      }, 1000);
    } else if (lower.includes('reminder') || lower.includes('medicine') || lower.includes('pill')) {
      voiceService.speak('Opening your scheduled reminders.', language);
      setTimeout(() => {
        onCommand('nav:reminders');
        onClose();
      }, 1000);
    } else if (lower.includes('caregiver') || lower.includes('call') || lower.includes('family')) {
      voiceService.speak('Connecting with your caregiver.', language);
      setTimeout(() => {
        onCommand('nav:caregiver');
        onClose();
      }, 1000);
    } else {
      voiceService.speak('I heard you. Let me guide you to the home dashboard.', language);
      setTimeout(() => {
        onCommand('nav:home');
        onClose();
      }, 1000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in select-none">
      <div className="w-full max-w-sm rounded-3xl bg-[#0F1E38] border border-blue-400/40 p-6 shadow-2xl flex flex-col items-center text-center relative">
        <button
          onClick={onClose}
          aria-label="Close Voice Assistant"
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Memora Voice Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-teal-500/30 text-teal-300 text-xs font-bold mb-1">
          <img src="/memora-logo.png" alt="Memora logo" className="w-4 h-4 object-contain" />
          <span>Memora Voice</span>
        </div>

        {/* Pulsing Mic Circle */}
        <div className="relative my-3">
          <button
            onClick={startListening}
            className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${
              isListening
                ? 'bg-blue-600 text-white shadow-[0_0_30px_rgba(0,128,255,0.8)] animate-pulse'
                : 'bg-slate-800 border-2 border-slate-600 text-slate-300'
            }`}
          >
            {isListening ? <Mic className="w-12 h-12" /> : <MicOff className="w-10 h-10" />}
          </button>
        </div>

        <h3 className="text-2xl font-extrabold text-white tracking-tight mb-1">
          {getTranslation(language, 'voiceAssistant')}
        </h3>

        <p className="text-sm text-cyan-300 font-medium mb-4">
          {statusMessage}
        </p>

        {transcript && (
          <div className="w-full p-3 rounded-2xl bg-slate-900 border border-slate-700 text-white font-bold text-sm mb-4">
            "{transcript}"
          </div>
        )}

        {/* Elderly-Friendly Quick Voice Shortcuts */}
        <div className="w-full space-y-2 mt-2">
          <p className="text-xs text-slate-400 font-semibold mb-2">Or tap an action:</p>

          <button
            onClick={() => processCommand('start game')}
            className="w-full py-3 px-4 rounded-xl bg-[#14264A] hover:bg-[#1A315F] border border-blue-500/30 text-white text-sm font-bold flex items-center justify-between"
          >
            <span>🧠 "Start memory game"</span>
            <span className="text-xs text-cyan-400">Run →</span>
          </button>

          <button
            onClick={() => processCommand('show reminders')}
            className="w-full py-3 px-4 rounded-xl bg-[#14264A] hover:bg-[#1A315F] border border-blue-500/30 text-white text-sm font-bold flex items-center justify-between"
          >
            <span>💊 "Check my medicine"</span>
            <span className="text-xs text-cyan-400">Run →</span>
          </button>

          <button
            onClick={() => processCommand('drink water')}
            className="w-full py-3 px-4 rounded-xl bg-[#14264A] hover:bg-[#1A315F] border border-blue-500/30 text-white text-sm font-bold flex items-center justify-between"
          >
            <span>💧 "I drank water"</span>
            <span className="text-xs text-cyan-400">Run →</span>
          </button>
        </div>
      </div>
    </div>
  );
};
