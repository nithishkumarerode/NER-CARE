import React, { useState } from 'react';
import { ArrowLeft, Palette, Sparkles, Check, AlertTriangle, ShieldCheck, RefreshCw, Sun, Moon, Waves, Leaf, Heart, Eye } from 'lucide-react';
import { ThemeId, ThemeConfig, BackgroundStyle, UserAppearancePreference } from '../../types/theme';
import { themeService, PRESET_THEMES, ELDERLY_COLOR_PRESETS } from '../../services/themeService';
import { auditColorAccessibility, getContrastRatio } from '../../utils/contrast';
import { voiceService } from '../../services/voiceService';
import { Language } from '../../types';

interface AppearanceScreenProps {
  language: Language;
  onBack: () => void;
}

export const AppearanceScreen: React.FC<AppearanceScreenProps> = ({
  language,
  onBack,
}) => {
  const [pref, setPref] = useState<UserAppearancePreference>(themeService.getPreference());
  const [customHex, setCustomHex] = useState<string>(
    pref.customBackgroundColor || '#060D1E'
  );
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);

  // Active theme calculation
  const activeTheme: ThemeConfig = themeService.getActiveTheme();

  // Audit contrast
  const audit = auditColorAccessibility(activeTheme.appBackground, activeTheme.primaryText);

  const handleSelectPresetTheme = (themeId: ThemeId) => {
    voiceService.playTone(523.25, 100, 'sine', 0.08);
    const newPref: UserAppearancePreference = {
      ...pref,
      themeId,
      highContrastMode: themeId === 'high-contrast',
    };
    setPref(newPref);
    themeService.savePreference(newPref);

    const themeName = PRESET_THEMES[themeId]?.name || themeId;
    voiceService.speak(`${themeName} theme selected.`, language);
  };

  const handleSelectBackgroundStyle = (style: BackgroundStyle) => {
    voiceService.playTone(587.33, 80, 'sine', 0.08);
    const newPref: UserAppearancePreference = {
      ...pref,
      backgroundStyle: style,
    };
    setPref(newPref);
    themeService.savePreference(newPref);
  };

  const handleApplyCustomColor = (colorHex: string) => {
    voiceService.playSuccessChime();
    setCustomHex(colorHex);
    const newPref: UserAppearancePreference = {
      themeId: 'custom',
      customBackgroundColor: colorHex,
      backgroundStyle: pref.backgroundStyle,
      highContrastMode: false,
    };
    setPref(newPref);
    themeService.savePreference(newPref);
    voiceService.speak('Custom background applied.', language);
  };

  const handleUseAccessibleVersion = () => {
    if (audit.suggestedBackground) {
      handleApplyCustomColor(audit.suggestedBackground);
    }
  };

  const handleReset = () => {
    voiceService.playGentleChime();
    const defaultPref = themeService.resetToDefault();
    setPref(defaultPref);
    setCustomHex('#060D1E');
    setShowResetConfirm(false);
    voiceService.speak('Appearance restored to default navy theme.', language);
  };

  const themeList: ThemeId[] = [
    'dark',
    'light',
    'calm-blue',
    'soft-green',
    'soft-lavender',
    'sky-blue',
    'high-contrast',
  ];

  return (
    <div className="min-h-screen w-full theme-bg text-inherit p-4 sm:p-6 pb-28 select-none animate-fade-in">
      <div className="w-full max-w-md mx-auto">
        {/* Top Header */}
        <div className="flex items-center justify-between mb-5">
          <button
            onClick={onBack}
            aria-label="Back to Settings"
            className="w-12 h-12 rounded-full theme-card flex items-center justify-center active:scale-95 transition-all"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>

          <div className="flex items-center space-x-2">
            <Palette className="w-6 h-6 text-cyan-400" />
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Theme & Appearance</h1>
          </div>

          <button
            onClick={() => setShowResetConfirm(true)}
            aria-label="Reset Theme"
            title="Reset to default"
            className="w-10 h-10 rounded-full theme-card flex items-center justify-center text-slate-300 hover:text-white active:scale-90 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* SECTION 6: LIVE INTERACTIVE MINIATURE PREVIEW */}
        <div className="mb-6 p-4 rounded-3xl theme-card shadow-xl overflow-hidden">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider mb-2.5 opacity-80">
            <span>Live Interactive Preview</span>
            <span className="flex items-center space-x-1 text-cyan-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{activeTheme.name}</span>
            </span>
          </div>

          {/* Miniature App Screen Mockup */}
          <div
            className="w-full rounded-2xl p-4 transition-all duration-300 border"
            style={{
              backgroundColor: activeTheme.appBackground,
              backgroundImage: activeTheme.appBackgroundGradient,
              borderColor: activeTheme.cardBorder,
              color: activeTheme.primaryText,
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-extrabold">Good Morning, Bhaben 👋</span>
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: activeTheme.cardBackground,
                  border: `1px solid ${activeTheme.cardBorder}`,
                  color: activeTheme.secondaryText,
                }}
              >
                10:30 AM
              </span>
            </div>

            {/* Mockup Card */}
            <div
              className="p-3.5 rounded-xl mb-3 shadow-md"
              style={{
                backgroundColor: activeTheme.cardBackground,
                border: `1px solid ${activeTheme.cardBorder}`,
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-xl">🧠</span>
                  <div>
                    <h5 className="text-xs font-extrabold" style={{ color: activeTheme.primaryText }}>
                      Memory Activity
                    </h5>
                    <p className="text-[10px]" style={{ color: activeTheme.secondaryText }}>
                      5 minutes daily focus
                    </p>
                  </div>
                </div>
                <span className="text-xs">✨</span>
              </div>

              {/* Mockup Button */}
              <button
                className="w-full py-2 rounded-lg font-bold text-xs shadow transition-transform active:scale-98"
                style={{
                  backgroundColor: activeTheme.primaryColor,
                  color: activeTheme.buttonText,
                }}
              >
                START ACTIVITY
              </button>
            </div>
          </div>
        </div>

        {/* SECTION 4: ACCESSIBILITY PROTECTION BANNER */}
        {!audit.isReadable ? (
          <div className="mb-6 p-4 rounded-2xl bg-amber-500/15 border-2 border-amber-500/60 text-amber-200 text-xs sm:text-sm flex flex-col space-y-2.5 animate-bounce-subtle">
            <div className="flex items-start space-x-2.5">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-white">{audit.warningMessage}</p>
                <p className="text-xs text-amber-300/90 mt-0.5">
                  Elderly vision requires high contrast for effortless readability.
                </p>
              </div>
            </div>
            {audit.suggestedBackground && (
              <button
                onClick={handleUseAccessibleVersion}
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow-md transition-all active:scale-98"
              >
                ✓ Use Accessible Version (High Contrast Guaranteed)
              </button>
            )}
          </div>
        ) : (
          <div className="mb-6 px-4 py-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="font-bold">WCAG Accessibility Verified</span>
            </div>
            <span className="font-extrabold">{audit.ratio}:1 Ratio</span>
          </div>
        )}

        {/* SECTION 1: PRESET THEME CARDS */}
        <div className="mb-6">
          <h3 className="text-sm font-bold uppercase tracking-wider mb-3 opacity-90">
            Choose Theme / Preset
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {themeList.map((tId) => {
              const theme = PRESET_THEMES[tId];
              const isSelected = pref.themeId === tId && !pref.highContrastMode;
              const isHighContrastSelected = tId === 'high-contrast' && pref.highContrastMode;
              const active = isSelected || isHighContrastSelected;

              return (
                <div
                  key={tId}
                  onClick={() => handleSelectPresetTheme(tId)}
                  className={`p-4 rounded-3xl cursor-pointer transition-all duration-200 border-2 active:scale-98 flex flex-col justify-between ${
                    active
                      ? 'border-cyan-400 shadow-lg shadow-cyan-500/20 scale-[1.02]'
                      : 'border-slate-700/60 hover:border-slate-500/80'
                  }`}
                  style={{
                    backgroundColor: theme.appBackground,
                    color: theme.primaryText,
                  }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{theme.icon}</span>
                      <div>
                        <h4 className="text-sm font-bold tracking-tight">{theme.name}</h4>
                        <span
                          className="text-[10px] block"
                          style={{ color: theme.secondaryText }}
                        >
                          {theme.isDark ? 'Dark mode' : 'Light mode'}
                        </span>
                      </div>
                    </div>
                    {active && (
                      <div className="w-6 h-6 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center shadow">
                        <Check className="w-4 h-4 stroke-[3]" />
                      </div>
                    )}
                  </div>

                  {/* Visual Preview Swatch: Aa Button Card matching user prompt */}
                  <div
                    className="p-2 rounded-xl flex items-center justify-between text-xs font-semibold"
                    style={{
                      backgroundColor: theme.cardBackground,
                      border: `1px solid ${theme.cardBorder}`,
                    }}
                  >
                    <span style={{ color: theme.primaryText }}>Aa Card</span>
                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-bold"
                      style={{
                        backgroundColor: theme.primaryColor,
                        color: theme.buttonText,
                      }}
                    >
                      Button
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION 3: BACKGROUND STYLE (Solid vs Subtle Gradient vs Soft Tint) */}
        <div className="mb-6 p-4 rounded-3xl theme-card shadow-xl">
          <h4 className="text-xs font-bold uppercase tracking-wider mb-3 opacity-90">
            Background Rendering Style
          </h4>
          <div className="grid grid-cols-3 gap-2">
            {(['solid', 'subtle-gradient', 'soft-tint'] as BackgroundStyle[]).map((st) => (
              <button
                key={st}
                onClick={() => handleSelectBackgroundStyle(st)}
                className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all ${
                  pref.backgroundStyle === st
                    ? 'bg-blue-600 text-white border-cyan-400 shadow-md'
                    : 'bg-slate-900/60 border-slate-700 text-slate-300 hover:border-slate-500'
                }`}
              >
                {st === 'solid' ? 'Solid' : st === 'subtle-gradient' ? 'Subtle Gradient' : 'Soft Tint'}
              </button>
            ))}
          </div>
        </div>

        {/* SECTION 2 & 9: CUSTOM COLOR OPTION & SOFT COLOR PALETTE */}
        <div className="mb-6 p-5 rounded-3xl theme-card shadow-xl">
          <div className="flex items-center space-x-2 mb-3">
            <Palette className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider">
              🎨 Customize Background Color
            </h3>
          </div>

          <p className="text-xs opacity-80 mb-4 leading-relaxed">
            Choose from restful elderly-friendly tones or enter your own custom HEX color.
          </p>

          {/* Quick Preset Soft Colors */}
          <div className="grid grid-cols-3 gap-2.5 mb-5">
            {ELDERLY_COLOR_PRESETS.map((preset) => (
              <button
                key={preset.hex}
                onClick={() => handleApplyCustomColor(preset.hex)}
                className="p-2 rounded-xl border flex flex-col items-center justify-between text-left transition-all active:scale-95 shadow-sm"
                style={{
                  backgroundColor: preset.hex,
                  borderColor: customHex === preset.hex ? '#0080FF' : 'rgba(150, 150, 150, 0.3)',
                  borderWidth: customHex === preset.hex ? '2px' : '1px',
                }}
              >
                <div className="w-full flex items-center justify-between">
                  <span
                    className="w-3 h-3 rounded-full border border-slate-400"
                    style={{ backgroundColor: preset.hex }}
                  ></span>
                  {customHex === preset.hex && (
                    <Check className="w-3 h-3 text-cyan-400 stroke-[3]" />
                  )}
                </div>
                <span
                  className="text-[11px] font-bold mt-2"
                  style={{ color: preset.isDark ? '#FFFFFF' : '#0F172A' }}
                >
                  {preset.name}
                </span>
              </button>
            ))}
          </div>

          {/* Interactive Native Color Picker & HEX Input matching User Prompt */}
          <div className="flex items-center space-x-3 p-3 rounded-2xl bg-slate-900/60 border border-slate-700">
            {/* Native Color Picker button */}
            <div className="relative w-11 h-11 rounded-xl overflow-hidden border-2 border-slate-500 shrink-0 cursor-pointer">
              <input
                type="color"
                value={customHex}
                onChange={(e) => {
                  setCustomHex(e.target.value.toUpperCase());
                }}
                className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer opacity-0"
              />
              <div
                className="w-full h-full flex items-center justify-center font-bold text-sm"
                style={{ backgroundColor: customHex }}
              >
                🎨
              </div>
            </div>

            {/* HEX Input Field */}
            <input
              type="text"
              value={customHex}
              onChange={(e) => setCustomHex(e.target.value.toUpperCase())}
              placeholder="#F5F9FF"
              maxLength={7}
              className="flex-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-600 text-white font-mono text-sm font-bold focus:border-cyan-400 outline-none"
            />

            {/* Apply Button */}
            <button
              onClick={() => handleApplyCustomColor(customHex)}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md active:scale-95 transition-all shrink-0"
            >
              Apply
            </button>
          </div>
        </div>

        {/* SECTION 8: RESET OPTION */}
        <div className="pt-2 text-center">
          <button
            onClick={() => setShowResetConfirm(true)}
            className="text-xs font-semibold opacity-70 hover:opacity-100 underline transition-opacity"
          >
            ↩️ Reset to Default Appearance
          </button>
        </div>
      </div>

      {/* CONFIRMATION RESET MODAL matching Requirement 8 */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-sm p-6 rounded-3xl theme-card border shadow-2xl text-center">
            <div className="w-14 h-14 rounded-full bg-blue-600/30 border border-cyan-400 flex items-center justify-center mx-auto mb-3 text-cyan-300">
              <RefreshCw className="w-7 h-7" />
            </div>

            <h3 className="text-xl font-bold mb-2">Restore Default Appearance?</h3>
            <p className="text-xs opacity-80 mb-6 leading-relaxed">
              This will restore the original CogniCare royal navy theme and default contrast settings.
            </p>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-3 rounded-xl bg-slate-800 text-slate-300 font-bold text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-md"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
