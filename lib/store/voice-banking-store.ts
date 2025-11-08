import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface VoiceBank {
  id: string;
  name: string;
  voiceData?: string; // Base64 encoded voice data or reference
  isPersonal: boolean; // Personal voice vs standard TTS
  createdAt: number;
  isActive: boolean;
}

interface VoiceBankingStore {
  voices: VoiceBank[];
  activeVoiceId: string | null;
  addVoice: (voice: Omit<VoiceBank, 'id' | 'createdAt'>) => void;
  removeVoice: (id: string) => void;
  setActiveVoice: (id: string | null) => void;
  getActiveVoice: () => VoiceBank | null;
  clearVoices: () => void;
}

const defaultVoices: VoiceBank[] = [
  {
    id: 'default-male',
    name: 'Default Male Voice',
    isPersonal: false,
    createdAt: Date.now(),
    isActive: true,
  },
  {
    id: 'default-female',
    name: 'Default Female Voice',
    isPersonal: false,
    createdAt: Date.now(),
    isActive: false,
  },
];

export const useVoiceBankingStore = create<VoiceBankingStore>()(
  persist(
    (set, get) => ({
      voices: defaultVoices,
      activeVoiceId: 'default-male',
      addVoice: (voice) =>
        set((state) => {
          const newVoice: VoiceBank = {
            ...voice,
            id: `voice-${Date.now()}`,
            createdAt: Date.now(),
          };
          return {
            voices: [newVoice, ...state.voices],
            activeVoiceId: voice.isActive ? newVoice.id : state.activeVoiceId,
          };
        }),
      removeVoice: (id) =>
        set((state) => {
          const activeId = state.activeVoiceId === id ? null : state.activeVoiceId;
          return {
            voices: state.voices.filter((v) => v.id !== id),
            activeVoiceId: activeId || state.voices.find((v) => v.id !== id)?.id || null,
          };
        }),
      setActiveVoice: (id) =>
        set((state) => ({
          activeVoiceId: id,
          voices: state.voices.map((v) => ({
            ...v,
            isActive: v.id === id,
          })),
        })),
      getActiveVoice: () => {
        const { voices, activeVoiceId } = get();
        return voices.find((v) => v.id === activeVoiceId) || voices.find((v) => v.isActive) || null;
      },
      clearVoices: () => set({ voices: defaultVoices, activeVoiceId: 'default-male' }),
    }),
    {
      name: 'inclusiaid-voice-banking',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

