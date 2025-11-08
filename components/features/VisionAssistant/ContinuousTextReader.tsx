'use client';

import { useState, useRef, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useAPIKey } from '@/lib/hooks/useAPIKey';
import { useUserPreferences } from '@/lib/store/user-preferences';
import { callAI } from '@/lib/utils/api-client';
import { TextToSpeech } from '@/components/accessibility/TextToSpeech';
import { CameraFeed } from './CameraFeed';

interface ContinuousTextReaderProps {
  onTextRead?: (text: string) => void;
}

/**
 * Continuous Text Reader Component
 * For reading long documents with auto-scroll detection
 */
export function ContinuousTextReader({ onTextRead }: ContinuousTextReaderProps) {
  const [isReading, setIsReading] = useState(false);
  const [currentText, setCurrentText] = useState<string>('');
  const [allText, setAllText] = useState<string[]>([]);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const { apiKey } = useAPIKey();
  const { aiProvider } = useUserPreferences();
  const readingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastTextRef = useRef<string>('');

  const { mutate: extractText, isPending } = useMutation({
    mutationFn: async (image: string) => {
      const response = await callAI(
        {
          type: 'vision',
          data: {
            image,
            context: 'Extract all text from this image. Return only the text content, preserving line breaks and structure. Focus on new text that appears below previously read content.',
          },
        },
        {
          apiKey,
          provider: aiProvider,
        }
      );
      return response.result;
    },
    onSuccess: (result) => {
      // Check if this is new text (different from last)
      if (result && result !== lastTextRef.current && result.trim().length > 0) {
        // Extract only new lines (assuming document scrolls down)
        const newLines = result.split('\n').filter(line => {
          return !lastTextRef.current.includes(line.trim()) && line.trim().length > 0;
        });
        
        if (newLines.length > 0) {
          const newText = newLines.join('\n');
          setCurrentText(newText);
          setAllText(prev => [...prev, newText]);
          lastTextRef.current = result;
          
          // Speak new text
          if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            const synth = window.speechSynthesis;
            const utterance = new SpeechSynthesisUtterance(newText);
            utterance.rate = 1.0;
            synth.speak(utterance);
          }
          
          if (onTextRead) {
            onTextRead(newText);
          }
        }
      }
    },
    onError: (error) => {
      console.error('Error extracting text:', error);
    },
  });

  const startReading = () => {
    if (!currentImage) {
      return;
    }
    
    setIsReading(true);
    lastTextRef.current = '';
    setAllText([]);
    
    // Initial read
    extractText(currentImage);
    
    // Continue reading every 3 seconds (adjust based on scroll speed)
    readingIntervalRef.current = setInterval(() => {
      if (currentImage) {
        extractText(currentImage);
      }
    }, 3000);
  };

  const stopReading = () => {
    setIsReading(false);
    if (readingIntervalRef.current) {
      clearInterval(readingIntervalRef.current);
      readingIntervalRef.current = null;
    }
    
    // Stop any ongoing speech
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  useEffect(() => {
    return () => {
      if (readingIntervalRef.current) {
        clearInterval(readingIntervalRef.current);
      }
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">Continuous Text Reader</h2>
      <p className="text-sm text-gray-600">
        Point camera at document and start reading. The app will automatically detect and read new text as you scroll.
      </p>
      
      <CameraFeed
        onImageCapture={(image) => {
          setCurrentImage(image);
          if (isReading) {
            extractText(image);
          }
        }}
        autoCapture={isReading}
        showGuidance={true}
        speakGuidance={true}
      />
      
      <div className="flex gap-4">
        <button
          onClick={startReading}
          disabled={!currentImage || isReading || isPending}
          className="flex-1 rounded-lg bg-gradient-to-r from-green-600 to-green-700 px-6 py-3 font-medium text-white transition-colors hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isReading ? 'Reading...' : 'Start Reading'}
        </button>
        <button
          onClick={stopReading}
          disabled={!isReading}
          className="flex-1 rounded-lg bg-gradient-to-r from-red-600 to-red-700 px-6 py-3 font-medium text-white transition-colors hover:from-red-700 hover:to-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Stop Reading
        </button>
      </div>
      
      {/* Current text being read */}
      {currentText && (
        <div className="rounded-lg bg-blue-50 p-4">
          <h3 className="mb-2 font-semibold text-blue-900">Currently Reading:</h3>
          <p className="text-blue-800">{currentText}</p>
          <TextToSpeech text={currentText} />
        </div>
      )}
      
      {/* All read text */}
      {allText.length > 0 && (
        <div className="rounded-lg bg-gray-50 p-4 max-h-96 overflow-y-auto">
          <h3 className="mb-2 font-semibold text-gray-900">Full Text:</h3>
          <div className="space-y-2">
            {allText.map((text, index) => (
              <p key={index} className="text-sm text-gray-700">{text}</p>
            ))}
          </div>
          <div className="mt-4 flex gap-2">
            <TextToSpeech text={allText.join('\n\n')} />
            <button
              onClick={() => navigator.clipboard.writeText(allText.join('\n\n'))}
              className="rounded-lg bg-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-300"
            >
              Copy All
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

