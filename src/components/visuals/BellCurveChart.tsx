import React from 'react';
import { Award, ShieldCheck } from 'lucide-react';

interface BellCurveChartProps {
  score?: number;
  showResearchBadges?: boolean;
  className?: string;
}

export const BellCurveChart: React.FC<BellCurveChartProps> = ({
  score = 48,
  showResearchBadges = true,
  className = '',
}) => {
  // Map score (0 to 100) to SVG x-coordinates (30 to 270)
  const scoreX = 30 + (score / 100) * 240;

  return (
    <div className={`w-full flex flex-col items-center select-none ${className}`}>
      {/* Your Score floating pin bubble */}
      <div className="relative mb-2 flex flex-col items-center animate-bounce" style={{ animationDuration: '2.5s' }}>
        <div className="px-3.5 py-1 rounded-full bg-slate-900 border border-amber-400 text-amber-300 font-bold text-xs sm:text-sm shadow-[0_0_12px_rgba(245,158,11,0.5)]">
          Your Score: {score}
        </div>
        <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] border-t-amber-400"></div>
      </div>

      {/* Bell Curve SVG matching Page 13 */}
      <div className="w-full max-w-xs sm:max-w-sm px-2">
        <svg viewBox="0 0 300 130" className="w-full h-auto overflow-visible" xmlns="http://www.w3.org/2000/svg">
          <defs>
            {/* Shaded gold area under curve */}
            <linearGradient id="curveGoldFill" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#D97706" stopOpacity="0.4" />
            </linearGradient>
            <linearGradient id="curveBlueFill" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0284C7" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#0369A1" stopOpacity="0.05" />
            </linearGradient>
          </defs>

          {/* Background baseline */}
          <line x1="20" y1="105" x2="280" y2="105" stroke="#334155" strokeWidth="2" strokeLinecap="round" />

          {/* Full Bell Curve Background (Blue/cyan) */}
          <path
            d="M 25 105 C 80 105, 110 95, 130 50 C 142 20, 158 20, 170 50 C 190 95, 220 105, 275 105 Z"
            fill="url(#curveBlueFill)"
            stroke="#0284C7"
            strokeWidth="2.5"
          />

          {/* Shaded Gold Segment up to User Score */}
          <path
            d={`M 25 105 C 80 105, 110 95, 130 50 C 142 20, 150 20, ${scoreX} 35 L ${scoreX} 105 Z`}
            fill="url(#curveGoldFill)"
            stroke="#F59E0B"
            strokeWidth="2"
          />

          {/* Vertical marker line at score position */}
          <line
            x1={scoreX}
            y1="32"
            x2={scoreX}
            y2="105"
            stroke="#FBBF24"
            strokeWidth="2.5"
            strokeDasharray="3,2"
          />
          {/* Glowing dot on curve */}
          <circle cx={scoreX} cy="34" r="5.5" fill="#FBBF24" stroke="#78350F" strokeWidth="1.5" />
          <circle cx={scoreX} cy="34" r="2.5" fill="#FFFFFF" />

          {/* Axis numbers matching Reference Page 13 (0, 50, 100) */}
          <text x="25" y="122" fill="#94A3B8" fontSize="12" fontWeight="600" textAnchor="middle">0</text>
          <text x="150" y="122" fill="#94A3B8" fontSize="12" fontWeight="600" textAnchor="middle">50</text>
          <text x="275" y="122" fill="#94A3B8" fontSize="12" fontWeight="600" textAnchor="middle">100</text>
        </svg>
      </div>

      {/* Scientific Research Trust Banner */}
      {showResearchBadges && (
        <div className="mt-6 flex flex-col items-center text-center">
          <p className="text-slate-300 text-sm font-medium tracking-wide">
            Backed by over 20 years of scientific research
          </p>
          <div className="mt-2.5 flex items-center justify-center space-x-4 text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-slate-800/60 border border-slate-700/50">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>AIIMS Guwahati</span>
            </div>
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-slate-800/60 border border-slate-700/50">
              <Award className="w-4 h-4 text-blue-400" />
              <span>ICMR Dementia Network</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
