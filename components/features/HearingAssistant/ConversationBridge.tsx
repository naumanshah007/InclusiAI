'use client';

import { useState, useRef } from 'react';
import { TextToSpeech } from '@/components/accessibility/TextToSpeech';

export function ConversationBridge() {
  const [mode, setMode] = useState<'type-to-speak' | 'speech-to-text'>('type-to-speak');
  const [text, setText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<any>(null);

  const handleSpeak = () => {
    if (!text.trim()) return;
    
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const synth = window.speechSynthesis;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.volume = 1.0;
      synth.speak(utterance);
    }
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
        Bridge conversations between DHH and hearing people.
      </p>

      {/* Mode Toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => {
            setMode('type-to-speak');
            setText('');
          }}
          className={`flex-1 rounded-lg px-4 py-3 font-medium transition-colors ${
            mode === 'type-to-speak'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          📝 Type to Speak
        </button>
        <button
          onClick={() => {
            setMode('speech-to-text');
            setTranscript('');
          }}
          className={`flex-1 rounded-lg px-4 py-3 font-medium transition-colors ${
            mode === 'speech-to-text'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          🎤 Speech to Text
        </button>
      </div>

      {/* Type to Speak Mode */}
      {mode === 'type-to-speak' && (
        <div className="rounded-lg bg-gray-50 p-4 space-y-3">
          <h3 className="font-semibold text-gray-900">You Type, App Speaks</h3>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type what you want to say..."
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={4}
          />
          <div className="flex gap-2">
            <button
              onClick={handleSpeak}
              disabled={!text.trim()}
              className="flex-1 rounded-lg bg-green-600 px-6 py-3 font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50"
            >
              🔊 Speak
            </button>
            <button
              onClick={() => setText('')}
              className="rounded-lg bg-gray-200 px-4 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-300"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Speech to Text Mode */}
      {mode === 'speech-to-text' && (
        <div className="rounded-lg bg-gray-50 p-4 space-y-3">
          <h3 className="font-semibold text-gray-900">They Speak, You Read</h3>
          <div className="rounded-lg bg-white border border-gray-200 p-4 min-h-[200px]">
            <p className="text-lg text-gray-700 whitespace-pre-wrap">
              {transcript || 'Waiting for speech...'}
            </p>
          </div>
          <div className="flex gap-2">
            {!isListening ? (
              <button
                onClick={handleStartListening}
                className="flex-1 rounded-lg bg-green-600 px-6 py-3 font-medium text-white transition-colors hover:bg-green-700"
              >
                🎤 Start Listening
              </button>
            ) : (
              <button
                onClick={handleStopListening}
                className="flex-1 rounded-lg bg-red-600 px-6 py-3 font-medium text-white transition-colors hover:bg-red-700"
              >
                ⏹️ Stop Listening
              </button>
            )}
            <button
              onClick={() => setTranscript('')}
              className="rounded-lg bg-gray-200 px-4 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-300"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Flip Device Hint */}
      <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 text-center">
        <p className="text-sm text-blue-800">
          💡 Tip: Flip your device to hand it back and forth during conversation
        </p>
      </div>
    </div>
  );
}

