'use client';

import { useUserProfile } from '@/lib/store/user-profile';
import { useAuthStore } from '@/lib/store/auth-store';
import { getProfileById } from '@/lib/types/user-profiles';
import { QuickAccessHub } from '@/components/features/Dashboard/QuickAccessHub';
import { RecentActions } from '@/components/features/Dashboard/RecentActions';
import { EmergencyButton } from '@/components/features/Emergency/EmergencyButton';
import { APIKeyWarning } from '@/components/features/SettingsPanel/APIKeyWarning';
import Link from 'next/link';
import { ROUTES } from '@/lib/constants';
import { getAvailableFeatures } from '@/lib/utils/profile-features';

export function ProfileDashboard() {
  const { profileId, profile } = useUserProfile();
  const { user } = useAuthStore();
  
  const currentProfile = profile || (profileId ? getProfileById(profileId) : null);
  const profileFeatures = getAvailableFeatures(profileId);

  if (!currentProfile) {
    // No profile selected - show general dashboard
    return (
      <div className="space-y-8">
        <div className="rounded-2xl border-2 border-yellow-200 bg-yellow-50 p-6">
          <h2 className="mb-2 text-xl font-semibold text-yellow-900">
            Profile Not Selected
          </h2>
          <p className="mb-4 text-yellow-800">
            Please select a profile to get a customized experience tailored to your needs.
          </p>
          <Link
            href={ROUTES.PROFILE_SELECTION}
            className="inline-block rounded-lg bg-yellow-600 px-6 py-3 font-medium text-white transition-colors hover:bg-yellow-700"
          >
            Select Profile
          </Link>
        </div>
        <QuickAccessHub />
        <RecentActions />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Profile Welcome Section */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div
            className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${currentProfile.color} text-4xl text-white shadow-lg`}
          >
            {currentProfile.icon}
          </div>
          <div className="flex-1">
            <h2 className="mb-1 font-display text-2xl font-bold text-gray-900">
              Welcome, {user?.name || 'User'}!
            </h2>
            <p className="text-gray-600">
              You're using the <strong>{currentProfile.name}</strong> profile
            </p>
            <p className="mt-1 text-sm text-gray-500">
              {currentProfile.description}
            </p>
          </div>
          <Link
            href={ROUTES.SETTINGS}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            Change Profile
          </Link>
        </div>
      </div>

      {/* API Key Warning */}
      <APIKeyWarning />

      {/* Quick Access Hub - Profile Specific */}
      <QuickAccessHub />

      {/* Special Voice Assistant for Visual Impairment */}
      {currentProfile.id === 'visual' && (
        <section className="rounded-2xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 p-6 shadow-lg">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 text-4xl text-white shadow-lg">
              🎤
            </div>
            <div className="flex-1">
              <h2 className="mb-1 font-display text-2xl font-bold text-gray-900">
                Voice Assistant
              </h2>
              <p className="text-gray-700">
                Talk to the app for all your tasks. I will be your eyes, helping you navigate and understand your surroundings.
              </p>
            </div>
          </div>
          <Link
            href={ROUTES.VOICE_ASSISTANT}
            className="inline-block rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl"
          >
            Start Voice Assistant
          </Link>
        </section>
      )}

      {/* Available Features */}
      <section>
        <h2 className="mb-4 font-display text-2xl font-bold text-gray-900">
          Available Features
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {profileFeatures.map((feature) => (
            <Link
              key={feature.id}
              href={feature.route}
              className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:scale-105 hover:shadow-lg"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 text-2xl text-white shadow-lg transition-transform group-hover:scale-110">
                {feature.icon}
              </div>
              <h3 className="mb-2 font-display text-xl font-semibold text-gray-900">
                {feature.name}
              </h3>
              <p className="text-sm text-gray-600">{feature.description}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent Actions */}
      <RecentActions />
    </div>
  );
}

