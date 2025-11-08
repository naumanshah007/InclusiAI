/**
 * Global type definitions
 */

export type DisabilityType =
  | 'visual'
  | 'hearing'
  | 'motor'
  | 'cognitive'
  | 'speech'
  | 'multiple'
  | 'none';

export interface UserPreferences {
  disabilityTypes: DisabilityType[];
  fontSize: number;
  contrastMode: 'normal' | 'high' | 'dark' | 'light' | 'custom';
  layoutDensity: 'compact' | 'normal' | 'spacious';
  reducedMotion: boolean;
  voiceNavigation: boolean;
  hapticFeedback: boolean;
  audioFeedback: boolean;
  aiProvider: 'gemini' | 'openai' | 'claude';
}

export interface AIRequest {
  type: 'vision' | 'audio' | 'text' | 'simplify' | 'summarize' | 'question';
  data: {
    image?: string;
    audio?: Blob;
    text?: string;
    prompt?: string;
    context?: string;
    scenario?: 'medicine' | 'sign' | 'menu' | 'document' | 'object' | 'color' | 'general';
  };
  provider?: 'gemini' | 'openai' | 'claude';
  apiKey?: string; // User's API key from settings
}

export interface AIResponse {
  result: string;
  provider: string;
  timestamp: number;
  cached?: boolean;
}

export interface Reminder {
  id: string;
  text: string;
  time: Date;
  recurring?: boolean;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  steps: string[];
  completed: boolean;
  createdAt: Date;
}

