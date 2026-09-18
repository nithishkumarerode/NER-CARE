import React from 'react';
import { Bell, Volume2, VolumeX, Wifi, WifiOff, PhoneCall, Palette } from 'lucide-react';
import { Patient } from '../../types';

interface TopHeaderProps {
  patient: Patient;
  pendingRemindersCount: number;
  isOffline: boolean;
  onBellClick: () => void;
  onVoiceToggle: () => void;
  onEmergencyClick: () => void;
  onOpenAppearance?: () => void;
  className?: string;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  patient,
  pendingRemindersCount,
  isOffline,
  onBellClick,
  onVoiceToggle,
  onEmergencyClick,
  onOpenAppearance,
  className = '',
}) => {
  return (
    <header className={`w-full max-w-xl mx-auto px-4 py-3 flex items-center justify-between select-none ${className}`}>
      {/* Left Action: Bell Notification with badge matching Page 15 */}
      <button
        onClick={onBellClick}
        aria-label="View Reminders"
        className="relative w-12 h-12 rounded-full bg-slate-900/80 border border-slate-700/60 flex items-center justify-center text-white active:scale-95 transition-all shadow-md"
      >
        <Bell className="w-6 h-6 text-slate-200" />
        {pendingRemindersCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-500 border-2 border-[#070F1E] flex items-center justify-center text-[11px] font-extrabold text-slate-950 animate-pulse">
            {pendingRemindersCount}
          </span>
        )}
      </button>

      {/* Center: Online/Offline Badge & Regional Identity */}
      <div className="flex flex-col items-center">
        <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-700/80 text-xs font-semibold">
          {isOffline ? (
            <>
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              <WifiOff className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-amber-300">Offline Safe</span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <Wifi className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-300">Cloud Synced</span>
            </>
          )}
        </div>
      </div>

      {/* Right Action: Voice Guidance toggle & Pill matching Page 15 ("0 N") */}
      <div className="flex items-center space-x-2">
        <button
          onClick={onVoiceToggle}
          title={patient.voice_enabled ? "Voice Guidance Active" : "Voice Muted"}
          className={`flex items-center space-x-1 px-3 py-2 rounded-full border transition-all active:scale-95 shadow-md ${
            patient.voice_enabled
              ? 'bg-blue-600/30 border-blue-400 text-blue-300'
              : 'bg-slate-900/80 border-slate-700 text-slate-400'
          }`}
        >
          {patient.voice_enabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4" />}
          <span className="text-xs font-bold">{patient.voice_enabled ? 'ON' : 'OFF'}</span>
        </button>

        {/* Theme Appearance Quick Button */}
        {onOpenAppearance && (
          <button
            onClick={onOpenAppearance}
            title="Change Theme & Background"
            className="w-10 h-10 rounded-full theme-card flex items-center justify-center text-cyan-300 hover:text-white active:scale-95 transition-all shadow-md"
          >
            <Palette className="w-4 h-4" />
          </button>
        )}

        {/* Emergency Call Quick Button */}
        <button
          onClick={onEmergencyClick}
          title="Contact Caregiver"
          className="w-10 h-10 rounded-full bg-rose-950/80 border border-rose-500/50 flex items-center justify-center text-rose-300 active:scale-95 transition-all shadow-md"
        >
          <PhoneCall className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
