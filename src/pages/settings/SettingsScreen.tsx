import React, { useState } from 'react';
import { Settings, Volume2, Type, Eye, Clock, Globe, User, Shield, HelpCircle, Wifi, RefreshCw, Edit3, Palette } from 'lucide-react';
import { Language, Patient, TextSize, UserRole } from '../../types';
import { getTranslation, SUPPORTED_LANGUAGES } from '../../locales/translations';
import { patientRepository } from '../../repositories/patientRepository';
import { syncRepository } from '../../repositories/syncRepository';
import { voiceService } from '../../services/voiceService';
import { themeService } from '../../services/themeService';

interface SettingsScreenProps {
  language: Language;
  patient: Patient;
  currentRole: UserRole;
  onLanguageClick: () => void;
  onAppearanceClick: () => void;
  onRoleChange: (role: UserRole) => void;
  onPatientUpdate: (patient: Patient) => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  language,
  patient,
  currentRole,
  onLanguageClick,
  onAppearanceClick,
  onRoleChange,
  onPatientUpdate,
}) => {
  const [showNameModal, setShowNameModal] = useState(false);
  const [nameInput, setNameInput] = useState(patient.name);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState('');

  const activeTheme = themeService.getActiveTheme();

  const currentLangInfo = SUPPORTED_LANGUAGES.find(l => l.code === language);

  const handleTextSizeChange = (size: TextSize) => {
    document.body.classList.remove('text-size-normal', 'text-size-large', 'text-size-xlarge');
    document.body.classList.add(`text-size-${size}`);
    const updated = patientRepository.updateTextSize(size);
    onPatientUpdate(updated);
    voiceService.speak(`Text size set to ${size}`, language);
  };

  const handleToggleVoice = () => {
    const newVal = !patient.voice_enabled;
    const updated = patientRepository.updatePatient({ voice_enabled: newVal });
    onPatientUpdate(updated);
    if (newVal) {
      voiceService.speak('Voice guidance turned on.', language);
    }
  };

  const handleToggleContrast = () => {
    const newVal = !patient.high_contrast;
    if (newVal) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
    const updated = patientRepository.updatePatient({ high_contrast: newVal });
    onPatientUpdate(updated);
  };

  const handleToggleGentlePace = () => {
    const newVal = !patient.reduce_time_pressure;
    const updated = patientRepository.updatePatient({ reduce_time_pressure: newVal });
    onPatientUpdate(updated);
    voiceService.speak(newVal ? 'Gentle pace mode activated. No timer pressure.' : 'Standard pace enabled.', language);
  };

  const handleSaveName = () => {
    if (!nameInput.trim()) return;
    const updated = patientRepository.updatePatient({ name: nameInput.trim() });
    onPatientUpdate(updated);
    setShowNameModal(false);
    voiceService.playSuccessChime();
    voiceService.speak(`Hello ${nameInput.trim()}, your name has been saved.`, language);
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    setSyncFeedback('Synchronizing local records...');
    const res = await syncRepository.processSyncQueue();
    setIsSyncing(false);
    setSyncFeedback(res.processed > 0 ? `Synced ${res.processed} records successfully!` : 'All data already synchronized.');
    setTimeout(() => setSyncFeedback(''), 3000);
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 pb-28 pt-2 select-none animate-fade-in">
      {/* Title */}
      <div className="mb-5">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Accessibility & Settings
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 mt-1">
          Designed with large, comfortable controls for daily ease.
        </p>
      </div>

      {/* Patient Profile Header Card */}
      <div className="p-5 rounded-3xl bg-[#0E1A33] border border-blue-500/25 mb-5 shadow-xl flex items-center justify-between">
        <div className="flex items-center space-x-3.5">
          <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-blue-600 to-sky-400 border-2 border-white/60 flex items-center justify-center text-2xl font-black text-white shadow-md">
            {patient.name.charAt(0)}
          </div>
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight">{patient.name}</h3>
            <p className="text-xs text-slate-300">Age: {patient.age} • {patient.region_code}</p>
          </div>
        </div>

        <button
          onClick={() => {
            setNameInput(patient.name);
            setShowNameModal(true);
          }}
          className="p-2.5 rounded-xl bg-blue-900/60 border border-blue-400/40 text-cyan-300 hover:text-white active:scale-90 transition-all shadow"
        >
          <Edit3 className="w-5 h-5" />
        </button>
      </div>

      {/* Theme & Appearance Customization matching User Requirement 1 */}
      <div
        onClick={onAppearanceClick}
        className="p-5 rounded-3xl theme-card border border-blue-500/25 mb-5 shadow-xl flex items-center justify-between cursor-pointer hover:border-cyan-400/50 active:scale-98 transition-all"
      >
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-2xl text-white shadow-md">
            {activeTheme.icon}
          </div>
          <div className="text-left">
            <h4 className="text-base font-bold text-white tracking-tight">Theme & Appearance</h4>
            <p className="text-xs text-slate-300">
              Current: <span className="font-bold text-cyan-400">{activeTheme.name}</span>
            </p>
          </div>
        </div>

        <span className="text-xs font-bold text-cyan-300 px-3 py-1.5 rounded-xl bg-blue-950 border border-blue-800">
          Customize →
        </span>
      </div>

      {/* Section 1: Accessibility Controls matching Requirement 25 */}
      <div className="p-5 rounded-3xl bg-[#0E1A33] border border-blue-500/20 mb-5 shadow-xl space-y-5">
        <h3 className="text-sm font-bold text-cyan-300 uppercase tracking-wider flex items-center space-x-2">
          <Eye className="w-4 h-4" />
          <span>Visual & Hearing Comfort</span>
        </h3>

        {/* Text Sizing Option */}
        <div>
          <label className="text-xs sm:text-sm font-semibold text-slate-300 mb-2 block">
            🔤 Text Size
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['normal', 'large', 'xlarge'] as TextSize[]).map((sz) => (
              <button
                key={sz}
                onClick={() => handleTextSizeChange(sz)}
                className={`py-2.5 rounded-xl text-xs sm:text-sm font-bold border-2 transition-all ${
                  patient.text_size === sz
                    ? 'bg-blue-600 border-cyan-300 text-white shadow-md'
                    : 'bg-slate-900/70 border-slate-700 text-slate-300 hover:border-slate-500'
                }`}
              >
                {sz === 'normal' ? 'Normal' : sz === 'large' ? 'Large' : 'Extra Large'}
              </button>
            ))}
          </div>
        </div>

        {/* Voice Guidance Toggle */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <div>
            <h4 className="text-sm sm:text-base font-bold text-white">🔊 Voice Guidance</h4>
            <p className="text-xs text-slate-400">Read aloud instructions & reminders</p>
          </div>
          <button
            onClick={handleToggleVoice}
            className={`w-14 h-8 rounded-full transition-colors relative flex items-center px-1 ${
              patient.voice_enabled ? 'bg-emerald-500' : 'bg-slate-700'
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full bg-white shadow-md transition-transform ${
                patient.voice_enabled ? 'translate-x-6' : 'translate-x-0'
              }`}
            ></div>
          </button>
        </div>

        {/* High Contrast Mode Toggle */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <div>
            <h4 className="text-sm sm:text-base font-bold text-white">🎨 High Contrast</h4>
            <p className="text-xs text-slate-400">Strong borders for low vision</p>
          </div>
          <button
            onClick={handleToggleContrast}
            className={`w-14 h-8 rounded-full transition-colors relative flex items-center px-1 ${
              patient.high_contrast ? 'bg-emerald-500' : 'bg-slate-700'
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full bg-white shadow-md transition-transform ${
                patient.high_contrast ? 'translate-x-6' : 'translate-x-0'
              }`}
            ></div>
          </button>
        </div>

        {/* Reduce Time Pressure Toggle */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <div>
            <h4 className="text-sm sm:text-base font-bold text-white">⏱️ Gentle Pace</h4>
            <p className="text-xs text-slate-400">Remove timer countdowns in games</p>
          </div>
          <button
            onClick={handleToggleGentlePace}
            className={`w-14 h-8 rounded-full transition-colors relative flex items-center px-1 ${
              patient.reduce_time_pressure ? 'bg-emerald-500' : 'bg-slate-700'
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full bg-white shadow-md transition-transform ${
                patient.reduce_time_pressure ? 'translate-x-6' : 'translate-x-0'
              }`}
            ></div>
          </button>
        </div>
      </div>

      {/* Section 2: Language & Region */}
      <div
        onClick={onLanguageClick}
        className="p-5 rounded-3xl bg-[#0E1A33] border border-blue-500/20 mb-5 shadow-xl flex items-center justify-between cursor-pointer hover:border-cyan-400/40 active:scale-98 transition-all"
      >
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-cyan-950 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
            <Globe className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-base font-bold text-white">Language / ভাষা</h4>
            <p className="text-xs text-slate-300">
              Current: <span className="font-bold text-cyan-300">{currentLangInfo?.nativeName}</span> ({currentLangInfo?.name})
            </p>
          </div>
        </div>

        <span className="text-xs font-bold text-blue-400 px-3 py-1.5 rounded-xl bg-blue-950 border border-blue-800">
          Change →
        </span>
      </div>

      {/* Section 3: Offline Data & Cloud Sync */}
      <div className="p-5 rounded-3xl bg-[#0E1A33] border border-blue-500/20 mb-5 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Wifi className="w-5 h-5 text-emerald-400" />
            <h4 className="text-base font-bold text-white">Offline Storage & Sync</h4>
          </div>
          <span className="text-xs font-bold text-emerald-400">IndexedDB Active</span>
        </div>
        <p className="text-xs text-slate-300 mb-4 leading-relaxed">
          All games, sessions, and reminder confirmations are safely stored on this device and auto-sync when online.
        </p>

        {syncFeedback && (
          <div className="p-2.5 rounded-xl bg-emerald-950 border border-emerald-400 text-emerald-300 text-xs font-bold mb-3 text-center animate-fade-in">
            {syncFeedback}
          </div>
        )}

        <button
          onClick={handleManualSync}
          disabled={isSyncing}
          className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 font-bold text-sm flex items-center justify-center space-x-2 active:scale-98 transition-all"
        >
          <RefreshCw className={`w-4 h-4 text-cyan-400 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>{isSyncing ? 'Synchronizing...' : 'Run Cloud Sync Now'}</span>
        </button>
      </div>

      {/* Section 4: Role Switcher (Patient / Caregiver / ASHA) */}
      <div className="p-5 rounded-3xl bg-[#0E1A33] border border-blue-500/20 mb-6 shadow-xl">
        <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3">
          Active Interface Role
        </h4>
        <div className="grid grid-cols-3 gap-2">
          {(['patient', 'caregiver', 'asha'] as UserRole[]).map((r) => (
            <button
              key={r}
              onClick={() => onRoleChange(r)}
              className={`py-3 rounded-2xl text-xs sm:text-sm font-extrabold border-2 transition-all ${
                currentRole === r
                  ? 'bg-gradient-to-r from-blue-600 to-sky-500 border-cyan-300 text-white shadow-lg'
                  : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
              }`}
            >
              {r === 'patient' ? 'Elderly Patient' : r === 'caregiver' ? 'Family Caregiver' : 'ASHA Worker'}
            </button>
          ))}
        </div>
      </div>

      {/* MODAL: Tell us your name first matching Reference Page 20 */}
      {showNameModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-sm p-6 rounded-3xl bg-[#0F1E38] border border-blue-400/40 shadow-2xl relative">
            <h3 className="text-2xl font-extrabold text-white text-center mb-6 tracking-tight">
              {getTranslation(language, 'patientName')}
            </h3>

            <div className="mb-6">
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder={getTranslation(language, 'writeYourName')}
                className="w-full px-5 py-4 rounded-2xl bg-[#142444] border-2 border-blue-500/40 text-white text-lg font-bold placeholder-slate-400 focus:border-cyan-400 outline-none shadow-inner"
              />
            </div>

            <div className="space-y-3">
              <button
                onClick={handleSaveName}
                className="w-full py-4 rounded-2xl bg-[#0080FF] hover:bg-[#006CD9] text-white font-extrabold text-lg shadow-lg shadow-blue-600/40 active:scale-[0.98] transition-all"
              >
                {getTranslation(language, 'save')}
              </button>

              <button
                onClick={() => setShowNameModal(false)}
                className="w-full py-2.5 text-center text-slate-400 hover:text-white font-semibold text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
