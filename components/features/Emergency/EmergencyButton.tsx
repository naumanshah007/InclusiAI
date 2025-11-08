'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ROUTES } from '@/lib/constants';
import { useEmergencyContactsStore } from '@/lib/store/emergency-contacts-store';

// Fallback function to share location when Web Share API is not available
async function fallbackShareLocationButton(url: string, locationText: string) {
  try {
    // Ensure document is focused before clipboard operation
    if (typeof window !== 'undefined' && document.hasFocus && !document.hasFocus()) {
      window.focus();
      // Wait a bit for focus to be established
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Try to copy to clipboard
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(locationText);
        alert('Location copied to clipboard! You can paste it in any app.');
        return;
      } catch (clipboardError: any) {
        // Clipboard failed - use alternative method
        console.log('Clipboard write failed, using alternative method:', clipboardError);
        // Fall through to alternative method
      }
    }

    // Alternative: Use a temporary textarea element to copy
    try {
      const textarea = document.createElement('textarea');
      textarea.value = locationText;
      textarea.style.position = 'fixed';
      textarea.style.left = '-999999px';
      textarea.style.top = '-999999px';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      
      const successful = document.execCommand('copy');
      document.body.removeChild(textarea);
      
      if (successful) {
        alert('Location copied to clipboard! You can paste it in any app.');
        return;
      }
    } catch (execError) {
      console.log('execCommand copy failed:', execError);
    }

    // Last resort: show location in a modal or alert for user to copy manually
    const locationDisplay = `📍 Location Information:\n\n${locationText}\n\nYou can copy this text and share it manually.`;
    alert(locationDisplay);
  } catch (error) {
    console.error('Error in fallback share:', error);
    // Last resort: show location in alert
    alert(`Location: ${locationText}\n\nYou can copy this and share it manually.`);
  }
}

