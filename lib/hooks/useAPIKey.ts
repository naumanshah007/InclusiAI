'use client';

import { useAPIKeysStore } from '@/lib/store/api-keys-store';
import { useUserPreferences } from '@/lib/store/user-preferences';

/**
 * Hook to get the appropriate API key for the current provider
 */
export function useAPIKey() {
  const { keys } = useAPIKeysStore();
  const { aiProvider } = useUserPreferences();

  const getAPIKey = (): string | undefined => {
    switch (aiProvider) {
      case 'gemini':
        return keys.gemini || undefined;
      case 'openai':
        return keys.openai || undefined;
      case 'claude':
        return keys.claude || undefined;
      default:
        return keys.gemini || undefined;
    }
  };

  return {
    apiKey: getAPIKey(),
    hasKey: !!getAPIKey(),
    provider: aiProvider,
  };
}

