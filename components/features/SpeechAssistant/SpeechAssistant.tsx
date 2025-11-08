'use client';

import { useState } from 'react';
import { CommunicationBoard } from './CommunicationBoard';
import { QuickPhrases } from './QuickPhrases';

type SpeechMode = 'board' | 'phrases';

export function SpeechAssistant() {
  const [mode, setMode] = useState<SpeechMode>('board');

  return (
    <div className="space-y-6">
      {/* Mode Selection */}
      <div className="flex flex-wrap gap-4">
        <button
          onClick={() => setMode('board')}
          className={`rounded-lg px-4 py-2 font-medium transition-colors ${
            mode === 'board'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
          aria-pressed={mode === 'board'}
        >
          Communication Board
        </button>
        <button
          onClick={() => setMode('phrases')}
          className={`rounded-lg px-4 py-2 font-medium transition-colors ${
            mode === 'phrases'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
          aria-pressed={mode === 'phrases'}
        >
          Quick Phrases
        </button>
      </div>

      {/* Content Area */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        {mode === 'board' && <CommunicationBoard />}
        {mode === 'phrases' && <QuickPhrases />}
      </div>
    </div>
  );
}

