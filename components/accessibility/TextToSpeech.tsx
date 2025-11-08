'use client';

import { useState, useEffect } from 'react';

interface TextToSpeechProps {
  text: string;
  rate?: number;
  pitch?: number;
  volume?: number;
}

export function TextToSpeech({
  text,
  rate = 1,
  pitch = 1,
  volume = 1,
}: TextToSpeechProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [synth, setSynth] = useState<SpeechSynthesis | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setSynth(window.speechSynthesis);
    }
  }, []);

  const speak = () => {
    if (!synth || !text) return;

    // Stop any ongoing speech
    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    synth.speak(utterance);
  };

  const stop = () => {
    if (synth) {
      synth.cancel();
      setIsSpeaking(false);
    }
  };

  if (!synth) {
    return null; // Text-to-speech not supported
  }

  return (
    <button
      onClick={isSpeaking ? stop : speak}
      className="rounded-lg bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-200"
      aria-label={isSpeaking ? 'Stop speaking' : 'Read aloud'}
    >
      {isSpeaking ? '⏸️ Stop' : '🔊 Read'}
    </button>
  );
}

