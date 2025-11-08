import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface CaptionSettings {
  fontSize: 'small' | 'medium' | 'large' | 'xlarge';
  contrast: 'high' | 'medium' | 'low';
  theme: 'light' | 'dark' | 'auto';
  position: 'bottom' | 'top' | 'center';
  backgroundOpacity: number; // 0-1
  showSpeakerLabels: boolean;
  maxLines: number;
  autoSave: boolean;
  autoDelete: boolean; // Auto-delete after session
  deleteAfterHours: number; // Hours to keep transcripts
}

export interface CaptionSession {
  id: string;
  startTime: number;
  endTime?: number;
  transcript: string;
  segments: Array<{
    text: string;
    timestamp: number;
    speaker?: string;
  }>;
  settings: CaptionSettings;
}

interface CaptionStore {
  settings: CaptionSettings;
  currentSession: CaptionSession | null;
  sessions: CaptionSession[];
  updateSettings: (settings: Partial<CaptionSettings>) => void;
  startSession: () => void;
  endSession: () => void;
  addTranscript: (text: string, speaker?: string) => void;
  clearSession: () => void;
  deleteSession: (id: string) => void;
  clearHistory: () => void;
}

const defaultSettings: CaptionSettings = {
  fontSize: 'large',
  contrast: 'high',
  theme: 'dark',
  position: 'bottom',
  backgroundOpacity: 0.9,
  showSpeakerLabels: true,
  maxLines: 3,
  autoSave: true,
  autoDelete: false,
  deleteAfterHours: 24,
};

export const useCaptionStore = create<CaptionStore>()(
  persist(
    (set, get) => ({
      settings: defaultSettings,
      currentSession: null,
      sessions: [],
      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),
      startSession: () => {
        const session: CaptionSession = {
          id: `session-${Date.now()}`,
          startTime: Date.now(),
          transcript: '',
          segments: [],
          settings: get().settings,
        };
        set({ currentSession: session });
      },
      endSession: () => {
        const { currentSession } = get();
        if (currentSession) {
          const updatedSession = {
            ...currentSession,
            endTime: Date.now(),
          };
          set((state) => ({
            currentSession: null,
            sessions: [updatedSession, ...state.sessions].slice(0, 50), // Keep last 50
          }));
        }
      },
      addTranscript: (text, speaker) => {
        const { currentSession } = get();
        if (currentSession) {
          const segment = {
            text,
            timestamp: Date.now(),
            speaker,
          };
          const updatedSession = {
            ...currentSession,
            transcript: currentSession.transcript
              ? `${currentSession.transcript} ${text}`
              : text,
            segments: [...currentSession.segments, segment].slice(-100), // Keep last 100 segments
          };
          set({ currentSession: updatedSession });
        }
      },
      clearSession: () => set({ currentSession: null }),
      deleteSession: (id) =>
        set((state) => ({
          sessions: state.sessions.filter((s) => s.id !== id),
        })),
      clearHistory: () => set({ sessions: [], currentSession: null }),
    }),
    {
      name: 'inclusiaid-caption-store',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

