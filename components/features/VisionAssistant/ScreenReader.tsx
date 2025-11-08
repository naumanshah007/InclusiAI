'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useAPIKey } from '@/lib/hooks/useAPIKey';
import { useUserPreferences } from '@/lib/store/user-preferences';
import { callAI } from '@/lib/utils/api-client';
import { TextToSpeech } from '@/components/accessibility/TextToSpeech';
import { CameraFeed } from './CameraFeed';

export function ScreenReader() {
  const [screenInfo, setScreenInfo] = useState<any>(null);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const { apiKey } = useAPIKey();
  const { aiProvider } = useUserPreferences();

  const { mutate: readScreen, isPending } = useMutation({
    mutationFn: async (image: string) => {
      const response = await callAI(
        {
          type: 'vision',
          data: {
            image,
            context: `Read this screen or appliance interface. Identify:
1. All text visible on the screen
2. All buttons and their labels
3. Current selection or highlighted option (if any)
4. Screen state (on/off, active/inactive)
5. Any icons or symbols and their meaning
6. Navigation options (menu items, tabs, etc.)

Be very specific about button locations (top, bottom, left, right, center) and current state.`,
            scenario: 'document',
          },
        },
        {
          apiKey,
          provider: aiProvider,
        }
      );
      return { image, result: response.result };
    },
    onSuccess: (result) => {
      setScreenInfo(result.result);
      setCurrentImage(result.image);
      
      // Auto-speak
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        const synth = window.speechSynthesis;
        const utterance = new SpeechSynthesisUtterance(result.result);
        utterance.rate = 1.0;
        synth.speak(utterance);
      }
    },
    onError: (error) => {
      console.error('Error reading screen:', error);
      setScreenInfo(null);
    },
  });

  const handleImageCapture = (image: string) => {
    readScreen(image);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">Screen & Appliance Reader</h2>
      <p className="text-sm text-gray-600">
        Point your camera at a screen (microwave, washing machine, elevator, etc.) to read it.
      </p>
      
      <CameraFeed
        onImageCapture={handleImageCapture}
        showGuidance={true}
        speakGuidance={true}
      />
      
      {isPending && (
        <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 text-center">
          <p className="text-sm text-blue-800">Reading screen...</p>
        </div>
      )}
      
      {screenInfo && (
        <div className="rounded-lg bg-gray-50 p-4">
          <h3 className="font-semibold text-gray-900 mb-2">Screen Information:</h3>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{screenInfo}</p>
          <div className="mt-3">
            <TextToSpeech text={screenInfo} />
          </div>
        </div>
      )}
    </div>
  );
}

