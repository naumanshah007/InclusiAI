/**
 * AI Provider Factory
 * Creates and manages AI provider instances
 */

import type { AIProvider } from './base';
import type { AIProviderType } from '@/config/ai-providers';
import { GeminiProvider } from './gemini';
import { OpenAIProvider } from './openai';
import { ClaudeProvider } from './claude';

export class AIProviderFactory {
  private static providers: Map<AIProviderType, AIProvider> = new Map();

  /**
   * Create or get an AI provider instance
   */
  static create(
    providerType: AIProviderType = 'gemini',
    apiKey?: string
  ): AIProvider {
    // For client-side usage, we need to pass API keys
    // For server-side, we can use environment variables
    
    // Create new instance based on provider type
    let provider: AIProvider;

    switch (providerType) {
      case 'gemini':
        provider = new GeminiProvider(apiKey);
        break;
      case 'openai':
        // OpenAI provider is a stub - will throw error if used
        // This allows the factory to work but requires implementation
        provider = new OpenAIProvider();
        break;
      case 'claude':
        // Claude provider is a stub - will throw error if used
        // This allows the factory to work but requires implementation
        provider = new ClaudeProvider();
        break;
      default:
        // Fallback to Gemini
        provider = new GeminiProvider();
    }

    // Cache the provider instance
    this.providers.set(providerType, provider);

    return provider;
  }

  /**
   * Get provider based on user subscription tier
   */
  static getProviderForUser(
    subscriptionTier: 'free' | 'premium' | 'pro' = 'free'
  ): AIProvider {
    // Free tier: Gemini only
    if (subscriptionTier === 'free') {
      return this.create('gemini');
    }

    // Premium/Pro tiers: Can use OpenAI and Claude
    // For now, default to Gemini until other providers are implemented
    return this.create('gemini');
  }

  /**
   * Clear cached providers (useful for testing)
   */
  static clearCache(): void {
    this.providers.clear();
  }
}

