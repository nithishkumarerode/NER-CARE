import React, { useState, useEffect, useRef } from 'react';
import { Volume2, Check, ArrowLeft, Mic, MicOff, Brain, Sparkles, RefreshCw } from 'lucide-react';
import { Language } from '../../types';
import { SUPPORTED_LANGUAGES, LanguageInfo, getTranslation } from '../../locales/translations';
import { voiceService } from '../../services/voiceService';

interface LanguageSelectScreenProps {
  currentLanguage: Language;
  onSelectLanguage: (lang: Language) => void;
  onBack?: () => void;
  isFirstLaunch?: boolean;
}

export const LanguageSelectScreen: React.FC<LanguageSelectScreenProps> = ({
  currentLanguage,
  onSelectLanguage,
  onBack,
  isFirstLaunch = false,
}) => {
  const [selectedLang, setSelectedLang] = useState<Language>(currentLanguage || 'en');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [voiceStatusText, setVoiceStatusText] = useState<string>('');
  const [isSpeechSupported, setIsSpeechSupported] = useState<boolean>(true);
  const [playingPreview, setPlayingPreview] = useState<string | null>(null);

  // Confirmation dialog state
  const [confirmationLang, setConfirmationLang] = useState<LanguageInfo | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);

  const stopListeningRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    setIsSpeechSupported(voiceService.isSpeechRecognitionSupported());
    return () => {
      if (stopListeningRef.current) {
        stopListeningRef.current();
      }
      voiceService.stopSpeaking();
    };
  }, []);

  // Handle Voice Preview
  const handlePreviewAudio = (e: React.MouseEvent, lang: LanguageInfo) => {
    e.stopPropagation();
    voiceService.stopSpeaking();
    setPlayingPreview(lang.code);
    voiceService.playGentleChime();
    
    // Play native preview sample
    voiceService.speak(lang.sampleGreeting, lang.code).then(() => {
      setPlayingPreview(null);
    });
  };

  // Match spoken words to supported languages
  const parseLanguageFromTranscript = (text: string): Language | null => {
    const clean = text.toLowerCase().trim();

    if (/english|angrezi|इंग्लिश|ইংরেজি|ইংৰাজী/.test(clean)) return 'en';
    if (/hindi|hindee|हिन्दी|हिंदी|হিন্দি/.test(clean)) return 'hi';
    if (/tamil|thamizh|தமிழ்|तमिल|তামিল/.test(clean)) return 'ta';
    if (/bengali|bangla|বাংল|বাংলা|बंगाली|বঙালী/.test(clean)) return 'bn';
    if (/assamese|asomiya|oxomiya|axomiya|অসমীয়া|অসমীয়া|असमिया/.test(clean)) return 'as';
    if (/mizo|lushei|lushai|ṭawng|tawng|मिज़ो|মিজো/.test(clean)) return 'lus';

    return null;
  };

  // Open confirmation for selected language
  const triggerConfirmation = (langInfo: LanguageInfo) => {
    setConfirmationLang(langInfo);
    setShowConfirmModal(true);
    voiceService.playSuccessChime();

    // Voice speak native confirmation after tiny delay
    setTimeout(() => {
      voiceService.speak(langInfo.voiceConfirmation, langInfo.code);
    }, 250);
  };

  // Voice Recognition Trigger
  const handleStartVoice = () => {
    if (!isSpeechSupported) {
      setVoiceStatusText('Voice recognition is not available in this browser. Please tap your language card.');
      return;
    }

    if (isListening) {
      if (stopListeningRef.current) {
        stopListeningRef.current();
      }
      setIsListening(false);
      setVoiceStatusText('');
      return;
    }

    voiceService.stopSpeaking();
    voiceService.playGentleChime();
    setIsListening(true);
    setVoiceStatusText('Listening... Say your language (e.g. "Hindi", "English", "Bengali")');

    try {
      const stopFn = voiceService.listenOnce(
        (transcript: string) => {
          setIsListening(false);
          const detected = parseLanguageFromTranscript(transcript);

          if (detected) {
            const matchedInfo = SUPPORTED_LANGUAGES.find(l => l.code === detected);
            if (matchedInfo) {
              setVoiceStatusText(`Detected: "${transcript}"`);
              setSelectedLang(detected);
              triggerConfirmation(matchedInfo);
              return;
            }
          }

          setVoiceStatusText(`Heard "${transcript}", but couldn't match a language. Tap your card below.`);
        },
        (error: any) => {
          setIsListening(false);
          console.warn('Speech recognition warning:', error);
          setVoiceStatusText('Could not hear clearly. Please tap your language card.');
        },
        () => {
          setIsListening(false);
        }
      );

      stopListeningRef.current = stopFn;
    } catch (err) {
      setIsListening(false);
      console.warn('Voice listening error handled safely:', err);
      setVoiceStatusText('Voice recognition encountered an issue. Please choose below.');
    }
  };

  // Card Tap Handler
  const handleCardClick = (lang: LanguageInfo) => {
    setSelectedLang(lang.code);
    triggerConfirmation(lang);
  };

  // Confirm selection
  const handleConfirm = () => {
    if (confirmationLang) {
      voiceService.stopSpeaking();
      voiceService.playSuccessChime();
      onSelectLanguage(confirmationLang.code);
    }
  };

  // Cancel / Change language
  const handleCancelConfirmation = () => {
    voiceService.stopSpeaking();
    setShowConfirmModal(false);
    setConfirmationLang(null);
  };

  return (
    <div className="min-h-screen w-full bg-[#060D1E] text-white p-4 sm:p-6 flex flex-col items-center justify-between select-none animate-fade-in relative overflow-x-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar */}
      <div className="w-full max-w-lg flex items-center justify-between pt-2 pb-4 z-10">
        {!isFirstLaunch && onBack ? (
          <button
            onClick={onBack}
            aria-label="Go back"
            className="w-12 h-12 rounded-2xl bg-slate-900/90 border border-slate-700/80 flex items-center justify-center text-slate-200 active:scale-95 transition-all shadow-md hover:border-slate-500"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
        ) : (
          <div className="w-12 h-12" />
        )}

        {/* Cognitive Care Branding Badge */}
        <div className="flex items-center space-x-2 px-4 py-1.5 rounded-full bg-blue-950/70 border border-blue-500/30 text-cyan-300 shadow-inner">
          <Brain className="w-5 h-5 text-cyan-400 animate-pulse" />
          <span className="text-sm font-bold tracking-wide">🧠 Cognitive Care</span>
        </div>

        <div className="w-12 h-12" />
      </div>

      {/* Screen Title & Elderly-friendly Subtext */}
      <div className="w-full max-w-lg text-center my-3 z-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight mb-2">
          Choose Your Language
        </h1>
        <p className="text-slate-300 text-base sm:text-lg font-medium leading-snug px-2">
          Select the language you are most comfortable with.
        </p>
      </div>

      {/* Prominent Voice Assistant Bar matching Requirement 2 */}
      <div className="w-full max-w-lg my-3 z-10">
        <div
          onClick={handleStartVoice}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleStartVoice(); }}
          className={`w-full p-4 rounded-3xl border-2 transition-all duration-300 flex items-center justify-between cursor-pointer active:scale-[0.98] shadow-xl ${
            isListening
              ? 'bg-gradient-to-r from-red-950/80 to-rose-900/80 border-rose-400 shadow-rose-500/30 animate-pulse'
              : 'bg-gradient-to-r from-blue-900/40 to-slate-900/80 border-cyan-500/40 hover:border-cyan-400 shadow-cyan-900/20'
          }`}
        >
          <div className="flex items-center space-x-3.5">
            {/* Pulsing Mic Button Icon */}
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform ${
                isListening
                  ? 'bg-rose-600 scale-110'
                  : 'bg-gradient-to-br from-cyan-500 to-blue-600 shadow-blue-500/30 hover:scale-105'
              }`}
            >
              {isListening ? (
                <MicOff className="w-7 h-7 animate-bounce" />
              ) : (
                <Mic className="w-7 h-7" />
              )}
            </div>

            <div className="text-left">
              <span className="text-base sm:text-lg font-bold text-white block">
                {isListening ? 'Listening to your voice...' : 'You can also say your language.'}
              </span>
              <span className="text-xs sm:text-sm text-cyan-200/90 font-medium block mt-0.5">
                {isListening
                  ? 'Say: English, Hindi, Bengali, Assamese, or Mizo'
                  : 'Tap to speak your language (🎙️)'}
              </span>
            </div>
          </div>

          <div className="hidden sm:flex items-center justify-center pl-2">
            <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-white/10 text-cyan-200">
              {isListening ? 'Live' : 'Voice'}
            </span>
          </div>
        </div>

        {/* Live status or feedback text */}
        {voiceStatusText && (
          <div className="mt-2 px-4 py-2 rounded-2xl bg-slate-900/90 border border-slate-700/60 text-xs sm:text-sm text-cyan-300 flex items-center justify-between">
            <span>{voiceStatusText}</span>
            <button
              onClick={(e) => { e.stopPropagation(); setVoiceStatusText(''); }}
              className="text-slate-400 hover:text-white ml-2 text-xs"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>

      {/* Large Language Cards (Elderly-Friendly & High Contrast) matching Requirement 1 */}
      <div className="w-full max-w-lg grid grid-cols-1 sm:grid-cols-2 gap-3.5 my-2 z-10">
        {SUPPORTED_LANGUAGES.map((lang) => {
          const isSelected = selectedLang === lang.code;
          const isPreviewing = playingPreview === lang.code;

          return (
            <div
              key={lang.code}
              onClick={() => handleCardClick(lang)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleCardClick(lang); }}
              className={`p-4 sm:p-5 rounded-3xl border-2 flex items-center justify-between cursor-pointer transition-all duration-200 active:scale-[0.98] shadow-lg min-h-[92px] ${
                isSelected
                  ? 'bg-gradient-to-r from-blue-900/90 to-cyan-950 border-cyan-400 shadow-cyan-500/25 ring-2 ring-cyan-400/40'
                  : 'bg-[#0B1528] border-slate-700/70 hover:border-blue-400/60 hover:bg-[#0F1D38]'
              }`}
            >
              <div className="flex items-center space-x-3.5">
                {/* Voice Preview Button 🔊 */}
                <button
                  type="button"
                  onClick={(e) => handlePreviewAudio(e, lang)}
                  title={`Listen to ${lang.nativeName} voice preview`}
                  aria-label={`Listen to ${lang.name} voice preview`}
                  className={`w-12 h-12 rounded-2xl border flex items-center justify-center transition-all active:scale-90 flex-shrink-0 ${
                    isPreviewing
                      ? 'bg-cyan-500 text-slate-950 border-cyan-300 animate-pulse'
                      : 'bg-blue-600/25 border-blue-400/40 text-cyan-300 hover:bg-blue-600/45 hover:text-white'
                  }`}
                >
                  <Volume2 className="w-6 h-6" />
                </button>

                {/* Names */}
                <div className="text-left">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight">
                      {lang.nativeName}
                    </span>
                    {lang.flag && (
                      <span className="text-xs px-2 py-0.5 rounded-md bg-white/10 font-bold text-slate-200">
                        {lang.flag}
                      </span>
                    )}
                  </div>
                  <p className="text-sm sm:text-base text-slate-300 font-semibold mt-0.5">
                    {lang.name}
                  </p>
                </div>
              </div>

              {/* Selection Checkmark */}
              {isSelected ? (
                <div className="w-8 h-8 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center shadow-md flex-shrink-0">
                  <Check className="w-5 h-5 stroke-[3]" />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full border-2 border-slate-600 flex-shrink-0" />
              )}
            </div>
          );
        })}
      </div>

      {/* Spoken Language Helper Pill */}
      <div className="w-full max-w-lg mt-3 mb-2 z-10 text-center">
        <p className="text-xs sm:text-sm text-slate-400 flex items-center justify-center space-x-1">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 mr-1" />
          <span>Supports: English • हिन्दी • বাংলা • অসমীয়া • Mizo</span>
        </p>
      </div>

      {/* Confirmation Modal matching Requirement 2 */}
      {showConfirmModal && confirmationLang && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-md bg-[#0B1528] border-2 border-cyan-400 rounded-3xl p-6 sm:p-7 shadow-2xl shadow-cyan-900/40 text-center animate-scale-in">
            {/* Modal Mascot / Icon */}
            <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center text-white shadow-xl shadow-cyan-500/25">
              <Brain className="w-11 h-11" />
            </div>

            {/* Prompt Text: "You selected [Language]. Is this correct?" */}
            <h2 className="text-2xl sm:text-3xl font-black text-white mb-2 leading-tight">
              You selected {confirmationLang.name}.
            </h2>
            <p className="text-cyan-300 text-lg sm:text-xl font-bold mb-4">
              Is this correct?
            </p>

            {/* Native Voice Transcript / Script preview */}
            <div className="p-4 rounded-2xl bg-blue-950/70 border border-blue-400/30 mb-6 flex items-start space-x-3 text-left">
              <Volume2 className="w-6 h-6 text-cyan-400 mt-0.5 flex-shrink-0 animate-pulse" />
              <div>
                <p className="text-base sm:text-lg font-bold text-white">
                  "{confirmationLang.voiceConfirmation}"
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Native audio preview spoken automatically
                </p>
              </div>
            </div>

            {/* Action Buttons: [ ✓ Yes ] [ Change Language ] */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={handleConfirm}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-black text-xl shadow-lg shadow-cyan-500/30 active:scale-[0.98] transition-all flex items-center justify-center space-x-2"
              >
                <Check className="w-6 h-6 stroke-[3]" />
                <span>✓ Yes, Continue</span>
              </button>

              <button
                type="button"
                onClick={handleCancelConfirmation}
                className="w-full py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white font-bold text-base active:scale-[0.98] transition-all flex items-center justify-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Change Language</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSelectScreen;
