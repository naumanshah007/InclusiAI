'use client';

import { useAACStore } from '@/lib/store/aac-store';

export function AACSettings() {
  const { settings, updateSettings } = useAACStore();

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">AAC Settings</h2>

      {/* Voice Settings */}
      <div className="rounded-lg bg-gray-50 p-4 space-y-4">
        <h3 className="font-semibold text-gray-900">Voice Settings</h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Voice Rate: {settings.voiceRate.toFixed(1)}x
          </label>
          <input
            type="range"
            min="0.5"
            max="2.0"
            step="0.1"
            value={settings.voiceRate}
            onChange={(e) => updateSettings({ voiceRate: parseFloat(e.target.value) })}
            className="w-full"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Voice Pitch: {settings.voicePitch.toFixed(1)}x
          </label>
          <input
            type="range"
            min="0.5"
            max="2.0"
            step="0.1"
            value={settings.voicePitch}
            onChange={(e) => updateSettings({ voicePitch: parseFloat(e.target.value) })}
            className="w-full"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Voice Volume: {Math.round(settings.voiceVolume * 100)}%
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={settings.voiceVolume}
            onChange={(e) => updateSettings({ voiceVolume: parseFloat(e.target.value) })}
            className="w-full"
          />
        </div>
      </div>

      {/* Display Settings */}
      <div className="rounded-lg bg-gray-50 p-4 space-y-4">
        <h3 className="font-semibold text-gray-900">Display Settings</h3>
        
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={settings.largeButtons}
            onChange={(e) => updateSettings({ largeButtons: e.target.checked })}
            className="rounded border-gray-300"
          />
          <span className="text-sm text-gray-700">Large Buttons</span>
        </label>
        
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={settings.showIcons}
            onChange={(e) => updateSettings({ showIcons: e.target.checked })}
            className="rounded border-gray-300"
          />
          <span className="text-sm text-gray-700">Show Icons</span>
        </label>
      </div>

      {/* Prediction Settings */}
      <div className="rounded-lg bg-gray-50 p-4 space-y-4">
        <h3 className="font-semibold text-gray-900">Prediction Settings</h3>
        
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={settings.showPredictions}
            onChange={(e) => updateSettings({ showPredictions: e.target.checked })}
            className="rounded border-gray-300"
          />
          <span className="text-sm text-gray-700">Show Predictions</span>
        </label>
        
        {settings.showPredictions && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Predictions: {settings.predictionCount}
            </label>
            <input
              type="range"
              min="1"
              max="5"
              step="1"
              value={settings.predictionCount}
              onChange={(e) => updateSettings({ predictionCount: parseInt(e.target.value) })}
              className="w-full"
            />
          </div>
        )}
      </div>

      {/* Access Method */}
      <div className="rounded-lg bg-gray-50 p-4 space-y-4">
        <h3 className="font-semibold text-gray-900">Access Method</h3>
        
        <select
          value={settings.accessMethod}
          onChange={(e) => updateSettings({ accessMethod: e.target.value as any })}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm"
        >
          <option value="touch">Touch</option>
          <option value="switch">Switch</option>
          <option value="scanning">Scanning</option>
          <option value="eye-tracking">Eye Tracking</option>
        </select>
        
        {settings.accessMethod === 'scanning' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Scanning Speed: {settings.scanningSpeed}ms
            </label>
            <input
              type="range"
              min="500"
              max="3000"
              step="100"
              value={settings.scanningSpeed}
              onChange={(e) => updateSettings({ scanningSpeed: parseInt(e.target.value) })}
              className="w-full"
            />
          </div>
        )}
      </div>

      {/* Behavior Settings */}
      <div className="rounded-lg bg-gray-50 p-4 space-y-4">
        <h3 className="font-semibold text-gray-900">Behavior Settings</h3>
        
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={settings.autoSpeak}
            onChange={(e) => updateSettings({ autoSpeak: e.target.checked })}
            className="rounded border-gray-300"
          />
          <span className="text-sm text-gray-700">Auto-Speak on Selection</span>
        </label>
        
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={settings.repeatLastMessage}
            onChange={(e) => updateSettings({ repeatLastMessage: e.target.checked })}
            className="rounded border-gray-300"
          />
          <span className="text-sm text-gray-700">Show Repeat Last Message Button</span>
        </label>
      </div>
    </div>
  );
}

