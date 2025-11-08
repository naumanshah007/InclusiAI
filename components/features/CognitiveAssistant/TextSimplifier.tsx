'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import type { AIRequest } from '@/types';
import { TextToSpeech } from '@/components/accessibility/TextToSpeech';
import { useAPIKey } from '@/lib/hooks/useAPIKey';
import { useUserPreferences } from '@/lib/store/user-preferences';
import { callAI } from '@/lib/utils/api-client';

export function TextSimplifier() {
  const [inputText, setInputText] = useState('');
  const [simplifiedText, setSimplifiedText] = useState<string | null>(null);
  const [level, setLevel] = useState<'basic' | 'intermediate' | 'advanced'>(
    'basic'
  );
  const { apiKey } = useAPIKey();
  const { aiProvider } = useUserPreferences();

  const { mutate: simplifyText, isPending } = useMutation({
    mutationFn: async (text: string) => {
      const response = await callAI(
        {
          type: 'simplify',
          data: {
            text,
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
      setSimplifiedText(result);
    },
    onError: (error) => {
      console.error('Error simplifying text:', error);
      setSimplifiedText('Failed to simplify text. Please try again.');
    },
  });

  const handleSimplify = () => {
    if (!inputText.trim()) {
      return;
    }
    setSimplifiedText(null);
    simplifyText(inputText);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">Simplify Text</h2>
      <p className="text-sm text-gray-600">
        Make complex text easier to understand for people with cognitive
        disabilities.
      </p>

      {/* Level Selection */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Simplification Level
        </label>
        <select
          value={level}
          onChange={(e) =>
            setLevel(
              e.target.value as 'basic' | 'intermediate' | 'advanced'
            )
          }
          className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="basic">Basic (Elementary school level)</option>
          <option value="intermediate">Intermediate (Middle school level)</option>
          <option value="advanced">Advanced (High school level)</option>
        </select>
      </div>

      {/* Input Text Area */}
      <div>
        <label
          htmlFor="input-text"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          Text to Simplify
        </label>
        <textarea
          id="input-text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Paste or type the text you want to simplify..."
          rows={8}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Simplify Button */}
      <button
        onClick={handleSimplify}
        disabled={isPending || !inputText.trim()}
        className="w-full rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700 disabled:bg-gray-400"
      >
        {isPending ? 'Simplifying...' : 'Simplify Text'}
      </button>

      {/* Simplified Text Result */}
      {simplifiedText && (
        <div
          className="rounded-lg bg-gray-50 p-4"
          role="region"
          aria-label="Simplified text"
        >
          <div className="mb-2 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Simplified Text:</h3>
            <TextToSpeech text={simplifiedText} />
          </div>
          <p className="text-gray-700 whitespace-pre-wrap">{simplifiedText}</p>
          <button
            onClick={() => navigator.clipboard.writeText(simplifiedText)}
            className="mt-4 rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-300"
          >
            Copy to Clipboard
          </button>
        </div>
      )}
    </div>
  );
}

