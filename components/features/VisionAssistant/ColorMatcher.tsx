'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useAPIKey } from '@/lib/hooks/useAPIKey';
import { useUserPreferences } from '@/lib/store/user-preferences';
import { callAI } from '@/lib/utils/api-client';
import { detectColors } from '@/lib/utils/color-detector';
import { TextToSpeech } from '@/components/accessibility/TextToSpeech';
import { CameraFeed } from './CameraFeed';

export function ColorMatcher() {
  const [colorInfo, setColorInfo] = useState<any>(null);
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
          scenario: 'color',
        },
      },
      {
        apiKey,
        provider: aiProvider,
      }
    );
    return response.result;
  };

  const { mutate: analyzeColors, isPending } = useMutation({
    mutationFn: async (image: string) => {
      const info = await detectColors(image, aiProviderFn);
      return { image, info };
    },
    onSuccess: (result) => {
      setColorInfo(result.info);
      setCurrentImage(result.image);
      
      // Auto-speak the result
      if (result.info) {
        let speechText = '';
        if (result.info.colors && result.info.colors.length > 0) {
          speechText = `I see these colors: ${result.info.colors.join(', ')}.`;
          if (result.info.primaryColor) {
            speechText += ` The primary color is ${result.info.primaryColor}.`;
          }
          if (result.info.outfitMatch) {
            speechText += ` The colors ${result.info.outfitMatch === 'matches' ? 'match well' : result.info.outfitMatch === 'complements' ? 'complement each other' : 'clash'}.`;
          }
          if (result.info.outfitStyle) {
            speechText += ` This appears to be a ${result.info.outfitStyle} outfit.`;
          }
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
      console.error('Error analyzing colors:', error);
      setColorInfo(null);
    },
  });

  const handleImageCapture = (image: string) => {
    analyzeColors(image);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">Color & Outfit Matcher</h2>
      <p className="text-sm text-gray-600">
        Identify colors and check if your outfit matches. Perfect for color-blind users.
      </p>
      
      <CameraFeed
        onImageCapture={handleImageCapture}
        showGuidance={true}
        speakGuidance={true}
      />
      
      {isPending && (
        <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 text-center">
          <p className="text-sm text-blue-800">Analyzing colors...</p>
        </div>
      )}
      
      {colorInfo && (
        <div className="rounded-lg bg-gray-50 p-4 space-y-3">
          <h3 className="font-semibold text-gray-900">Color Analysis:</h3>
          <div className="space-y-2 text-sm">
            {colorInfo.colors && colorInfo.colors.length > 0 && (
              <div>
                <p className="font-medium text-gray-700">Colors detected:</p>
                <ul className="list-disc list-inside text-gray-600">
                  {colorInfo.colors.map((color: string, idx: number) => (
                    <li key={idx}>{color}</li>
                  ))}
                </ul>
              </div>
            )}
            {colorInfo.primaryColor && (
              <p><strong>Primary color:</strong> {colorInfo.primaryColor}</p>
            )}
            {colorInfo.secondaryColor && (
              <p><strong>Secondary color:</strong> {colorInfo.secondaryColor}</p>
            )}
            {colorInfo.contrastLevel && (
              <p><strong>Contrast level:</strong> {colorInfo.contrastLevel}</p>
            )}
            {colorInfo.outfitMatch && (
              <p className={colorInfo.outfitMatch === 'clashes' ? 'text-red-600 font-medium' : 'text-green-600 font-medium'}>
                <strong>Outfit match:</strong> {colorInfo.outfitMatch === 'matches' ? '✓ Colors match well' : colorInfo.outfitMatch === 'complements' ? '✓ Colors complement each other' : '✗ Colors clash'}
              </p>
            )}
            {colorInfo.outfitStyle && (
              <p><strong>Style:</strong> {colorInfo.outfitStyle.charAt(0).toUpperCase() + colorInfo.outfitStyle.slice(1)}</p>
            )}
          </div>
          
          <div className="mt-3">
            <TextToSpeech 
              text={`Colors: ${colorInfo.colors?.join(', ') || 'unknown'}. ${colorInfo.primaryColor ? `Primary color is ${colorInfo.primaryColor}.` : ''} ${colorInfo.outfitMatch ? `The colors ${colorInfo.outfitMatch === 'matches' ? 'match well' : colorInfo.outfitMatch === 'complements' ? 'complement each other' : 'clash'}.` : ''} ${colorInfo.outfitStyle ? `This appears to be a ${colorInfo.outfitStyle} outfit.` : ''}`} 
            />
          </div>
        </div>
      )}
    </div>
  );
}

