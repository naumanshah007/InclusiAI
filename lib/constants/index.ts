/**
 * Application constants
 */

export const APP_NAME = 'InclusiAid';
export const APP_DESCRIPTION = 'Empowering Independence Through AI';
export const APP_TAGLINE = 'AI-powered accessibility assistant for everyone';

export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  EMERGENCY: '/emergency',
  VISION: '/vision',
  HEARING: '/hearing',
  MOTOR: '/motor',
  COGNITIVE: '/cognitive',
  SPEECH: '/speech',
  VOICE_ASSISTANT: '/voice-assistant',
  SETTINGS: '/settings',
  HELP: '/help',
  ONBOARDING: '/onboarding',
  PROFILE_SELECTION: '/profile-selection',
  LOGIN: '/login',
  SIGNUP: '/signup',
  ADMIN: '/admin',
} as const;

export const API_ROUTES = {
  AI: '/api/ai',
  UPLOAD: '/api/upload',
  USER: '/api/user',
} as const;

export const MAX_FILE_SIZE = {
  IMAGE: 10 * 1024 * 1024, // 10MB
  AUDIO: 25 * 1024 * 1024, // 25MB
  DOCUMENT: 5 * 1024 * 1024, // 5MB
} as const;

export const SUPPORTED_FILE_TYPES = {
  IMAGE: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  AUDIO: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm'],
  DOCUMENT: ['application/pdf', 'text/plain'],
} as const;

