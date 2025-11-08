'use client';

import { useState } from 'react';
import { TextToSpeech } from '@/components/accessibility/TextToSpeech';

const commonPhrases = [
  'Hello',
  'Thank you',
  'Please',
  'Yes',
  'No',
  'Help',
  'I need',
  'Water',
  'Food',
  'Bathroom',
  'Pain',
  'Happy',
  'Sad',
  'Tired',
  'Good',
  'Bad',
];

export function CommunicationBoard() {
  const [message, setMessage] = useState('');
  const [customPhrase, setCustomPhrase] = useState('');

  const addPhrase = (phrase: string) => {
    setMessage((prev) => (prev ? `${prev} ${phrase}` : phrase));
  };

  const addCustomPhrase = () => {
    if (customPhrase.trim()) {
      addPhrase(customPhrase.trim());
      setCustomPhrase('');
    }
  };

  const clearMessage = () => {
    setMessage('');
  };

  const speakMessage = () => {
    if (message) {
      // TextToSpeech component will handle this
      const utterance = new SpeechSynthesisUtterance(message);
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">
        Communication Board
      </h2>
      <p className="text-sm text-gray-600">
        Tap phrases to build a message, then speak it aloud.
      </p>

      {/* Message Display */}
      <div className="rounded-lg border-2 border-gray-300 bg-gray-50 p-4">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Your Message:</h3>
          <div className="flex gap-2">
            {message && (
              <>
                <TextToSpeech text={message} />
                <button
                  onClick={clearMessage}
                  className="rounded-lg bg-gray-200 px-3 py-1 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-300"
                >
                  Clear
                </button>
              </>
            )}
          </div>
        </div>
        <div
          className="min-h-[60px] text-lg text-gray-700"
          role="textbox"
          aria-label="Message"
        >
          {message || 'Your message will appear here...'}
        </div>
      </div>

      {/* Common Phrases Grid */}
      <div>
        <h3 className="mb-3 font-semibold text-gray-900">Common Phrases:</h3>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {commonPhrases.map((phrase) => (
            <button
              key={phrase}
              onClick={() => addPhrase(phrase)}
              className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:border-blue-500"
            >
              {phrase}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Phrase Input */}
      <div>
        <h3 className="mb-2 font-semibold text-gray-900">Add Custom Phrase:</h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={customPhrase}
            onChange={(e) => setCustomPhrase(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                addCustomPhrase();
              }
            }}
            placeholder="Type a custom phrase..."
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={addCustomPhrase}
            disabled={!customPhrase.trim()}
            className="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white transition-colors hover:bg-blue-700 disabled:bg-gray-400"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}

