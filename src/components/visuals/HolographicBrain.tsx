import React from 'react';
import { Brain, Sparkles, Check, Lock } from 'lucide-react';

interface HolographicBrainProps {
  showBadges?: boolean;
  highlightArea?: 'memory' | 'attention' | 'perception' | 'reasoning' | 'coordination' | 'all';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const HolographicBrain: React.FC<HolographicBrainProps> = ({
  showBadges = false,
  highlightArea = 'memory',
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-44 h-44',
    md: 'w-64 h-64',
    lg: 'w-80 h-80',
  };

  return (
    <div className={`relative flex flex-col items-center justify-center select-none ${className}`}>
      {/* Hologram Lighting Ring & Tech Platform (Page 15 & 17) */}
      <div className="absolute -bottom-6 w-48 sm:w-60 h-10 bg-blue-500/20 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute -bottom-2 w-40 sm:w-52 h-4 rounded-full border border-cyan-400/40 bg-cyan-900/30 backdrop-blur-sm shadow-[0_0_20px_rgba(6,182,212,0.6)]"></div>

      {/* Hologram Floating Brain Visual */}
      <div className={`relative ${sizeClasses[size]} flex items-center justify-center animate-float`}>
        {/* Glowing Neural Network Background */}
        <div className="absolute inset-0 bg-radial from-cyan-500/30 via-blue-600/10 to-transparent rounded-full blur-2xl"></div>

        <svg
          viewBox="0 0 300 240"
          className="w-full h-full drop-shadow-[0_0_25px_rgba(56,189,248,0.6)] overflow-visible"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="brainBlueGlow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="50%" stopColor="#0284C7" />
              <stop offset="100%" stopColor="#1E3A8A" />
            </linearGradient>
            <linearGradient id="brainGreenGlow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#34D399" />
              <stop offset="70%" stopColor="#059669" />
              <stop offset="100%" stopColor="#064E3B" />
            </linearGradient>
            <filter id="glowFilter" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Left Hemisphere Outline / Neural Lattice */}
          <path
            d="M 150 40 C 110 40, 70 65, 60 100 C 50 135, 75 180, 110 190 C 130 195, 145 180, 150 170 Z"
            fill="none"
            stroke="#0284C7"
            strokeWidth="2.5"
            strokeDasharray="4,2"
            opacity="0.8"
          />

          {/* Right Hemisphere (Memory highlight region - glowing emerald green when active) */}
          <path
            d="M 150 40 C 190 40, 230 65, 240 100 C 250 135, 225 180, 190 190 C 170 195, 155 180, 150 170 Z"
            fill={highlightArea === 'memory' || highlightArea === 'all' ? 'url(#brainGreenGlow)' : 'none'}
            stroke={highlightArea === 'memory' || highlightArea === 'all' ? '#10B981' : '#0284C7'}
            strokeWidth="3"
            opacity={highlightArea === 'memory' ? '0.75' : '0.4'}
            filter="url(#glowFilter)"
          />

          {/* Neural Synapses & Network Nodes (Glowing dots connected with lines) */}
          {/* Constellation Nodes */}
          <g stroke="#38BDF8" strokeWidth="1.2" opacity="0.65">
            <line x1="85" y1="80" x2="120" y2="70" />
            <line x1="120" y1="70" x2="150" y2="60" />
            <line x1="85" y1="80" x2="90" y2="120" />
            <line x1="90" y1="120" x2="130" y2="110" />
            <line x1="130" y1="110" x2="150" y2="130" />
            <line x1="130" y1="110" x2="110" y2="160" />
            <line x1="110" y1="160" x2="140" y2="175" />

            {/* Green lit constellation on Memory region */}
            <g stroke="#34D399" strokeWidth="1.5">
              <line x1="150" y1="60" x2="180" y2="70" />
              <line x1="180" y1="70" x2="215" y2="80" />
              <line x1="180" y1="70" x2="170" y2="110" />
              <line x1="170" y1="110" x2="210" y2="120" />
              <line x1="210" y1="120" x2="225" y2="155" />
              <line x1="170" y1="110" x2="190" y2="160" />
              <line x1="190" y1="160" x2="160" y2="175" />
            </g>
          </g>

          {/* Glowing Neural Dots */}
          <circle cx="85" cy="80" r="3.5" fill="#38BDF8" />
          <circle cx="120" cy="70" r="4" fill="#38BDF8" />
          <circle cx="90" cy="120" r="4.5" fill="#38BDF8" />
          <circle cx="130" cy="110" r="4.5" fill="#38BDF8" />
          <circle cx="110" cy="160" r="3.5" fill="#38BDF8" />
          <circle cx="140" cy="175" r="3" fill="#38BDF8" />

          {/* Memory Active Glowing Synapses */}
          <circle cx="180" cy="70" r="5" fill="#34D399" className="animate-ping" style={{ animationDuration: '3s' }} />
          <circle cx="180" cy="70" r="4.5" fill="#10B981" />
          <circle cx="215" cy="80" r="4" fill="#34D399" />
          <circle cx="170" cy="110" r="5.5" fill="#10B981" />
          <circle cx="210" cy="120" r="5" fill="#34D399" />
          <circle cx="190" cy="160" r="4.5" fill="#10B981" />
          <circle cx="160" cy="175" r="3.5" fill="#34D399" />

          {/* Brain Stem */}
          <path
            d="M 142 175 Q 140 215 130 225 L 170 225 Q 160 215 158 175 Z"
            fill="none"
            stroke="#0284C7"
            strokeWidth="2"
            opacity="0.6"
          />
        </svg>

        {/* Cognitive Badges matching Reference Screenshots (Pages 12 & 14) */}
        {showBadges && (
          <>
            {/* Memory Pill (Unlocked / Green) */}
            <div className="absolute right-0 top-12 px-3 py-1.5 rounded-full bg-emerald-950/90 border border-emerald-500/80 shadow-[0_0_15px_rgba(16,185,129,0.5)] flex items-center space-x-1.5 text-xs sm:text-sm font-semibold text-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Memory</span>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            </div>

            {/* Attention Pill */}
            <div className="absolute top-2 left-6 px-3 py-1 rounded-full bg-slate-900/90 border border-blue-500/40 flex items-center space-x-1.5 text-xs text-blue-200">
              <Lock className="w-3 h-3 text-blue-400" />
              <span>Attention</span>
            </div>

            {/* Perception Pill */}
            <div className="absolute bottom-16 left-0 px-3 py-1 rounded-full bg-slate-900/90 border border-blue-500/40 flex items-center space-x-1.5 text-xs text-blue-200">
              <Lock className="w-3 h-3 text-blue-400" />
              <span>Perception</span>
            </div>

            {/* Reasoning Pill */}
            <div className="absolute bottom-10 right-4 px-3 py-1 rounded-full bg-slate-900/90 border border-blue-500/40 flex items-center space-x-1.5 text-xs text-blue-200">
              <Lock className="w-3 h-3 text-blue-400" />
              <span>Reasoning</span>
            </div>

            {/* Coordination Pill */}
            <div className="absolute -bottom-2 left-10 px-3 py-1 rounded-full bg-slate-900/90 border border-blue-500/40 flex items-center space-x-1.5 text-xs text-blue-200">
              <Lock className="w-3 h-3 text-blue-400" />
              <span>Coordination</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
