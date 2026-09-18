import React from 'react';
import { Volume2, Check, Globe2, ArrowLeft } from 'lucide-react';
import { Language } from '../../types';
import { SUPPORTED_LANGUAGES } from '../../locales/translations';
import { voiceService } from '../../services/voiceService';

interface LanguageSelectScreenProps {
  currentLanguage: Language;
  onSelectLanguage: (lang: Language) => void;
  onBack?: () => void;
}

export const LanguageSelectScreen: React.FC<LanguageSelectScreenProps> = ({
  currentLanguage,
  onSelectLanguage,
  onBack,
}) => {
  const handlePreviewAudio = (e: React.MouseEvent, lang: Language, nativeName: string) => {
    e.stopPropagation();
    voiceService.speak(`Hello, welcome to CogniCare. ${nativeName}`, lang);
  };

  return (
    <div className="min-h-screen w-full bg-[#060D1E] text-white p-4 sm:p-6 flex flex-col items-center select-none animate-fade-in">
      {/* Top Bar */}
      <div className="w-full max-w-md flex items-center justify-between mb-6">
        {onBack ? (
          <button
            onClick={onBack}
            className="w-12 h-12 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-200 active:scale-95"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
        ) : (
          <div className="w-12"></div>
        )}

        <div className="flex items-center space-x-2">
          <Globe2 className="w-6 h-6 text-cyan-400" />
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Language / ভাষা</h1>
        </div>

        <div className="w-12"></div>
      </div>

      <p className="text-slate-300 text-sm sm:text-base text-center max-w-sm mb-6">
        Choose your comfortable language. You can change this anytime.
      </p>

      {/* Large Language Cards matching Requirement 8 */}
      <div className="w-full max-w-md grid grid-cols-1 gap-3.5 pb-8">
        {SUPPORTED_LANGUAGES.map((lang) => {
          const isSelected = currentLanguage === lang.code;

          return (
            <div
              key={lang.code}
              onClick={() => {
                onSelectLanguage(lang.code);
                voiceService.speak(`CogniCare ${lang.nativeName}`, lang.code);
              }}
              className={`p-5 rounded-3xl border-2 flex items-center justify-between cursor-pointer transition-all duration-200 active:scale-[0.98] shadow-lg ${
                isSelected
                  ? 'bg-gradient-to-r from-blue-900/90 to-cyan-950 border-cyan-400 shadow-cyan-500/20'
                  : 'bg-[#0E1A33] border-blue-500/20 hover:border-blue-400/50'
              }`}
            >
              <div className="flex items-center space-x-4">
                {/* Audio Preview Icon */}
                <button
                  onClick={(e) => handlePreviewAudio(e, lang.code, lang.nativeName)}
                  title="Listen to pronunciation"
                  className="w-12 h-12 rounded-2xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-cyan-300 active:scale-90 transition-all hover:bg-blue-600/50"
                >
                  <Volume2 className="w-6 h-6" />
                </button>

                <div className="text-left">
                  <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    {lang.nativeName}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 font-medium">
                    {lang.name} • <span className="text-cyan-400">{lang.region}</span>
                  </p>
                </div>
              </div>

              {isSelected && (
                <div className="w-9 h-9 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center shadow-md">
                  <Check className="w-5 h-5 stroke-[3]" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {onBack && (
        <button
          onClick={onBack}
          className="w-full max-w-md py-4 rounded-2xl bg-[#0080FF] hover:bg-[#006CD9] text-white font-extrabold text-lg shadow-lg active:scale-[0.98] transition-all mt-auto"
        >
          Confirm Language
        </button>
      )}
    </div>
  );
};
