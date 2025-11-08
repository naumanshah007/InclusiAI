'use client';

import { useState } from 'react';
import { TextToSpeech } from '@/components/accessibility/TextToSpeech';

export function PhoneControlHub() {
  const [messages, setMessages] = useState<string[]>([]);
  const [reminders, setReminders] = useState<Array<{ id: string; text: string; time: string }>>([]);
  const [isListening, setIsListening] = useState(false);

  // Simulated messages (in production, this would fetch from device)
  const mockMessages = [
    { id: '1', from: 'John', text: 'Hey, are you free today?', time: '10:30 AM' },
    { id: '2', from: 'Mom', text: 'Don\'t forget your appointment at 2 PM', time: '9:15 AM' },
    { id: '3', from: 'Doctor', text: 'Your test results are ready', time: 'Yesterday' },
  ];

  const handleReadMessages = () => {
    const messageText = mockMessages.map(m => `Message from ${m.from}: ${m.text}`).join('. ');
    
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const synth = window.speechSynthesis;
      const utterance = new SpeechSynthesisUtterance(messageText);
      utterance.rate = 1.0;
      synth.speak(utterance);
    }
    
    setMessages(mockMessages.map(m => m.text));
  };

  const handleVoiceReply = () => {
    setIsListening(true);
    
    // Use Web Speech API for voice input
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        
        // In production, this would send the message
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
          const synth = window.speechSynthesis;
          const utterance = new SpeechSynthesisUtterance(`Message sent: ${transcript}`);
          utterance.rate = 1.0;
          synth.speak(utterance);
        }
        
        setIsListening(false);
      };
      
      recognition.onerror = () => {
        setIsListening(false);
      };
      
      recognition.start();
    }
  };

  const handleAddReminder = () => {
    const reminderText = prompt('What is the reminder?');
    const reminderTime = prompt('What time? (e.g., 2:00 PM)');
    
    if (reminderText && reminderTime) {
      const newReminder = {
        id: `reminder-${Date.now()}`,
        text: reminderText,
        time: reminderTime,
      };
      setReminders([...reminders, newReminder]);
      
      // Speak confirmation
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        const synth = window.speechSynthesis;
        const utterance = new SpeechSynthesisUtterance(`Reminder set: ${reminderText} at ${reminderTime}`);
        utterance.rate = 1.0;
        synth.speak(utterance);
      }
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">Phone Control Hub</h2>
      <p className="text-sm text-gray-600">
        Control your phone with voice commands: read messages, reply, set reminders.
      </p>
      
      {/* Messages Section */}
      <div className="rounded-lg bg-gray-50 p-4 space-y-3">
        <h3 className="font-semibold text-gray-900">Messages</h3>
        <div className="flex gap-2">
          <button
            onClick={handleReadMessages}
            className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            📱 Read Messages
          </button>
          <button
            onClick={handleVoiceReply}
            disabled={isListening}
            className="flex-1 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50"
          >
            {isListening ? '🎤 Listening...' : '🎤 Voice Reply'}
          </button>
        </div>
        
        {messages.length > 0 && (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {mockMessages.map((msg) => (
              <div key={msg.id} className="rounded-lg bg-white border border-gray-200 p-3 text-sm">
                <p className="font-medium text-gray-900">{msg.from}</p>
                <p className="text-gray-700">{msg.text}</p>
                <p className="text-xs text-gray-500 mt-1">{msg.time}</p>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Reminders Section */}
      <div className="rounded-lg bg-gray-50 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Reminders</h3>
          <button
            onClick={handleAddReminder}
            className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-700"
          >
            ➕ Add Reminder
          </button>
        </div>
        
        {reminders.length > 0 ? (
          <div className="space-y-2">
            {reminders.map((reminder) => (
              <div key={reminder.id} className="rounded-lg bg-white border border-gray-200 p-3 text-sm">
                <p className="font-medium text-gray-900">{reminder.text}</p>
                <p className="text-xs text-gray-500 mt-1">At {reminder.time}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-600">No reminders set</p>
        )}
      </div>
      
      {/* Calendar Integration (Placeholder) */}
      <div className="rounded-lg bg-gray-50 p-4">
        <h3 className="font-semibold text-gray-900 mb-2">Calendar</h3>
        <p className="text-sm text-gray-600">
          Calendar integration coming soon. You'll be able to ask about your schedule and upcoming events.
        </p>
      </div>
      
      {/* Voice Commands Help */}
      <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
        <h3 className="font-semibold text-blue-900 mb-2">Voice Commands:</h3>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>"Read my messages"</li>
          <li>"Reply to message"</li>
          <li>"Set reminder for [time]"</li>
          <li>"What's on my calendar?"</li>
        </ul>
      </div>
    </div>
  );
}

