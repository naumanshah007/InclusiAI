/**
 * API Client Utility
 * Handles API calls with user's API keys
 */

import { API_ROUTES } from '@/lib/constants';
import type { AIRequest, AIResponse } from '@/types';

interface APICallOptions {
  apiKey?: string;
  provider?: 'gemini' | 'openai' | 'claude';
}

export async function callAI(
  request: Omit<AIRequest, 'apiKey' | 'provider'>,
  options?: APICallOptions
): Promise<AIResponse> {
  try {
    const response = await fetch(API_ROUTES.AI, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...request,
        provider: options?.provider || 'gemini',
        apiKey: options?.apiKey,
      } as AIRequest & { apiKey?: string }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ 
        error: 'Unknown error',
        message: `HTTP ${response.status}: ${response.statusText}`
      }));
      
      // Provide more specific error messages
      let errorMessage = errorData.error || 'API request failed';
      if (errorData.message) {
        errorMessage += `: ${errorData.message}`;
      }
      
      // Check for specific error cases
      if (response.status === 500 && errorData.message) {
        if (errorData.message.includes('API key') || errorData.message.includes('GEMINI_API_KEY')) {
          errorMessage = 'API key is missing or invalid. Please add your API key in Settings > API Keys.';
        }
      }
      
      throw new Error(errorMessage);
    }

    const result = await response.json();
    return result;
  } catch (err) {
    // Re-throw if it's already an Error with a message
    if (err instanceof Error) {
      throw err;
    }
    // Otherwise, wrap in Error
    throw new Error('Failed to process AI request. Please try again.');
  }
}

