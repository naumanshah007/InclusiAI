/**
 * Main AI Processing API Route
 * Now supports user-provided API keys
 */

import { NextRequest, NextResponse } from 'next/server';
import { AIProviderFactory } from '@/lib/ai/factory';
import type { AIRequest, AIResponse } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body: AIRequest = await req.json();
    const { type, data, provider, apiKey } = body;

    // Use provided API key or fall back to environment variable
    const keyToUse = apiKey || process.env.GEMINI_API_KEY;

    if (!keyToUse) {
      return NextResponse.json(
        {
          error: 'API key is required',
          message: 'Please add your API key in Settings > API Keys or set GEMINI_API_KEY in your environment variables.',
        },
        { status: 400 }
      );
    }

    // Get the appropriate AI provider with API key
    let aiProvider;
    try {
      aiProvider = AIProviderFactory.create(
        provider || 'gemini',
        keyToUse
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize AI provider';
      return NextResponse.json(
        {
          error: 'Failed to initialize AI provider',
          message: errorMessage,
        },
        { status: 500 }
      );
    }

    let result: string;

    switch (type) {
      case 'vision':
        if (!data.image) {
          return NextResponse.json(
            { error: 'Image is required for vision processing' },
            { status: 400 }
          );
        }
            // Check if this is an OCR request (context contains "Extract all text")
            if (data.context?.includes('Extract all text')) {
              result = await aiProvider.extractText(data.image, data.context);
            } else {
          // Pass scenario to describeImage if available
          const scenario = data.scenario || undefined;
          result = await aiProvider.describeImage(data.image, data.context, scenario);
        }
        break;

      case 'text':
        if (!data.text) {
          return NextResponse.json(
            { error: 'Text is required for text processing' },
            { status: 400 }
          );
        }
        result = await aiProvider.answerQuestion(data.text, data.context);
        break;

      case 'simplify':
        if (!data.text) {
          return NextResponse.json(
            { error: 'Text is required for simplification' },
            { status: 400 }
          );
        }
        result = await aiProvider.simplifyText(data.text, 'basic');
        break;

      case 'summarize':
        if (!data.text) {
          return NextResponse.json(
            { error: 'Text is required for summarization' },
            { status: 400 }
          );
        }
        result = await aiProvider.summarizeText(data.text, 'medium');
        break;

      case 'question':
        if (!data.prompt) {
          return NextResponse.json(
            { error: 'Question is required' },
            { status: 400 }
          );
        }
        result = await aiProvider.answerQuestion(data.prompt, data.context);
        break;

      case 'audio':
        if (!data.audio) {
          return NextResponse.json(
            { error: 'Audio is required for audio processing' },
            { status: 400 }
          );
        }
        // Convert Blob to proper format if needed
        const audioBlob = new Blob([data.audio], { type: 'audio/webm' });
        result = await aiProvider.transcribeAudio(audioBlob);
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid request type' },
          { status: 400 }
        );
    }

    const response: AIResponse = {
      result,
      provider: provider || 'gemini',
      timestamp: Date.now(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('AI processing error:', error);
    
    // Provide more specific error messages
    let errorMessage = 'Unknown error';
    if (error instanceof Error) {
      errorMessage = error.message;
      
      // Check for specific Gemini API errors
      if (errorMessage.includes('API_KEY_INVALID') || errorMessage.includes('API key')) {
        errorMessage = 'Invalid API key. Please check your API key in Settings > API Keys.';
      } else if (errorMessage.includes('QUOTA_EXCEEDED') || errorMessage.includes('quota')) {
        errorMessage = 'API quota exceeded. Please check your API usage limits.';
      } else if (errorMessage.includes('PERMISSION_DENIED')) {
        errorMessage = 'Permission denied. Please check your API key permissions.';
      }
    }
    
    return NextResponse.json(
      {
        error: 'AI processing failed',
        message: errorMessage,
      },
      { status: 500 }
    );
  }
}
