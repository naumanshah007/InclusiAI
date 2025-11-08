'use client';

import { useState } from 'react';
import { useUserProfile } from '@/lib/store/user-profile';
import { useAuthStore } from '@/lib/store/auth-store';
import { USER_PROFILES, type UserProfileType } from '@/lib/types/user-profiles';
import { ProfileCard } from '@/components/onboarding/ProfileCard';

export function ProfileSelectionSection() {
  const { profileId, setProfile } = useUserProfile();
  const { user, updateUser } = useAuthStore();
  const [isChanging, setIsChanging] = useState(false);

  const handleProfileChange = (newProfileId: UserProfileType) => {
    if (newProfileId === profileId) return;

    setIsChanging(true);
    
    // Set new profile
    setProfile(newProfileId);
    
    // Update user
    if (user) {
      updateUser({ profileId: newProfileId });
    }
    
    // Show confirmation
    setTimeout(() => {
      setIsChanging(false);
      alert(`Profile changed to ${USER_PROFILES[newProfileId].name}. Your interface has been customized.`);
    }, 100);
  };

  // Filter out admin from selection (admin is set manually)
  const availableProfiles = Object.values(USER_PROFILES).filter(
    (profile) => profile.id !== 'admin'
  );

  return (
    <section className="rounded-lg border border-gray-200 bg-white p-6">
      <h2 className="mb-4 text-xl font-semibold text-gray-900">
        Your Profile
      </h2>
      <p className="mb-6 text-sm text-gray-600">
        Your current profile determines which features are available and how the
        interface is customized for your needs.
      </p>

      {profileId && (
        <div className="mb-6 rounded-lg border-2 border-primary-200 bg-primary-50 p-4">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${USER_PROFILES[profileId].color} text-2xl text-white shadow-lg`}
            >
              {USER_PROFILES[profileId].icon}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">
                {USER_PROFILES[profileId].name}
              </h3>
              <p className="text-sm text-gray-600">
                {USER_PROFILES[profileId].description}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="mb-4">
        <h3 className="mb-3 text-lg font-medium text-gray-900">
          Change Profile
        </h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {availableProfiles.map((profile) => (
            <ProfileCard
              key={profile.id}
              profile={profile}
              isSelected={profileId === profile.id}
              onSelect={() => handleProfileChange(profile.id)}
            />
          ))}
        </div>
      </div>

      {isChanging && (
        <div className="mt-4 rounded-lg bg-blue-50 p-3 text-sm text-blue-800">
          Updating your profile...
        </div>
      )}
    </section>
  );
}

