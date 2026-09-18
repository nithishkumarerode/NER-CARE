import React from 'react';

interface NeuroMascotProps {
  mood?: 'happy' | 'waving' | 'pointing' | 'thinking' | 'celebrating';
  speechBubble?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  onVoiceClick?: () => void;
}

export const NeuroMascot: React.FC<NeuroMascotProps> = ({
  mood = 'waving',
  speechBubble,
  size = 'md',
  className = '',
  onVoiceClick,
}) => {
  const sizeMap = {
    sm: 'w-24 h-24',
    md: 'w-36 h-36',
    lg: 'w-48 h-48',
    xl: 'w-56 h-56',
  };

  return (
    <div className={`flex flex-col items-center justify-center relative ${className}`}>
      {/* Speech Bubble matching reference screenshots (Pages 2, 3, 4, 5, 6, 12, 13) */}
      {speechBubble && (
        <div className="relative mb-3 max-w-xs sm:max-w-sm px-5 py-3.5 rounded-2xl bg-[#13233E]/90 border border-blue-400/30 text-white shadow-xl backdrop-blur-md text-center text-base sm:text-lg font-medium leading-snug animate-fade-in">
          <p>{speechBubble}</p>
          {/* Downward triangle pointer pointing towards the mascot */}
          <div className="absolute -bottom-2.5 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[10px] border-t-[#13233E]/90"></div>
        </div>
      )}

      {/* Mascot Visual Representation: Friendly Neuro neuron with smiling face, big blue eyes, waving arm, dendrites */}
      <div className={`relative ${sizeMap[size]} select-none transition-transform duration-300 hover:scale-105`}>
        {/* Soft background glow */}
        <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-2xl animate-pulse-ring"></div>
        
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full drop-shadow-2xl overflow-visible"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Smooth neuron white-to-light-cyan gradient */}
            <linearGradient id="neuronBody" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="75%" stopColor="#EFF6FF" />
              <stop offset="100%" stopColor="#DBEAFE" />
            </linearGradient>
            <radialGradient id="neuronEyeGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="60%" stopColor="#0284C7" />
              <stop offset="100%" stopColor="#0369A1" />
            </radialGradient>
            <filter id="shadowGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#0284C7" floodOpacity="0.25" />
            </filter>
          </defs>

          {/* Dendrites / Neuronal Extensions around head */}
          {/* Top Dendrites */}
          <path d="M 85 50 Q 80 20 68 25 Q 75 42 88 52" fill="url(#neuronBody)" stroke="#CBD5E1" strokeWidth="1.5" />
          <path d="M 100 45 Q 100 12 110 15 Q 106 35 104 46" fill="url(#neuronBody)" stroke="#CBD5E1" strokeWidth="1.5" />
          <path d="M 115 50 Q 128 20 140 25 Q 128 42 114 52" fill="url(#neuronBody)" stroke="#CBD5E1" strokeWidth="1.5" />

          {/* Side Dendrites (Left) */}
          <path d="M 60 70 Q 30 55 25 65 Q 40 78 58 80" fill="url(#neuronBody)" stroke="#CBD5E1" strokeWidth="1.5" />
          <path d="M 52 95 Q 22 92 18 105 Q 35 110 52 105" fill="url(#neuronBody)" stroke="#CBD5E1" strokeWidth="1.5" />

          {/* Side Dendrites (Right - Branching) */}
          <path d="M 140 70 Q 170 58 178 70 Q 160 80 142 82" fill="url(#neuronBody)" stroke="#CBD5E1" strokeWidth="1.5" />
          <path d="M 148 95 Q 178 95 184 108 Q 165 112 148 105" fill="url(#neuronBody)" stroke="#CBD5E1" strokeWidth="1.5" />

          {/* Cute Left Arm (Waving!) */}
          {mood === 'waving' ? (
            <g className="animate-float" style={{ transformOrigin: '48px 115px' }}>
              <path
                d="M 55 110 C 35 100 20 80 24 68 C 28 62 38 68 45 80 C 50 88 58 108 58 115"
                fill="url(#neuronBody)"
                stroke="#CBD5E1"
                strokeWidth="1.5"
              />
              {/* Hand with little waving fingers */}
              <circle cx="23" cy="67" r="6" fill="url(#neuronBody)" stroke="#CBD5E1" strokeWidth="1.2" />
              <circle cx="19" cy="62" r="4.5" fill="url(#neuronBody)" />
              <circle cx="28" cy="63" r="4.5" fill="url(#neuronBody)" />
            </g>
          ) : (
            <path
              d="M 55 115 C 38 120 28 135 32 145 C 38 142 50 128 58 122"
              fill="url(#neuronBody)"
              stroke="#CBD5E1"
              strokeWidth="1.5"
            />
          )}

          {/* Cute Right Arm */}
          {mood === 'pointing' ? (
            <g>
              <path
                d="M 145 115 C 160 118 175 130 180 140 C 172 145 155 132 142 122"
                fill="url(#neuronBody)"
                stroke="#CBD5E1"
                strokeWidth="1.5"
              />
              <circle cx="180" cy="140" r="5" fill="#38BDF8" />
            </g>
          ) : (
            <path
              d="M 145 110 C 162 108 174 125 170 140 C 164 142 152 126 142 118"
              fill="url(#neuronBody)"
              stroke="#CBD5E1"
              strokeWidth="1.5"
            />
          )}

          {/* Main Neuron Core / Head */}
          <ellipse
            cx="100"
            cy="95"
            rx="46"
            ry="46"
            fill="url(#neuronBody)"
            stroke="#CBD5E1"
            strokeWidth="1.5"
            filter="url(#shadowGlow)"
          />

          {/* Big, Friendly, Expressive Cartoon Eyes */}
          {/* Left Eye */}
          <ellipse cx="84" cy="88" rx="11" ry="14" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="1" />
          <ellipse cx="85" cy="89" rx="7.5" ry="9.5" fill="url(#neuronEyeGlow)" />
          <ellipse cx="86" cy="89" rx="4" ry="5" fill="#0F172A" />
          {/* Eye Catchlight Reflection */}
          <circle cx="83" cy="85" r="2.8" fill="#FFFFFF" />
          <circle cx="87" cy="92" r="1.4" fill="#FFFFFF" />

          {/* Right Eye */}
          <ellipse cx="116" cy="88" rx="11" ry="14" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="1" />
          <ellipse cx="115" cy="89" rx="7.5" ry="9.5" fill="url(#neuronEyeGlow)" />
          <ellipse cx="114" cy="89" rx="4" ry="5" fill="#0F172A" />
          {/* Eye Catchlight Reflection */}
          <circle cx="113" cy="85" r="2.8" fill="#FFFFFF" />
          <circle cx="117" cy="92" r="1.4" fill="#FFFFFF" />

          {/* Cheerful Eyebrows */}
          <path d="M 74 72 Q 84 66 94 72" fill="none" stroke="#64748B" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M 106 72 Q 116 66 126 72" fill="none" stroke="#64748B" strokeWidth="2.5" strokeLinecap="round" />

          {/* Warm Rosy Cheeks */}
          <ellipse cx="73" cy="104" rx="6" ry="3.5" fill="#F43F5E" opacity="0.25" />
          <ellipse cx="127" cy="104" rx="6" ry="3.5" fill="#F43F5E" opacity="0.25" />

          {/* Big Warm Smile */}
          <path
            d="M 82 108 Q 100 128 118 108"
            fill="#BE123C"
            stroke="#991B1B"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          {/* Cute Little Tooth */}
          <path d="M 94 108 L 106 108 L 104 112 L 96 112 Z" fill="#FFFFFF" />

          {/* Legs */}
          <path d="M 85 138 Q 80 165 72 182 Q 62 185 64 190 Q 82 190 88 178 Q 94 160 92 138" fill="url(#neuronBody)" stroke="#CBD5E1" strokeWidth="1.2" />
          <path d="M 112 138 Q 118 165 128 182 Q 138 185 136 190 Q 118 190 112 178 Q 106 160 108 138" fill="url(#neuronBody)" stroke="#CBD5E1" strokeWidth="1.2" />
        </svg>
      </div>
    </div>
  );
};
