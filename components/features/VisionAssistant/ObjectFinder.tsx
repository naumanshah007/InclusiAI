'use client';

import { useState, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useAPIKey } from '@/lib/hooks/useAPIKey';
import { useUserPreferences } from '@/lib/store/user-preferences';
import { callAI } from '@/lib/utils/api-client';
import { useObjectMemoryStore } from '@/lib/store/object-memory-store';
import { generateSpatialGuidance, speakSpatialGuidance } from '@/lib/utils/spatial-guidance';
import { TextToSpeech } from '@/components/accessibility/TextToSpeech';
import { CameraFeed } from './CameraFeed';

export function ObjectFinder() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [foundObjects, setFoundObjects] = useState<any[]>([]);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const { apiKey } = useAPIKey();
  const { aiProvider } = useUserPreferences();
  const { findObject, addObject, objects } = useObjectMemoryStore();

  const { mutate: searchForObject, isPending } = useMutation({
    mutationFn: async ({ image, objectName }: { image: string; objectName: string }) => {
      const response = await callAI(
        {
          type: 'vision',
          data: {
            image,
            context: `Look for a ${objectName} in this image. If you find it, describe its exact location (left, right, center, ahead, behind, up, down) and approximate distance in feet or meters. Be very specific about the location. If the object is not visible, say "NOT_FOUND".`,
            scenario: 'object',
          },
        },
        {
          apiKey,
          provider: aiProvider,
        }
      );
      return response.result;
    },
    onSuccess: (result, variables) => {
      if (result && !result.includes('NOT_FOUND')) {
        const guidance = generateSpatialGuidance(result);
        setFoundObjects([{ name: variables.objectName, location: result, guidance }]);
        
        // Speak guidance
        speakSpatialGuidance(guidance);
        
        // Save to memory
        addObject({
          objectName: variables.objectName,
          location: result,
          image: variables.image,
        });
      } else {
        setFoundObjects([]);
      }
    },
    onError: (error) => {
      console.error('Error finding object:', error);
      setFoundObjects([]);
    },
  });

  const handleSearch = () => {
    if (!searchQuery.trim() || !currentImage) {
      return;
    }
    
    setIsSearching(true);
    searchForObject({ image: currentImage, objectName: searchQuery.trim() });
  };

  const handleImageCapture = (image: string) => {
    setCurrentImage(image);
    if (searchQuery.trim()) {
      searchForObject({ image, objectName: searchQuery.trim() });
    }
  };

  // Check memory for saved objects
  const savedObjects = searchQuery ? findObject(searchQuery) : [];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">Find My Object</h2>
      <p className="text-sm text-gray-600">
        Tell me what you're looking for, and I'll help you find it using the camera.
      </p>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="object-search" className="mb-2 block text-sm font-medium text-gray-700">
            What are you looking for?
          </label>
          <div className="flex gap-2">
            <input
              id="object-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="e.g., keys, backpack, cane, phone"
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && currentImage) {
                  handleSearch();
                }
              }}
            />
            <button
              onClick={handleSearch}
              disabled={!currentImage || !searchQuery.trim() || isPending}
              className="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? 'Searching...' : 'Find'}
            </button>
          </div>
        </div>
        
        {/* Saved objects */}
        {savedObjects.length > 0 && (
          <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Previously Found:</h3>
            <div className="space-y-2">
              {savedObjects.map((obj) => (
                <div key={obj.id} className="text-sm text-blue-800">
                  <p><strong>{obj.objectName}:</strong> {obj.location}</p>
                  <p className="text-xs text-blue-600">Found {new Date(obj.timestamp).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <CameraFeed
        onImageCapture={handleImageCapture}
        showGuidance={true}
        speakGuidance={true}
      />
      
      {isPending && (
        <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 text-center">
          <p className="text-sm text-blue-800">Searching for {searchQuery}...</p>
        </div>
      )}
      
      {foundObjects.length > 0 && (
        <div className="rounded-lg bg-green-50 border border-green-200 p-4 space-y-2">
          <h3 className="font-semibold text-green-900">Found!</h3>
          {foundObjects.map((obj, idx) => (
            <div key={idx} className="space-y-2">
              <p className="text-sm text-green-800"><strong>{obj.name}:</strong> {obj.location}</p>
              {obj.guidance && (
                <div className="mt-2">
                  <p className="text-sm font-medium text-green-900">Guidance:</p>
                  <p className="text-sm text-green-800">{obj.guidance.instruction}</p>
                  <div className="mt-2">
                    <TextToSpeech text={obj.guidance.instruction} />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      {foundObjects.length === 0 && !isPending && searchQuery && currentImage && (
        <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4">
          <p className="text-sm text-yellow-800">Object not found in current view. Try moving the camera or adjusting the angle.</p>
        </div>
      )}
    </div>
  );
}

