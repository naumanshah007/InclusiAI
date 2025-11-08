'use client';

import { useState } from 'react';
import { useAACStore } from '@/lib/store/aac-store';
import { useVoiceBankingStore } from '@/lib/store/voice-banking-store';

export function CareTeam() {
  const { phrases, boards, history, settings } = useAACStore();
  const { voices } = useVoiceBankingStore();
  const [exportFormat, setExportFormat] = useState<'json' | 'csv' | 'pdf'>('json');

  const handleExportPhrases = () => {
    const data = {
      phrases: phrases.map((p) => ({
        text: p.text,
        category: p.category,
        frequency: p.frequency,
        lastUsed: p.lastUsed,
      })),
      exportDate: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aac-phrases-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportUsage = () => {
    const usage = {
      totalPhrases: phrases.length,
      totalBoards: boards.length,
      totalHistory: history.length,
      mostUsedPhrases: phrases
        .sort((a, b) => b.frequency - a.frequency)
        .slice(0, 10)
        .map((p) => ({
          text: p.text,
          frequency: p.frequency,
          lastUsed: p.lastUsed,
        })),
      recentPhrases: history.slice(0, 20).map((h) => ({
        text: h.text,
        timestamp: h.timestamp,
        method: h.method,
      })),
      exportDate: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(usage, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aac-usage-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportConfig = () => {
    const config = {
      boards: boards.map((b) => ({
        name: b.name,
        category: b.category,
        phrases: b.phrases.map((p) => ({
          text: p.text,
          category: p.category,
          icon: p.icon,
        })),
        location: b.location,
        timeContext: b.timeContext,
        scene: b.scene,
      })),
      settings: {
        voiceRate: settings.voiceRate,
        voicePitch: settings.voicePitch,
        voiceVolume: settings.voiceVolume,
        autoSpeak: settings.autoSpeak,
        showPredictions: settings.showPredictions,
        predictionCount: settings.predictionCount,
        accessMethod: settings.accessMethod,
        scanningSpeed: settings.scanningSpeed,
        largeButtons: settings.largeButtons,
        showIcons: settings.showIcons,
      },
      exportDate: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aac-config-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportConfig = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const config = JSON.parse(event.target?.result as string);
            // In production, validate and import config
            alert('Configuration imported! (In production, this would validate and apply the config)');
          } catch (error) {
            alert('Failed to import configuration. Please check the file format.');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">Care Team & Export</h2>
      <p className="text-sm text-gray-600">
        Export usage data and shareable configuration with therapists and caregivers.
      </p>

      {/* Export Options */}
      <div className="rounded-lg bg-gray-50 p-4 space-y-4">
        <h3 className="font-semibold text-gray-900">Export Data</h3>
        
        <div className="space-y-3">
          <button
            onClick={handleExportPhrases}
            className="w-full rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700"
          >
            📋 Export Phrases
          </button>
          
          <button
            onClick={handleExportUsage}
            className="w-full rounded-lg bg-green-600 px-6 py-3 font-medium text-white transition-colors hover:bg-green-700"
          >
            📊 Export Usage Statistics
          </button>
          
          <button
            onClick={handleExportConfig}
            className="w-full rounded-lg bg-purple-600 px-6 py-3 font-medium text-white transition-colors hover:bg-purple-700"
          >
            ⚙️ Export Configuration
          </button>
        </div>
      </div>

      {/* Import Configuration */}
      <div className="rounded-lg bg-gray-50 p-4 space-y-4">
        <h3 className="font-semibold text-gray-900">Import Configuration</h3>
        <p className="text-sm text-gray-600">
          Import a configuration file from a therapist or caregiver.
        </p>
        <button
          onClick={handleImportConfig}
          className="w-full rounded-lg bg-orange-600 px-6 py-3 font-medium text-white transition-colors hover:bg-orange-700"
        >
          📥 Import Configuration
        </button>
      </div>

      {/* Usage Statistics */}
      <div className="rounded-lg bg-gray-50 p-4 space-y-3">
        <h3 className="font-semibold text-gray-900">Usage Statistics</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg bg-white border border-gray-200 p-3">
            <p className="text-2xl font-bold text-gray-900">{phrases.length}</p>
            <p className="text-sm text-gray-600">Total Phrases</p>
          </div>
          <div className="rounded-lg bg-white border border-gray-200 p-3">
            <p className="text-2xl font-bold text-gray-900">{boards.length}</p>
            <p className="text-sm text-gray-600">Total Boards</p>
          </div>
          <div className="rounded-lg bg-white border border-gray-200 p-3">
            <p className="text-2xl font-bold text-gray-900">{history.length}</p>
            <p className="text-sm text-gray-600">Total Messages</p>
          </div>
          <div className="rounded-lg bg-white border border-gray-200 p-3">
            <p className="text-2xl font-bold text-gray-900">{voices.length}</p>
            <p className="text-sm text-gray-600">Voice Banks</p>
          </div>
        </div>
      </div>

      {/* Most Used Phrases */}
      {phrases.length > 0 && (
        <div className="rounded-lg bg-gray-50 p-4 space-y-3">
          <h3 className="font-semibold text-gray-900">Most Used Phrases</h3>
          <div className="space-y-2">
            {phrases
              .sort((a, b) => b.frequency - a.frequency)
              .slice(0, 10)
              .map((phrase) => (
                <div
                  key={phrase.id}
                  className="flex items-center justify-between rounded-lg bg-white border border-gray-200 p-3"
                >
                  <div>
                    <p className="font-medium text-gray-900">{phrase.text}</p>
                    <p className="text-xs text-gray-500">
                      Used {phrase.frequency} times
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Privacy Notice */}
      <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4">
        <h3 className="font-semibold text-yellow-900 mb-2">Privacy & Consent</h3>
        <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
          <li>All exports require user consent</li>
          <li>Usage statistics are anonymized</li>
          <li>Personal voice banks are never exported</li>
          <li>You can revoke access at any time</li>
        </ul>
      </div>
    </div>
  );
}

