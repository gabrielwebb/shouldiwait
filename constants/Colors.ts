/**
 * Color Constants and Theme System
 *
 * Centralized color palette for the Should I Wait app.
 * Features a yellow accent system that conveys cleanliness, brightness,
 * and friendliness while maintaining iOS native styling.
 */

/**
 * Yellow Accent System
 * Main color for positive actions, highlights, and "good enough" cleanliness
 */
export const Yellow = {
  primary: '#FFD60A',      // iOS system yellow - main accent
  light: '#FFE55C',        // Lighter tint for backgrounds/highlights
  dark: '#FFC700',         // Darker shade for pressed states
  subtle: '#FFF9E6',       // Very light yellow tint for subtle backgrounds
  transparent20: '#FFD60A33', // 20% opacity for badges
} as const;

/**
 * Cleanliness Rating Colors
 * Color-coded system for bathroom ratings
 */
export const Cleanliness = {
  excellent: '#34C759',    // iOS green - 4.0+ stars
  good: '#FFD60A',         // iOS yellow - 3.0-3.9 stars
  poor: '#FF453A',         // iOS red - below 3.0 stars
  unrated: '#8E8E93',      // iOS gray - no ratings yet
} as const;

/**
 * iOS System Blues
 * For links, primary actions, and navigation
 */
export const Blue = {
  light: '#007AFF',        // iOS blue (light mode)
  dark: '#0A84FF',         // iOS blue (dark mode)
} as const;

/**
 * iOS System Grays
 * For text, backgrounds, and secondary elements
 */
export const Gray = {
  // Light mode grays
  light: {
    primary: '#000000',       // Primary text
    secondary: '#3C3C43',     // Secondary text
    tertiary: '#8E8E93',      // Tertiary text/icons
    quaternary: '#C7C7CC',    // Dividers
    background: '#F2F2F7',    // System background
    elevated: '#FFFFFF',      // Elevated surfaces (cards)
  },
  // Dark mode grays
  dark: {
    primary: '#FFFFFF',       // Primary text
    secondary: '#EBEBF5',     // Secondary text
    tertiary: '#8E8E93',      // Tertiary text/icons
    quaternary: '#48484A',    // Dividers
    background: '#000000',    // System background
    elevated: '#1C1C1E',      // Elevated surfaces (cards)
    elevated2: '#2C2C2E',     // Secondary elevated
    elevated3: '#38383A',     // Tertiary elevated
  },
} as const;

/**
 * Semantic Colors
 * For specific UI purposes
 */
export const Semantic = {
  success: '#34C759',       // Success states
  warning: '#FFD60A',       // Warning states (yellow!)
  error: '#FF453A',         // Error states
  info: '#007AFF',          // Information
} as const;

/**
 * Special Use Colors
 */
export const Special = {
  errorBackground: {
    light: '#FEF2F2',       // Light error background
    dark: '#3A1A1A',        // Dark error background
  },
  warningBackground: {
    light: '#FFF9E6',       // Light warning background (yellow!)
    dark: '#3A3420',        // Dark warning background
  },
  successBackground: {
    light: '#F0FDF4',       // Light success background
    dark: '#1A3A1A',        // Dark success background
  },
} as const;

/**
 * Get cleanliness color based on rating
 */
export function getCleanlinessColor(rating: number | undefined): string {
  if (rating === undefined) return Cleanliness.unrated;
  if (rating >= 4.0) return Cleanliness.excellent;
  if (rating >= 3.0) return Cleanliness.good;
  return Cleanliness.poor;
}

/**
 * Get text color based on dark mode
 */
export function getTextColor(isDark: boolean, level: 'primary' | 'secondary' | 'tertiary' = 'primary'): string {
  if (level === 'primary') return isDark ? Gray.dark.primary : Gray.light.primary;
  if (level === 'secondary') return isDark ? Gray.dark.secondary : Gray.light.secondary;
  return isDark ? Gray.dark.tertiary : Gray.light.tertiary;
}

/**
 * Get background color based on dark mode
 */
export function getBackgroundColor(isDark: boolean, elevated: boolean = false): string {
  if (elevated) {
    return isDark ? Gray.dark.elevated : Gray.light.elevated;
  }
  return isDark ? Gray.dark.background : Gray.light.background;
}

/**
 * Get blue color based on dark mode
 */
export function getBlue(isDark: boolean): string {
  return isDark ? Blue.dark : Blue.light;
}
