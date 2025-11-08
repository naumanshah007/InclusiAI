'use client';

import { useEffect, useRef, useState } from 'react';
import { analyzeImageQuality, getImageQualityGuidance, type ImageQualityMetrics } from '@/lib/utils/image-quality';

interface CameraStabilizerProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  onQualityChange?: (metrics: ImageQualityMetrics) => void;
  onGuidanceChange?: (guidance: string | null) => void;
  enabled?: boolean;
  speakGuidance?: boolean;
}

/**
 * Camera Stabilizer Component
 * Provides real-time feedback for camera positioning and image quality
 */
export function CameraStabilizer({
  videoRef,
  canvasRef,
  onQualityChange,
  onGuidanceChange,
  enabled = true,
  speakGuidance = false,
}: CameraStabilizerProps) {
  const [guidance, setGuidance] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<ImageQualityMetrics | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastGuidanceRef = useRef<string | null>(null);

  useEffect(() => {
    if (!enabled || !videoRef.current || !canvasRef.current) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;

    const checkQuality = () => {
      if (!video || !canvas || video.readyState < 2 || video.videoWidth === 0 || video.videoHeight === 0) {
        return;
      }

      try {
        const context = canvas.getContext('2d', { willReadFrequently: true });
        if (!context) return;

        // Set canvas size to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Draw current frame
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Analyze quality
        const qualityMetrics = analyzeImageQuality(canvas, context);
        const guidanceMessage = getImageQualityGuidance(qualityMetrics);

        setMetrics(qualityMetrics);
        setGuidance(guidanceMessage);

        // Call callbacks
        if (onQualityChange) {
          onQualityChange(qualityMetrics);
        }

        if (onGuidanceChange) {
          onGuidanceChange(guidanceMessage);
        }

        // Speak guidance if enabled and changed
        if (speakGuidance && guidanceMessage && guidanceMessage !== lastGuidanceRef.current) {
          lastGuidanceRef.current = guidanceMessage;
          
          // Use Web Speech API to speak guidance
          if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            const synth = window.speechSynthesis;
            const utterance = new SpeechSynthesisUtterance(guidanceMessage);
            utterance.rate = 1.2;
            utterance.volume = 0.8;
            synth.speak(utterance);
          }
        }
      } catch (error) {
        console.error('Error checking image quality:', error);
      }
    };

    // Check quality every 500ms
    intervalRef.current = setInterval(checkQuality, 500);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, videoRef, canvasRef, onQualityChange, onGuidanceChange, speakGuidance]);

  // Visual feedback (optional, for sighted users or debugging)
  if (!guidance) {
    return null;
  }

  return (
    <div
      className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-lg bg-black/70 px-4 py-2 text-sm text-white"
      role="status"
      aria-live="polite"
    >
      {guidance}
    </div>
  );
}