export function EmergencyButton() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [pressStartTime, setPressStartTime] = useState<number | null>(null);
  const [isLongPressing, setIsLongPressing] = useState(false);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const { getPrimaryContact } = useEmergencyContactsStore();

  // Long-press handler (2 seconds)
  const LONG_PRESS_DURATION = 2000;

  const handlePressStart = () => {
    const startTime = Date.now();
    setPressStartTime(startTime);
    setIsLongPressing(false);
    
    longPressTimerRef.current = setTimeout(() => {
      setIsLongPressing(true);
      handleLongPress();
    }, LONG_PRESS_DURATION);
  };

  const handlePressEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    
    if (pressStartTime && Date.now() - pressStartTime < LONG_PRESS_DURATION) {
      // Short press - toggle menu
      setIsExpanded(!isExpanded);
    }
    
    setPressStartTime(null);
    setIsLongPressing(false);
  };

  const handleLongPress = () => {
    // Long press - call primary contact or 911
    const primaryContact = getPrimaryContact();
    
    if (primaryContact && primaryContact.phone) {
      window.location.href = `tel:${primaryContact.phone}`;
    } else {
      // Fallback to 911
      window.location.href = 'tel:911';
    }
    
    // Speak confirmation
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const synth = window.speechSynthesis;
      const message = primaryContact 
        ? `Calling ${primaryContact.name}`
        : 'Calling 911';
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.rate = 1.0;
      synth.speak(utterance);
    }
  };

  useEffect(() => {
    return () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }
    };
  }, []);

  return (
    <>
      {/* Floating Emergency Button */}
      <button
        onMouseDown={handlePressStart}
        onMouseUp={handlePressEnd}
        onMouseLeave={handlePressEnd}
        onTouchStart={handlePressStart}
        onTouchEnd={handlePressEnd}
        className={`fixed bottom-6 right-6 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-emergency-500 to-emergency-600 text-white shadow-2xl transition-all hover:scale-110 hover:shadow-emergency-500/50 focus:outline-none focus:ring-4 focus:ring-emergency-500/50 ${isLongPressing ? 'animate-pulse scale-110' : ''}`}
        aria-label="Emergency help (long press to call)"
        aria-expanded={isExpanded}
      >
        <svg
          className="h-8 w-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </button>

      {/* Emergency Menu */}
      {isExpanded && (
        <div className="fixed bottom-24 right-6 z-50 w-64 rounded-2xl border-2 border-emergency-300 bg-white p-4 shadow-2xl">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emergency-500 to-emergency-600 text-white">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="font-display text-lg font-bold text-emergency-900">
              Emergency Help
            </h3>
          </div>
          <div className="space-y-2">
            <Link
              href={ROUTES.EMERGENCY}
              className="flex items-center gap-3 rounded-lg bg-emergency-50 px-4 py-3 text-emergency-900 transition-colors hover:bg-emergency-100"
            >
              <span className="text-xl">🚨</span>
              <span className="font-medium">Emergency Mode</span>
            </Link>
            <button
              onClick={() => window.location.href = 'tel:911'}
              className="flex w-full items-center gap-3 rounded-lg bg-emergency-500 px-4 py-3 text-white transition-colors hover:bg-emergency-600"
            >
              <span className="text-xl">📞</span>
              <span className="font-medium">Call 911</span>
            </button>
            <button
              onClick={async () => {
                try {
                  // Check if geolocation is available
                  if (!navigator.geolocation) {
                    alert('Geolocation is not supported by your browser. Please enable location services.');
                    return;
                  }

                  // Get current position
                  navigator.geolocation.getCurrentPosition(
                    async (position) => {
                      try {
                        const latitude = position.coords.latitude;
                        const longitude = position.coords.longitude;
                        const url = `https://www.google.com/maps?q=${latitude},${longitude}`;
                        const locationText = `I need help. My location: ${latitude}, ${longitude}\n${url}`;

                        // Try to use Web Share API if available
                        if (navigator.share) {
                          try {
                            await navigator.share({
                              title: 'My Location - Emergency',
                              text: locationText,
                              url: url,
                            });
                            // Success - share dialog was shown and user shared
                          } catch (shareError: any) {
                            // User canceled or share failed
                            if (shareError.name === 'AbortError') {
                              // User canceled - this is normal, don't show error
                              return;
                            }
                            // Other error - fallback to copying to clipboard
                            await fallbackShareLocationButton(url, locationText);
                          }
                        } else {
                          // Web Share API not available - use fallback
                          await fallbackShareLocationButton(url, locationText);
                        }
                      } catch (error) {
                        console.error('Error sharing location:', error);
                        alert('Failed to share location. Please try again.');
                      }
                    },
                    (error) => {
                      // Geolocation error
                      console.error('Geolocation error:', error);
                      let errorMessage = 'Failed to get your location. ';
                      switch (error.code) {
                        case error.PERMISSION_DENIED:
                          errorMessage += 'Please enable location permissions in your browser settings.';
                          break;
                        case error.POSITION_UNAVAILABLE:
                          errorMessage += 'Location information is unavailable.';
                          break;
                        case error.TIMEOUT:
                          errorMessage += 'Location request timed out. Please try again.';
                          break;
                        default:
                          errorMessage += 'Please try again.';
                          break;
                      }
                      alert(errorMessage);
                    },
                    {
                      enableHighAccuracy: true,
                      timeout: 10000,
                      maximumAge: 0,
                    }
                  );
                } catch (error) {
                  console.error('Error in share location:', error);
                  alert('Failed to share location. Please try again.');
                }
              }}
              className="flex w-full items-center gap-3 rounded-lg bg-emergency-100 px-4 py-3 text-emergency-900 transition-colors hover:bg-emergency-200"
            >
              <span className="text-xl">📤</span>
              <span className="font-medium">Share Location</span>
            </button>
            <button
              onClick={() => setIsExpanded(false)}
              className="flex w-full items-center gap-3 rounded-lg bg-gray-100 px-4 py-3 text-gray-700 transition-colors hover:bg-gray-200"
            >
              <span className="text-xl">✕</span>
              <span className="font-medium">Close</span>
            </button>
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isExpanded && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
          onClick={() => setIsExpanded(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
}

