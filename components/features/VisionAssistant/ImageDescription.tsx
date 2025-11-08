'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import type { AIRequest } from '@/types';
import { useAPIKey } from '@/lib/hooks/useAPIKey';
import { useUserPreferences } from '@/lib/store/user-preferences';
import { callAI } from '@/lib/utils/api-client';
import { TextToSpeech } from '@/components/accessibility/TextToSpeech';
import { useVisionHistory } from '@/lib/store/vision-history';
import { parseMedicineInfo, formatMedicineInfoForSpeech } from '@/lib/utils/medicine-parser';

interface ImageDescriptionProps {
  image: string;
  scenario?: 'medicine' | 'sign' | 'menu' | 'document' | 'object' | 'color' | 'general';
  onDescriptionComplete?: (description: string) => void;
}

export function ImageDescription({ 
  image, 
  scenario = 'general',
  onDescriptionComplete 
}: ImageDescriptionProps) {
  const [context, setContext] = useState('');
  const [description, setDescription] = useState<string | null>(null);
  const [medicineInfo, setMedicineInfo] = useState<any>(null);
  const { apiKey } = useAPIKey();
  const { aiProvider } = useUserPreferences();

  const { addScan } = useVisionHistory();

  const { mutate: describeImage, isPending } = useMutation({
    mutationFn: async (data: AIRequest['data']) => {
      // Build context with scenario information
      const fullContext = scenario !== 'general' 
        ? `Scenario: ${scenario}. ${data.context || ''}`
        : data.context;

      const response = await callAI(
        {
          type: 'vision',
          data: {
            image,
            context: fullContext,
            scenario: scenario, // Pass scenario to API
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
          setDescription(result);
          
          // Parse medicine info if medicine scenario
          if (scenario === 'medicine') {
            try {
              const parsed = parseMedicineInfo(result);
              setMedicineInfo(parsed);
              
              // Check for conflicts and alert
              if (parsed.conflicts && parsed.conflicts.length > 0) {
                // Speak conflicts with high priority
                if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                  const synth = window.speechSynthesis;
                  const conflictText = `WARNING: ${parsed.conflicts.join('. ')}`;
                  const utterance = new SpeechSynthesisUtterance(conflictText);
                  utterance.rate = 0.9; // Slightly slower for important info
                  utterance.volume = 1.0;
                  synth.speak(utterance);
                }
              }
              
              // Check for expired medication
              if (parsed.isExpired) {
                if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                  const synth = window.speechSynthesis;
                  const expiredText = 'WARNING: This medication appears to be expired. Do not use.';
                  const utterance = new SpeechSynthesisUtterance(expiredText);
                  utterance.rate = 0.9;
                  utterance.volume = 1.0;
                  synth.speak(utterance);
                }
              }
            } catch (e) {
              console.error('Error parsing medicine info:', e);
            }
          }
          
          // Save to history
          addScan({
            image,
            type: 'description',
            scenario,
            result,
            isFavorite: false,
            context: context || undefined,
          });
          
          // Call completion callback
          if (onDescriptionComplete) {
            onDescriptionComplete(result);
          }
        },
    onError: (error) => {
      console.error('Error describing image:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to describe image. Please try again.';
      setDescription(`Error: ${errorMessage}`);
    },
  });

  const handleDescribe = () => {
    setDescription(null);
    describeImage({ image, context: context || undefined });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">Image Description</h2>
      <div className="space-y-4">
        {/* Image Preview */}
        <div className="rounded-lg border border-gray-200 p-4">
          <img
            src={image}
            alt="Uploaded image for description"
            className="max-h-64 w-full rounded-lg object-contain"
          />
        </div>

        {/* Context Input */}
        <div>
          <label
            htmlFor="context"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Optional Context (e.g., "I'm looking at a medicine bottle")
          </label>
          <input
            id="context"
            type="text"
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="Add context to help with description..."
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Describe Button */}
        <button
          onClick={handleDescribe}
          disabled={isPending}
          className="w-full rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700 disabled:bg-gray-400"
        >
          {isPending ? 'Describing...' : 'Describe Image'}
        </button>

            {/* Medicine Info (Structured) */}
            {scenario === 'medicine' && medicineInfo && (
              <div
                className="rounded-lg bg-red-50 border-2 border-red-200 p-4 mb-4"
                role="region"
                aria-label="Medicine information"
              >
                <h3 className="mb-3 font-semibold text-red-900">Medicine Information:</h3>
                <div className="space-y-2 text-sm">
                  {medicineInfo.fullName && (
                    <p><strong>Name:</strong> {medicineInfo.fullName}</p>
                  )}
                  {medicineInfo.dosage && (
                    <p><strong>Dosage:</strong> {medicineInfo.dosage.strength} {medicineInfo.dosage.form}</p>
                  )}
                  {medicineInfo.instructions && (
                    <p><strong>Instructions:</strong> {medicineInfo.instructions.amount} {medicineInfo.instructions.frequency} {medicineInfo.instructions.timing}</p>
                  )}
                  {medicineInfo.expirationDate && (
                    <p className={medicineInfo.isExpired ? 'text-red-700 font-bold' : ''}>
                      <strong>Expiration:</strong> {medicineInfo.expirationDate}
                      {medicineInfo.isExpired && ' - EXPIRED'}
                    </p>
                  )}
                  {medicineInfo.conflicts && medicineInfo.conflicts.length > 0 && (
                    <div className="mt-3 p-2 bg-red-100 rounded">
                      <p className="font-bold text-red-900">⚠️ Warnings:</p>
                      <ul className="list-disc list-inside">
                        {medicineInfo.conflicts.map((conflict: string, idx: number) => (
                          <li key={idx} className="text-red-800">{conflict}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                <div className="mt-3">
                  <TextToSpeech text={formatMedicineInfoForSpeech(medicineInfo)} />
                </div>
              </div>
            )}
            
            {/* Description Result */}
            {description && (
              <div
                className="rounded-lg bg-gray-50 p-4"
                role="region"
                aria-label="Image description"
              >
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Description:</h3>
                  <div className="flex gap-2">
                    <TextToSpeech text={description} />
                    <button
                      onClick={() => navigator.clipboard.writeText(description)}
                      className="rounded-lg bg-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-300"
                      aria-label="Copy description to clipboard"
                    >
                      Copy
                    </button>
                  </div>
                </div>
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{description}</p>
              </div>
            )}
      </div>
    </div>
  );
}

