import { ThemeId, ThemeConfig, BackgroundStyle, UserAppearancePreference } from '../types/theme';
import { createCustomTheme } from '../utils/contrast';

export const PRESET_THEMES: Record<ThemeId, ThemeConfig> = {
  dark: {
    id: 'dark',
    name: 'Dark Navy',
    icon: '🌙',
    description: 'Original CogniCare royal navy theme',
    appBackground: '#060D1E',
    appBackgroundGradient: 'linear-gradient(180deg, #09152E 0%, #060D1E 100%)',
    surfaceBackground: '#0B172E',
    cardBackground: '#0E1A33',
    cardBorder: 'rgba(59, 130, 246, 0.25)',
    primaryText: '#FFFFFF',
    secondaryText: '#94A3B8',
    primaryColor: '#0080FF',
    primaryColorHover: '#006CD9',
    buttonText: '#FFFFFF',
    navBackground: 'rgba(12, 23, 44, 0.95)',
    navBorder: 'rgba(59, 130, 246, 0.3)',
    isDark: true,
  },
  light: {
    id: 'light',
    name: 'Light',
    icon: '☀️',
    description: 'Crisp, bright daylight interface',
    appBackground: '#F8FAFC',
    appBackgroundGradient: 'linear-gradient(180deg, #FFFFFF 0%, #F1F5F9 100%)',
    surfaceBackground: '#F1F5F9',
    cardBackground: '#FFFFFF',
    cardBorder: 'rgba(203, 213, 225, 0.85)',
    primaryText: '#0F172A',
    secondaryText: '#475569',
    primaryColor: '#0284C7',
    primaryColorHover: '#0369A1',
    buttonText: '#FFFFFF',
    navBackground: 'rgba(255, 255, 255, 0.95)',
    navBorder: 'rgba(203, 213, 225, 0.9)',
    isDark: false,
  },
  'calm-blue': {
    id: 'calm-blue',
    name: 'Calm Blue',
    icon: '🌊',
    description: 'Soothing deep marine atmosphere',
    appBackground: '#0A192F',
    appBackgroundGradient: 'linear-gradient(180deg, #102444 0%, #0A192F 100%)',
    surfaceBackground: '#112240',
    cardBackground: '#172A45',
    cardBorder: 'rgba(56, 189, 248, 0.25)',
    primaryText: '#FFFFFF',
    secondaryText: '#94A3B8',
    primaryColor: '#0EA5E9',
    primaryColorHover: '#0284C7',
    buttonText: '#FFFFFF',
    navBackground: 'rgba(17, 34, 64, 0.95)',
    navBorder: 'rgba(56, 189, 248, 0.3)',
    isDark: true,
  },
  'soft-green': {
    id: 'soft-green',
    name: 'Soft Green',
    icon: '🌿',
    description: 'Restful botanical mint for calm focus',
    appBackground: '#F0FDF4',
    appBackgroundGradient: 'linear-gradient(180deg, #FFFFFF 0%, #F0FDF4 100%)',
    surfaceBackground: '#DCFCE7',
    cardBackground: '#FFFFFF',
    cardBorder: 'rgba(134, 239, 172, 0.8)',
    primaryText: '#064E3B',
    secondaryText: '#047857',
    primaryColor: '#059669',
    primaryColorHover: '#047857',
    buttonText: '#FFFFFF',
    navBackground: 'rgba(255, 255, 255, 0.95)',
    navBorder: 'rgba(134, 239, 172, 0.8)',
    isDark: false,
  },
  'soft-lavender': {
    id: 'soft-lavender',
    name: 'Soft Lavender',
    icon: '💜',
    description: 'Peaceful lilac tone with high dignity',
    appBackground: '#FAF5FF',
    appBackgroundGradient: 'linear-gradient(180deg, #FFFFFF 0%, #FAF5FF 100%)',
    surfaceBackground: '#F3E8FF',
    cardBackground: '#FFFFFF',
    cardBorder: 'rgba(216, 180, 254, 0.7)',
    primaryText: '#3B0764',
    secondaryText: '#6B21A8',
    primaryColor: '#7C3AED',
    primaryColorHover: '#6D28D9',
    buttonText: '#FFFFFF',
    navBackground: 'rgba(255, 255, 255, 0.95)',
    navBorder: 'rgba(216, 180, 254, 0.7)',
    isDark: false,
  },
  'sky-blue': {
    id: 'sky-blue',
    name: 'Sky Blue',
    icon: '🩵',
    description: 'Gentle, refreshing daylight sky',
    appBackground: '#F0F9FF',
    appBackgroundGradient: 'linear-gradient(180deg, #FFFFFF 0%, #F0F9FF 100%)',
    surfaceBackground: '#E0F2FE',
    cardBackground: '#FFFFFF',
    cardBorder: 'rgba(125, 211, 252, 0.75)',
    primaryText: '#0C4A6E',
    secondaryText: '#0369A1',
    primaryColor: '#0284C7',
    primaryColorHover: '#0369A1',
    buttonText: '#FFFFFF',
    navBackground: 'rgba(255, 255, 255, 0.95)',
    navBorder: 'rgba(125, 211, 252, 0.75)',
    isDark: false,
  },
  'high-contrast': {
    id: 'high-contrast',
    name: 'High Contrast',
    icon: '🌓',
    description: 'WCAG AAA maximum contrast for low vision',
    appBackground: '#000000',
    appBackgroundGradient: '#000000',
    surfaceBackground: '#0D0D0D',
    cardBackground: '#141414',
    cardBorder: '#FFFFFF',
    primaryText: '#FFFFFF',
    secondaryText: '#FDE047',
    primaryColor: '#FDE047',
    primaryColorHover: '#FACC15',
    buttonText: '#000000',
    navBackground: '#000000',
    navBorder: '#FFFFFF',
    isDark: true,
  },
  custom: {
    id: 'custom',
    name: 'Custom Theme',
    icon: '🎨',
    description: 'Custom personalized background',
    appBackground: '#060D1E',
    surfaceBackground: '#0B172E',
    cardBackground: '#0E1A33',
    cardBorder: 'rgba(59, 130, 246, 0.25)',
    primaryText: '#FFFFFF',
    secondaryText: '#94A3B8',
    primaryColor: '#0080FF',
    primaryColorHover: '#006CD9',
    buttonText: '#FFFFFF',
    navBackground: 'rgba(12, 23, 44, 0.95)',
    navBorder: 'rgba(59, 130, 246, 0.3)',
    isDark: true,
  }
};

