'use client';

import { useState } from 'react';
import { LiveCaptions } from './LiveCaptions';
import { SoundAwareness } from './SoundAwareness';
import { ConversationBridge } from './ConversationBridge';
import { AnnouncementCapture } from './AnnouncementCapture';
import { CallCaptioning } from './CallCaptioning';
import { AudioUtilities } from './AudioUtilities';

type HearingMode = 'captions' | 'sounds' | 'bridge' | 'announcements' | 'call' | 'utilities';

export function HearingAssistant() {
  const [mode, setMode] = useState<HearingMode>('captions');

  return (
    <div className="space-y-6">
      {/* Mode Selection */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => setMode('captions')}
          className={`rounded-lg px-5 py-3 font-medium transition-all ${
            mode === 'captions'
              ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white shadow-lg'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
          }`}
          aria-pressed={mode === 'captions'}
        >
          📝 Live Captions
        </button>
        <button
          onClick={() => setMode('sounds')}
          className={`rounded-lg px-5 py-3 font-medium transition-all ${
            mode === 'sounds'
              ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white shadow-lg'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
          }`}
          aria-pressed={mode === 'sounds'}
        >
          🔊 Sound Awareness
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
          onClick={() => setMode('announcements')}
          className={`rounded-lg px-5 py-3 font-medium transition-all ${
            mode === 'announcements'
              ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white shadow-lg'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
          }`}
          aria-pressed={mode === 'announcements'}
        >
          📢 Announcements
        </button>
        <button
          onClick={() => setMode('call')}
          className={`rounded-lg px-5 py-3 font-medium transition-all ${
            mode === 'call'
              ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white shadow-lg'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
          }`}
          aria-pressed={mode === 'call'}
        >
          📞 Call Captioning
        </button>
        <button
          onClick={() => setMode('utilities')}
          className={`rounded-lg px-5 py-3 font-medium transition-all ${
            mode === 'utilities'
              ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white shadow-lg'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
          }`}
          aria-pressed={mode === 'utilities'}
        >
          🛠️ Audio Utilities
        </button>
      </div>

      {/* Content Area */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        {mode === 'captions' && <LiveCaptions />}
        {mode === 'sounds' && <SoundAwareness />}
        {mode === 'bridge' && <ConversationBridge />}
        {mode === 'announcements' && <AnnouncementCapture />}
        {mode === 'call' && <CallCaptioning />}
        {mode === 'utilities' && <AudioUtilities />}
      </div>
    </div>
  );
}
