'use client';

import { useState, useRef, useEffect } from 'react';
import { useCaptionStore } from '@/lib/store/caption-store';

export function AnnouncementCapture() {
  const [isListening, setIsListening] = useState(false);
  const [announcements, setAnnouncements] = useState<Array<{ text: string; timestamp: number }>>([]);
  const recognitionRef = useRef<any>(null);
  const { addTranscript } = useCaptionStore();

  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      
      recognition.onstart = () => {
        setIsListening(true);
      };
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[event.results.length - 1][0].transcript;
        
        // Check if this looks like an announcement (keywords)
        const announcementKeywords = [
          'gate', 'platform', 'boarding', 'departure', 'arrival',
          'delay', 'cancelled', 'now boarding', 'final call',
          'attention', 'announcement', 'counter', 'ticket',
        ];
        
        const lowerTranscript = transcript.toLowerCase();
        const isAnnouncement = announcementKeywords.some(keyword => 
          lowerTranscript.includes(keyword)
        );
        
        if (isAnnouncement || transcript.length > 20) {
          const announcement = {
            text: transcript,
            timestamp: Date.now(),
          };
          
          setAnnouncements((prev) => [announcement, ...prev].slice(0, 20));
          addTranscript(transcript, 'Announcement');
          
          // Visual alert for announcement
          if (typeof document !== 'undefined') {
            const alert = document.createElement('div');
            alert.className = 'fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-yellow-500 text-black px-6 py-3 rounded-lg shadow-lg';
            alert.textContent = '🔔 Announcement detected!';
            document.body.appendChild(alert);
            
            setTimeout(() => {
              document.body.removeChild(alert);
            }, 3000);
          }
          
          // Haptic feedback
          if (typeof window !== 'undefined' && 'vibrate' in navigator) {
            navigator.vibrate([200, 100, 200]);
          }
        }
      };
      
      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        if (event.error !== 'no-speech') {
          setIsListening(false);
        }
      };
      
      recognition.onend = () => {
        if (isListening) {
          // Restart if still listening
          try {
            recognition.start();
          } catch (e) {
            setIsListening(false);
          }
        }
      };
      
      recognitionRef.current = recognition;
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isListening, addTranscript]);

  const handleStart = () => {
    if (recognitionRef.current) {
      recognitionRef.current.start();
    }
  };

  const handleStop = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Announcement Capture</h2>
        <div className="flex gap-2">
          <button
            onClick={handleStart}
            disabled={isListening}
            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50"
          >
            {isListening ? '🎤 Listening...' : '▶️ Start Listening'}
          </button>
          <button
            onClick={handleStop}
            disabled={!isListening}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
          >
            ⏹️ Stop
          </button>
        </div>
      </div>

      <p className="text-sm text-gray-600">
        Listen for public announcements at stations, airports, hospitals, etc.
      </p>

      {/* Announcements List */}
      {announcements.length > 0 && (
        <div className="rounded-lg bg-gray-50 p-4 space-y-3">
          <h3 className="font-semibold text-gray-900">Detected Announcements</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {announcements.map((announcement, idx) => (
              <div
                key={idx}
                className="rounded-lg bg-yellow-50 border border-yellow-200 p-3"
              >
                <p className="text-sm font-medium text-gray-900 mb-1">
                  {announcement.text}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(announcement.timestamp).toLocaleTimeString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {announcements.length === 0 && isListening && (
        <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 text-center">
          <p className="text-sm text-blue-800">
            Listening for announcements... Speak clearly into the microphone.
          </p>
        </div>
      )}
    </div>
  );
}

