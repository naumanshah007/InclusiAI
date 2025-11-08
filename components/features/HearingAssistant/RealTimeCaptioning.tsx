'use client';

import { useState, useEffect, useRef } from 'react';

export function RealTimeCaptioning() {
  const [isListening, setIsListening] = useState(false);
  const [currentCaption, setCurrentCaption] = useState('');
  const [captions, setCaptions] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      window.SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError(
        'Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.'
      );
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      setCurrentCaption(interimTranscript);

      if (finalTranscript) {
        setCaptions((prev) => [...prev, finalTranscript.trim()]);
        setCurrentCaption('');
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        setError('Microphone permission denied. Please allow microphone access.');
      } else {
        setError(`Speech recognition error: ${event.error}`);
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      if (isListening) {
        try {
          recognition.start();
        } catch (e) {
          // Already started or error
        }
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isListening]);

  const startListening = () => {
    if (!recognitionRef.current) {
      setError('Speech recognition not available');
      return;
    }

    try {
      setError(null);
      setCaptions([]);
      setCurrentCaption('');
      recognitionRef.current.start();
      setIsListening(true);
    } catch (e) {
      setError('Failed to start speech recognition');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const clearCaptions = () => {
    setCaptions([]);
    setCurrentCaption('');
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">
        Real-Time Captioning
      </h2>
      <p className="text-sm text-gray-600">
        Get live captions of speech in real-time, similar to closed captions.
      </p>

      {/* Controls */}
      <div className="flex gap-4">
        {!isListening ? (
          <button
            onClick={startListening}
            className="flex-1 rounded-lg bg-green-600 px-6 py-3 font-medium text-white transition-colors hover:bg-green-700"
          >
            Start Captioning
          </button>
        ) : (
          <button
            onClick={stopListening}
            className="flex-1 rounded-lg bg-red-600 px-6 py-3 font-medium text-white transition-colors hover:bg-red-700"
          >
            Stop Captioning
          </button>
        )}
        <button
          onClick={clearCaptions}
          disabled={captions.length === 0 && !currentCaption}
          className="rounded-lg bg-gray-200 px-6 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400"
        >
          Clear
        </button>
      </div>

      {/* Status Indicator */}
      {isListening && (
        <div className="flex items-center gap-2 text-green-600">
          <span className="h-3 w-3 animate-pulse rounded-full bg-green-600"></span>
          <span>Captioning...</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div
          className="rounded-lg bg-red-50 p-4 text-red-800"
          role="alert"
          aria-live="polite"
        >
          {error}
        </div>
      )}

      {/* Caption Display */}
      <div className="rounded-lg border-2 border-gray-300 bg-black p-6 text-center">
        <div className="min-h-[100px] space-y-2">
          {captions.map((caption, index) => (
            <p
              key={index}
              className="text-lg font-medium text-white"
              aria-live="polite"
            >
              {caption}
            </p>
          ))}
          {currentCaption && (
            <p className="text-lg font-medium text-gray-400" aria-live="polite">
              {currentCaption}
            </p>
          )}
          {captions.length === 0 && !currentCaption && (
            <p className="text-gray-500">Captions will appear here...</p>
          )}
        </div>
      </div>
    </div>
  );
}

