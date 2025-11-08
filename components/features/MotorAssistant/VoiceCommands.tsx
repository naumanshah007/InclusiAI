'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/lib/constants';

export function VoiceCommands() {
  const [isListening, setIsListening] = useState(false);
  const [command, setCommand] = useState('');
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const router = useRouter();

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
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[event.resultIndex][0].transcript
        .toLowerCase()
        .trim();
      setCommand(transcript);
      handleCommand(transcript);
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

  const handleCommand = (command: string) => {
    // Navigation commands
    if (command.includes('go to') || command.includes('navigate to')) {
      if (command.includes('home')) {
        router.push(ROUTES.HOME);
      } else if (command.includes('vision')) {
        router.push(ROUTES.VISION);
      } else if (command.includes('hearing')) {
        router.push(ROUTES.HEARING);
      } else if (command.includes('motor')) {
        router.push(ROUTES.MOTOR);
      } else if (command.includes('cognitive')) {
        router.push(ROUTES.COGNITIVE);
      } else if (command.includes('speech')) {
        router.push(ROUTES.SPEECH);
      } else if (command.includes('settings')) {
        router.push(ROUTES.SETTINGS);
      }
    }

    // Action commands
    if (command.includes('stop') || command.includes('cancel')) {
      stopListening();
    }
  };

  const startListening = () => {
    if (!recognitionRef.current) {
      setError('Speech recognition not available');
      return;
    }

    try {
      setError(null);
      setCommand('');
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

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">Voice Commands</h2>
      <p className="text-sm text-gray-600">
        Control the app using voice commands. Try saying "go to home", "go to
        vision", "go to settings", etc.
      </p>

      {/* Controls */}
      <div className="flex gap-4">
        {!isListening ? (
          <button
            onClick={startListening}
            className="flex-1 rounded-lg bg-green-600 px-6 py-3 font-medium text-white transition-colors hover:bg-green-700"
          >
            Start Voice Commands
          </button>
        ) : (
          <button
            onClick={stopListening}
            className="flex-1 rounded-lg bg-red-600 px-6 py-3 font-medium text-white transition-colors hover:bg-red-700"
          >
            Stop Voice Commands
          </button>
        )}
      </div>

      {/* Status Indicator */}
      {isListening && (
        <div className="flex items-center gap-2 text-green-600">
          <span className="h-3 w-3 animate-pulse rounded-full bg-green-600"></span>
          <span>Listening for commands...</span>
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

      {/* Command Display */}
      {command && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <h3 className="mb-2 font-semibold text-gray-900">Last Command:</h3>
          <p className="text-gray-700">{command}</p>
        </div>
      )}

      {/* Available Commands */}
      <div className="rounded-lg border border-gray-200 bg-blue-50 p-4">
        <h3 className="mb-2 font-semibold text-gray-900">Available Commands:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
          <li>"Go to home" - Navigate to home page</li>
          <li>"Go to vision" - Navigate to vision assistance</li>
          <li>"Go to hearing" - Navigate to hearing assistance</li>
          <li>"Go to motor" - Navigate to motor assistance</li>
          <li>"Go to cognitive" - Navigate to cognitive assistance</li>
          <li>"Go to speech" - Navigate to speech assistance</li>
          <li>"Go to settings" - Navigate to settings</li>
          <li>"Stop" or "Cancel" - Stop voice commands</li>
        </ul>
      </div>
    </div>
  );
}

