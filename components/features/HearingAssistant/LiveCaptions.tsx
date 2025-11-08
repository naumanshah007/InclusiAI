'use client';

import { useState, useEffect, useRef } from 'react';
import { useCaptionStore } from '@/lib/store/caption-store';
import { TextToSpeech } from '@/components/accessibility/TextToSpeech';

export function LiveCaptions() {
  const [isListening, setIsListening] = useState(false);
  const [currentText, setCurrentText] = useState('');
  const [interimText, setInterimText] = useState('');
  const recognitionRef = useRef<any>(null);
  const { 
    settings, 
    currentSession, 
    startSession, 
    endSession, 
    addTranscript,
    updateSettings 
  } = useCaptionStore();

  useEffect(() => {
    // Initialize speech recognition
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      
      recognition.onstart = () => {
        setIsListening(true);
        if (!currentSession) {
          startSession();
        }
      };
      
      recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            final += transcript + ' ';
          } else {
            interim += transcript;
          }
        }
        
        if (final) {
          setCurrentText(final.trim());
          addTranscript(final.trim());
          setInterimText('');
        } else {
          setInterimText(interim);
        }
      };
      
      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'no-speech') {
          // Ignore no-speech errors
          return;
        }
        setIsListening(false);
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
      
      recognitionRef.current = recognition;
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [currentSession, startSession, addTranscript]);

  const handleStart = () => {
    if (recognitionRef.current) {
      recognitionRef.current.start();
    }
  };

  const handleStop = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      endSession();
      setCurrentText('');
      setInterimText('');
    }
  };

  const fontSizeClasses = {
    small: 'text-lg',
    medium: 'text-2xl',
    large: 'text-4xl',
    xlarge: 'text-6xl',
  };

  const contrastClasses = {
    high: 'text-white',
    medium: 'text-gray-100',
    low: 'text-gray-200',
  };

  const themeClasses = {
    light: 'bg-white text-black',
    dark: 'bg-black text-white',
    auto: settings.theme === 'dark' ? 'bg-black text-white' : 'bg-white text-black',
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Live Captions</h2>
        <div className="flex gap-2">
          <button
            onClick={handleStart}
            disabled={isListening}
            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50"
          >
            {isListening ? '🎤 Listening...' : '▶️ Start'}
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

      {/* Caption Display */}
      <div
        className={`fixed ${settings.position === 'bottom' ? 'bottom-8' : settings.position === 'top' ? 'top-8' : 'top-1/2 -translate-y-1/2'} left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-4xl rounded-lg p-6 ${themeClasses[settings.theme]} shadow-2xl`}
        style={{
          backgroundColor: settings.theme === 'dark' 
            ? `rgba(0, 0, 0, ${settings.backgroundOpacity})`
            : `rgba(255, 255, 255, ${settings.backgroundOpacity})`,
        }}
      >
        <div className={`${fontSizeClasses[settings.fontSize]} ${contrastClasses[settings.contrast]} font-bold text-center leading-tight`}>
          {currentText && (
            <p className="mb-2">{currentText}</p>
          )}
          {interimText && (
            <p className="opacity-60 italic">{interimText}</p>
          )}
          {!currentText && !interimText && (
            <p className="opacity-50">Waiting for speech...</p>
          )}
        </div>
      </div>

      {/* Settings Panel */}
      <div className="rounded-lg bg-gray-50 p-4 space-y-3">
        <h3 className="font-semibold text-gray-900">Caption Settings</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Font Size
            </label>
            <select
              value={settings.fontSize}
              onChange={(e) => updateSettings({ fontSize: e.target.value as any })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
              <option value="xlarge">Extra Large</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Position
            </label>
            <select
              value={settings.position}
              onChange={(e) => updateSettings({ position: e.target.value as any })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="bottom">Bottom</option>
              <option value="top">Top</option>
              <option value="center">Center</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Theme
            </label>
            <select
              value={settings.theme}
              onChange={(e) => updateSettings({ theme: e.target.value as any })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="auto">Auto</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Background Opacity: {Math.round(settings.backgroundOpacity * 100)}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={settings.backgroundOpacity}
              onChange={(e) => updateSettings({ backgroundOpacity: parseFloat(e.target.value) })}
              className="w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

