'use client';

import { useState } from 'react';
import { AACBoard } from './AACBoard';
import { TypeToSpeak } from './TypeToSpeak';
import { ConversationBridge } from './ConversationBridge';
import { VoiceBanking } from './VoiceBanking';
import { Routines } from './Routines';
import { AICSenseIntegration } from './AICSenseIntegration';
import { AACSettings } from './AACSettings';
import { CareTeam } from './CareTeam';

type AACMode = 'board' | 'type' | 'bridge' | 'voice' | 'routines' | 'ai' | 'settings' | 'care';

export function AACAssistant() {
  const [mode, setMode] = useState<AACMode>('board');

  return (
    <div className="space-y-6">
      {/* Mode Selection */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => setMode('board')}
          className={`rounded-lg px-5 py-3 font-medium transition-all ${
            mode === 'board'
              ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white shadow-lg'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
          }`}
          aria-pressed={mode === 'board'}
        >
          📋 Communication Board
        </button>
        <button
          onClick={() => setMode('type')}
          className={`rounded-lg px-5 py-3 font-medium transition-all ${
            mode === 'type'
              ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white shadow-lg'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
          }`}
          aria-pressed={mode === 'type'}
        >
          ⌨️ Type to Speak
        </button>
        <button
          onClick={() => setMode('bridge')}
          className={`rounded-lg px-5 py-3 font-medium transition-all ${
            mode === 'bridge'
              ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white shadow-lg'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
          }`}
          aria-pressed={mode === 'bridge'}
        >
          🌉 Conversation Bridge
        </button>
        <button
          onClick={() => setMode('voice')}
          className={`rounded-lg px-5 py-3 font-medium transition-all ${
            mode === 'voice'
              ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white shadow-lg'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
          }`}
          aria-pressed={mode === 'voice'}
        >
          🎤 Voice Banking
        </button>
        <button
          onClick={() => setMode('routines')}
          className={`rounded-lg px-5 py-3 font-medium transition-all ${
            mode === 'routines'
              ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white shadow-lg'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
          }`}
          aria-pressed={mode === 'routines'}
        >
          ⏰ Routines
        </button>
        <button
          onClick={() => setMode('ai')}
          className={`rounded-lg px-5 py-3 font-medium transition-all ${
            mode === 'ai'
              ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white shadow-lg'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
          }`}
          aria-pressed={mode === 'ai'}
        >
          🤖 AI Integration
        </button>
        <button
          onClick={() => setMode('settings')}
          className={`rounded-lg px-5 py-3 font-medium transition-all ${
            mode === 'settings'
              ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white shadow-lg'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
          }`}
          aria-pressed={mode === 'settings'}
        >
          ⚙️ Settings
        </button>
        <button
          onClick={() => setMode('care')}
          className={`rounded-lg px-5 py-3 font-medium transition-all ${
            mode === 'care'
              ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white shadow-lg'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
          }`}
          aria-pressed={mode === 'care'}
        >
          👥 Care Team
        </button>
      </div>

      {/* Content Area */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        {mode === 'board' && <AACBoard />}
        {mode === 'type' && <TypeToSpeak />}
        {mode === 'bridge' && <ConversationBridge />}
        {mode === 'voice' && <VoiceBanking />}
        {mode === 'routines' && <Routines />}
        {mode === 'ai' && <AICSenseIntegration />}
        {mode === 'settings' && <AACSettings />}
        {mode === 'care' && <CareTeam />}
      </div>
    </div>
  );
}

