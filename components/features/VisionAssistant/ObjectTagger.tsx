'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useAPIKey } from '@/lib/hooks/useAPIKey';
import { useUserPreferences } from '@/lib/store/user-preferences';
import { callAI } from '@/lib/utils/api-client';
import { useTagStore } from '@/lib/store/tag-store';
import { detectQRCode } from '@/lib/utils/qr-nfc-handler';
import { TextToSpeech } from '@/components/accessibility/TextToSpeech';
import { CameraFeed } from './CameraFeed';

export function ObjectTagger() {
  const [tagName, setTagName] = useState('');
  const [tagDescription, setTagDescription] = useState('');
  const [tagCategory, setTagCategory] = useState('');
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const { apiKey } = useAPIKey();
  const { aiProvider } = useUserPreferences();
  const { addTag, tags, searchTags } = useTagStore();

  // AI provider function
  const aiProviderFn = async (image: string, prompt: string): Promise<string> => {
    const response = await callAI(
      {
        type: 'vision',
        data: {
          image,
          context: prompt,
          scenario: 'object',
        },
      },
      {
        apiKey,
        provider: aiProvider,
      }
    );
    return response.result;
  };

  const { mutate: scanQR, isPending: isScanningQR } = useMutation({
    mutationFn: async (image: string) => {
      const qr = await detectQRCode(image, aiProviderFn);
      return { image, qr };
    },
    onSuccess: (result) => {
      if (result.qr) {
        setQrCode(result.qr.data);
        setCurrentImage(result.image);
      }
    },
  });

  const handleImageCapture = (image: string) => {
    setCurrentImage(image);
    scanQR(image);
  };

  const handleCreateTag = () => {
    if (!tagName.trim() || !currentImage) {
      return;
    }

    addTag({
      name: tagName.trim(),
      description: tagDescription.trim() || `Tagged location: ${tagName}`,
      location: tagDescription.trim() || 'Current location',
      image: currentImage,
      qrCode: qrCode || undefined,
      category: tagCategory || undefined,
    });

    // Speak confirmation
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const synth = window.speechSynthesis;
      const utterance = new SpeechSynthesisUtterance(`Tagged ${tagName} successfully.`);
      utterance.rate = 1.0;
      synth.speak(utterance);
    }

    // Reset form
    setTagName('');
    setTagDescription('');
    setTagCategory('');
    setQrCode(null);
  };

  const handleSearchTag = () => {
    if (!tagName.trim()) {
      return;
    }

    const found = searchTags(tagName.trim());
    if (found.length > 0) {
      const tag = found[0];
      const message = `${tag.name} is located at ${tag.location}. ${tag.description}`;
      
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        const synth = window.speechSynthesis;
        const utterance = new SpeechSynthesisUtterance(message);
        utterance.rate = 1.0;
        synth.speak(utterance);
      }
    } else {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        const synth = window.speechSynthesis;
        const utterance = new SpeechSynthesisUtterance(`Tag ${tagName} not found.`);
        utterance.rate = 1.0;
        synth.speak(utterance);
      }
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">Personal Tagging</h2>
      <p className="text-sm text-gray-600">
        Tag objects, shelves, containers, folders, or doors for easy recall later.
      </p>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="tag-name" className="mb-2 block text-sm font-medium text-gray-700">
            Tag Name
          </label>
          <input
            id="tag-name"
            type="text"
            value={tagName}
            onChange={(e) => setTagName(e.target.value)}
            placeholder="e.g., keys, top shelf, medicine cabinet"
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label htmlFor="tag-description" className="mb-2 block text-sm font-medium text-gray-700">
            Description/Location
          </label>
          <input
            id="tag-description"
            type="text"
            value={tagDescription}
            onChange={(e) => setTagDescription(e.target.value)}
            placeholder="e.g., on the kitchen counter, in the top drawer"
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label htmlFor="tag-category" className="mb-2 block text-sm font-medium text-gray-700">
            Category (optional)
          </label>
          <select
            id="tag-category"
            value={tagCategory}
            onChange={(e) => setTagCategory(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select category</option>
            <option value="shelf">Shelf</option>
            <option value="container">Container</option>
            <option value="folder">Folder</option>
            <option value="door">Door</option>
            <option value="drawer">Drawer</option>
            <option value="other">Other</option>
          </select>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={handleCreateTag}
            disabled={!tagName.trim() || !currentImage}
            className="flex-1 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
          >
            📌 Create Tag
          </button>
          <button
            onClick={handleSearchTag}
            disabled={!tagName.trim()}
            className="flex-1 rounded-lg bg-green-600 px-4 py-2 font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50"
          >
            🔍 Find Tag
          </button>
        </div>
      </div>
      
      <CameraFeed
        onImageCapture={handleImageCapture}
        showGuidance={true}
        speakGuidance={true}
      />
      
      {isScanningQR && (
        <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 text-center">
          <p className="text-sm text-blue-800">Scanning for QR code...</p>
        </div>
      )}
      
      {qrCode && (
        <div className="rounded-lg bg-green-50 border border-green-200 p-4">
          <p className="text-sm text-green-800">QR Code detected: {qrCode}</p>
        </div>
      )}
      
      {tags.length > 0 && (
        <div className="rounded-lg bg-gray-50 p-4">
          <h3 className="font-semibold text-gray-900 mb-2">Your Tags ({tags.length}):</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {tags.map((tag) => (
              <div key={tag.id} className="text-sm text-gray-700 border-b border-gray-200 pb-2">
                <p><strong>{tag.name}</strong> - {tag.location}</p>
                {tag.category && <p className="text-xs text-gray-500">Category: {tag.category}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

