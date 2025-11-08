'use client';

import { useUserProfile } from '@/lib/store/user-profile';
import { useAuthStore } from '@/lib/store/auth-store';
import { canAccessFeature } from '@/lib/utils/profile-features';
import { ROUTES } from '@/lib/constants';
import Link from 'next/link';

interface ProfileFeatureGuardProps {
  featureRoute: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * ProfileFeatureGuard Component
 * Conditionally renders content based on profile access to a feature
 */
export function ProfileFeatureGuard({
  featureRoute,
  children,
  fallback,
}: ProfileFeatureGuardProps) {
  const { profileId } = useUserProfile();
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';

  // Admin can access everything
  if (isAdmin) {
    return <>{children}</>;
  }

  // Check if feature is available for this profile
  const hasAccess = canAccessFeature(profileId, featureRoute);

  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="rounded-2xl border-2 border-yellow-200 bg-yellow-50 p-8 text-center">
        <h2 className="mb-4 text-2xl font-bold text-yellow-900">
          Feature Not Available
        </h2>
        <p className="mb-6 text-yellow-800">
          This feature is not available for your current profile. Please change your profile in Settings to access this feature.
        </p>
        <Link
          href={ROUTES.SETTINGS}
          className="inline-block rounded-lg bg-yellow-600 px-6 py-3 font-medium text-white transition-colors hover:bg-yellow-700"
        >
          Go to Settings
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}

