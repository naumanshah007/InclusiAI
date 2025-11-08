/**
 * Accessibility configuration constants
 */

export const ACCESSIBILITY_CONFIG = {
  // Font sizes (in pixels)
  FONT_SIZES: {
    MIN: 12,
    DEFAULT: 16,
    MAX: 48,
    STEP: 2,
  },

  // Color contrast ratios (WCAG 2.1 AA minimum is 4.5:1)
  CONTRAST_RATIOS: {
    NORMAL_TEXT: 4.5,
    LARGE_TEXT: 3.0,
    UI_COMPONENTS: 3.0,
  },

  // Animation preferences
  ANIMATION: {
    REDUCED_MOTION: 'prefers-reduced-motion',
    DEFAULT_DURATION: 200,
    REDUCED_DURATION: 0,
  },

  // Touch target sizes (minimum 44x44px for accessibility)
  TOUCH_TARGETS: {
    MIN_SIZE: 44,
    RECOMMENDED_SIZE: 48,
  },

  // Keyboard navigation
  KEYBOARD: {
    TAB_INDEX_VISIBLE: 0,
    TAB_INDEX_HIDDEN: -1,
  },
} as const;

export type FontSize = number;
export type ContrastMode = 'normal' | 'high' | 'dark' | 'light' | 'custom';
export type LayoutDensity = 'compact' | 'normal' | 'spacious';