export const ELDERLY_COLOR_PRESETS = [
  { name: 'Deep Navy', hex: '#060D1E', isDark: true },
  { name: 'Calm Marine', hex: '#0A192F', isDark: true },
  { name: 'Dark Charcoal', hex: '#111827', isDark: true },
  { name: 'Soft Blue', hex: '#EBF3FC', isDark: false },
  { name: 'Pale Sky', hex: '#E0F2FE', isDark: false },
  { name: 'Soft Mint', hex: '#ECFDF5', isDark: false },
  { name: 'Warm Cream', hex: '#FEF9EE', isDark: false },
  { name: 'Soft Lavender', hex: '#F3E8FF', isDark: false },
  { name: 'Light Grey', hex: '#F1F5F9', isDark: false },
];

const STORAGE_KEY = 'ner_care_theme_preference_v1';

class ThemeService {
  private currentPreference: UserAppearancePreference;

  constructor() {
    this.currentPreference = this.loadPreference();
    this.applyPreference(this.currentPreference);
  }

  public loadPreference(): UserAppearancePreference {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to load theme preference:', e);
    }
    return {
      themeId: 'dark',
      backgroundStyle: 'solid',
      highContrastMode: false,
    };
  }

  public savePreference(pref: UserAppearancePreference): void {
    this.currentPreference = pref;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(pref));
    } catch (e) {
      console.warn('Failed to save theme preference:', e);
    }
    this.applyPreference(pref);
  }

  public getPreference(): UserAppearancePreference {
    return this.currentPreference;
  }

  public getActiveTheme(): ThemeConfig {
    if (this.currentPreference.highContrastMode) {
      return PRESET_THEMES['high-contrast'];
    }

    if (this.currentPreference.themeId === 'custom' && this.currentPreference.customBackgroundColor) {
      return createCustomTheme(
        this.currentPreference.customBackgroundColor,
        this.currentPreference.backgroundStyle
      );
    }

    return PRESET_THEMES[this.currentPreference.themeId] || PRESET_THEMES['dark'];
  }

  public applyPreference(pref: UserAppearancePreference): void {
    if (typeof document === 'undefined') return;

    const theme = pref.highContrastMode
      ? PRESET_THEMES['high-contrast']
      : pref.themeId === 'custom' && pref.customBackgroundColor
      ? createCustomTheme(pref.customBackgroundColor, pref.backgroundStyle)
      : PRESET_THEMES[pref.themeId] || PRESET_THEMES['dark'];

    const root = document.documentElement;

    // Set CSS Variables on root
    root.style.setProperty('--app-background', theme.appBackground);
    root.style.setProperty(
      '--app-background-gradient',
      theme.appBackgroundGradient || theme.appBackground
    );
    root.style.setProperty('--surface-background', theme.surfaceBackground);
    root.style.setProperty('--card-background', theme.cardBackground);
    root.style.setProperty('--card-border', theme.cardBorder);
    root.style.setProperty('--primary-text', theme.primaryText);
    root.style.setProperty('--secondary-text', theme.secondaryText);
    root.style.setProperty('--primary-color', theme.primaryColor);
    root.style.setProperty('--primary-color-hover', theme.primaryColorHover);
    root.style.setProperty('--button-text', theme.buttonText);
    root.style.setProperty('--nav-background', theme.navBackground);
    root.style.setProperty('--nav-border', theme.navBorder);

    // Toggle body classes
    if (pref.highContrastMode) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }

    if (theme.isDark) {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
  }

  public resetToDefault(): UserAppearancePreference {
    const defaultPref: UserAppearancePreference = {
      themeId: 'dark',
      backgroundStyle: 'solid',
      highContrastMode: false,
    };
    this.savePreference(defaultPref);
    return defaultPref;
  }
}

export const themeService = new ThemeService();
