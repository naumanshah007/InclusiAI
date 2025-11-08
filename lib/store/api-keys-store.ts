/**
 * API Keys Store (Zustand)
 * Manages user's API keys securely
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface APIKeys {
  gemini: string;
  openai: string;
  claude: string;
}

interface APIKeysState {
  keys: APIKeys;
  setGeminiKey: (key: string) => void;
  setOpenAIKey: (key: string) => void;
  setClaudeKey: (key: string) => void;
  clearKeys: () => void;
  hasKey: (provider: keyof APIKeys) => boolean;
}

const defaultKeys: APIKeys = {
  gemini: '',
  openai: '',
  claude: '',
};

export const useAPIKeysStore = create<APIKeysState>()(
  persist(
    (set, get) => ({
      keys: defaultKeys,
      setGeminiKey: (key: string) => {
        set((state) => ({
          keys: { ...state.keys, gemini: key },
        }));
      },
      setOpenAIKey: (key: string) => {
        set((state) => ({
          keys: { ...state.keys, openai: key },
        }));
      },
      setClaudeKey: (key: string) => {
        set((state) => ({
          keys: { ...state.keys, claude: key },
        }));
      },
      clearKeys: () => {
        set({ keys: defaultKeys });
      },
      hasKey: (provider: keyof APIKeys) => {
        return !!get().keys[provider];
      },
    }),
    {
      name: 'inclusiaid-api-keys',
    }
  )
);

