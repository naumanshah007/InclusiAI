'use client';

import { useEffect, useState } from 'react';
import { useAdminStore } from '@/lib/store/admin-store';
import { useAuthStore } from '@/lib/store/auth-store';
import { USER_PROFILES, type UserProfileType } from '@/lib/types/user-profiles';
import { ROUTES } from '@/lib/constants';
import Link from 'next/link';

export function AdminDashboard() {
  const { analytics, refreshAnalytics } = useAdminStore();
  const { user } = useAuthStore();
  const [selectedProfile, setSelectedProfile] = useState<UserProfileType | null>(null);

  useEffect(() => {
    refreshAnalytics();
  }, [refreshAnalytics]);

  // Check if user is admin
  if (user?.role !== 'admin') {
    return (
      <div className="rounded-2xl border-2 border-red-200 bg-red-50 p-8 text-center">
        <h2 className="mb-4 text-2xl font-bold text-red-900">Access Denied</h2>
        <p className="mb-6 text-red-800">
          You need administrator privileges to access this page.
        </p>
        <Link
          href={ROUTES.DASHBOARD}
          className="inline-block rounded-lg bg-red-600 px-6 py-3 font-medium text-white transition-colors hover:bg-red-700"
        >
          Go to Dashboard
        </Link>
      </div>
    );
  }

  const selectedAnalytics = selectedProfile
    ? analytics.profileAnalytics.find((a) => a.profileId === selectedProfile)
    : null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="mb-2 font-display text-4xl font-bold text-gray-900">
          Admin Dashboard
        </h1>
        <p className="text-gray-600">
          Manage users, view analytics, and monitor system usage
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-2xl">👥</span>
            <h3 className="text-lg font-semibold text-gray-900">Total Users</h3>
          </div>
          <p className="text-3xl font-bold text-primary-600">{analytics.totalUsers}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-2xl">🟢</span>
            <h3 className="text-lg font-semibold text-gray-900">Active Users</h3>
          </div>
          <p className="text-3xl font-bold text-green-600">{analytics.activeUsers}</p>
          <p className="mt-1 text-sm text-gray-500">Last 7 days</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-2xl">📊</span>
            <h3 className="text-lg font-semibold text-gray-900">Total Features</h3>
          </div>
          <p className="text-3xl font-bold text-blue-600">
            {Object.keys(analytics.featureUsage).length}
          </p>
        </div>
      </div>

      {/* Profile Distribution */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 font-display text-2xl font-bold text-gray-900">
          Profile Distribution
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Object.entries(analytics.profileDistribution).map(([profileId, count]) => {
            const profile = USER_PROFILES[profileId as UserProfileType];
            if (!profile) return null;
            return (
              <button
                key={profileId}
                onClick={() => setSelectedProfile(selectedProfile === profileId ? null : profileId as UserProfileType)}
                className={`rounded-xl border-2 p-4 text-left transition-all hover:scale-105 ${
                  selectedProfile === profileId
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-2xl">{profile.icon}</span>
                  <h3 className="font-semibold text-gray-900">{profile.name}</h3>
                </div>
                <p className="text-2xl font-bold text-primary-600">{count}</p>
                <p className="text-sm text-gray-500">users</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Profile Analytics */}
      {selectedAnalytics && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-2xl font-bold text-gray-900">
              {USER_PROFILES[selectedAnalytics.profileId].name} Analytics
            </h2>
            <button
              onClick={() => setSelectedProfile(null)}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              Close
            </button>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{selectedAnalytics.userCount}</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <p className="text-sm text-gray-600">Total Usage</p>
              <p className="text-2xl font-bold text-gray-900">{selectedAnalytics.totalUsage}</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <p className="text-sm text-gray-600">Avg Sessions</p>
              <p className="text-2xl font-bold text-gray-900">
                {selectedAnalytics.averageSessions.toFixed(1)}
              </p>
            </div>
          </div>
          {selectedAnalytics.mostUsedFeatures.length > 0 && (
            <div className="mt-6">
              <h3 className="mb-3 font-semibold text-gray-900">Most Used Features</h3>
              <div className="space-y-2">
                {selectedAnalytics.mostUsedFeatures.map((feature, index) => (
                  <div
                    key={feature.feature}
                    className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-primary-600 font-semibold">
                        {index + 1}
                      </span>
                      <span className="font-medium text-gray-900">{feature.feature}</span>
                    </div>
                    <span className="font-semibold text-primary-600">{feature.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Feature Usage */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 font-display text-2xl font-bold text-gray-900">
          Feature Usage
        </h2>
        <div className="space-y-2">
          {Object.entries(analytics.featureUsage)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10)
            .map(([feature, count]) => (
              <div
                key={feature}
                className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-4"
              >
                <span className="font-medium text-gray-900">{feature}</span>
                <span className="font-semibold text-primary-600">{count}</span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

