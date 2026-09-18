import React, { useEffect } from 'react';
import { Brain, Sparkles } from 'lucide-react';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish();
    }, 2400);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div
      onClick={onFinish}
      className="fixed inset-0 z-50 bg-[#007AFF] flex flex-col items-center justify-center text-white cursor-pointer select-none animate-fade-in"
    >
      {/* Central Brand Logo & Icon matching Page 1 of Reference PDF */}
      <div className="flex flex-col items-center animate-scale-in">
        <div className="relative mb-4 flex items-center justify-center">
          <div className="w-24 h-24 rounded-3xl bg-white/15 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-2xl">
            <Brain className="w-14 h-14 text-white" />
          </div>
          <Sparkles className="w-6 h-6 text-cyan-200 absolute -top-1 -right-1 animate-pulse" />
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-2">
          CogniCare
        </h1>

        <span className="px-3.5 py-0.5 rounded-full bg-white/20 text-xs font-black tracking-widest uppercase text-white mb-4">
          NORTH EASTERN REGION
        </span>

        <p className="text-sm sm:text-base font-medium text-white/90 text-center max-w-xs px-4 leading-relaxed">
          Remember. Engage. Live Independently.
        </p>
      </div>

      {/* Subtle bottom indicator */}
      <div className="absolute bottom-8 flex flex-col items-center">
        <div className="w-8 h-1 rounded-full bg-white/40 mb-2"></div>
        <span className="text-[11px] text-white/60">Tap anywhere to proceed</span>
      </div>
    </div>
  );
};
