'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';
import { ROUTES } from '@/lib/constants';

export function UserProfileSection() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push(ROUTES.HOME);
  };

  if (!isAuthenticated || !user) {
    return (
      <section className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">
          Account
        </h2>
        <p className="mb-4 text-sm text-gray-600">
          Sign in to save your preferences and access your account across
          devices.
        </p>
        <div className="flex gap-4">
          <a
            href={ROUTES.LOGIN}
            className="rounded-lg bg-gradient-to-r from-primary-600 to-secondary-600 px-6 py-3 font-medium text-white transition-colors hover:from-primary-700 hover:to-secondary-700"
          >
            Sign In
          </a>
          <a
            href={ROUTES.SIGNUP}
            className="rounded-lg border border-gray-300 bg-white px-6 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            Create Account
          </a>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-lg border border-gray-200 bg-white p-6">
      <h2 className="mb-4 text-xl font-semibold text-gray-900">
        User Profile
      </h2>
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700">Name</label>
          <p className="mt-1 text-gray-900">{user.name}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Email</label>
          <p className="mt-1 text-gray-900">{user.email}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">
            Member Since
          </label>
          <p className="mt-1 text-gray-900">
            {new Date(user.createdAt).toLocaleDateString()}
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="mt-4 rounded-lg bg-red-600 px-6 py-3 font-medium text-white transition-colors hover:bg-red-700"
        >
          Sign Out
        </button>
      </div>
    </section>
  );
}

