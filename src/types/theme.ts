export type ThemeId =
  | 'dark'
  | 'light'
  | 'calm-blue'
  | 'soft-green'
  | 'soft-lavender'
  | 'sky-blue'
  | 'high-contrast'
  | 'custom';

export type BackgroundStyle = 'solid' | 'subtle-gradient' | 'soft-tint';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  icon: string;
  description: string;
  appBackground: string;
  appBackgroundGradient?: string;
  surfaceBackground: string;
  cardBackground: string;
  cardBorder: string;
  primaryText: string;
  secondaryText: string;
  primaryColor: string;
  primaryColorHover: string;
  buttonText: string;
  navBackground: string;
  navBorder: string;
  isDark: boolean;
}

export interface ContrastAudit {
  ratio: number;
  isReadable: boolean;
  warningMessage?: string;
  suggestedBackground?: string;
  suggestedText?: string;
}

export interface UserAppearancePreference {
  themeId: ThemeId;
  customBackgroundColor?: string;
  backgroundStyle: BackgroundStyle;
  highContrastMode: boolean;
}
