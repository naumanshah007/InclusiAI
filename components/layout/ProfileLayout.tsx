'use client';

import { useEffect } from 'react';
import { useUserProfile } from '@/lib/store/user-profile';
import { useAuthStore } from '@/lib/store/auth-store';

/**
 * ProfileLayout Component
 * Applies profile-specific UI preferences when profile changes
 */
export function ProfileLayout({ children }: { children: React.ReactNode }) {
  const { profileId, applyProfilePreferences, setProfile } = useUserProfile();
  const { user } = useAuthStore();

  useEffect(() => {
    // Sync profile from user data on mount
    if (user?.profileId && !profileId) {
      setProfile(user.profileId);
    } else if (profileId) {
      // Apply profile preferences when profile is set
      applyProfilePreferences();
    }
  }, [user, profileId, applyProfilePreferences, setProfile]);

  return <>{children}</>;
}
