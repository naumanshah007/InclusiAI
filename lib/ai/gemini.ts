/**
 * Gemini AI Provider Implementation
 * 
 * Uses FREE Gemini models:
 * - gemini-2.5-flash: For vision tasks (image understanding, OCR) - FREE multimodal model
 * - gemini-pro: For text-only tasks (text generation, summarization, etc.)
 * 
 * Both models are free and perfect for accessibility applications.
 * Get your free API key at: https://makersuite.google.com/app/apikey
 * 
 * Note: Using gemini-2.5-flash for vision tasks - latest free multimodal model.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import type { AIProvider, ObjectRecognition, Reminder } from './base';
import { withRetry, sanitizeErrorMessage, safetyFilter } from './utils';

export class GeminiProvider implements AIProvider {
  private genAI: GoogleGenerativeAI;
  private visionModel: any;
  private textModel: any;

  constructor(apiKey?: string) {
    // Try to use provided API key, then environment variable, then throw error
    const key = apiKey || process.env.GEMINI_API_KEY;

    if (!key) {
      throw new Error(
        'GEMINI_API_KEY is not set. Please add it in Settings > API Keys or in your .env.local file.'
      );
    }

    this.genAI = new GoogleGenerativeAI(key);
    
    // Use gemini-2.5-flash for vision tasks (images) - FREE multimodal model
    // Use gemini-pro for text-only tasks
    // Both are free and stable models
    const visionConfig = {
      model: 'gemini-2.5-flash', // User requested gemini-2.5-flash
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 8192,
      },
    };
    
    const textConfig = {
      model: 'gemini-pro', // Free model for text tasks
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 8192,
      },
    };
    
    // Use gemini-2.5-flash for vision tasks (supports images)
    // Use gemini-pro for text-only tasks
    this.visionModel = this.genAI.getGenerativeModel(visionConfig);
    this.textModel = this.genAI.getGenerativeModel(textConfig);
  }

  async describeImage(
    image: string,
    context?: string,
    scenario?: 'medicine' | 'sign' | 'menu' | 'document' | 'object' | 'color' | 'general'
  ): Promise<string> {
    try {
      // Scenario-specific prompts for better accuracy
      const scenarioPrompts: Record<string, string> = {
            medicine: `You are helping a visually impaired person read a medication label. This is CRITICAL for safety. Extract and describe ALL of the following:

1. MEDICATION NAME:
   - Brand name (if visible)
   - Generic name (if visible)
   - Full medication name

2. DOSAGE INFORMATION:
   - Strength (e.g., "500mg", "10mg", "250mg/5ml")
   - Form (tablets, capsules, liquid, cream, etc.)
   - Quantity (how many tablets/capsules in package)

3. INSTRUCTIONS FOR USE:
   - How often to take (e.g., "twice daily", "every 8 hours")
   - When to take (e.g., "with food", "on empty stomach", "at bedtime")
   - How much to take (e.g., "1 tablet", "2 capsules", "5ml")
   - Duration (if specified, e.g., "for 7 days")

4. WARNINGS AND PRECAUTIONS:
   - All warnings (e.g., "may cause drowsiness", "do not drive")
   - Precautions (e.g., "avoid alcohol", "take with food")
   - Contraindications if visible

5. EXPIRATION DATE:
   - Full expiration date
   - Check if expired and ALERT if expired

6. PRESCRIPTION INFORMATION:
   - Prescription number (if visible)
   - Doctor name (if visible)
   - Pharmacy name (if visible)

7. CONFLICT DETECTION:
   - If dosage seems unusual (e.g., very high or very low), mention it
   - If instructions seem unclear or contradictory, mention it
   - If expiration date is missing or unclear, mention it

Be EXTREMELY clear and specific. If any text is unclear or missing, explicitly state "WARNING: [information] is unclear or missing". Safety is paramount.`,
        sign: `You are helping a visually impaired person read a sign. Describe:
- All text on the sign (exact wording)
- Sign location and orientation
- Any symbols or icons and their meaning
- Colors used (for accessibility)
- Size and visibility
Be precise with text and location details.`,
        menu: `You are helping a visually impaired person read a menu. Extract:
- Restaurant/cafe name
- All menu items with prices
- Descriptions of dishes
- Dietary information (vegetarian, vegan, gluten-free, etc.)
- Special sections (appetizers, mains, desserts)
Organize the information clearly.`,
        document: `You are helping a visually impaired person read a document. Extract:
- Document type (letter, form, bill, etc.)
- All text content preserving structure
- Important dates, numbers, amounts
- Required actions or next steps
- Contact information if present
Preserve formatting and structure.`,
        object: `You are helping a visually impaired person identify objects in their environment. Describe:
- All objects visible in the image
- Location of each object (left, right, center, distance)
- Size and shape of objects
- Colors of objects
- Spatial relationships between objects
- Any text visible on objects
Be specific about locations and relationships.`,
            color: `You are helping a color-blind or visually impaired person identify colors. Describe:
- All colors visible in the image
- Color names (be specific: "navy blue" not just "blue")
- Color combinations and patterns
- Contrast levels between colors
- Accessibility of color choices
- Suggestions for color matching if applicable
- If this appears to be clothing or an outfit, describe:
  * The overall color scheme
  * Whether colors match or complement each other
  * If the outfit appears formal, casual, or business-appropriate
  * Color coordination suggestions`,
        general: `Describe this image concisely for a visually impaired person. List the TOP 3-5 most important things. Be very brief - each item should be 5-10 words max. Focus on: 1) Main objects or people, 2) Their positions (left/right/center/ahead), 3) Important text if visible, 4) Any obstacles or notable features. Format as a numbered list.`,
      };

      const basePrompt = scenario && scenarioPrompts[scenario]
        ? scenarioPrompts[scenario]
        : context
        ? (context.toLowerCase().includes('top 3') || context.toLowerCase().includes('top 5') || context.toLowerCase().includes('brief') || context.toLowerCase().includes('concise'))
          ? `List the TOP 3-5 most important things in this image. Be very brief - each item should be 5-10 words max. Context: ${context}. Format as a numbered list.`
          : `Describe this image concisely for a visually impaired person. Context: ${context}. List the TOP 3-5 most important things. Be brief - each item 5-10 words max.`
        : scenarioPrompts.general;

      // Convert base64 to image part for multimodal input
      const imagePart = {
        inlineData: {
          data: image.replace(/^data:image\/\w+;base64,/, ''),
          mimeType: this.getMimeType(image),
        },
      };

      // Use the multimodal model to process image + text prompt with retry
      const result = await withRetry(
        async () => {
          const result = await this.visionModel.generateContent([basePrompt, imagePart]);
          return result.response;
        },
        { timeout: 30000, maxRetries: 2 }
      );
      
      const responseText = await result.text();
      // Apply safety filter to remove potential PII
      return safetyFilter(responseText);
    } catch (error) {
      console.error('Error describing image:', error);
      const userMessage = sanitizeErrorMessage(error);
      throw new Error(userMessage);
    }
  }

  async extractText(image: string, context?: string): Promise<string> {
    try {
      // Optimized prompt for speed and accuracy
      const basePrompt = 'Extract all text from this image. Return only the text content, preserving line breaks and structure. Do not add any explanations or descriptions, only return the extracted text.';
      
      const prompt = context 
        ? `${basePrompt}\n\nContext: ${context}\n\nFocus on extracting text relevant to the context, but include all visible text.`
        : basePrompt;

      // Convert base64 to image part for OCR using multimodal model
      const imagePart = {
        inlineData: {
          data: image.replace(/^data:image\/\w+;base64,/, ''),
          mimeType: this.getMimeType(image),
        },
      };

      // Use the multimodal model for OCR (text extraction from images) with retry
      const result = await withRetry(
        async () => {
          const result = await this.visionModel.generateContent([prompt, imagePart]);
          return result.response;
        },
        { timeout: 30000, maxRetries: 2 }
      );
      
      const responseText = await result.text();
      // Apply safety filter
      return safetyFilter(responseText);
    } catch (error) {
      console.error('Error extracting text:', error);
      const userMessage = sanitizeErrorMessage(error);
      throw new Error(userMessage);
    }
  }

  async recognizeObjects(image: string): Promise<ObjectRecognition[]> {
    try {
      const prompt =
        'Identify all objects in this image. For each object, provide its name and your confidence level (0-1). Format as a simple list.';

      const imagePart = {
        inlineData: {
          data: image.replace(/^data:image\/\w+;base64,/, ''),
          mimeType: this.getMimeType(image),
        },
      };

      const result = await withRetry(
        async () => {
          const result = await this.visionModel.generateContent([prompt, imagePart]);
          return result.response;
        },
        { timeout: 30000, maxRetries: 2 }
      );
      
      const text = await result.text();
      // Apply safety filter
      const filteredText = safetyFilter(text);

      // Parse the response (this is a simplified parser)
      // In production, you might want more sophisticated parsing
      const lines = filteredText.split('\n').filter((line) => line.trim());
      const objects: ObjectRecognition[] = lines.map((line, index) => ({
        name: line.split(/[:\-]/)[0]?.trim() || `Object ${index + 1}`,
        confidence: 0.8, // Default confidence, could be parsed from response
      }));

      return objects;
    } catch (error) {
      console.error('Error recognizing objects:', error);
      const userMessage = sanitizeErrorMessage(error);
      throw new Error(userMessage);
    }
  }

  async transcribeAudio(audio: Blob): Promise<string> {
    // Gemini doesn't have native speech-to-text
    // This would need to use Web Speech API or OpenAI Whisper
    throw new Error(
      'Speech-to-text not available with Gemini. Please use OpenAI or Web Speech API.'
    );
  }

  async synthesizeSpeech(text: string, voice?: string): Promise<Blob> {
    // Gemini doesn't have native text-to-speech
    // This would need to use Web Speech API or OpenAI TTS
    throw new Error(
      'Text-to-speech not available with Gemini. Please use Web Speech API or OpenAI TTS.'
    );
  }

  async simplifyText(
    text: string,
    level: 'basic' | 'intermediate' | 'advanced' = 'basic'
  ): Promise<string> {
    try {
      const levelInstructions = {
        basic: 'Use very simple words (elementary school level), short sentences (10 words or less), and clear structure.',
        intermediate: 'Use simple words (middle school level), medium sentences (15 words or less), and clear structure.',
        advanced: 'Use accessible language (high school level), varied sentence length, and clear structure.',
      };

      const prompt = `Simplify this text for someone with cognitive disabilities. ${levelInstructions[level]}\n\nOriginal text:\n${text}`;

      const result = await withRetry(
        async () => {
          const result = await this.textModel.generateContent(prompt);
          return result.response;
        },
        { timeout: 30000, maxRetries: 2 }
      );
      
      const responseText = await result.text();
      return safetyFilter(responseText);
    } catch (error) {
      console.error('Error simplifying text:', error);
      const userMessage = sanitizeErrorMessage(error);
      throw new Error(userMessage);
    }
  }

  async summarizeText(
    text: string,
    length: 'short' | 'medium' | 'long' = 'medium'
  ): Promise<string> {
    try {
      const lengthInstructions = {
        short: 'Create a very brief summary (2-3 sentences).',
        medium: 'Create a concise summary (1 paragraph, 4-6 sentences).',
        long: 'Create a detailed summary (2-3 paragraphs).',
      };

      const prompt = `Summarize the following text. ${lengthInstructions[length]}\n\nText:\n${text}`;

      const result = await withRetry(
        async () => {
          const result = await this.textModel.generateContent(prompt);
          return result.response;
        },
        { timeout: 30000, maxRetries: 2 }
      );
      
      const responseText = await result.text();
      return safetyFilter(responseText);
    } catch (error) {
      console.error('Error summarizing text:', error);
      const userMessage = sanitizeErrorMessage(error);
      throw new Error(userMessage);
    }
  }

  async answerQuestion(question: string, context?: string): Promise<string> {
    try {
      const prompt = context
        ? `Answer this question based on the provided context. If the answer cannot be found in the context, say so.\n\nContext: ${context}\n\nQuestion: ${question}`
        : `Answer this question clearly and concisely.\n\nQuestion: ${question}`;

      const result = await withRetry(
        async () => {
          const result = await this.textModel.generateContent(prompt);
          return result.response;
        },
        { timeout: 30000, maxRetries: 2 }
      );
      
      const responseText = await result.text();
      return safetyFilter(responseText);
    } catch (error) {
      console.error('Error answering question:', error);
      const userMessage = sanitizeErrorMessage(error);
      throw new Error(userMessage);
    }
  }

  async breakDownTask(task: string): Promise<string[]> {
    try {
      const prompt = `Break down this task into simple, actionable steps. Each step should be clear and easy to follow. Return only the steps, one per line, numbered.\n\nTask: ${task}`;

      const result = await withRetry(
        async () => {
          const result = await this.textModel.generateContent(prompt);
          return result.response;
        },
        { timeout: 30000, maxRetries: 2 }
      );
      
      const text = await result.text();
      const filteredText = safetyFilter(text);

      // Parse steps from response
      const steps = filteredText
        .split('\n')
        .map((line) => line.replace(/^\d+[\.\)]\s*/, '').trim())
        .filter((line) => line.length > 0);

      return steps.length > 0 ? steps : ['Task breakdown unavailable'];
    } catch (error) {
      console.error('Error breaking down task:', error);
      const userMessage = sanitizeErrorMessage(error);
      throw new Error(userMessage);
    }
  }

  async generateReminder(text: string): Promise<Reminder> {
    try {
      const prompt = `Extract reminder information from this text. Identify what needs to be remembered and when (if a time/date is mentioned). Format as: "Reminder: [what] | Time: [when]" or just "Reminder: [what]" if no time is mentioned.\n\nText: ${text}`;

      const result = await withRetry(
        async () => {
          const result = await this.textModel.generateContent(prompt);
          return result.response;
        },
        { timeout: 30000, maxRetries: 2 }
      );
      
      const reminderText = await result.text();
      const filteredText = safetyFilter(reminderText);

      // Parse reminder (simplified - in production, use more sophisticated parsing)
      const reminderMatch = filteredText.match(/Reminder:\s*(.+?)(?:\s*\|\s*Time:\s*(.+))?$/i);
      const reminderContent = reminderMatch?.[1]?.trim() || text;
      const timeString = reminderMatch?.[2]?.trim();

      return {
        id: `reminder-${Date.now()}`,
        text: reminderContent,
        time: timeString ? new Date(timeString) : new Date(),
        completed: false,
      };
    } catch (error) {
      console.error('Error generating reminder:', error);
      const userMessage = sanitizeErrorMessage(error);
      throw new Error(userMessage);
    }
  }

  private getMimeType(base64String: string): string {
    if (base64String.startsWith('data:image/jpeg')) return 'image/jpeg';
    if (base64String.startsWith('data:image/png')) return 'image/png';
    if (base64String.startsWith('data:image/webp')) return 'image/webp';
    if (base64String.startsWith('data:image/gif')) return 'image/gif';
    return 'image/jpeg'; // Default
  }
}

