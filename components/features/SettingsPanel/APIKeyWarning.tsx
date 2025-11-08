'use client';

import Link from 'next/link';
import { useAPIKeysStore } from '@/lib/store/api-keys-store';
import { useUserPreferences } from '@/lib/store/user-preferences';
import { ROUTES } from '@/lib/constants';

export function APIKeyWarning() {
  const { keys } = useAPIKeysStore();
  const { aiProvider } = useUserPreferences();

  const hasAPIKey = () => {
    switch (aiProvider) {
      case 'gemini':
        return !!keys.gemini;
      case 'openai':
        return !!keys.openai;
      case 'claude':
        return !!keys.claude;
      default:
        return !!keys.gemini;
    }
  };

  if (hasAPIKey()) {
    return null;
  }

  return (
    <div className="mb-6 rounded-lg border-2 border-yellow-300 bg-yellow-50 p-4">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <svg
            className="h-6 w-6 text-yellow-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-yellow-900">
            API Key Required
          </h3>
          <p className="mt-1 text-sm text-yellow-800">
            You need to add your {aiProvider.toUpperCase()} API key to use AI
            features. Go to{' '}
            <Link
              href={ROUTES.SETTINGS}
              className="font-medium underline hover:text-yellow-900"
            >
              Settings
            </Link>{' '}
            to add your API key.
          </p>
        </div>
      </div>
    </div>
  );
}

