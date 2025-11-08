'use client';

import { useState } from 'react';
import { useAACStore, type AACBoard } from '@/lib/store/aac-store';

export function Routines() {
  const { boards, addBoard, setCurrentBoard } = useAACStore();
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedScene, setSelectedScene] = useState<string>('');

  const locations = ['home', 'school', 'work', 'hospital', 'restaurant', 'store'];
  const timeContexts = ['morning', 'afternoon', 'evening', 'anytime'];
  const scenes = [
    { id: 'clinic', name: 'Clinic Visit', category: 'medical' },
    { id: 'restaurant', name: 'Restaurant', category: 'social' },
    { id: 'classroom', name: 'Classroom', category: 'education' },
    { id: 'meeting', name: 'Meeting', category: 'work' },
    { id: 'emergency', name: 'Emergency', category: 'safety' },
  ];

  const locationBoards = boards.filter(
    (b) => b.location && (!selectedLocation || b.location === selectedLocation)
  );
  const timeBoards = boards.filter(
    (b) => b.timeContext && (!selectedTime || b.timeContext === selectedTime)
  );
  const sceneBoards = boards.filter(
    (b) => b.scene && (!selectedScene || b.scene === selectedScene)
  );

  const handleCreateLocationBoard = (location: string) => {
    const phrases = [
      { id: '1', text: `I'm at ${location}`, category: 'location', frequency: 0 },
      { id: '2', text: 'I need help', category: 'needs', frequency: 0 },
      { id: '3', text: 'Where is the bathroom?', category: 'needs', frequency: 0 },
    ];
    
    addBoard({
      name: `${location.charAt(0).toUpperCase() + location.slice(1)} Board`,
      category: 'location',
      phrases,
      location,
      isDefault: false,
    });
  };

  const handleCreateSceneBoard = (scene: typeof scenes[0]) => {
    let phrases: any[] = [];
    
    if (scene.id === 'clinic') {
      phrases = [
        { id: '1', text: 'I have pain', category: 'medical', frequency: 0 },
        { id: '2', text: 'I need medication', category: 'medical', frequency: 0 },
        { id: '3', text: 'I consent to treatment', category: 'medical', frequency: 0 },
        { id: '4', text: 'I do not consent', category: 'medical', frequency: 0 },
        { id: '5', text: 'I have questions', category: 'medical', frequency: 0 },
      ];
    } else if (scene.id === 'restaurant') {
      phrases = [
        { id: '1', text: 'I would like to order', category: 'social', frequency: 0 },
        { id: '2', text: 'What do you recommend?', category: 'social', frequency: 0 },
        { id: '3', text: 'I have allergies', category: 'needs', frequency: 0 },
        { id: '4', text: 'Thank you', category: 'social', frequency: 0 },
      ];
    } else if (scene.id === 'classroom') {
      phrases = [
        { id: '1', text: 'I need help', category: 'education', frequency: 0 },
        { id: '2', text: 'I understand', category: 'education', frequency: 0 },
        { id: '3', text: 'I have a question', category: 'education', frequency: 0 },
        { id: '4', text: 'I need a break', category: 'needs', frequency: 0 },
      ];
    } else if (scene.id === 'meeting') {
      phrases = [
        { id: '1', text: 'I agree', category: 'work', frequency: 0 },
        { id: '2', text: 'I have a suggestion', category: 'work', frequency: 0 },
        { id: '3', text: 'Can we discuss this later?', category: 'work', frequency: 0 },
        { id: '4', text: 'Thank you', category: 'social', frequency: 0 },
      ];
    } else if (scene.id === 'emergency') {
      phrases = [
        { id: '1', text: 'Help', category: 'safety', frequency: 0 },
        { id: '2', text: 'Call 911', category: 'safety', frequency: 0 },
        { id: '3', text: "I can't breathe", category: 'safety', frequency: 0 },
        { id: '4', text: 'Call my family', category: 'safety', frequency: 0 },
      ];
    }
    
    addBoard({
      name: scene.name,
      category: scene.category,
      phrases,
      scene: scene.id,
      isDefault: false,
    });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">Routines & Context</h2>
      <p className="text-sm text-gray-600">
        Create location-aware, time-based, and scene-specific communication boards.
      </p>

      {/* Location-Aware Boards */}
      <div className="rounded-lg bg-gray-50 p-4 space-y-3">
        <h3 className="font-semibold text-gray-900">Location-Aware Boards</h3>
        <div className="flex gap-2 flex-wrap">
          {locations.map((location) => (
            <button
              key={location}
              onClick={() => {
                setSelectedLocation(location);
                handleCreateLocationBoard(location);
              }}
              className="rounded-lg bg-white border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
            >
              📍 {location.charAt(0).toUpperCase() + location.slice(1)}
            </button>
          ))}
        </div>
        {locationBoards.length > 0 && (
          <div className="mt-3 space-y-2">
            <p className="text-sm font-medium text-gray-700">Location Boards:</p>
            {locationBoards.map((board) => (
              <button
                key={board.id}
                onClick={() => setCurrentBoard(board.id)}
                className="w-full rounded-lg bg-blue-50 border border-blue-200 px-4 py-2 text-sm text-blue-900 transition-colors hover:bg-blue-100 text-left"
              >
                {board.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Time-Based Boards */}
      <div className="rounded-lg bg-gray-50 p-4 space-y-3">
        <h3 className="font-semibold text-gray-900">Time-Based Boards</h3>
        <div className="flex gap-2 flex-wrap">
          {timeContexts.map((time) => (
            <button
              key={time}
              onClick={() => setSelectedTime(time)}
              className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                selectedTime === time
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-100'
              }`}
            >
              ⏰ {time.charAt(0).toUpperCase() + time.slice(1)}
            </button>
          ))}
        </div>
        {timeBoards.length > 0 && (
          <div className="mt-3 space-y-2">
            <p className="text-sm font-medium text-gray-700">Time-Based Boards:</p>
            {timeBoards.map((board) => (
              <button
                key={board.id}
                onClick={() => setCurrentBoard(board.id)}
                className="w-full rounded-lg bg-blue-50 border border-blue-200 px-4 py-2 text-sm text-blue-900 transition-colors hover:bg-blue-100 text-left"
              >
                {board.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Scene Boards */}
      <div className="rounded-lg bg-gray-50 p-4 space-y-3">
        <h3 className="font-semibold text-gray-900">Scene Boards</h3>
        <div className="grid grid-cols-2 gap-2">
          {scenes.map((scene) => (
            <button
              key={scene.id}
              onClick={() => handleCreateSceneBoard(scene)}
              className="rounded-lg bg-white border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
            >
              {scene.name}
            </button>
          ))}
        </div>
        {sceneBoards.length > 0 && (
          <div className="mt-3 space-y-2">
            <p className="text-sm font-medium text-gray-700">Scene Boards:</p>
            {sceneBoards.map((board) => (
              <button
                key={board.id}
                onClick={() => setCurrentBoard(board.id)}
                className="w-full rounded-lg bg-blue-50 border border-blue-200 px-4 py-2 text-sm text-blue-900 transition-colors hover:bg-blue-100 text-left"
              >
                {board.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

