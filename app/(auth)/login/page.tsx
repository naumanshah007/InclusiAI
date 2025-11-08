'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store/auth-store';
import { useUserProfile } from '@/lib/store/user-profile';
import { ROUTES, APP_NAME } from '@/lib/constants';
import { Logo } from '@/components/branding/Logo';

export default function LoginPage() {
  const router = useRouter();
  const { login, user } = useAuthStore();
  const { setProfile } = useUserProfile();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const success = await login(email, password);
      if (success) {
        // Get the updated user after login
        const currentUser = useAuthStore.getState().user;
        
        // Sync profile from user data
        if (currentUser?.profileId) {
          setProfile(currentUser.profileId);
        }
        
        // Check if user has a profile selected
        // If not, redirect to profile selection
        // Otherwise, go to dashboard
        if (currentUser && !currentUser.profileId) {
          router.push(ROUTES.PROFILE_SELECTION);
        } else {
          router.push(ROUTES.DASHBOARD);
        }
      } else {
        setError('Invalid email or password');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-50 via-secondary-50 to-accent-50 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Logo size="xl" className="justify-center mb-6" />
          <h1 className="mb-2 font-display text-3xl font-bold text-gray-900">
            Welcome Back
          </h1>
          <p className="text-gray-600">Sign in to your {APP_NAME} account</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div
                className="rounded-lg bg-red-50 p-4 text-red-800"
                role="alert"
              >
                {error}
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg bg-gradient-to-r from-primary-600 to-secondary-600 px-6 py-3 font-semibold text-white transition-all hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link
                href={ROUTES.SIGNUP}
                className="font-medium text-primary-600 hover:text-primary-700"
              >
                Sign up
              </Link>
            </p>
          </div>

          <div className="mt-4 text-center">
            <Link
              href={ROUTES.HOME}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Continue without account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

