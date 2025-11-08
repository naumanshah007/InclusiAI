/**
 * User Preferences Store (Zustand)
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserPreferences, DisabilityType } from '@/types';

interface UserPreferencesState extends UserPreferences {
  setDisabilityTypes: (types: DisabilityType[]) => void;
  setFontSize: (size: number) => void;
  setContrastMode: (mode: UserPreferences['contrastMode']) => void;
  setLayoutDensity: (density: UserPreferences['layoutDensity']) => void;
  setReducedMotion: (reduced: boolean) => void;
  setVoiceNavigation: (enabled: boolean) => void;
  setHapticFeedback: (enabled: boolean) => void;
  setAudioFeedback: (enabled: boolean) => void;
  setAIProvider: (provider: UserPreferences['aiProvider']) => void;
  reset: () => void;
}

const defaultPreferences: UserPreferences = {
  disabilityTypes: [],
  fontSize: 16,
  contrastMode: 'normal',
  layoutDensity: 'normal',
  reducedMotion: false,
  voiceNavigation: false,
  hapticFeedback: true,
  audioFeedback: true,
  aiProvider: 'gemini',
};

export const useUserPreferences = create<UserPreferencesState>()(
  persist(
    (set) => ({
      ...defaultPreferences,
      setDisabilityTypes: (types) => set({ disabilityTypes: types }),
      setFontSize: (size) => set({ fontSize: Math.max(12, Math.min(48, size)) }),
      setContrastMode: (mode) => set({ contrastMode: mode }),
      setLayoutDensity: (density) => set({ layoutDensity: density }),
      setReducedMotion: (reduced) => set({ reducedMotion: reduced }),
      setVoiceNavigation: (enabled) => set({ voiceNavigation: enabled }),
      setHapticFeedback: (enabled) => set({ hapticFeedback: enabled }),
      setAudioFeedback: (enabled) => set({ audioFeedback: enabled }),
      setAIProvider: (provider) => set({ aiProvider: provider }),
      reset: () => set(defaultPreferences),
    }),
    {
      name: 'inclusiaid-preferences',
    }
  )
);

