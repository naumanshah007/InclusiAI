'use client';

import { useState, useEffect } from 'react';
import { useSoundAwarenessStore, type SoundAlert } from '@/lib/store/sound-awareness-store';
import { triggerSoundAlert } from '@/lib/utils/sound-classifier';

export function SoundAwareness() {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [currentSound, setCurrentSound] = useState<string | null>(null);
  const {
    alerts,
    recentEvents,
    quietModeEnabled,
    quietModeStart,
    quietModeEnd,
    toggleAlert,
    updateAlert,
    addEvent,
    setQuietMode,
    isQuietModeActive,
  } = useSoundAwarenessStore();

  // Check quiet mode periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (quietModeEnabled && isQuietModeActive()) {
        setIsMonitoring(false);
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [quietModeEnabled, isQuietModeActive]);

  const handleSoundDetected = (alert: SoundAlert) => {
    if (!alert.enabled) return;
    
    // Check quiet mode
    if (quietModeEnabled && isQuietModeActive()) {
      return;
    }
    
    // Trigger alert
    triggerSoundAlert(alert.vibrationPattern, alert.screenFlash);
    
    // Add event
    addEvent({
      type: alert.type,
      confidence: 0.9,
      label: alert.customLabel || alert.label,
    });
    
    setCurrentSound(alert.label);
    setTimeout(() => setCurrentSound(null), 3000);
  };

  const enabledAlerts = alerts.filter((a) => a.enabled);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Sound Awareness</h2>
        <button
          onClick={() => setIsMonitoring(!isMonitoring)}
          className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors ${
            isMonitoring
              ? 'bg-red-600 hover:bg-red-700'
              : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          {isMonitoring ? '⏸️ Stop Monitoring' : '▶️ Start Monitoring'}
        </button>
      </div>

      {/* Current Sound Alert */}
      {currentSound && (
        <div className="rounded-lg bg-red-50 border-2 border-red-300 p-4 text-center">
          <p className="text-2xl font-bold text-red-900">🔔 {currentSound}</p>
        </div>
      )}

      {/* Quiet Mode */}
      <div className="rounded-lg bg-gray-50 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Quiet Mode</h3>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={quietModeEnabled}
              onChange={(e) => setQuietMode(e.target.checked, quietModeStart, quietModeEnd)}
              className="rounded border-gray-300"
            />
            <span className="text-sm text-gray-700">Enable</span>
          </label>
        </div>
        {quietModeEnabled && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Time
              </label>
              <input
                type="time"
                value={quietModeStart || '22:00'}
                onChange={(e) => setQuietMode(true, e.target.value, quietModeEnd)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Time
              </label>
              <input
                type="time"
                value={quietModeEnd || '08:00'}
                onChange={(e) => setQuietMode(true, quietModeStart, e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
          </div>
        )}
      </div>

      {/* Sound Alerts */}
      <div className="rounded-lg bg-gray-50 p-4 space-y-3">
        <h3 className="font-semibold text-gray-900">Sound Alerts</h3>
        <div className="space-y-2">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="flex items-center justify-between rounded-lg bg-white border border-gray-200 p-3"
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={alert.enabled}
                  onChange={() => toggleAlert(alert.id)}
                  className="rounded border-gray-300"
                />
                <div>
                  <p className="font-medium text-gray-900">{alert.label}</p>
                  <p className="text-xs text-gray-500">
                    Priority: {alert.priority} | 
                    {alert.screenFlash ? ' Flash' : ''} | 
                    Vibration: {alert.vibrationPattern.length} pulses
                  </p>
                </div>
              </div>
              {isMonitoring && (
                <button
                  onClick={() => handleSoundDetected(alert)}
                  className="rounded-lg bg-blue-600 px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-blue-700"
                >
                  Test
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Recent Events */}
      {recentEvents.length > 0 && (
        <div className="rounded-lg bg-gray-50 p-4">
          <h3 className="font-semibold text-gray-900 mb-2">Recent Events</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {recentEvents.slice(0, 10).map((event) => (
              <div
                key={event.id}
                className="text-sm text-gray-700 border-b border-gray-200 pb-2"
              >
                <p>
                  <strong>{event.label}</strong> - {new Date(event.timestamp).toLocaleTimeString()}
                </p>
                <p className="text-xs text-gray-500">Confidence: {Math.round(event.confidence * 100)}%</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

