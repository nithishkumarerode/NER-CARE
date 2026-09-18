import { ThemeConfig, ContrastAudit, BackgroundStyle } from '../types/theme';

export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  let cleaned = hex.replace('#', '').trim();
  if (cleaned.length === 3) {
    cleaned = cleaned.split('').map(c => c + c).join('');
  }
  if (cleaned.length !== 6) return null;
  const num = parseInt(cleaned, 16);
  if (isNaN(num)) return null;
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

export function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  const toHex = (v: number) => clamp(v).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

/**
 * Calculates WCAG relative luminance
 */
export function getLuminance(r: number, g: number, b: number): number {
  const a = [r, g, b].map(v => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
}

/**
 * Calculates contrast ratio between two colors (e.g. 1.0 to 21.0)
 */
export function getContrastRatio(hex1: string, hex2: string): number {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);
  if (!rgb1 || !rgb2) return 4.5; // fallback

  const l1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const l2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);

  const brighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (brighter + 0.05) / (darker + 0.05);
}

/**
 * Audits a background color for elderly accessibility
 */
export function auditColorAccessibility(bgHex: string, textHex: string): ContrastAudit {
  const ratio = getContrastRatio(bgHex, textHex);
  const isReadable = ratio >= 4.5;

  let warningMessage: string | undefined;
  let suggestedBackground: string | undefined;

  if (!isReadable) {
    const rgb = hexToRgb(bgHex);
    if (rgb) {
      const lum = getLuminance(rgb.r, rgb.g, rgb.b);
      // If mid-tone / poor contrast, propose accessible version
      if (lum > 0.4) {
        // Shift lighter to achieve > 7:1 against dark text
        suggestedBackground = '#F1F5F9';
      } else {
        // Shift darker to achieve > 7:1 against white text
        suggestedBackground = '#0B172E';
      }
    }
    warningMessage = `⚠️ This color provides low contrast (${ratio.toFixed(1)}:1). Text may be hard to read for elderly users.`;
  }

  return {
    ratio: Math.round(ratio * 10) / 10,
    isReadable,
    warningMessage,
    suggestedBackground,
    suggestedText: isReadable ? textHex : (getContrastRatio(bgHex, '#FFFFFF') > getContrastRatio(bgHex, '#0F172A') ? '#FFFFFF' : '#0F172A')
  };
}

/**
 * Generates a full theme configuration dynamically from any background color
 */
export function createCustomTheme(bgHex: string, style: BackgroundStyle = 'solid'): ThemeConfig {
  const rgb = hexToRgb(bgHex) || { r: 6, g: 13, b: 30 };
  const lum = getLuminance(rgb.r, rgb.g, rgb.b);
  const isDark = lum < 0.45;

  let primaryText = isDark ? '#FFFFFF' : '#0F172A';
  let secondaryText = isDark ? '#94A3B8' : '#475569';
  let primaryColor = isDark ? '#0080FF' : '#0284C7';
  let primaryColorHover = isDark ? '#006CD9' : '#0369A1';
  let buttonText = '#FFFFFF';

  let surfaceBackground: string;
  let cardBackground: string;
  let cardBorder: string;
  let navBackground: string;
  let navBorder: string;
  let appBackgroundGradient: string | undefined;

  if (isDark) {
    // Dark palette adaptation
    const cardR = Math.min(255, rgb.r + 12);
    const cardG = Math.min(255, rgb.g + 16);
    const cardB = Math.min(255, rgb.b + 28);
    cardBackground = rgbToHex(cardR, cardG, cardB);

    const surfR = Math.min(255, rgb.r + 6);
    const surfG = Math.min(255, rgb.g + 10);
    const surfB = Math.min(255, rgb.b + 18);
    surfaceBackground = rgbToHex(surfR, surfG, surfB);

    cardBorder = 'rgba(255, 255, 255, 0.12)';
    navBackground = `rgba(${Math.max(0, rgb.r - 2)}, ${Math.max(0, rgb.g - 2)}, ${Math.max(0, rgb.b + 4)}, 0.95)`;
    navBorder = 'rgba(56, 189, 248, 0.25)';

    if (style === 'subtle-gradient') {
      const topHex = rgbToHex(Math.min(255, rgb.r + 14), Math.min(255, rgb.g + 20), Math.min(255, rgb.b + 32));
      appBackgroundGradient = `linear-gradient(180deg, ${topHex} 0%, ${bgHex} 100%)`;
    } else if (style === 'soft-tint') {
      appBackgroundGradient = `radial-gradient(circle at 50% 0%, rgba(0, 128, 255, 0.15) 0%, ${bgHex} 70%)`;
    }
  } else {
    // Light palette adaptation
    cardBackground = '#FFFFFF';
    surfaceBackground = rgbToHex(
      Math.max(0, rgb.r - 8),
      Math.max(0, rgb.g - 8),
      Math.max(0, rgb.b - 8)
    );
    cardBorder = 'rgba(203, 213, 225, 0.8)';
    navBackground = 'rgba(255, 255, 255, 0.95)';
    navBorder = 'rgba(203, 213, 225, 0.8)';

    if (style === 'subtle-gradient') {
      const bottomHex = rgbToHex(Math.max(0, rgb.r - 12), Math.max(0, rgb.g - 12), Math.max(0, rgb.b - 10));
      appBackgroundGradient = `linear-gradient(180deg, ${bgHex} 0%, ${bottomHex} 100%)`;
    } else if (style === 'soft-tint') {
      appBackgroundGradient = `radial-gradient(circle at 50% 0%, rgba(56, 189, 248, 0.12) 0%, ${bgHex} 75%)`;
    }
  }

  return {
    id: 'custom',
    name: 'Custom Theme',
    icon: '🎨',
    description: `Personalized ${isDark ? 'dark' : 'light'} background`,
    appBackground: bgHex,
    appBackgroundGradient,
    surfaceBackground,
    cardBackground,
    cardBorder,
    primaryText,
    secondaryText,
    primaryColor,
    primaryColorHover,
    buttonText,
    navBackground,
    navBorder,
    isDark,
  };
}
