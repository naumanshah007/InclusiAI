'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useAPIKey } from '@/lib/hooks/useAPIKey';
import { useUserPreferences } from '@/lib/store/user-preferences';
import { callAI } from '@/lib/utils/api-client';
import { parseFormInfo, generatePenGuidance, type FormField } from '@/lib/utils/form-parser';
import { useFormStore } from '@/lib/store/form-store';
import { TextToSpeech } from '@/components/accessibility/TextToSpeech';
import { CameraFeed } from './CameraFeed';

export function FormHelper() {
  const [formInfo, setFormInfo] = useState<any>(null);
  const [currentField, setCurrentField] = useState<FormField | null>(null);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isRecording, setIsRecording] = useState(false);
  const { apiKey } = useAPIKey();
  const { aiProvider } = useUserPreferences();
  const { addForm } = useFormStore();

  const { mutate: analyzeForm, isPending } = useMutation({
    mutationFn: async (image: string) => {
      const response = await callAI(
        {
          type: 'vision',
          data: {
            image,
            context: `Analyze this form or document. Identify:
1. Form title or document type
2. All form fields with their labels
3. Field types (text, email, phone, date, signature, etc.)
4. Required fields (marked with * or "required")
5. Approximate position of each field (top, middle, bottom, left, right, center)
6. Signature location if present

Format your response clearly listing each field and its position.`,
            scenario: 'document',
          },
        },
        {
          apiKey,
          provider: aiProvider,
        }
      );
      return { image, result: response.result };
    },
    onSuccess: (result) => {
      const parsed = parseFormInfo(result.result);
      setFormInfo(parsed);
      setCurrentImage(result.image);
      
      if (parsed.fields.length > 0) {
        setCurrentField(parsed.fields[0]);
        
        // Speak first field
        const guidance = generatePenGuidance(parsed.fields[0]);
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
          const synth = window.speechSynthesis;
          const utterance = new SpeechSynthesisUtterance(guidance);
          utterance.rate = 1.0;
          synth.speak(utterance);
        }
      }
      
      // Save form
      addForm({
        formInfo: parsed,
        answers: [],
        image: result.image,
      });
    },
    onError: (error) => {
      console.error('Error analyzing form:', error);
      setFormInfo(null);
    },
  });

  const handleImageCapture = (image: string) => {
    analyzeForm(image);
  };

  const handleNextField = () => {
    if (!formInfo || !currentField) return;
    
    const currentIndex = formInfo.fields.findIndex((f: FormField) => f.id === currentField.id);
    if (currentIndex < formInfo.fields.length - 1) {
      const nextField = formInfo.fields[currentIndex + 1];
      setCurrentField(nextField);
      
      const guidance = generatePenGuidance(nextField);
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        const synth = window.speechSynthesis;
        const utterance = new SpeechSynthesisUtterance(guidance);
        utterance.rate = 1.0;
        synth.speak(utterance);
      }
    }
  };

  const handlePreviousField = () => {
    if (!formInfo || !currentField) return;
    
    const currentIndex = formInfo.fields.findIndex((f: FormField) => f.id === currentField.id);
    if (currentIndex > 0) {
      const prevField = formInfo.fields[currentIndex - 1];
      setCurrentField(prevField);
      
      const guidance = generatePenGuidance(prevField);
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        const synth = window.speechSynthesis;
        const utterance = new SpeechSynthesisUtterance(guidance);
        utterance.rate = 1.0;
        synth.speak(utterance);
      }
    }
  };

  const handleRecordAnswer = () => {
    if (!currentField) return;
    
    setIsRecording(true);
    
    // Use Web Speech API for speech-to-text
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setAnswers(prev => ({ ...prev, [currentField.id]: transcript }));
        setIsRecording(false);
        
        // Speak confirmation
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
          const synth = window.speechSynthesis;
          const utterance = new SpeechSynthesisUtterance(`Recorded: ${transcript}`);
          utterance.rate = 1.0;
          synth.speak(utterance);
        }
      };
      
      recognition.onerror = () => {
        setIsRecording(false);
      };
      
      recognition.start();
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">Form Assistant</h2>
      <p className="text-sm text-gray-600">
        Point your camera at a form, and I'll help you fill it out with voice guidance.
      </p>
      
      <CameraFeed
        onImageCapture={handleImageCapture}
        showGuidance={true}
        speakGuidance={true}
      />
      
      {isPending && (
        <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 text-center">
          <p className="text-sm text-blue-800">Analyzing form...</p>
        </div>
      )}
      
      {formInfo && (
        <div className="rounded-lg bg-gray-50 p-4 space-y-4">
          <h3 className="font-semibold text-gray-900">{formInfo.title || 'Form'}</h3>
          
          {currentField && (
            <div className="rounded-lg bg-blue-50 border-2 border-blue-200 p-4">
              <h4 className="font-semibold text-blue-900 mb-2">Current Field:</h4>
              <p className="text-blue-800 mb-2">{currentField.label} {currentField.required && '(Required)'}</p>
              <p className="text-sm text-blue-700 mb-3">{generatePenGuidance(currentField)}</p>
              
              {answers[currentField.id] && (
                <p className="text-sm text-green-700 mb-2">Your answer: {answers[currentField.id]}</p>
              )}
              
              <div className="flex gap-2">
                <button
                  onClick={handleRecordAnswer}
                  disabled={isRecording}
                  className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50"
                >
                  {isRecording ? 'Recording...' : '🎤 Record Answer'}
                </button>
                <button
                  onClick={handlePreviousField}
                  disabled={formInfo.fields.findIndex((f: FormField) => f.id === currentField.id) === 0}
                  className="rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-300 disabled:opacity-50"
                >
                  ← Previous
                </button>
                <button
                  onClick={handleNextField}
                  disabled={formInfo.fields.findIndex((f: FormField) => f.id === currentField.id) === formInfo.fields.length - 1}
                  className="rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-300 disabled:opacity-50"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
          
          <div className="space-y-2">
            <h4 className="font-semibold text-gray-900">All Fields:</h4>
            {formInfo.fields.map((field: FormField) => (
              <div
                key={field.id}
                className={`rounded-lg p-2 text-sm ${field.id === currentField?.id ? 'bg-blue-100 border border-blue-300' : 'bg-white border border-gray-200'}`}
              >
                <p>{field.label} {field.required && '*'}</p>
                {answers[field.id] && (
                  <p className="text-xs text-green-600">Answer: {answers[field.id]}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

