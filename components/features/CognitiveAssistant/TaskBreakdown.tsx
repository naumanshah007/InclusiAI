'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import type { AIRequest } from '@/types';
import { useAPIKey } from '@/lib/hooks/useAPIKey';
import { useUserPreferences } from '@/lib/store/user-preferences';
import { callAI } from '@/lib/utils/api-client';

export function TaskBreakdown() {
  const [task, setTask] = useState('');
  const [steps, setSteps] = useState<string[]>([]);
  const { apiKey } = useAPIKey();
  const { aiProvider } = useUserPreferences();

  const { mutate: breakDownTask, isPending } = useMutation({
    mutationFn: async (taskText: string) => {
      const response = await callAI(
        {
          type: 'question',
          data: {
            prompt: `Break down this task into simple, actionable steps. Each step should be clear and easy to follow. Return only the steps, one per line, numbered.\n\nTask: ${taskText}`,
          },
        },
        {
          apiKey,
          provider: aiProvider,
        }
      );
      
      // Parse steps from response
      const stepText = response.result;
      const parsedSteps = stepText
        .split('\n')
        .map((line: string) => line.replace(/^\d+[\.\)]\s*/, '').trim())
        .filter((line: string) => line.length > 0);

      return parsedSteps.length > 0 ? parsedSteps : ['Task breakdown unavailable'];
    },
    onSuccess: (result) => {
      setSteps(result);
    },
    onError: (error) => {
      console.error('Error breaking down task:', error);
      setSteps(['Failed to break down task. Please try again.']);
    },
  });

  const handleBreakDown = () => {
    if (!task.trim()) {
      return;
    }
    setSteps([]);
    breakDownTask(task);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">Task Breakdown</h2>
      <p className="text-sm text-gray-600">
        Break down complex tasks into simple, manageable steps.
      </p>

      {/* Task Input */}
      <div>
        <label
          htmlFor="task"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          Task to Break Down
        </label>
        <textarea
          id="task"
          value={task}
          onChange={(e) => setTask(e.target.value)}
          placeholder="Describe the task you want to break down..."
          rows={4}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Break Down Button */}
      <button
        onClick={handleBreakDown}
        disabled={isPending || !task.trim()}
        className="w-full rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700 disabled:bg-gray-400"
      >
        {isPending ? 'Breaking down...' : 'Break Down Task'}
      </button>

      {/* Steps Result */}
      {steps.length > 0 && (
        <div
          className="rounded-lg bg-gray-50 p-4"
          role="region"
          aria-label="Task steps"
        >
          <h3 className="mb-4 font-semibold text-gray-900">Steps:</h3>
          <ol className="list-decimal list-inside space-y-2">
            {steps.map((step, index) => (
              <li key={index} className="text-gray-700">
                {step}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

