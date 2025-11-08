'use client';

import { useState, useEffect, useRef } from 'react';
import { useAACStore, type AACPhrase } from '@/lib/store/aac-store';
import { speakWithVoice } from '@/lib/utils/voice-banking';
import { useVoiceBankingStore } from '@/lib/store/voice-banking-store';
import { initializeScanning, handleSwitchInput } from '@/lib/utils/access-methods';

export function AACBoard() {
  const {
    boards,
    currentBoard,
    settings,
    usePhrase,
    addHistory,
    setCurrentBoard,
    getPredictions,
  } = useAACStore();
  const { getActiveVoice } = useVoiceBankingStore();
  const [predictions, setPredictions] = useState<AACPhrase[]>([]);
  const [lastSpoken, setLastSpoken] = useState<string | null>(null);
  const scanningRef = useRef<any>(null);

  useEffect(() => {
    if (settings.showPredictions) {
      const preds = getPredictions();
      setPredictions(preds);
    }
  }, [settings.showPredictions, getPredictions]);

  // Initialize scanning mode if enabled
  useEffect(() => {
    if (settings.accessMethod === 'scanning' && currentBoard) {
      const items = currentBoard.phrases;
      scanningRef.current = initializeScanning(
        items,
        (item) => handlePhraseSelect(item),
        settings.scanningSpeed
      );
      
      // Start scanning
      if (scanningRef.current) {
        // Visual scanning will be handled by CSS classes
      }
    }
    
    return () => {
      if (scanningRef.current?.intervalId) {
        clearInterval(scanningRef.current.intervalId);
      }
    };
  }, [settings.accessMethod, currentBoard, settings.scanningSpeed]);

  const handlePhraseSelect = (phrase: AACPhrase) => {
    usePhrase(phrase.id);
    addHistory(phrase.text, 'board');
    setLastSpoken(phrase.text);
    
    // Speak the phrase
    if (settings.autoSpeak) {
      const activeVoice = getActiveVoice();
      speakWithVoice(
        phrase.text,
        activeVoice?.id || null,
        {
          rate: settings.voiceRate,
          pitch: settings.voicePitch,
          volume: settings.voiceVolume,
        }
      );
    }
  };

  const handleRepeatLast = () => {
    if (lastSpoken) {
      const activeVoice = getActiveVoice();
      speakWithVoice(
        lastSpoken,
        activeVoice?.id || null,
        {
          rate: settings.voiceRate,
          pitch: settings.voicePitch,
          volume: settings.voiceVolume,
        }
      );
    }
  };

  if (!currentBoard) {
    return (
      <div className="rounded-lg bg-gray-50 p-4 text-center">
        <p className="text-gray-600">No board selected. Please select a board.</p>
      </div>
    );
  }

  const buttonSize = settings.largeButtons ? 'text-2xl px-6 py-6' : 'text-lg px-4 py-4';
  const gridCols = settings.largeButtons ? 'grid-cols-2' : 'grid-cols-3';

  return (
    <div className="space-y-4">
      {/* Board Selector */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {boards.map((board) => (
          <button
            key={board.id}
            onClick={() => setCurrentBoard(board.id)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
              currentBoard.id === board.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {board.name}
          </button>
        ))}
      </div>

      {/* Phrases Grid */}
      <div className={`grid ${gridCols} gap-3`}>
        {currentBoard.phrases.map((phrase, index) => (
          <button
            key={phrase.id}
            data-scan-index={index}
            onClick={() => handlePhraseSelect(phrase)}
            className={`rounded-lg border-2 border-gray-300 bg-white p-4 text-center transition-all hover:border-blue-500 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 ${buttonSize} ${
              settings.showIcons && phrase.icon ? 'flex flex-col items-center justify-center gap-2' : ''
            }`}
            aria-label={phrase.text}
          >
            {settings.showIcons && phrase.icon && (
              <span className="text-3xl">{phrase.icon}</span>
            )}
            <span className="font-medium">{phrase.text}</span>
          </button>
        ))}
      </div>

      {/* Predictions */}
      {settings.showPredictions && predictions.length > 0 && (
        <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Suggestions:</h3>
          <div className="flex gap-2 flex-wrap">
            {predictions.map((phrase) => (
              <button
                key={phrase.id}
                onClick={() => handlePhraseSelect(phrase)}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
              >
                {phrase.text}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Repeat Last Message */}
      {settings.repeatLastMessage && lastSpoken && (
        <button
          onClick={handleRepeatLast}
          className="w-full rounded-lg bg-green-600 px-6 py-3 text-lg font-medium text-white transition-colors hover:bg-green-700"
        >
          🔄 Repeat: "{lastSpoken}"
        </button>
      )}

      {/* Quick Toggles */}
      <div className="flex gap-2">
        <button
          className="flex-1 rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-300"
        >
          ⏱️ Give me time to type
        </button>
        <button
          className="flex-1 rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-300"
        >
          📱 I use this device to communicate
        </button>
      </div>
    </div>
  );
}

