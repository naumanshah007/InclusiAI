'use client';

import { useState, useEffect, useRef } from 'react';

export function SpeechToText() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const finalTranscriptRef = useRef<string>('');

  useEffect(() => {
    // Check if browser supports Web Speech API
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
      let interimText = '';
      let finalText = '';

      // Only process new results (from resultIndex onwards)
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript;
        
        if (result.isFinal) {
          // Final result - add to permanent transcript
          finalText += transcript + ' ';
        } else {
          // Interim result - show temporarily
          interimText += transcript;
        }
      }

      // Update final transcript (only add new final results)
      if (finalText) {
        finalTranscriptRef.current += finalText;
        setTranscript(finalTranscriptRef.current);
      }

      // Update interim transcript (replace, don't append)
      setInterimTranscript(interimText);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'no-speech') {
        setError('No speech detected. Please try again.');
      } else if (event.error === 'not-allowed') {
        setError('Microphone permission denied. Please allow microphone access.');
      } else {
        setError(`Speech recognition error: ${event.error}`);
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      if (isListening) {
        // Restart if still listening
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
      setTranscript('');
      setInterimTranscript('');
      finalTranscriptRef.current = '';
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
      // Add any remaining interim text to final transcript
      if (interimTranscript) {
        finalTranscriptRef.current += interimTranscript + ' ';
        setTranscript(finalTranscriptRef.current);
        setInterimTranscript('');
      }
    }
  };

  const clearTranscript = () => {
    setTranscript('');
    setInterimTranscript('');
    finalTranscriptRef.current = '';
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">Speech to Text</h2>
      <p className="text-sm text-gray-600">
        Convert speech to text in real-time using your microphone.
      </p>

      {/* Controls */}
      <div className="flex gap-4">
        {!isListening ? (
          <button
            onClick={startListening}
            className="flex-1 rounded-lg bg-green-600 px-6 py-3 font-medium text-white transition-colors hover:bg-green-700"
          >
            Start Listening
          </button>
        ) : (
          <button
            onClick={stopListening}
            className="flex-1 rounded-lg bg-red-600 px-6 py-3 font-medium text-white transition-colors hover:bg-red-700"
          >
            Stop Listening
          </button>
        )}
        <button
          onClick={clearTranscript}
          disabled={!transcript}
          className="rounded-lg bg-gray-200 px-6 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400"
        >
          Clear
        </button>
      </div>

      {/* Status Indicator */}
      {isListening && (
        <div className="flex items-center gap-2 text-green-600">
          <span className="h-3 w-3 animate-pulse rounded-full bg-green-600"></span>
          <span>Listening...</span>
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

      {/* Transcript */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <h3 className="mb-2 font-semibold text-gray-900">Transcript:</h3>
        <div
          className="min-h-[200px] whitespace-pre-wrap text-gray-700"
          role="log"
          aria-live="polite"
          aria-label="Speech transcription"
        >
          {transcript && (
            <span className="text-gray-900">{transcript}</span>
          )}
          {interimTranscript && (
            <span className="text-gray-400 italic">{interimTranscript}</span>
          )}
          {!transcript && !interimTranscript && (
            <span className="text-gray-400">Transcript will appear here...</span>
          )}
        </div>
        {(transcript || interimTranscript) && (
          <button
            onClick={() => navigator.clipboard.writeText(transcript + (interimTranscript ? ' ' + interimTranscript : ''))}
            className="mt-4 rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-300"
          >
            Copy to Clipboard
          </button>
        )}
      </div>
    </div>
  );
}


