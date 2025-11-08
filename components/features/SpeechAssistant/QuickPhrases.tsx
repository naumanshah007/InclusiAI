'use client';

import { TextToSpeech } from '@/components/accessibility/TextToSpeech';

const quickPhrases = [
  { category: 'Greetings', phrases: ['Hello', 'Hi', 'Good morning', 'Good afternoon', 'Good evening', 'Goodbye'] },
  { category: 'Needs', phrases: ['I need help', 'I need water', 'I need food', 'I need the bathroom', 'I need rest'] },
  { category: 'Feelings', phrases: ['I am happy', 'I am sad', 'I am tired', 'I am in pain', 'I am okay'] },
  { category: 'Questions', phrases: ['What?', 'Where?', 'When?', 'Why?', 'How?', 'Who?'] },
  { category: 'Responses', phrases: ['Yes', 'No', 'Maybe', 'Thank you', 'Please', 'Sorry'] },
  { category: 'Emergency', phrases: ['Help', 'Emergency', 'Call 911', 'I need a doctor', 'I am hurt'] },
];

export function QuickPhrases() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">Quick Phrases</h2>
      <p className="text-sm text-gray-600">
        Tap a phrase to speak it aloud instantly.
      </p>

      <div className="space-y-6">
        {quickPhrases.map((category) => (
          <div key={category.category}>
            <h3 className="mb-3 font-semibold text-gray-900">
              {category.category}:
            </h3>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              {category.phrases.map((phrase) => (
                <div
                  key={phrase}
                  className="flex items-center justify-between rounded-lg border border-gray-300 bg-white p-3"
                >
                  <span className="text-sm font-medium text-gray-700">
                    {phrase}
                  </span>
                  <TextToSpeech text={phrase} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

