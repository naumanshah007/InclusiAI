import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type SoundType =
  | 'doorbell'
  | 'knock'
  | 'name-call'
  | 'baby-cry'
  | 'alarm'
  | 'timer'
  | 'smoke-alarm'
  | 'fire-alarm'
  | 'co-alarm'
  | 'siren'
  | 'honk'
  | 'glass-breaking'
  | 'phone-ring'
  | 'notification'
  | 'other';

export interface SoundAlert {
  id: string;
  type: SoundType;
  label: string;
  enabled: boolean;
  vibrationPattern: number[]; // Vibration pattern in ms
  screenFlash: boolean;
  priority: 'low' | 'medium' | 'high' | 'emergency';
  customLabel?: string;
}

export interface SoundEvent {
  id: string;
  type: SoundType;
  timestamp: number;
  confidence: number;
  label: string;
}

interface SoundAwarenessStore {
  alerts: SoundAlert[];
  recentEvents: SoundEvent[];
  quietModeEnabled: boolean;
  quietModeStart?: string; // HH:mm format
  quietModeEnd?: string; // HH:mm format
  addAlert: (alert: Omit<SoundAlert, 'id'>) => void;
  updateAlert: (id: string, updates: Partial<SoundAlert>) => void;
  removeAlert: (id: string) => void;
  toggleAlert: (id: string) => void;
  addEvent: (event: Omit<SoundEvent, 'id' | 'timestamp'>) => void;
  clearEvents: () => void;
  setQuietMode: (enabled: boolean, start?: string, end?: string) => void;
  isQuietModeActive: () => boolean;
}

const defaultAlerts: SoundAlert[] = [
  {
    id: 'doorbell',
    type: 'doorbell',
    label: 'Doorbell',
    enabled: true,
    vibrationPattern: [200, 100, 200],
    screenFlash: true,
    priority: 'high',
  },
  {
    id: 'knock',
    type: 'knock',
    label: 'Knock',
    enabled: true,
    vibrationPattern: [100, 50, 100],
    screenFlash: false,
    priority: 'medium',
  },
  {
    id: 'name-call',
    type: 'name-call',
    label: 'Name Called',
    enabled: true,
    vibrationPattern: [150, 50, 150, 50, 150],
    screenFlash: true,
    priority: 'high',
  },
  {
    id: 'baby-cry',
    type: 'baby-cry',
    label: 'Baby Crying',
    enabled: true,
    vibrationPattern: [300, 100, 300],
    screenFlash: true,
    priority: 'high',
  },
  {
    id: 'alarm',
    type: 'alarm',
    label: 'Alarm',
    enabled: true,
    vibrationPattern: [200, 100, 200, 100, 200],
    screenFlash: true,
    priority: 'high',
  },
  {
    id: 'smoke-alarm',
    type: 'smoke-alarm',
    label: 'Smoke Alarm',
    enabled: true,
    vibrationPattern: [500, 200, 500, 200, 500],
    screenFlash: true,
    priority: 'emergency',
  },
  {
    id: 'fire-alarm',
    type: 'fire-alarm',
    label: 'Fire Alarm',
    enabled: true,
    vibrationPattern: [500, 200, 500, 200, 500],
    screenFlash: true,
    priority: 'emergency',
  },
  {
    id: 'phone-ring',
    type: 'phone-ring',
    label: 'Phone Ringing',
    enabled: true,
    vibrationPattern: [200, 100, 200],
    screenFlash: false,
    priority: 'medium',
  },
];

export const useSoundAwarenessStore = create<SoundAwarenessStore>()(
  persist(
    (set, get) => ({
      alerts: defaultAlerts,
      recentEvents: [],
      quietModeEnabled: false,
      addAlert: (alert) =>
        set((state) => ({
          alerts: [
            {
              ...alert,
              id: `alert-${Date.now()}`,
            },
            ...state.alerts,
          ],
        })),
      updateAlert: (id, updates) =>
        set((state) => ({
          alerts: state.alerts.map((a) =>
            a.id === id ? { ...a, ...updates } : a
          ),
        })),
      removeAlert: (id) =>
        set((state) => ({
          alerts: state.alerts.filter((a) => a.id !== id),
        })),
      toggleAlert: (id) =>
        set((state) => ({
          alerts: state.alerts.map((a) =>
            a.id === id ? { ...a, enabled: !a.enabled } : a
          ),
        })),
      addEvent: (event) =>
        set((state) => ({
          recentEvents: [
            {
              ...event,
              id: `event-${Date.now()}`,
              timestamp: Date.now(),
            },
            ...state.recentEvents,
          ].slice(0, 100), // Keep last 100 events
        })),
      clearEvents: () => set({ recentEvents: [] }),
      setQuietMode: (enabled, start, end) =>
        set({
          quietModeEnabled: enabled,
          quietModeStart: start,
          quietModeEnd: end,
        }),
      isQuietModeActive: () => {
        const { quietModeEnabled, quietModeStart, quietModeEnd } = get();
        if (!quietModeEnabled) return false;
        
        if (!quietModeStart || !quietModeEnd) return false;
        
        const now = new Date();
        const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        
        // Simple time comparison (assumes same day)
        return currentTime >= quietModeStart && currentTime <= quietModeEnd;
      },
    }),
    {
      name: 'inclusiaid-sound-awareness',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

