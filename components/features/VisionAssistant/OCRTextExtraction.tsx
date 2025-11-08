'use client';

import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import type { AIRequest } from '@/types';
import { useAPIKey } from '@/lib/hooks/useAPIKey';
import { useUserPreferences } from '@/lib/store/user-preferences';
import { callAI } from '@/lib/utils/api-client';
import { TextToSpeech } from '@/components/accessibility/TextToSpeech';
import { useVisionHistory } from '@/lib/store/vision-history';
import { analyzeImageQuality } from '@/lib/utils/image-quality';

interface OCRTextExtractionProps {
  image: string;
  autoRead?: boolean; // Auto-read text when image quality is good
  showQualityFeedback?: boolean; // Show image quality feedback
}

export function OCRTextExtraction({ 
  image, 
  autoRead = false,
  showQualityFeedback = false,
}: OCRTextExtractionProps) {
  const [extractedText, setExtractedText] = useState<string | null>(null);
  const [qualityFeedback, setQualityFeedback] = useState<string | null>(null);
  const { apiKey } = useAPIKey();
  const { aiProvider } = useUserPreferences();
  const { addScan } = useVisionHistory();

  const { mutate: extractText, isPending } = useMutation({
    mutationFn: async () => {
      // Check image quality before processing
      if (showQualityFeedback) {
        try {
          const img = new Image();
          img.src = image;
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
          });
          
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (ctx) {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            const metrics = analyzeImageQuality(canvas, ctx);
            
            if (!metrics.isReadable) {
              const issues: string[] = [];
              if (metrics.blur > 0.6) issues.push('blurry');
              if (metrics.brightness < 0.3) issues.push('too dark');
              if (metrics.brightness > 0.9) issues.push('too bright');
              if (metrics.contrast < 0.3) issues.push('low contrast');
              
              if (issues.length > 0) {
                setQualityFeedback(`Image quality issues: ${issues.join(', ')}. Please adjust camera.`);
              } else {
                setQualityFeedback(null);
              }
            } else {
              setQualityFeedback(null);
            }
          }
        } catch (e) {
          // Ignore quality check errors
        }
      }
      
      const response = await callAI(
        {
          type: 'vision',
          data: {
            image,
            context: 'Extract all text from this image. Return only the text content, preserving line breaks and structure. Be fast and accurate.',
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
      setExtractedText(result);
      setQualityFeedback(null);
      
      // Save to history
      addScan({
        image,
        type: 'ocr',
        result,
        isFavorite: false,
      });
      
      // Auto-read if enabled
      if (autoRead && typeof window !== 'undefined' && 'speechSynthesis' in window) {
        const synth = window.speechSynthesis;
        const utterance = new SpeechSynthesisUtterance(result);
        utterance.rate = 1.0;
        synth.speak(utterance);
      }
    },
    onError: (error) => {
      console.error('Error extracting text:', error);
      setExtractedText('Failed to extract text. Please try again.');
    },
  });
  
  // Auto-extract if autoRead is enabled and image is provided
  useEffect(() => {
    if (autoRead && image && !extractedText && !isPending) {
      extractText();
    }
  }, [autoRead, image, extractedText, isPending, extractText]);

  const handleExtract = () => {
    setExtractedText(null);
    extractText();
  };


  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">Text Extraction (OCR)</h2>
      <div className="space-y-4">
        {/* Image Preview */}
        <div className="rounded-lg border border-gray-200 p-4">
          <img
            src={image}
            alt="Image for text extraction"
            className="max-h-64 w-full rounded-lg object-contain"
          />
        </div>
        
        {/* Quality Feedback */}
        {showQualityFeedback && qualityFeedback && (
          <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-3">
            <p className="text-sm text-yellow-800">{qualityFeedback}</p>
          </div>
        )}

        {/* Extract Button */}
        {!autoRead && (
          <button
            onClick={() => {
              setExtractedText(null);
              extractText();
            }}
            disabled={isPending}
            className="w-full rounded-lg bg-gradient-to-r from-primary-600 to-secondary-600 px-6 py-3 font-medium text-white transition-colors hover:from-primary-700 hover:to-secondary-700 disabled:bg-gray-400"
          >
            {isPending ? 'Extracting text...' : 'Extract Text'}
          </button>
        )}
        
        {autoRead && isPending && (
          <div className="w-full rounded-lg bg-blue-50 border border-blue-200 p-3 text-center">
            <p className="text-sm text-blue-800">Extracting text automatically...</p>
          </div>
        )}

        {/* Extracted Text Result */}
        {extractedText && (
          <div
            className="rounded-lg bg-gray-50 p-4"
            role="region"
            aria-label="Extracted text"
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Extracted Text:</h3>
              <div className="flex gap-2">
                <TextToSpeech text={extractedText} />
                <button
                  onClick={() => navigator.clipboard.writeText(extractedText)}
                  className="rounded-lg bg-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-300"
                  aria-label="Copy text to clipboard"
                >
                  Copy
                </button>
              </div>
            </div>
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed font-mono text-sm bg-white p-4 rounded border border-gray-200">{extractedText}</p>
          </div>
        )}
      </div>
    </div>
  );
}

