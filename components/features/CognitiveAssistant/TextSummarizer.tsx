'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import type { AIRequest } from '@/types';
import { TextToSpeech } from '@/components/accessibility/TextToSpeech';
import { useAPIKey } from '@/lib/hooks/useAPIKey';
import { useUserPreferences } from '@/lib/store/user-preferences';
import { callAI } from '@/lib/utils/api-client';

export function TextSummarizer() {
  const [inputText, setInputText] = useState('');
  const [summary, setSummary] = useState<string | null>(null);
  const [length, setLength] = useState<'short' | 'medium' | 'long'>('medium');
  const { apiKey } = useAPIKey();
  const { aiProvider } = useUserPreferences();

  const { mutate: summarizeText, isPending } = useMutation({
    mutationFn: async (text: string) => {
      const response = await callAI(
        {
          type: 'summarize',
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
      setSummary(result);
    },
    onError: (error) => {
      console.error('Error summarizing text:', error);
      setSummary('Failed to summarize text. Please try again.');
    },
  });

  const handleSummarize = () => {
    if (!inputText.trim()) {
      return;
    }
    setSummary(null);
    summarizeText(inputText);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">Summarize Text</h2>
      <p className="text-sm text-gray-600">
        Get a concise summary of long documents or articles.
      </p>

      {/* Length Selection */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Summary Length
        </label>
        <select
          value={length}
          onChange={(e) =>
            setLength(e.target.value as 'short' | 'medium' | 'long')
          }
          className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="short">Short (2-3 sentences)</option>
          <option value="medium">Medium (1 paragraph)</option>
          <option value="long">Long (2-3 paragraphs)</option>
        </select>
      </div>

      {/* Input Text Area */}
      <div>
        <label
          htmlFor="input-text"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          Text to Summarize
        </label>
        <textarea
          id="input-text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Paste or type the text you want to summarize..."
          rows={10}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Summarize Button */}
      <button
        onClick={handleSummarize}
        disabled={isPending || !inputText.trim()}
        className="w-full rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700 disabled:bg-gray-400"
      >
        {isPending ? 'Summarizing...' : 'Summarize Text'}
      </button>

      {/* Summary Result */}
      {summary && (
        <div
          className="rounded-lg bg-gray-50 p-4"
          role="region"
          aria-label="Summary"
        >
          <div className="mb-2 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Summary:</h3>
            <TextToSpeech text={summary} />
          </div>
          <p className="text-gray-700 whitespace-pre-wrap">{summary}</p>
          <button
            onClick={() => navigator.clipboard.writeText(summary)}
            className="mt-4 rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-300"
          >
            Copy to Clipboard
          </button>
        </div>
      )}
    </div>
  );
}

