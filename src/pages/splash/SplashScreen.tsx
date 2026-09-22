import React, { useEffect } from 'react';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish();
    }, 2600);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div
      onClick={onFinish}
      className="fixed inset-0 z-50 bg-gradient-to-b from-[#0072EA] via-[#0060C7] to-[#004EA6] flex flex-col items-center justify-center text-white cursor-pointer select-none animate-fade-in"
    >
      {/* Central Brand Logo & Name */}
      <div className="flex flex-col items-center animate-scale-in text-center px-6">
        <div className="relative mb-5 flex items-center justify-center">
          <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-white shadow-2xl shadow-blue-950/40 p-3 flex items-center justify-center border-2 border-white/60">
            <img
              src="/memora-logo.png"
              alt="Memora logo"
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-2">
          Memora
        </h1>

        <span className="px-3.5 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-black tracking-widest uppercase text-white mb-4 border border-white/20">
          NORTH EASTERN REGION
        </span>

        <p className="text-sm sm:text-base font-medium text-white/90 text-center max-w-xs px-4 leading-relaxed">
          Remember. Engage. Live Independently.
        </p>
      </div>

      {/* Subtle bottom indicator */}
      <div className="absolute bottom-8 flex flex-col items-center">
        <div className="w-8 h-1 rounded-full bg-white/40 mb-2"></div>
        <span className="text-[11px] text-white/70 tracking-wide">Tap anywhere to proceed</span>
      </div>
    </div>
  );
};

