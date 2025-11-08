'use client';

import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useAPIKey } from '@/lib/hooks/useAPIKey';
import { useUserPreferences } from '@/lib/store/user-preferences';
import { callAI } from '@/lib/utils/api-client';
import { useTrustedPeopleStore } from '@/lib/store/trusted-people-store';
import { isPersonDetectionEnabled, enablePersonDetection, isTrustedPeopleSavingEnabled, enableTrustedPeopleSaving } from '@/lib/utils/privacy-handler';
import { TextToSpeech } from '@/components/accessibility/TextToSpeech';
import { CameraFeed } from './CameraFeed';

export function PeopleAwareness() {
  const [personInfo, setPersonInfo] = useState<any>(null);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [detectionEnabled, setDetectionEnabled] = useState(false);
  const [savingEnabled, setSavingEnabled] = useState(false);
  const [personName, setPersonName] = useState('');
  const { apiKey } = useAPIKey();
  const { aiProvider } = useUserPreferences();
  const { addPerson, people, searchPeople } = useTrustedPeopleStore();

  useEffect(() => {
    setDetectionEnabled(isPersonDetectionEnabled());
    setSavingEnabled(isTrustedPeopleSavingEnabled());
  }, []);

  const { mutate: detectPeople, isPending } = useMutation({
    mutationFn: async (image: string) => {
      const response = await callAI(
        {
          type: 'vision',
          data: {
            image,
            context: `Look for people in this image. For each person, describe:
1. Approximate location (left, right, center, ahead, behind)
2. Approximate distance in feet or meters
3. What they might be doing (standing, sitting, walking)
4. If they appear to be facing you or away
5. General description (if safe and privacy-respecting)

Be specific about location and distance. If no people are visible, say "No people visible".`,
            scenario: 'object',
          },
        },
        {
          apiKey,
          provider: aiProvider,
        }
      );
      return { image, result: response.result };
    },
    onSuccess: (result) => {
      setPersonInfo(result.result);
      setCurrentImage(result.image);
      
      // Auto-speak
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        const synth = window.speechSynthesis;
        const utterance = new SpeechSynthesisUtterance(result.result);
        utterance.rate = 1.0;
        synth.speak(utterance);
      }
    },
    onError: (error) => {
      console.error('Error detecting people:', error);
      setPersonInfo(null);
    },
  });

  const handleImageCapture = (image: string) => {
    if (detectionEnabled) {
      detectPeople(image);
    }
  };

  const handleEnableDetection = () => {
    enablePersonDetection();
    setDetectionEnabled(true);
  };

  const handleEnableSaving = () => {
    enableTrustedPeopleSaving();
    setSavingEnabled(true);
  };

  const handleSavePerson = () => {
    if (!personName.trim() || !currentImage) {
      return;
    }

    if (!savingEnabled) {
      alert('Please enable trusted people saving first (privacy opt-in).');
      return;
    }

    addPerson({
      name: personName.trim(),
      description: personInfo || 'Trusted person',
      image: currentImage,
      timestamp: Date.now(),
    });

    // Speak confirmation
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const synth = window.speechSynthesis;
      const utterance = new SpeechSynthesisUtterance(`Saved ${personName} as a trusted person.`);
      utterance.rate = 1.0;
      synth.speak(utterance);
    }

    setPersonName('');
  };

  const handleSearchPerson = () => {
    if (!personName.trim()) {
      return;
    }

    const found = searchPeople(personName.trim());
    if (found.length > 0) {
      const person = found[0];
      const message = `${person.name} is a trusted person. ${person.description || ''} ${person.lastSeen ? `Last seen ${new Date(person.lastSeen).toLocaleDateString()}.` : ''}`;
      
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        const synth = window.speechSynthesis;
        const utterance = new SpeechSynthesisUtterance(message);
        utterance.rate = 1.0;
        synth.speak(utterance);
      }
    } else {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        const synth = window.speechSynthesis;
        const utterance = new SpeechSynthesisUtterance(`${personName} not found in trusted people.`);
        utterance.rate = 1.0;
        synth.speak(utterance);
      }
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">People Awareness</h2>
      <p className="text-sm text-gray-600">
        Detect people nearby and save trusted people (privacy-first, opt-in only).
      </p>
      
      {/* Privacy Settings */}
      <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4 space-y-3">
        <h3 className="font-semibold text-yellow-900">Privacy Settings (Opt-In):</h3>
        <div className="space-y-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={detectionEnabled}
              onChange={(e) => {
                if (e.target.checked) {
                  handleEnableDetection();
                } else {
                  setDetectionEnabled(false);
                }
              }}
              className="rounded border-gray-300"
            />
            <span className="text-sm text-yellow-800">Enable person detection</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={savingEnabled}
              onChange={(e) => {
                if (e.target.checked) {
                  handleEnableSaving();
                } else {
                  setSavingEnabled(false);
                }
              }}
              className="rounded border-gray-300"
            />
            <span className="text-sm text-yellow-800">Enable trusted people saving (local storage only)</span>
          </label>
        </div>
        <p className="text-xs text-yellow-700">
          All data is stored locally on your device. No data is sent to external servers.
        </p>
      </div>
      
      {detectionEnabled && (
        <>
          <CameraFeed
            onImageCapture={handleImageCapture}
            showGuidance={true}
            speakGuidance={true}
          />
          
          {isPending && (
            <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 text-center">
              <p className="text-sm text-blue-800">Detecting people...</p>
            </div>
          )}
          
          {personInfo && (
            <div className="rounded-lg bg-gray-50 p-4 space-y-3">
              <h3 className="font-semibold text-gray-900">People Detection:</h3>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{personInfo}</p>
              <div className="mt-3">
                <TextToSpeech text={personInfo} />
              </div>
            </div>
          )}
        </>
      )}
      
      {savingEnabled && (
        <div className="rounded-lg bg-gray-50 p-4 space-y-3">
          <h3 className="font-semibold text-gray-900">Save Trusted Person:</h3>
          <div className="space-y-2">
            <input
              type="text"
              value={personName}
              onChange={(e) => setPersonName(e.target.value)}
              placeholder="Person's name"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex gap-2">
              <button
                onClick={handleSavePerson}
                disabled={!personName.trim() || !currentImage}
                className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
              >
                💾 Save Person
              </button>
              <button
                onClick={handleSearchPerson}
                disabled={!personName.trim()}
                className="flex-1 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50"
              >
                🔍 Find Person
              </button>
            </div>
          </div>
        </div>
      )}
      
      {people.length > 0 && (
        <div className="rounded-lg bg-gray-50 p-4">
          <h3 className="font-semibold text-gray-900 mb-2">Trusted People ({people.length}):</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {people.map((person) => (
              <div key={person.id} className="text-sm text-gray-700 border-b border-gray-200 pb-2">
                <p><strong>{person.name}</strong> - {person.description || 'Trusted person'}</p>
                {person.lastSeen && (
                  <p className="text-xs text-gray-500">Last seen: {new Date(person.lastSeen).toLocaleDateString()}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

