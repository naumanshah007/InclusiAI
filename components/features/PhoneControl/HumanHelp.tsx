'use client';

import { useState, useRef } from 'react';
import { useAPIKey } from '@/lib/hooks/useAPIKey';
import { useUserPreferences } from '@/lib/store/user-preferences';
import { callAI } from '@/lib/utils/api-client';
import { useEmergencyContactsStore } from '@/lib/store/emergency-contacts-store';
import { CameraFeed } from '@/components/features/VisionAssistant/CameraFeed';

export function HumanHelp() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [aiConfidence, setAiConfidence] = useState<number | null>(null);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [helpRequest, setHelpRequest] = useState('');
  const { apiKey } = useAPIKey();
  const { aiProvider } = useUserPreferences();
  const { contacts } = useEmergencyContactsStore();
  const streamIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleConnect = async () => {
    setIsConnecting(true);
    
    // Simulate connection (in production, this would connect to a real service)
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsConnected(true);
    setIsConnecting(false);
    
    // Start streaming camera feed (simulated)
    startStreaming();
  };

  const startStreaming = () => {
    // In production, this would stream video to a volunteer network
    // For now, we'll simulate by analyzing images periodically
    streamIntervalRef.current = setInterval(async () => {
      if (currentImage) {
        try {
          // Analyze image to determine AI confidence
          const response = await callAI(
            {
              type: 'vision',
              data: {
                image: currentImage,
                context: 'Analyze this scene and provide a confidence score (0-100) for how well AI can assist. Consider: clarity, complexity, presence of text, obstacles, etc. Return only a number between 0 and 100.',
                scenario: 'general',
              },
            },
            {
              apiKey,
              provider: aiProvider,
            }
          );
          
          // Extract confidence score
          const scoreMatch = response.result.match(/\d+/);
          if (scoreMatch) {
            const score = parseInt(scoreMatch[0]);
            setAiConfidence(Math.min(100, Math.max(0, score)));
            
            // If confidence is low, suggest human help
            if (score < 50 && !isConnected) {
              if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                const synth = window.speechSynthesis;
                const utterance = new SpeechSynthesisUtterance('AI confidence is low. Consider connecting to human help.');
                utterance.rate = 1.0;
                synth.speak(utterance);
              }
            }
          }
        } catch (error) {
          console.error('Error analyzing confidence:', error);
        }
      }
    }, 5000); // Analyze every 5 seconds
  };

  const handleDisconnect = () => {
    if (streamIntervalRef.current) {
      clearInterval(streamIntervalRef.current);
      streamIntervalRef.current = null;
    }
    setIsConnected(false);
    setAiConfidence(null);
  };

  const handleImageCapture = (image: string) => {
    setCurrentImage(image);
  };

  const handleRequestHelp = () => {
    if (!helpRequest.trim()) {
      return;
    }
    
    // In production, this would send the request to a volunteer network
    // For now, we'll simulate by speaking the request
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const synth = window.speechSynthesis;
      const utterance = new SpeechSynthesisUtterance(`Help request sent: ${helpRequest}`);
      utterance.rate = 1.0;
      synth.speak(utterance);
    }
    
    setHelpRequest('');
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">Human Help Fallback</h2>
      <p className="text-sm text-gray-600">
        Connect to a human volunteer when AI assistance is not sufficient.
      </p>
      
      {/* AI Confidence Indicator */}
      {aiConfidence !== null && (
        <div className={`rounded-lg p-4 ${
          aiConfidence >= 70 ? 'bg-green-50 border border-green-200' :
          aiConfidence >= 40 ? 'bg-yellow-50 border border-yellow-200' :
          'bg-red-50 border border-red-200'
        }`}>
          <p className="text-sm font-medium">
            AI Confidence: {aiConfidence}%
            {aiConfidence < 50 && (
              <span className="ml-2 text-red-600">Consider human help</span>
            )}
          </p>
        </div>
      )}
      
      {/* Connection Status */}
      <div className="rounded-lg bg-gray-50 p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="font-semibold text-gray-900">Connection Status</p>
            <p className={`text-sm ${isConnected ? 'text-green-600' : 'text-gray-600'}`}>
              {isConnected ? 'Connected to volunteer network' : 'Not connected'}
            </p>
          </div>
          {!isConnected ? (
            <button
              onClick={handleConnect}
              disabled={isConnecting}
              className="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
            >
              {isConnecting ? 'Connecting...' : 'Connect'}
            </button>
          ) : (
            <button
              onClick={handleDisconnect}
              className="rounded-lg bg-red-600 px-6 py-2 font-medium text-white transition-colors hover:bg-red-700"
            >
              Disconnect
            </button>
          )}
        </div>
      </div>
      
      {/* Help Request */}
      {isConnected && (
        <div className="rounded-lg bg-gray-50 p-4 space-y-3">
          <label htmlFor="help-request" className="block text-sm font-medium text-gray-700">
            What do you need help with?
          </label>
          <textarea
            id="help-request"
            value={helpRequest}
            onChange={(e) => setHelpRequest(e.target.value)}
            placeholder="Describe what you need help with..."
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
          />
          <button
            onClick={handleRequestHelp}
            disabled={!helpRequest.trim()}
            className="w-full rounded-lg bg-green-600 px-6 py-2 font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50"
          >
            Send Help Request
          </button>
        </div>
      )}
      
      {/* Camera Feed for Streaming */}
      {isConnected && (
        <div className="rounded-lg bg-gray-50 p-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Camera Feed (Streaming)</p>
          <CameraFeed
            onImageCapture={handleImageCapture}
            showGuidance={false}
            speakGuidance={false}
          />
        </div>
      )}
      
      {/* Emergency Contacts */}
      {contacts.length > 0 && (
        <div className="rounded-lg bg-gray-50 p-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Quick Contact:</p>
          <div className="space-y-2">
            {contacts.slice(0, 3).map((contact) => (
              <button
                key={contact.id}
                onClick={() => window.location.href = `tel:${contact.phone}`}
                className="w-full rounded-lg bg-blue-50 border border-blue-200 px-4 py-2 text-sm text-blue-900 transition-colors hover:bg-blue-100"
              >
                📞 Call {contact.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

