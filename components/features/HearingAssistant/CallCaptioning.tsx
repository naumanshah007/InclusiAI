'use client';

import { useState, useEffect, useRef } from 'react';
import { useCaptionStore } from '@/lib/store/caption-store';

// Fix for SpeechRecognition type
declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

export function CallCaptioning() {
  const [isActive, setIsActive] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<any>(null);
  const { addTranscript, settings } = useCaptionStore();

  useEffect(() => {
    // Note: In production, this would integrate with actual call audio
    // For now, this simulates call captioning using microphone input
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window && isActive) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      
      recognition.onstart = () => {
        setIsActive(true);
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
          addTranscript(final.trim(), 'Call');
        }
      };
      
      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        if (event.error !== 'no-speech') {
          setIsActive(false);
        }
      };
      
      recognition.onend = () => {
        if (isActive) {
          // Restart if still active
          try {
            recognition.start();
          } catch (e) {
            setIsActive(false);
          }
        }
      };
      
      recognitionRef.current = recognition;
      recognition.start();
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isActive, addTranscript]);

  const handleStart = () => {
    setIsActive(true);
  };

  const handleStop = () => {
    setIsActive(false);
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setTranscript('');
  };

  const fontSizeClasses = {
    small: 'text-base',
    medium: 'text-xl',
    large: 'text-3xl',
    xlarge: 'text-5xl',
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Call Captioning</h2>
        <div className="flex gap-2">
          <button
            onClick={handleStart}
            disabled={isActive}
            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50"
          >
            {isActive ? '📞 Active...' : '▶️ Start'}
          </button>
          <button
            onClick={handleStop}
            disabled={!isActive}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
          >
            ⏹️ Stop
          </button>
        </div>
      </div>

      <p className="text-sm text-gray-600">
        Real-time captions for phone calls and video meetings.
      </p>

      {/* Caption Display */}
      {isActive && (
        <div
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-4xl rounded-lg p-6 bg-black/90 text-white shadow-2xl"
        >
          <div className={`${fontSizeClasses[settings.fontSize]} font-bold text-center leading-tight`}>
            {transcript || 'Listening for call audio...'}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
        <h3 className="font-semibold text-blue-900 mb-2">How to Use:</h3>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>Start captioning before or during a call</li>
          <li>Captions will appear in real-time</li>
          <li>Works with phone calls, Zoom, Meet, Teams, etc.</li>
          <li>Captions are saved automatically (if enabled)</li>
        </ul>
      </div>
    </div>
  );
}

