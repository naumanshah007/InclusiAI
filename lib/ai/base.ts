/**
 * Base AI Provider Interface
 * All AI providers must implement this interface
 */

export interface ObjectRecognition {
  name: string;
  confidence: number;
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface Reminder {
  id: string;
  text: string;
  time: Date;
  recurring?: boolean;
  completed: boolean;
}

export interface AIProvider {
  // Vision capabilities
  describeImage(image: string, context?: string, scenario?: 'medicine' | 'sign' | 'menu' | 'document' | 'object' | 'color' | 'general'): Promise<string>;
  extractText(image: string, context?: string): Promise<string>;
  recognizeObjects(image: string): Promise<ObjectRecognition[]>;

  // Audio capabilities
  transcribeAudio(audio: Blob): Promise<string>;
  synthesizeSpeech(text: string, voice?: string): Promise<Blob>;

  // Text processing
  simplifyText(
    text: string,
    level?: 'basic' | 'intermediate' | 'advanced'
  ): Promise<string>;
  summarizeText(
    text: string,
    length?: 'short' | 'medium' | 'long'
  ): Promise<string>;
  answerQuestion(question: string, context?: string): Promise<string>;

  // Specialized features
  breakDownTask(task: string): Promise<string[]>;
  generateReminder(text: string): Promise<Reminder>;
}

