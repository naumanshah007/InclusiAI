'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useAPIKey } from '@/lib/hooks/useAPIKey';
import { useUserPreferences } from '@/lib/store/user-preferences';
import { callAI } from '@/lib/utils/api-client';
import { detectDangers } from '@/lib/utils/danger-detector';
import { TextToSpeech } from '@/components/accessibility/TextToSpeech';
import { CameraFeed } from '@/components/features/VisionAssistant/CameraFeed';

export function DangerDetection() {
  const [dangerInfo, setDangerInfo] = useState<any>(null);
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
          scenario: 'general',
        },
      },
      {
        apiKey,
        provider: aiProvider,
      }
    );
    return response.result;
  };

  const { mutate: scanDangers, isPending } = useMutation({
    mutationFn: async (image: string) => {
      const info = await detectDangers(image, aiProviderFn);
      return { image, info };
    },
    onSuccess: (result) => {
      setDangerInfo(result.info);
      setCurrentImage(result.image);
      
      // Auto-speak danger level and hazards
      if (result.info.level !== 'none') {
        let speechText = `Danger level: ${result.info.level}. `;
        if (result.info.hazards.length > 0) {
          speechText += `Hazards detected: ${result.info.hazards.join('. ')}. `;
        }
        if (result.info.recommendations.length > 0) {
          speechText += `Recommendations: ${result.info.recommendations.join('. ')}.`;
        }
        
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
          const synth = window.speechSynthesis;
          const utterance = new SpeechSynthesisUtterance(speechText);
          utterance.rate = 0.9; // Slightly slower for important safety info
          utterance.volume = 1.0;
          synth.speak(utterance);
        }
      }
    },
    onError: (error) => {
      console.error('Error detecting dangers:', error);
      setDangerInfo(null);
    },
  });

  const handleImageCapture = (image: string) => {
    scanDangers(image);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">Danger Detection</h2>
      <p className="text-sm text-gray-600">
        Scan your surroundings for potential hazards and safety concerns.
      </p>
      
      <CameraFeed
        onImageCapture={handleImageCapture}
        showGuidance={true}
        speakGuidance={true}
      />
      
      {isPending && (
        <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 text-center">
          <p className="text-sm text-blue-800">Scanning for dangers...</p>
        </div>
      )}
      
      {dangerInfo && (
        <div className={`rounded-lg p-4 space-y-3 ${
          dangerInfo.level === 'high' ? 'bg-red-50 border-2 border-red-300' :
          dangerInfo.level === 'medium' ? 'bg-yellow-50 border-2 border-yellow-300' :
          dangerInfo.level === 'low' ? 'bg-orange-50 border-2 border-orange-300' :
          'bg-green-50 border-2 border-green-300'
        }`}>
          <h3 className={`font-semibold ${
            dangerInfo.level === 'high' ? 'text-red-900' :
            dangerInfo.level === 'medium' ? 'text-yellow-900' :
            dangerInfo.level === 'low' ? 'text-orange-900' :
            'text-green-900'
          }`}>
            Danger Level: {dangerInfo.level.toUpperCase()}
          </h3>
          
          {dangerInfo.hazards.length > 0 && (
            <div>
              <p className="font-medium text-gray-900 mb-2">Hazards Detected:</p>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                {dangerInfo.hazards.map((hazard: string, idx: number) => (
                  <li key={idx}>{hazard}</li>
                ))}
              </ul>
            </div>
          )}
          
          {dangerInfo.recommendations.length > 0 && (
            <div>
              <p className="font-medium text-gray-900 mb-2">Recommendations:</p>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                {dangerInfo.recommendations.map((rec: string, idx: number) => (
                  <li key={idx}>{rec}</li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="mt-3">
            <TextToSpeech 
              text={`Danger level: ${dangerInfo.level}. ${dangerInfo.hazards.length > 0 ? `Hazards: ${dangerInfo.hazards.join('. ')}. ` : ''}${dangerInfo.recommendations.length > 0 ? `Recommendations: ${dangerInfo.recommendations.join('. ')}.` : ''}`} 
            />
          </div>
        </div>
      )}
    </div>
  );
}

