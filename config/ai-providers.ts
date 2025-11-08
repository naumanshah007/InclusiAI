/**
 * AI Provider configuration
 */

export type AIProviderType = 'gemini' | 'openai' | 'claude';

export interface AIProviderConfig {
  name: string;
  enabled: boolean;
  apiKey?: string;
  rateLimit?: {
    requests: number;
    window: number; // in seconds
  };
  features: {
    vision: boolean;
    audio: boolean;
    text: boolean;
    reasoning: boolean;
  };
}

export const AI_PROVIDERS: Record<AIProviderType, AIProviderConfig> = {
  gemini: {
    name: 'Google Gemini',
    enabled: true,
    rateLimit: {
      requests: 60, // Free tier limit
      window: 60,
    },
    features: {
      vision: true,
      audio: false, // No native STT/TTS
      text: true,
      reasoning: true,
    },
  },
  openai: {
    name: 'OpenAI',
    enabled: false, // Premium tier
    rateLimit: {
      requests: 1000,
      window: 60,
    },
    features: {
      vision: true,
      audio: true,
      text: true,
      reasoning: true,
    },
  },
  claude: {
    name: 'Anthropic Claude',
    enabled: false, // Premium tier
    rateLimit: {
      requests: 1000,
      window: 60,
    },
    features: {
      vision: false,
      audio: false,
      text: true,
      reasoning: true,
    },
  },
};

export const DEFAULT_PROVIDER: AIProviderType = 'gemini';

