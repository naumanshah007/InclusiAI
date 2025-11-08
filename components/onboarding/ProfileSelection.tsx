'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserProfile } from '@/lib/store/user-profile';
import { useAuthStore } from '@/lib/store/auth-store';
import { ProfileCard } from './ProfileCard';
import { USER_PROFILES, type UserProfileType } from '@/lib/types/user-profiles';
import { ROUTES } from '@/lib/constants';
import { Logo } from '@/components/branding/Logo';

export function ProfileSelection() {
  const router = useRouter();
  const { setProfile } = useUserProfile();
  const { user, updateUser } = useAuthStore();
  const [selectedProfile, setSelectedProfile] = useState<UserProfileType | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Filter out admin profile from selection (admin is set manually)
  const availableProfiles = Object.values(USER_PROFILES).filter(
    (profile) => profile.id !== 'admin'
  );

  const handleProfileSelect = (profileId: string) => {
    setSelectedProfile(profileId as UserProfileType);
  };

  const handleContinue = async () => {
    if (!selectedProfile) return;

    setIsLoading(true);
    
    try {
      // Set profile in store
      setProfile(selectedProfile);
      
      // Update user with profile
      if (user) {
        updateUser({ profileId: selectedProfile });
      }
      
      // Redirect to dashboard
      router.push(ROUTES.DASHBOARD);
    } catch (error) {
      console.error('Error setting profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    // Set to general profile
    setProfile('general');
    if (user) {
      updateUser({ profileId: 'general' });
    }
    router.push(ROUTES.DASHBOARD);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-primary-50 via-secondary-50 to-accent-50 px-4 py-12">
      <div className="w-full max-w-6xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <Logo size="xl" className="justify-center mb-6" />
          <h1 className="mb-3 font-display text-4xl font-bold text-gray-900">
            Choose Your Profile
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            Select the profile that best describes your needs. This helps us
            customize your experience and show you the most relevant features.
          </p>
        </div>

        {/* Profile Cards Grid */}
        <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {availableProfiles.map((profile) => (
            <ProfileCard
              key={profile.id}
              profile={profile}
              isSelected={selectedProfile === profile.id}
              onSelect={handleProfileSelect}
            />
          ))}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <button
            onClick={handleContinue}
            disabled={!selectedProfile || isLoading}
            className="rounded-xl bg-gradient-to-r from-primary-600 to-secondary-600 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isLoading ? 'Setting up...' : 'Continue'}
          </button>
          <button
            onClick={handleSkip}
            disabled={isLoading}
            className="rounded-xl border-2 border-gray-300 bg-white px-8 py-4 text-lg font-semibold text-gray-700 transition-all hover:bg-gray-50 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Skip for Now
          </button>
        </div>

        {/* Help Text */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            You can change your profile anytime in Settings
          </p>
        </div>
      </div>
    </div>
  );
}

