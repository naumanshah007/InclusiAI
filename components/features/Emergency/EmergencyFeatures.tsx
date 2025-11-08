'use client';

import { useState } from 'react';
import { useEmergencyContactsStore } from '@/lib/store/emergency-contacts-store';
import { DangerDetection } from './DangerDetection';

// Fallback function to share location when Web Share API is not available
async function fallbackShareLocation(url: string, locationText: string) {
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

export function EmergencyFeatures() {
  const [activeFeature, setActiveFeature] = useState<string | null>(null);
  const { getPrimaryContact } = useEmergencyContactsStore();

  const emergencyFeatures = [
    {
      id: 'call-911',
      label: 'Call 911',
      icon: '📞',
      color: 'from-emergency-500 to-emergency-600',
      action: () => {
        window.location.href = 'tel:911';
      },
      description: 'Call emergency services immediately',
    },
    {
      id: 'share-location',
      label: 'Share Location',
      icon: '📍',
      color: 'from-emergency-500 to-emergency-600',
      action: async () => {
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
                    await fallbackShareLocation(url, locationText);
                  }
                } else {
                  // Web Share API not available - use fallback
                  await fallbackShareLocation(url, locationText);
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
      },
      description: 'Share your location with emergency contacts',
    },
    {
      id: 'emergency-contact',
      label: 'Emergency Contact',
      icon: '👤',
      color: 'from-emergency-500 to-emergency-600',
      action: () => {
        const primaryContact = getPrimaryContact();
        if (primaryContact && primaryContact.phone) {
          window.location.href = `tel:${primaryContact.phone}`;
        } else {
          alert('Please set an emergency contact in Settings');
        }
      },
      description: 'Call your emergency contact',
    },
    {
      id: 'danger-detection',
      label: 'Danger Detection',
      icon: '⚠️',
      color: 'from-red-500 to-red-600',
      action: () => {
        setActiveFeature(activeFeature === 'danger-detection' ? null : 'danger-detection');
      },
      description: 'Scan for potential hazards',
    },
    {
      id: 'medication',
      label: 'Medication Info',
      icon: '💊',
      color: 'from-primary-500 to-primary-600',
      action: () => {
        setActiveFeature(activeFeature === 'medication' ? null : 'medication');
      },
      description: 'View medication information',
    },
    {
      id: 'communication',
      label: 'Emergency Communication',
      icon: '💬',
      color: 'from-secondary-500 to-secondary-600',
      action: () => {
        setActiveFeature(activeFeature === 'communication' ? null : 'communication');
      },
      description: 'Quick communication board',
    },
    {
      id: 'medical-info',
      label: 'Medical Information',
      icon: '🏥',
      color: 'from-accent-500 to-accent-600',
      action: () => {
        setActiveFeature(activeFeature === 'medical-info' ? null : 'medical-info');
      },
      description: 'View medical information',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Emergency Actions Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {emergencyFeatures.map((feature) => (
          <button
            key={feature.id}
            onClick={feature.action}
            className={`group flex flex-col items-center rounded-2xl border-2 border-emergency-200 bg-white p-6 text-center shadow-lg transition-all hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-emergency-500 focus:ring-offset-2 ${
              activeFeature === feature.id ? 'ring-2 ring-emergency-500' : ''
            }`}
            aria-label={feature.description}
          >
            <div
              className={`mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.color} text-3xl text-white shadow-lg transition-transform group-hover:scale-110`}
            >
              {feature.icon}
            </div>
            <h3 className="mb-2 font-display text-xl font-semibold text-emergency-900">
              {feature.label}
            </h3>
            <p className="text-sm text-emergency-700">{feature.description}</p>
          </button>
        ))}
      </div>

      {/* Active Feature Content */}
      {activeFeature === 'medication' && (
        <div className="rounded-2xl border-2 border-emergency-200 bg-white p-6 shadow-lg">
          <h3 className="mb-4 font-display text-2xl font-bold text-emergency-900">
            Medication Information
          </h3>
          <p className="text-gray-600">
            Use the camera to scan medication labels and get information about
            your medications.
          </p>
          <button
            onClick={() => setActiveFeature(null)}
            className="mt-4 rounded-lg bg-emergency-100 px-4 py-2 text-sm font-medium text-emergency-700 transition-colors hover:bg-emergency-200"
          >
            Close
          </button>
        </div>
      )}

      {activeFeature === 'communication' && (
        <div className="rounded-2xl border-2 border-emergency-200 bg-white p-6 shadow-lg">
          <h3 className="mb-4 font-display text-2xl font-bold text-emergency-900">
            Emergency Communication
          </h3>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {['Help', 'Emergency', 'Call 911', 'I need help', 'Medical emergency', 'I am hurt', 'I am lost', 'I need assistance'].map((phrase) => (
              <button
                key={phrase}
                className="rounded-lg border border-emergency-200 bg-emergency-50 px-4 py-3 text-sm font-medium text-emergency-900 transition-colors hover:bg-emergency-100"
                onClick={() => {
                  if ('speechSynthesis' in window) {
                    const utterance = new SpeechSynthesisUtterance(phrase);
                    window.speechSynthesis.speak(utterance);
                  }
                }}
              >
                {phrase}
              </button>
            ))}
          </div>
          <button
            onClick={() => setActiveFeature(null)}
            className="mt-4 rounded-lg bg-emergency-100 px-4 py-2 text-sm font-medium text-emergency-700 transition-colors hover:bg-emergency-200"
          >
            Close
          </button>
        </div>
      )}

      {activeFeature === 'medical-info' && (
        <div className="rounded-2xl border-2 border-emergency-200 bg-white p-6 shadow-lg">
          <h3 className="mb-4 font-display text-2xl font-bold text-emergency-900">
            Medical Information
          </h3>
          <p className="mb-4 text-gray-600">
            Store important medical information that can be shared in emergencies.
          </p>
          <div className="space-y-2 text-sm text-gray-700">
            <p>
              <strong>Allergies:</strong> Please set in Settings
            </p>
            <p>
              <strong>Medical Conditions:</strong> Please set in Settings
            </p>
            <p>
              <strong>Medications:</strong> Please set in Settings
            </p>
            <p>
              <strong>Emergency Contact:</strong> Please set in Settings
            </p>
          </div>
          <button
            onClick={() => setActiveFeature(null)}
            className="mt-4 rounded-lg bg-emergency-100 px-4 py-2 text-sm font-medium text-emergency-700 transition-colors hover:bg-emergency-200"
          >
            Close
          </button>
        </div>
      )}

      {activeFeature === 'danger-detection' && (
        <div className="rounded-2xl border-2 border-emergency-200 bg-white p-6 shadow-lg">
          <h3 className="mb-4 font-display text-2xl font-bold text-emergency-900">
            Danger Detection
          </h3>
          <DangerDetection />
          <button
            onClick={() => setActiveFeature(null)}
            className="mt-4 rounded-lg bg-emergency-100 px-4 py-2 text-sm font-medium text-emergency-700 transition-colors hover:bg-emergency-200"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}

