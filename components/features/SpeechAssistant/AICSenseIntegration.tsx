'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useAACStore } from '@/lib/store/aac-store';
import { useAPIKey } from '@/lib/hooks/useAPIKey';
import { useUserPreferences } from '@/lib/store/user-preferences';
import { callAI } from '@/lib/utils/api-client';
import { speakWithVoice } from '@/lib/utils/voice-banking';
import { useVoiceBankingStore } from '@/lib/store/voice-banking-store';
import { CameraFeed } from '@/components/features/VisionAssistant/CameraFeed';
import { TextToSpeech } from '@/components/accessibility/TextToSpeech';

export function AICSenseIntegration() {
  const [mode, setMode] = useState<'camera' | 'ocr' | 'scene'>('camera');
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const { apiKey } = useAPIKey();
  const { aiProvider } = useUserPreferences();
  const { settings, addHistory } = useAACStore();
  const { getActiveVoice } = useVoiceBankingStore();

  const { mutate: processImage, isPending } = useMutation({
    mutationFn: async ({ image, mode }: { image: string; mode: string }) => {
      let context = '';
      if (mode === 'camera') {
        context = 'Identify this object and suggest a quick phrase the user might want to say about it. Examples: "I want this drink", "What is this medicine?", "I see a red bottle". Return ONLY the suggested phrase.';
      } else if (mode === 'ocr') {
        context = 'Extract all text from this image. Return only the text content.';
      } else if (mode === 'scene') {
        context = 'Describe this scene in simple terms and suggest a phrase the user might want to say about it. Examples: "Tell them I see a red bottle on the left shelf", "There is a person ahead". Return ONLY the suggested phrase.';
      }
      
      const response = await callAI(
        {
          type: 'vision',
          data: {
            image,
            context,
            scenario: mode === 'camera' ? 'object' : mode === 'ocr' ? 'document' : 'general',
          },
        },
        {
          apiKey,
          provider: aiProvider,
        }
      );
      return response.result;
    },
    onSuccess: (result) => {
      setResult(result);
      addHistory(result, mode === 'camera' ? 'camera' : mode === 'ocr' ? 'ocr' : 'camera');
      
      // Auto-speak if enabled
      if (settings.autoSpeak) {
        const activeVoice = getActiveVoice();
        speakWithVoice(
          result,
          activeVoice?.id || null,
          {
            rate: settings.voiceRate,
            pitch: settings.voicePitch,
            volume: settings.voiceVolume,
          }
        );
      }
    },
    onError: (error) => {
      console.error('Error processing image:', error);
      setResult('Failed to process image. Please try again.');
    },
  });

  const handleImageCapture = (image: string) => {
    setCurrentImage(image);
    processImage({ image, mode });
  };

  const handleSpeakResult = () => {
    if (result) {
      const activeVoice = getActiveVoice();
      speakWithVoice(
        result,
        activeVoice?.id || null,
        {
          rate: settings.voiceRate,
          pitch: settings.voicePitch,
          volume: settings.voiceVolume,
        }
      );
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">AI Integration</h2>
      <p className="text-sm text-gray-600">
        Use AI vision to generate quick phrases from your surroundings.
      </p>

      {/* Mode Selection */}
      <div className="flex gap-2">
        <button
          onClick={() => setMode('camera')}
          className={`flex-1 rounded-lg px-4 py-2 font-medium transition-colors ${
            mode === 'camera'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          📷 Object
        </button>
        <button
          onClick={() => setMode('ocr')}
          className={`flex-1 rounded-lg px-4 py-2 font-medium transition-colors ${
            mode === 'ocr'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          📝 Text
        </button>
        <button
          onClick={() => setMode('scene')}
          className={`flex-1 rounded-lg px-4 py-2 font-medium transition-colors ${
            mode === 'scene'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          👁️ Scene
        </button>
      </div>

      {/* Camera Feed */}
      <CameraFeed
        onImageCapture={handleImageCapture}
        showGuidance={true}
        speakGuidance={false}
      />

      {/* Processing Status */}
      {isPending && (
        <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 text-center">
          <div className="mb-2 h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="text-sm text-blue-800">Processing image...</p>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="rounded-lg bg-gray-50 p-4 space-y-3">
          <h3 className="font-semibold text-gray-900">Suggested Phrase:</h3>
          <div className="rounded-lg bg-white border border-gray-200 p-4">
            <p className={`text-gray-700 ${settings.largeButtons ? 'text-2xl' : 'text-lg'}`}>
              {result}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSpeakResult}
              className="flex-1 rounded-lg bg-green-600 px-6 py-3 font-medium text-white transition-colors hover:bg-green-700"
            >
              🔊 Speak
            </button>
            <button
              onClick={() => {
                // Add to recent phrases
                addHistory(result, 'camera');
                setResult(null);
              }}
              className="rounded-lg bg-blue-600 px-4 py-3 font-medium text-white transition-colors hover:bg-blue-700"
            >
              ✓ Use
            </button>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4">
        <h3 className="font-semibold text-yellow-900 mb-2">How to Use:</h3>
        <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
          <li><strong>Object Mode:</strong> Point camera at objects to generate phrases like "I want this drink"</li>
          <li><strong>Text Mode:</strong> Point camera at text to read it aloud</li>
          <li><strong>Scene Mode:</strong> Point camera at scenes to describe what you see</li>
        </ul>
      </div>
    </div>
  );
}

