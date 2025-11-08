'use client';

import { useState, useRef } from 'react';
import { useAACStore } from '@/lib/store/aac-store';
import { speakWithVoice } from '@/lib/utils/voice-banking';
import { useVoiceBankingStore } from '@/lib/store/voice-banking-store';

export function TypeToSpeak() {
  const [text, setText] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const { settings, addHistory, getRecentPhrases } = useAACStore();
  const { getActiveVoice } = useVoiceBankingStore();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSpeak = () => {
    if (!text.trim()) return;
    
    addHistory(text.trim(), 'type');
    setIsSpeaking(true);
    
    const activeVoice = getActiveVoice();
    speakWithVoice(
      text.trim(),
      activeVoice?.id || null,
      {
        rate: settings.voiceRate,
        pitch: settings.voicePitch,
        volume: settings.voiceVolume,
      }
    );
    
    // Reset speaking state after speech completes
    setTimeout(() => {
      setIsSpeaking(false);
    }, text.length * 100); // Rough estimate
  };

  const handleClear = () => {
    setText('');
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleRecentPhrase = (phrase: string) => {
    setText(phrase);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const recentPhrases = getRecentPhrases(5);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">Type to Speak</h2>
      
      {/* Text Input */}
      <div className="space-y-3">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type what you want to say..."
          className={`w-full rounded-lg border-2 border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            settings.largeButtons ? 'text-2xl' : 'text-lg'
          }`}
          rows={settings.largeButtons ? 4 : 3}
          autoFocus
        />
        
        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleSpeak}
            disabled={!text.trim() || isSpeaking}
            className={`flex-1 rounded-lg bg-green-600 px-6 py-3 font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50 ${
              settings.largeButtons ? 'text-xl' : 'text-lg'
            }`}
          >
            {isSpeaking ? '🔊 Speaking...' : '🔊 Speak'}
          </button>
          <button
            onClick={handleClear}
            className={`rounded-lg bg-gray-200 px-4 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-300 ${
              settings.largeButtons ? 'text-xl' : 'text-lg'
            }`}
          >
            Clear
          </button>
        </div>
      </div>

      {/* Recent Phrases */}
      {recentPhrases.length > 0 && (
        <div className="rounded-lg bg-gray-50 p-4 space-y-2">
          <h3 className="font-semibold text-gray-900">Recent Phrases:</h3>
          <div className="flex gap-2 flex-wrap">
            {recentPhrases.map((phrase) => (
              <button
                key={phrase.id}
                onClick={() => handleRecentPhrase(phrase.text)}
                className="rounded-lg bg-white border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
              >
                {phrase.text}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Hint */}
      <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
        <p className="text-sm text-blue-800">
          💡 Tip: Press Enter to speak, Escape to clear
        </p>
      </div>
    </div>
  );
}

