'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import type { AIRequest } from '@/types';
import { TextToSpeech } from '@/components/accessibility/TextToSpeech';
import { useAPIKey } from '@/lib/hooks/useAPIKey';
import { useUserPreferences } from '@/lib/store/user-preferences';
import { callAI } from '@/lib/utils/api-client';

export function QAAssistant() {
  const [question, setQuestion] = useState('');
  const [context, setContext] = useState('');
  const [answer, setAnswer] = useState<string | null>(null);
  const { apiKey } = useAPIKey();
  const { aiProvider } = useUserPreferences();

  const { mutate: answerQuestion, isPending } = useMutation({
    mutationFn: async (data: { question: string; context?: string }) => {
      const response = await callAI(
        {
          type: 'question',
          data: {
            prompt: data.question,
            context: data.context,
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
      setAnswer(result);
    },
    onError: (error) => {
      console.error('Error answering question:', error);
      setAnswer('Failed to answer question. Please try again.');
    },
  });

  const handleAsk = () => {
    if (!question.trim()) {
      return;
    }
    setAnswer(null);
    answerQuestion({ question, context: context || undefined });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">Q&A Assistant</h2>
      <p className="text-sm text-gray-600">
        Ask questions and get answers. Optionally provide context for more
        accurate responses.
      </p>

      {/* Context Input (Optional) */}
      <div>
        <label
          htmlFor="context"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          Optional Context
        </label>
        <textarea
          id="context"
          value={context}
          onChange={(e) => setContext(e.target.value)}
          placeholder="Provide context (e.g., document content, background information)..."
          rows={4}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Question Input */}
      <div>
        <label
          htmlFor="question"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          Your Question
        </label>
        <textarea
          id="question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask your question here..."
          rows={4}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Ask Button */}
      <button
        onClick={handleAsk}
        disabled={isPending || !question.trim()}
        className="w-full rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700 disabled:bg-gray-400"
      >
        {isPending ? 'Thinking...' : 'Ask Question'}
      </button>

      {/* Answer Result */}
      {answer && (
        <div
          className="rounded-lg bg-gray-50 p-4"
          role="region"
          aria-label="Answer"
        >
          <div className="mb-2 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Answer:</h3>
            <TextToSpeech text={answer} />
          </div>
          <p className="text-gray-700 whitespace-pre-wrap">{answer}</p>
          <button
            onClick={() => navigator.clipboard.writeText(answer)}
            className="mt-4 rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-300"
          >
            Copy to Clipboard
          </button>
        </div>
      )}
    </div>
  );
}

