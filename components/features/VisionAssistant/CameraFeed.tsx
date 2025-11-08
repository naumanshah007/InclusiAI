'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { CameraStabilizer } from '@/components/accessibility/CameraStabilizer';
import { analyzeImageQuality, type ImageQualityMetrics } from '@/lib/utils/image-quality';

interface CameraFeedProps {
  onImageCapture: (image: string) => void;
  autoCapture?: boolean; // Auto-capture when text is detected and in focus
  showGuidance?: boolean; // Show camera guidance feedback
  speakGuidance?: boolean; // Speak guidance for blind users
}

export function CameraFeed({ 
  onImageCapture, 
  autoCapture = false,
  showGuidance = true,
  speakGuidance = false,
}: CameraFeedProps) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [captureSuccess, setCaptureSuccess] = useState(false);
  const [qualityMetrics, setQualityMetrics] = useState<ImageQualityMetrics | null>(null);
  const [guidance, setGuidance] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const autoCaptureIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastAutoCaptureRef = useRef<number>(0);

  const captureImage = useCallback(() => {
    console.log('Capture button clicked');
    console.log('videoRef.current:', videoRef.current);
    console.log('canvasRef.current:', canvasRef.current);
    console.log('videoReady:', videoReady);
    
    if (!videoRef.current) {
      setError('Video element not found. Please try again.');
      console.error('Video element not found');
      return;
    }

    if (!canvasRef.current) {
      setError('Canvas element not found. Please try again.');
      console.error('Canvas element not found');
      return;
    }

    if (!videoReady) {
      setError('Video is not ready. Please wait for the camera to load.');
      console.error('Video not ready');
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Check if video has valid dimensions
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      setError('Video dimensions are invalid. Please try again.');
      console.error('Invalid video dimensions:', video.videoWidth, video.videoHeight);
      return;
    }

    console.log('Video dimensions:', video.videoWidth, video.videoHeight);
    console.log('Video readyState:', video.readyState);

    const context = canvas.getContext('2d', { willReadFrequently: true });

    if (!context) {
      setError('Failed to get canvas context');
      console.error('Failed to get canvas context');
      return;
    }

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    // Note: The video is mirrored (scaleX(-1)), so we need to flip it back when capturing
    try {
      // Save the context state
      context.save();
      
      // Flip the context horizontally to undo the mirror effect
      context.scale(-1, 1);
      context.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
      
      // Restore the context state
      context.restore();
      
      // Convert to base64
      const imageData = canvas.toDataURL('image/jpeg', 0.8);
      console.log('Image captured successfully, length:', imageData.length);
      
      if (!imageData || imageData === 'data:,') {
        setError('Failed to capture image. The image data is empty.');
        console.error('Empty image data');
        return;
      }
      
      // Call the callback
      try {
        onImageCapture(imageData);
        console.log('onImageCapture called successfully');
        
        // Show success message briefly
        setCaptureSuccess(true);
        setError(null);
        setTimeout(() => setCaptureSuccess(false), 2000);
      } catch (callbackErr) {
        console.error('Error in onImageCapture callback:', callbackErr);
        setError('Failed to process captured image. Please try again.');
      }
    } catch (err) {
      console.error('Error capturing image:', err);
      setError(`Failed to capture image: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }, [videoReady, onImageCapture]);

  // Handle stream changes
  useEffect(() => {
    if (stream && videoRef.current) {
      const video = videoRef.current;
      video.srcObject = stream;
      
      const handleCanPlay = () => {
        video.play()
          .then(() => {
            setVideoReady(true);
            setIsLoading(false);
          })
          .catch((err) => {
            console.error('Error playing video:', err);
            setError('Failed to start video preview');
            setIsLoading(false);
          });
      };

      const handleLoadedMetadata = () => {
        if (video.readyState >= 2) { // HAVE_CURRENT_DATA
          handleCanPlay();
        }
      };

      // Remove old listeners if any
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      
      // Add new listeners
      video.addEventListener('canplay', handleCanPlay, { once: true });
      video.addEventListener('loadedmetadata', handleLoadedMetadata, { once: true });
      
      // If already loaded, trigger immediately
      if (video.readyState >= 2) {
        handleCanPlay();
      }
    }

    return () => {
      // Cleanup stream on unmount
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      if (autoCaptureIntervalRef.current) {
        clearInterval(autoCaptureIntervalRef.current);
      }
    };
  }, [stream]);

  // Auto-capture when text is detected and image quality is good
  useEffect(() => {
    if (!autoCapture || !videoReady || !videoRef.current || !canvasRef.current) {
      if (autoCaptureIntervalRef.current) {
        clearInterval(autoCaptureIntervalRef.current);
        autoCaptureIntervalRef.current = null;
      }
      return;
    }

    const checkAndCapture = () => {
      const now = Date.now();
      // Don't auto-capture too frequently (at least 2 seconds apart)
      if (now - lastAutoCaptureRef.current < 2000) {
        return;
      }

      if (!qualityMetrics) {
        return;
      }

      // Auto-capture if:
      // 1. Image is readable (good quality)
      // 2. Text is detected
      // 3. Not too blurry
      if (qualityMetrics.isReadable && qualityMetrics.textDetected && qualityMetrics.blur < 0.5) {
        lastAutoCaptureRef.current = now;
        captureImage();
      }
    };

    // Check every 1 second for auto-capture
    autoCaptureIntervalRef.current = setInterval(checkAndCapture, 1000);

    return () => {
      if (autoCaptureIntervalRef.current) {
        clearInterval(autoCaptureIntervalRef.current);
        autoCaptureIntervalRef.current = null;
      }
    };
  }, [autoCapture, videoReady, qualityMetrics, captureImage]);

  const startCamera = async () => {
    try {
      setError(null);
      setIsLoading(true);
      setVideoReady(false);
      
      // Stop any existing stream first
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
      });
      
      setStream(mediaStream);
      // The useEffect will handle setting up the video element
    } catch (err: any) {
      let errorMessage = 'Failed to access camera. Please ensure you have granted camera permissions.';
      
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMessage = 'Camera permission denied. Please allow camera access in your browser settings.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errorMessage = 'No camera found. Please connect a camera device.';
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        errorMessage = 'Camera is already in use by another application.';
      }
      
      setError(errorMessage);
      console.error('Camera error:', err);
      setIsLoading(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
      videoRef.current.pause();
    }
    setVideoReady(false);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">Camera Feed</h2>
      <div className="space-y-4">
        {!stream ? (
          <button
            onClick={startCamera}
            disabled={isLoading}
            className="w-full rounded-lg bg-gradient-to-r from-primary-600 to-secondary-600 px-6 py-3 font-medium text-white transition-colors hover:from-primary-700 hover:to-secondary-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Starting Camera...' : 'Start Camera'}
          </button>
        ) : (
          <>
            <div className="relative overflow-hidden rounded-lg bg-black min-h-[300px]">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full max-h-[500px] object-cover"
                aria-label="Camera preview"
                style={{ 
                  transform: 'scaleX(-1)',
                  opacity: videoReady ? 1 : 0,
                  position: videoReady ? 'relative' : 'absolute',
                  zIndex: videoReady ? 1 : 0
                }}
              />
              {!videoReady && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900 text-white z-10">
                  <div className="text-center">
                    {isLoading ? (
                      <>
                        <div className="mb-2 h-8 w-8 animate-spin rounded-full border-4 border-white border-t-transparent mx-auto"></div>
                        <p>Starting camera...</p>
                      </>
                    ) : (
                      <>
                        <div className="mb-2 h-8 w-8 animate-spin rounded-full border-4 border-white border-t-transparent mx-auto"></div>
                        <p>Preparing camera...</p>
                      </>
                    )}
                  </div>
                </div>
              )}
              <canvas 
                ref={canvasRef} 
                className="hidden"
                width={640}
                height={480}
              />
              {/* Camera Stabilizer for real-time feedback */}
              {showGuidance && videoReady && (
                <CameraStabilizer
                  videoRef={videoRef}
                  canvasRef={canvasRef}
                  onQualityChange={setQualityMetrics}
                  onGuidanceChange={setGuidance}
                  enabled={true}
                  speakGuidance={speakGuidance}
                />
              )}
              {/* Visual guidance display */}
              {showGuidance && guidance && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-lg bg-black/70 px-4 py-2 text-sm text-white z-20">
                  {guidance}
                </div>
              )}
              {/* Auto-capture indicator */}
              {autoCapture && qualityMetrics?.isReadable && qualityMetrics?.textDetected && (
                <div className="absolute top-4 right-4 rounded-lg bg-green-500/80 px-3 py-1 text-xs text-white z-20">
                  Auto-capture ready
                </div>
              )}
            </div>
            <div className="flex gap-4">
              <button
                onClick={captureImage}
                disabled={!videoReady || isLoading}
                className="flex-1 rounded-lg bg-gradient-to-r from-green-600 to-green-700 px-6 py-3 font-medium text-white transition-colors hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {videoReady ? 'Capture Image' : 'Waiting for camera...'}
              </button>
              <button
                onClick={stopCamera}
                className="flex-1 rounded-lg bg-gradient-to-r from-red-600 to-red-700 px-6 py-3 font-medium text-white transition-colors hover:from-red-700 hover:to-red-800"
              >
                Stop Camera
              </button>
            </div>
          </>
        )}
        {error && (
          <div
            className="rounded-lg bg-red-50 p-4 text-red-800"
            role="alert"
            aria-live="polite"
          >
            {error}
          </div>
        )}
        {captureSuccess && (
          <div
            className="rounded-lg bg-green-50 p-4 text-green-800"
            role="alert"
            aria-live="polite"
          >
            ✓ Image captured successfully! You can now describe or extract text from it.
          </div>
        )}
      </div>
    </div>
  );
}

