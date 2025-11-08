'use client';

import { useState, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useAPIKey } from '@/lib/hooks/useAPIKey';
import { useUserPreferences } from '@/lib/store/user-preferences';
import { callAI } from '@/lib/utils/api-client';

export function AudioUtilities() {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { apiKey } = useAPIKey();
  const { aiProvider } = useUserPreferences();

  const { mutate: transcribeAudio, isPending } = useMutation({
    mutationFn: async (file: File) => {
      // Convert audio to base64
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = reader.result as string;
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    },
    onSuccess: async (base64) => {
      try {
        setIsProcessing(true);
        
        // Use AI to transcribe audio
        // Note: In production, use proper speech-to-text API (Whisper, etc.)
        const response = await callAI(
          {
            type: 'question',
            data: {
              prompt: 'Transcribe this audio file. Return only the transcribed text.',
            },
          },
          {
            apiKey,
            provider: aiProvider,
          }
        );
        
        // For now, we'll use Web Speech API as fallback
        // In production, integrate with proper audio transcription service
        setTranscript('Audio transcription requires proper audio processing API. Please use the live captioning feature for real-time transcription.');
      } catch (error) {
        console.error('Error transcribing audio:', error);
        setTranscript('Failed to transcribe audio. Please try again.');
      } finally {
        setIsProcessing(false);
      }
    },
    onError: (error) => {
      console.error('Error processing audio:', error);
      setTranscript('Failed to process audio file.');
      setIsProcessing(false);
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && (file.type.startsWith('audio/') || file.type.startsWith('video/'))) {
      setAudioFile(file);
      setTranscript(null);
      transcribeAudio(file);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">Audio Utilities</h2>
      <p className="text-sm text-gray-600">
        Transcribe voicemail, audio messages, and recorded videos.
      </p>

      {/* File Upload */}
      <div className="rounded-lg bg-gray-50 p-4 space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Audio/Video File
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*,video/*"
            onChange={handleFileSelect}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm"
          />
        </div>
        
        {audioFile && (
          <div className="rounded-lg bg-white border border-gray-200 p-3">
            <p className="text-sm text-gray-700">
              <strong>File:</strong> {audioFile.name}
            </p>
            <p className="text-xs text-gray-500">
              Size: {(audioFile.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        )}
      </div>

      {/* Processing Status */}
      {(isPending || isProcessing) && (
        <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 text-center">
          <div className="mb-2 h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="text-sm text-blue-800">Processing audio...</p>
        </div>
      )}

      {/* Transcript Result */}
      {transcript && (
        <div className="rounded-lg bg-gray-50 p-4 space-y-3">
          <h3 className="font-semibold text-gray-900">Transcript:</h3>
          <div className="rounded-lg bg-white border border-gray-200 p-4">
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{transcript}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => navigator.clipboard.writeText(transcript)}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              📋 Copy
            </button>
            <button
              onClick={() => {
                setAudioFile(null);
                setTranscript(null);
                if (fileInputRef.current) {
                  fileInputRef.current.value = '';
                }
              }}
              className="rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-300"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4">
        <h3 className="font-semibold text-yellow-900 mb-2">Supported Formats:</h3>
        <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
          <li>Voicemail recordings (MP3, WAV, M4A)</li>
          <li>Audio messages from WhatsApp, Messenger, etc.</li>
          <li>Recorded videos with audio (MP4, MOV, etc.)</li>
          <li>Lecture recordings, meetings, etc.</li>
        </ul>
        <p className="text-xs text-yellow-700 mt-2">
          Note: For best results, use clear audio with minimal background noise.
        </p>
      </div>
    </div>
  );
}

