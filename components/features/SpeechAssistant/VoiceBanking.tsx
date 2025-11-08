'use client';

import { useState, useRef } from 'react';
import { useVoiceBankingStore } from '@/lib/store/voice-banking-store';
import { recordVoiceSample } from '@/lib/utils/voice-banking';

export function VoiceBanking() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordings, setRecordings] = useState<Array<{ text: string; blob: Blob }>>([]);
  const [currentText, setCurrentText] = useState('');
  const { voices, activeVoiceId, addVoice, setActiveVoice, getActiveVoice } = useVoiceBankingStore();
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const recordingScripts = [
    'Hello, this is my voice.',
    'I am recording my voice for voice banking.',
    'This will help me communicate when I cannot speak.',
    'Thank you for helping me preserve my voice.',
  ];

  const handleStartRecording = async (text: string) => {
    try {
      setIsRecording(true);
      setCurrentText(text);
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks: Blob[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setRecordings((prev) => [...prev, { text, blob }]);
        setIsRecording(false);
        setCurrentText('');
        
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
        }
      };
      
      mediaRecorder.start();
      
      // Auto-stop after 10 seconds
      setTimeout(() => {
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.stop();
        }
      }, 10000);
    } catch (error) {
      console.error('Error starting recording:', error);
      setIsRecording(false);
      alert('Failed to start recording. Please check microphone permissions.');
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    setIsRecording(false);
  };

  const handleGenerateVoice = async () => {
    if (recordings.length < 3) {
      alert('Please record at least 3 samples to generate a voice bank.');
      return;
    }
    
    // In production, this would send recordings to voice cloning service
    // For now, create a placeholder voice bank
    const voiceName = prompt('Enter a name for your voice:');
    if (voiceName) {
      addVoice({
        name: voiceName,
        isPersonal: true,
        isActive: false,
      });
      
      alert('Voice bank created! (In production, this would use actual voice cloning)');
      setRecordings([]);
    }
  };

  const activeVoice = getActiveVoice();

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">Voice Banking</h2>
      <p className="text-sm text-gray-600">
        Record your voice to create a personal voice bank for future use.
      </p>

      {/* Active Voice */}
      {activeVoice && (
        <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
          <p className="text-sm font-medium text-blue-900">
            Active Voice: <strong>{activeVoice.name}</strong>
            {activeVoice.isPersonal && ' (Personal)'}
          </p>
        </div>
      )}

      {/* Recording Scripts */}
      <div className="rounded-lg bg-gray-50 p-4 space-y-3">
        <h3 className="font-semibold text-gray-900">Recording Scripts</h3>
        <p className="text-sm text-gray-600">
          Read these phrases to create your voice bank. Record at least 3-5 samples.
        </p>
        <div className="space-y-2">
          {recordingScripts.map((script, index) => (
            <div
              key={index}
              className="rounded-lg bg-white border border-gray-200 p-3"
            >
              <p className="text-sm text-gray-700 mb-2">{script}</p>
              {isRecording && currentText === script ? (
                <button
                  onClick={handleStopRecording}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
                >
                  ⏹️ Stop Recording
                </button>
              ) : (
                <button
                  onClick={() => handleStartRecording(script)}
                  disabled={isRecording}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                >
                  🎤 Record
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Recordings */}
      {recordings.length > 0 && (
        <div className="rounded-lg bg-gray-50 p-4 space-y-3">
          <h3 className="font-semibold text-gray-900">
            Recordings ({recordings.length}/5)
          </h3>
          <div className="space-y-2">
            {recordings.map((recording, index) => (
              <div
                key={index}
                className="rounded-lg bg-white border border-gray-200 p-3 flex items-center justify-between"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Sample {index + 1}
                  </p>
                  <p className="text-xs text-gray-500">{recording.text}</p>
                </div>
                <audio controls className="h-8">
                  <source src={URL.createObjectURL(recording.blob)} type="audio/webm" />
                </audio>
              </div>
            ))}
          </div>
          {recordings.length >= 3 && (
            <button
              onClick={handleGenerateVoice}
              className="w-full rounded-lg bg-green-600 px-6 py-3 font-medium text-white transition-colors hover:bg-green-700"
            >
              ✅ Generate Voice Bank
            </button>
          )}
        </div>
      )}

      {/* Available Voices */}
      <div className="rounded-lg bg-gray-50 p-4 space-y-3">
        <h3 className="font-semibold text-gray-900">Available Voices</h3>
        <div className="space-y-2">
          {voices.map((voice) => (
            <div
              key={voice.id}
              className={`rounded-lg border p-3 flex items-center justify-between ${
                voice.id === activeVoiceId
                  ? 'bg-blue-50 border-blue-300'
                  : 'bg-white border-gray-200'
              }`}
            >
              <div>
                <p className="font-medium text-gray-900">{voice.name}</p>
                <p className="text-xs text-gray-500">
                  {voice.isPersonal ? 'Personal Voice' : 'Standard Voice'}
                </p>
              </div>
              <button
                onClick={() => setActiveVoice(voice.id)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  voice.id === activeVoiceId
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {voice.id === activeVoiceId ? 'Active' : 'Select'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4">
        <h3 className="font-semibold text-yellow-900 mb-2">Privacy & Security</h3>
        <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
          <li>Voice recordings are stored locally on your device</li>
          <li>Voice banks are encrypted and never shared without your consent</li>
          <li>You can delete recordings and voice banks at any time</li>
        </ul>
      </div>
    </div>
  );
}

