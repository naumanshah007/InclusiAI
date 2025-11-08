/**
 * AI Provider Utilities
 * Shared utilities for error handling, timeouts, and retries
 */

export interface RetryOptions {
  maxRetries?: number;
  retryDelay?: number;
  timeout?: number;
}

export const DEFAULT_RETRY_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  retryDelay: 1000, // 1 second
  timeout: 30000, // 30 seconds
};

/**
 * Retry a function with exponential backoff
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const { maxRetries, retryDelay, timeout } = {
    ...DEFAULT_RETRY_OPTIONS,
    ...options,
  };

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Apply timeout
      const result = await Promise.race([
        fn(),
        new Promise<T>((_, reject) =>
          setTimeout(
            () => reject(new Error('Request timeout')),
            timeout
          )
        ),
      ]);

      return result;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Don't retry on certain errors
      if (
        error instanceof Error &&
        (error.message.includes('API_KEY_INVALID') ||
          error.message.includes('PERMISSION_DENIED') ||
          error.message.includes('timeout'))
      ) {
        throw error;
      }

      // If this was the last attempt, throw
      if (attempt === maxRetries) {
        throw lastError;
      }

      // Wait before retrying (exponential backoff)
      const delay = retryDelay * Math.pow(2, attempt);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError || new Error('Unknown error');
}

/**
 * Check if an error is retryable
 */
export function isRetryableError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;

  const message = error.message.toLowerCase();
  const retryablePatterns = [
    'network',
    'timeout',
    'rate limit',
    'quota',
    'server error',
    'temporary',
    '503',
    '502',
    '504',
  ];

  return retryablePatterns.some((pattern) => message.includes(pattern));
}

/**
 * Sanitize error message for user display
 */
export function sanitizeErrorMessage(error: unknown): string {
  if (!(error instanceof Error)) {
    return 'An unknown error occurred';
  }

  const message = error.message;

  // Map API errors to user-friendly messages
  if (message.includes('API_KEY_INVALID') || message.includes('API key')) {
    return 'Invalid API key. Please check your API key in Settings > API Keys.';
  }

  if (message.includes('QUOTA_EXCEEDED') || message.includes('quota')) {
    return 'API quota exceeded. Please check your API usage limits.';
  }

  if (message.includes('PERMISSION_DENIED')) {
    return 'Permission denied. Please check your API key permissions.';
  }

  if (message.includes('timeout')) {
    return 'Request timed out. Please try again.';
  }

  if (message.includes('network') || message.includes('fetch')) {
    return 'Network error. Please check your internet connection and try again.';
  }

  // Return generic error message for unknown errors
  return 'An error occurred while processing your request. Please try again.';
}

/**
 * Safety filter for AI responses
 * Removes or redacts potentially sensitive information
 */
export function safetyFilter(text: string): string {
  // Remove potential PII patterns (basic implementation)
  // In production, use more sophisticated PII detection
  let filtered = text;

  // Remove email addresses
  filtered = filtered.replace(
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    '[email redacted]'
  );

  // Remove phone numbers (basic pattern)
  filtered = filtered.replace(
    /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g,
    '[phone redacted]'
  );

  // Remove credit card numbers (basic pattern)
  filtered = filtered.replace(
    /\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b/g,
    '[card redacted]'
  );

  return filtered;
}

