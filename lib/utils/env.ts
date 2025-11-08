/**
 * Environment variable utilities
 */

export function getEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key] || defaultValue;
  if (!value) {
    throw new Error(`Environment variable ${key} is not set`);
  }
  return value;
}

export function getOptionalEnvVar(key: string, defaultValue?: string): string | undefined {
  return process.env[key] || defaultValue;
}

// Environment variable getters
export const env = {
  geminiApiKey: () => getOptionalEnvVar('GEMINI_API_KEY'),
  openaiApiKey: () => getOptionalEnvVar('OPENAI_API_KEY'),
  anthropicApiKey: () => getOptionalEnvVar('ANTHROPIC_API_KEY'),
  nodeEnv: () => getOptionalEnvVar('NODE_ENV', 'development'),
  appUrl: () => getOptionalEnvVar('NEXT_PUBLIC_APP_URL', 'http://localhost:3000'),
};

