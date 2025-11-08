'use client';

import { useState, useRef } from 'react';
import { useAACStore } from '@/lib/store/aac-store';
import { speakWithVoice } from '@/lib/utils/voice-banking';
import { useVoiceBankingStore } from '@/lib/store/voice-banking-store';

export function ConversationBridge() {
  const [text, setText] = useState('');
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const { settings, addHistory } = useAACStore();
  const { getActiveVoice } = useVoiceBankingStore();
  const recognitionRef = useRef<any>(null);

  const handleSpeak = () => {
    if (!text.trim()) return;
    
    addHistory(text.trim(), 'type');
    
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
    
    setText('');
  };

  const handleStartListening = () => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      
      recognition.onstart = () => {
        setIsListening(true);
      };
      
      recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            final += transcript + ' ';
          } else {
            interim += transcript;
          }
        }
        
        if (final) {
          setTranscript((prev) => prev + final);
        } else {
          setTranscript((prev) => prev.split(' ').slice(0, -1).join(' ') + ' ' + interim);
        }
      };
      
      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
      
      recognitionRef.current = recognition;
      recognition.start();
    }
  };

  const handleStopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">Conversation Bridge</h2>
      <p className="text-sm text-gray-600">
        Bridge conversations between non-speaking and speaking people.
      </p>

      {/* You Type, App Speaks */}
      <div className="rounded-lg bg-gray-50 p-4 space-y-3">
        <h3 className="font-semibold text-gray-900">You Type, App Speaks</h3>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type what you want to say..."
          className={`w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            settings.largeButtons ? 'text-2xl' : 'text-lg'
          }`}
          rows={3}
        />
        <button
          onClick={handleSpeak}
          disabled={!text.trim()}
          className={`w-full rounded-lg bg-green-600 px-6 py-3 font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50 ${
            settings.largeButtons ? 'text-xl' : 'text-lg'
          }`}
        >
          🔊 Speak
        </button>
      </div>

      {/* They Speak, You Read */}
      <div className="rounded-lg bg-gray-50 p-4 space-y-3">
        <h3 className="font-semibold text-gray-900">They Speak, You Read</h3>
        <div className="rounded-lg bg-white border border-gray-200 p-4 min-h-[150px]">
          <p className={`text-gray-700 whitespace-pre-wrap ${
            settings.largeButtons ? 'text-2xl' : 'text-lg'
          }`}>
            {transcript || 'Waiting for speech...'}
          </p>
        </div>
        <div className="flex gap-2">
          {!isListening ? (
            <button
              onClick={handleStartListening}
              className={`flex-1 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700 ${
                settings.largeButtons ? 'text-xl' : 'text-lg'
              }`}
            >
              🎤 Start Listening
            </button>
          ) : (
            <button
              onClick={handleStopListening}
              className={`flex-1 rounded-lg bg-red-600 px-6 py-3 font-medium text-white transition-colors hover:bg-red-700 ${
                settings.largeButtons ? 'text-xl' : 'text-lg'
              }`}
            >
              ⏹️ Stop Listening
            </button>
          )}
          <button
            onClick={() => setTranscript('')}
            className={`rounded-lg bg-gray-200 px-4 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-300 ${
              settings.largeButtons ? 'text-xl' : 'text-lg'
            }`}
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}

