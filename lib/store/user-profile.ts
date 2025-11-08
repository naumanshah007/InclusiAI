/**
 * User Profile Store (Zustand)
 * Manages user profile selection and profile-specific preferences
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserProfileType, UserProfile } from '@/lib/types/user-profiles';
import { getProfileById } from '@/lib/types/user-profiles';
import { useUserPreferences } from './user-preferences';

interface UserProfileState {
  profileId: UserProfileType | null;
  profile: UserProfile | null;
  setProfile: (profileId: UserProfileType) => void;
  clearProfile: () => void;
  applyProfilePreferences: () => void;
}

export const useUserProfile = create<UserProfileState>()(
  persist(
    (set, get) => ({
      profileId: null,
      profile: null,
      setProfile: (profileId: UserProfileType) => {
        const profile = getProfileById(profileId);
        set({ profileId, profile });
        
        // Apply profile-specific UI preferences
        const preferences = useUserPreferences.getState();
        preferences.setFontSize(profile.uiPreferences.fontSize);
        preferences.setContrastMode(profile.uiPreferences.contrastMode);
        preferences.setLayoutDensity(profile.uiPreferences.layoutDensity);
        preferences.setVoiceNavigation(profile.uiPreferences.voiceNavigation);
        preferences.setHapticFeedback(profile.uiPreferences.hapticFeedback);
        preferences.setAudioFeedback(profile.uiPreferences.audioFeedback);
        preferences.setReducedMotion(profile.uiPreferences.reducedMotion);
      },
      clearProfile: () => {
        set({ profileId: null, profile: null });
      },
      applyProfilePreferences: () => {
        const { profile } = get();
        if (profile) {
          const preferences = useUserPreferences.getState();
          preferences.setFontSize(profile.uiPreferences.fontSize);
          preferences.setContrastMode(profile.uiPreferences.contrastMode);
          preferences.setLayoutDensity(profile.uiPreferences.layoutDensity);
          preferences.setVoiceNavigation(profile.uiPreferences.voiceNavigation);
          preferences.setHapticFeedback(profile.uiPreferences.hapticFeedback);
          preferences.setAudioFeedback(profile.uiPreferences.audioFeedback);
          preferences.setReducedMotion(profile.uiPreferences.reducedMotion);
        }
      },
    }),
    {
      name: 'inclusiaid-user-profile',
    }
  )
);

