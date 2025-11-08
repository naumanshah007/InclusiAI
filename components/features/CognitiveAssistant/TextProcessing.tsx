'use client';

import { useState } from 'react';
import { TextSimplifier } from './TextSimplifier';
import { TextSummarizer } from './TextSummarizer';
import { QAAssistant } from './QAAssistant';
import { TaskBreakdown } from './TaskBreakdown';

type TextMode = 'simplify' | 'summarize' | 'question' | 'task';

export function TextProcessing() {
  const [mode, setMode] = useState<TextMode>('simplify');

  return (
    <div className="space-y-6">
      {/* Mode Selection */}
      <div className="flex flex-wrap gap-4">
        <button
          onClick={() => setMode('simplify')}
          className={`rounded-lg px-4 py-2 font-medium transition-colors ${
            mode === 'simplify'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
          aria-pressed={mode === 'simplify'}
        >
          Simplify Text
        </button>
        <button
          onClick={() => setMode('summarize')}
          className={`rounded-lg px-4 py-2 font-medium transition-colors ${
            mode === 'summarize'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
          aria-pressed={mode === 'summarize'}
        >
          Summarize
        </button>
        <button
          onClick={() => setMode('question')}
          className={`rounded-lg px-4 py-2 font-medium transition-colors ${
            mode === 'question'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
          aria-pressed={mode === 'question'}
        >
          Q&A Assistant
        </button>
        <button
          onClick={() => setMode('task')}
          className={`rounded-lg px-4 py-2 font-medium transition-colors ${
            mode === 'task'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
          aria-pressed={mode === 'task'}
        >
          Task Breakdown
        </button>
      </div>

      {/* Content Area */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        {mode === 'simplify' && <TextSimplifier />}
        {mode === 'summarize' && <TextSummarizer />}
        {mode === 'question' && <QAAssistant />}
        {mode === 'task' && <TaskBreakdown />}
      </div>
    </div>
  );
}

