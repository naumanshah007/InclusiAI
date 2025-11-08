'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useAPIKey } from '@/lib/hooks/useAPIKey';
import { useUserPreferences } from '@/lib/store/user-preferences';
import { callAI } from '@/lib/utils/api-client';
import { TextToSpeech } from '@/components/accessibility/TextToSpeech';
import { CameraFeed } from './CameraFeed';

export function CardHelper() {
  const [cardInfo, setCardInfo] = useState<any>(null);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const { apiKey } = useAPIKey();
  const { aiProvider } = useUserPreferences();

  const { mutate: analyzeCard, isPending } = useMutation({
    mutationFn: async (image: string) => {
      const response = await callAI(
        {
          type: 'vision',
          data: {
            image,
            context: `Analyze this card (credit card, debit card, ID card, etc.). Identify:
1. Which side is visible (front or back)
2. Card type if visible (credit, debit, ID, etc.)
3. Important information visible (but do NOT read sensitive numbers like full card numbers - only mention if numbers are visible)
4. Orientation (is it right-side up or upside down)

Be helpful but DO NOT read full card numbers or sensitive information. Only mention that numbers are present.`,
            scenario: 'object',
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
      setCardInfo(result);
      
      // Auto-speak
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        const synth = window.speechSynthesis;
        const utterance = new SpeechSynthesisUtterance(result);
        utterance.rate = 1.0;
        synth.speak(utterance);
      }
    },
    onError: (error) => {
      console.error('Error analyzing card:', error);
      setCardInfo(null);
    },
  });

  const handleImageCapture = (image: string) => {
    analyzeCard(image);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">Card Helper</h2>
      <p className="text-sm text-gray-600">
        Identify which side of a card is visible and its orientation. Helps with inserting cards correctly.
      </p>
      
      <CameraFeed
        onImageCapture={handleImageCapture}
        showGuidance={true}
        speakGuidance={true}
      />
      
      {isPending && (
        <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 text-center">
          <p className="text-sm text-blue-800">Analyzing card...</p>
        </div>
      )}
      
      {cardInfo && (
        <div className="rounded-lg bg-gray-50 p-4">
          <h3 className="font-semibold text-gray-900 mb-2">Card Information:</h3>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{cardInfo}</p>
          <div className="mt-3">
            <TextToSpeech text={cardInfo} />
          </div>
        </div>
      )}
    </div>
  );
}

