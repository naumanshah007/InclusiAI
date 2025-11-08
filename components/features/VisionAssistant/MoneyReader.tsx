'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useAPIKey } from '@/lib/hooks/useAPIKey';
import { useUserPreferences } from '@/lib/store/user-preferences';
import { callAI } from '@/lib/utils/api-client';
import { detectMoney } from '@/lib/utils/money-detector';
import { TextToSpeech } from '@/components/accessibility/TextToSpeech';
import { CameraFeed } from './CameraFeed';

export function MoneyReader() {
  const [moneyInfo, setMoneyInfo] = useState<any>(null);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const { apiKey } = useAPIKey();
  const { aiProvider } = useUserPreferences();

  // AI provider function
  const aiProviderFn = async (image: string, prompt: string): Promise<string> => {
    const response = await callAI(
      {
        type: 'vision',
        data: {
          image,
          context: prompt,
          scenario: 'object',
        },
      },
      {
        apiKey,
        provider: aiProvider,
      }
    );
    return response.result;
  };

  const { mutate: scanMoney, isPending } = useMutation({
    mutationFn: async (image: string) => {
      const info = await detectMoney(image, aiProviderFn);
      return { image, info };
    },
    onSuccess: (result) => {
      setMoneyInfo(result.info);
      setCurrentImage(result.image);
      
      // Auto-speak the result
      if (result.info) {
        let speechText = '';
        if (result.info.type === 'banknote' || result.info.type === 'coin') {
          speechText = `This is ${result.info.denomination || 'money'} ${result.info.currency ? `in ${result.info.currency}` : ''}. ${result.info.side ? `You are looking at the ${result.info.side} side.` : ''}`;
        } else if (result.info.type === 'card') {
          speechText = `This is a card. You are looking at the ${result.info.side || 'unknown'} side.`;
        } else if (result.info.type === 'pos') {
          speechText = 'This appears to be a payment terminal or POS device.';
        }
        
        if (speechText && typeof window !== 'undefined' && 'speechSynthesis' in window) {
          const synth = window.speechSynthesis;
          const utterance = new SpeechSynthesisUtterance(speechText);
          utterance.rate = 1.0;
          synth.speak(utterance);
        }
      }
    },
    onError: (error) => {
      console.error('Error scanning money:', error);
      setMoneyInfo(null);
    },
  });

  const handleImageCapture = (image: string) => {
    scanMoney(image);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">Money & Card Reader</h2>
      <p className="text-sm text-gray-600">
        Point your camera at banknotes, coins, cards, or POS terminals to identify them.
      </p>
      
      <CameraFeed
        onImageCapture={handleImageCapture}
        showGuidance={true}
        speakGuidance={true}
      />
      
      {isPending && (
        <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 text-center">
          <p className="text-sm text-blue-800">Identifying money or card...</p>
        </div>
      )}
      
      {moneyInfo && (
        <div className="rounded-lg bg-gray-50 p-4 space-y-3">
          <h3 className="font-semibold text-gray-900">Identification:</h3>
          <div className="space-y-2 text-sm">
            {moneyInfo.type && (
              <p><strong>Type:</strong> {moneyInfo.type.charAt(0).toUpperCase() + moneyInfo.type.slice(1)}</p>
            )}
            {moneyInfo.currency && (
              <p><strong>Currency:</strong> {moneyInfo.currency}</p>
            )}
            {moneyInfo.denomination && (
              <p><strong>Denomination:</strong> {moneyInfo.denomination}</p>
            )}
            {moneyInfo.side && (
              <p><strong>Side:</strong> {moneyInfo.side.charAt(0).toUpperCase() + moneyInfo.side.slice(1)}</p>
            )}
          </div>
          
          <div className="mt-3">
            <TextToSpeech 
              text={`${moneyInfo.type === 'banknote' || moneyInfo.type === 'coin' ? `This is ${moneyInfo.denomination || 'money'} ${moneyInfo.currency ? `in ${moneyInfo.currency}` : ''}` : moneyInfo.type === 'card' ? `This is a card` : 'This is a payment terminal'}. ${moneyInfo.side ? `You are looking at the ${moneyInfo.side} side.` : ''}`} 
            />
          </div>
        </div>
      )}
    </div>
  );
}

