import React, { useState } from 'react';
import { Terminal, Wifi, WifiOff, BellRing, Brain, RefreshCw, Users, ShieldCheck, X, Palette } from 'lucide-react';
import { UserRole, Reminder, Language } from '../../types';
import { syncRepository } from '../../repositories/syncRepository';
import { voiceService } from '../../services/voiceService';

interface DemoToolbarProps {
  currentRole: UserRole;
  isOffline: boolean;
  onToggleOffline: () => void;
  onTriggerAlarm: () => void;
  onSimulateGame: () => void;
  onRoleChange: (role: UserRole) => void;
  onSync: () => void;
  onResetData: () => void;
  onOpenAppearance?: () => void;
}

export const DemoToolbar: React.FC<DemoToolbarProps> = ({
  currentRole,
  isOffline,
  onToggleOffline,
  onTriggerAlarm,
  onSimulateGame,
  onRoleChange,
  onSync,
  onResetData,
  onOpenAppearance,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Discreet Demo Floating Button */}
      <div className="fixed top-3 right-3 z-50 select-none">
        <button
          onClick={() => setIsOpen(!isOpen)}
          title="Open Hackathon Demo Controls"
          className="px-2.5 py-1 rounded-full bg-slate-900/90 hover:bg-slate-800 border border-cyan-400/50 text-[11px] font-bold text-cyan-300 flex items-center space-x-1 shadow-lg active:scale-95 transition-all"
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>Demo</span>
        </button>
      </div>

      {/* Floating Demo Drawer */}
      {isOpen && (
        <div className="fixed top-12 right-3 z-50 w-72 p-4 rounded-3xl bg-[#091326]/95 border border-cyan-400/50 shadow-2xl backdrop-blur-xl text-white select-none animate-scale-in">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-700/60">
            <span className="text-xs font-black text-cyan-300 uppercase tracking-wider flex items-center space-x-1">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>Jury Demo Controls</span>
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="w-6 h-6 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2">
            {/* Toggle Network */}
            <button
              onClick={onToggleOffline}
              className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-between transition-all ${
                isOffline ? 'bg-amber-950 text-amber-300 border border-amber-500/50' : 'bg-slate-800 text-slate-200 border border-slate-700'
              }`}
            >
              <span className="flex items-center space-x-1.5">
                {isOffline ? <WifiOff className="w-3.5 h-3.5 text-amber-400" /> : <Wifi className="w-3.5 h-3.5 text-emerald-400" />}
                <span>{isOffline ? 'Offline Mode (Active)' : 'Online Mode'}</span>
              </span>
              <span className="text-[10px] text-cyan-300">Toggle</span>
            </button>

            {/* Trigger Alarm */}
            <button
              onClick={onTriggerAlarm}
              className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold flex items-center justify-between text-slate-200"
            >
              <span className="flex items-center space-x-1.5">
                <BellRing className="w-3.5 h-3.5 text-rose-400" />
                <span>Trigger Live Alarm</span>
              </span>
              <span className="text-[10px] text-cyan-300">Fire</span>
            </button>

            {/* Simulate Game Completion */}
            <button
              onClick={onSimulateGame}
              className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold flex items-center justify-between text-slate-200"
            >
              <span className="flex items-center space-x-1.5">
                <Brain className="w-3.5 h-3.5 text-cyan-400" />
                <span>Simulate Game & AI</span>
              </span>
              <span className="text-[10px] text-cyan-300">Run</span>
            </button>

            {/* Theme & Appearance Customizer */}
            {onOpenAppearance && (
              <button
                onClick={() => {
                  onOpenAppearance();
                  setIsOpen(false);
                }}
                className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-blue-900 to-indigo-950 hover:from-blue-800 hover:to-indigo-900 border border-cyan-400/50 text-xs font-bold flex items-center justify-between text-cyan-200 shadow-md"
              >
                <span className="flex items-center space-x-1.5">
                  <Palette className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Customize Theme & Color</span>
                </span>
                <span className="text-[10px] text-white">Open</span>
              </button>
            )}

            {/* Run Cloud Sync */}
            <button
              onClick={onSync}
              className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold flex items-center justify-between text-slate-200"
            >
              <span className="flex items-center space-x-1.5">
                <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
                <span>Trigger Cloud Sync</span>
              </span>
              <span className="text-[10px] text-cyan-300">Sync</span>
            </button>

            {/* Role Switch */}
            <div className="pt-2 border-t border-slate-800">
              <span className="text-[10px] text-slate-400 font-bold block mb-1">Switch View Role:</span>
              <div className="grid grid-cols-3 gap-1">
                {(['patient', 'caregiver', 'asha'] as UserRole[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => onRoleChange(r)}
                    className={`py-1 rounded-lg text-[10px] font-extrabold capitalize ${
                      currentRole === r ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Reset data */}
            <div className="pt-2">
              <button
                onClick={onResetData}
                className="w-full py-1 text-center text-[10px] text-slate-400 hover:text-rose-400 underline"
              >
                Reset Default Seed Data
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
