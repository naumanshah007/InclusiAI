import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface AACPhrase {
  id: string;
  text: string;
  category: string;
  icon?: string;
  color?: string;
  frequency: number; // Usage frequency for prediction
  lastUsed?: number;
  custom?: boolean; // User-created phrase
}

export interface AACBoard {
  id: string;
  name: string;
  category: string;
  phrases: AACPhrase[];
  location?: string; // Location context (home, school, hospital, etc.)
  timeContext?: 'morning' | 'afternoon' | 'evening' | 'anytime';
  scene?: string; // Scene context (clinic, restaurant, classroom, etc.)
  isDefault?: boolean;
}

export interface AACHistory {
  id: string;
  text: string;
  timestamp: number;
  method: 'board' | 'type' | 'prediction' | 'camera' | 'ocr';
}

export interface AACSettings {
  voiceRate: number; // 0.5 - 2.0
  voicePitch: number; // 0.5 - 2.0
  voiceVolume: number; // 0.0 - 1.0
  voiceName?: string; // Custom voice name
  autoSpeak: boolean; // Auto-speak on selection
  showPredictions: boolean;
  predictionCount: number; // Number of predictions to show
  accessMethod: 'touch' | 'switch' | 'scanning' | 'eye-tracking';
  scanningSpeed: number; // ms per item
  largeButtons: boolean;
  showIcons: boolean;
  repeatLastMessage: boolean;
}

interface AACStore {
  phrases: AACPhrase[];
  boards: AACBoard[];
  history: AACHistory[];
  settings: AACSettings;
  currentBoard: AACBoard | null;
  addPhrase: (phrase: Omit<AACPhrase, 'id' | 'frequency'>) => void;
  updatePhrase: (id: string, updates: Partial<AACPhrase>) => void;
  removePhrase: (id: string) => void;
  usePhrase: (id: string) => void;
  addBoard: (board: Omit<AACBoard, 'id'>) => void;
  updateBoard: (id: string, updates: Partial<AACBoard>) => void;
  removeBoard: (id: string) => void;
  setCurrentBoard: (boardId: string | null) => void;
  addHistory: (text: string, method: AACHistory['method']) => void;
  clearHistory: () => void;
  updateSettings: (settings: Partial<AACSettings>) => void;
  getPredictions: (context?: string) => AACPhrase[];
  getRecentPhrases: (count?: number) => AACPhrase[];
}

const defaultPhrases: AACPhrase[] = [
  // Basic needs
  { id: 'pain', text: 'I have pain', category: 'needs', icon: '😣', frequency: 0 },
  { id: 'toilet', text: 'I need the toilet', category: 'needs', icon: '🚽', frequency: 0 },
  { id: 'eat', text: 'I want to eat', category: 'needs', icon: '🍽️', frequency: 0 },
  { id: 'drink', text: 'I want a drink', category: 'needs', icon: '🥤', frequency: 0 },
  { id: 'hot', text: 'I am hot', category: 'needs', icon: '🔥', frequency: 0 },
  { id: 'cold', text: 'I am cold', category: 'needs', icon: '❄️', frequency: 0 },
  { id: 'yes', text: 'Yes', category: 'basic', icon: '✓', frequency: 0 },
  { id: 'no', text: 'No', category: 'basic', icon: '✗', frequency: 0 },
  
  // Safety
  { id: 'stop', text: 'Stop', category: 'safety', icon: '🛑', frequency: 0 },
  { id: 'help', text: 'Help', category: 'safety', icon: '🆘', frequency: 0 },
  { id: 'breathe', text: "I can't breathe", category: 'safety', icon: '😰', frequency: 0 },
  { id: 'call-family', text: 'Call my family', category: 'safety', icon: '📞', frequency: 0 },
  
  // Social
  { id: 'hello', text: 'Hello', category: 'social', icon: '👋', frequency: 0 },
  { id: 'thanks', text: 'Thank you', category: 'social', icon: '🙏', frequency: 0 },
  { id: 'please', text: 'Please', category: 'social', icon: '🙏', frequency: 0 },
  { id: 'sorry', text: 'Sorry', category: 'social', icon: '😔', frequency: 0 },
  { id: 'goodbye', text: 'Goodbye', category: 'social', icon: '👋', frequency: 0 },
];

const defaultBoards: AACBoard[] = [
  {
    id: 'basic',
    name: 'Basic Needs',
    category: 'needs',
    phrases: defaultPhrases.filter(p => p.category === 'needs' || p.category === 'basic'),
    isDefault: true,
  },
  {
    id: 'safety',
    name: 'Safety',
    category: 'safety',
    phrases: defaultPhrases.filter(p => p.category === 'safety'),
    isDefault: true,
  },
  {
    id: 'social',
    name: 'Social',
    category: 'social',
    phrases: defaultPhrases.filter(p => p.category === 'social'),
    isDefault: true,
  },
];

const defaultSettings: AACSettings = {
  voiceRate: 1.0,
  voicePitch: 1.0,
  voiceVolume: 1.0,
  autoSpeak: true,
  showPredictions: true,
  predictionCount: 3,
  accessMethod: 'touch',
  scanningSpeed: 1000,
  largeButtons: true,
  showIcons: true,
  repeatLastMessage: true,
};

export const useAACStore = create<AACStore>()(
  persist(
    (set, get) => ({
      phrases: defaultPhrases,
      boards: defaultBoards,
      history: [],
      settings: defaultSettings,
      currentBoard: defaultBoards[0] || null,
      addPhrase: (phrase) =>
        set((state) => ({
          phrases: [
            {
              ...phrase,
              id: `phrase-${Date.now()}`,
              frequency: 0,
              custom: true,
            },
            ...state.phrases,
          ],
        })),
      updatePhrase: (id, updates) =>
        set((state) => ({
          phrases: state.phrases.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
        })),
      removePhrase: (id) =>
        set((state) => ({
          phrases: state.phrases.filter((p) => p.id !== id),
          boards: state.boards.map((board) => ({
            ...board,
            phrases: board.phrases.filter((p) => p.id !== id),
          })),
        })),
      usePhrase: (id) =>
        set((state) => {
          const phrase = state.phrases.find((p) => p.id === id);
          if (phrase) {
            return {
              phrases: state.phrases.map((p) =>
                p.id === id
                  ? { ...p, frequency: p.frequency + 1, lastUsed: Date.now() }
                  : p
              ),
            };
          }
          return state;
        }),
      addBoard: (board) =>
        set((state) => ({
          boards: [
            {
              ...board,
              id: `board-${Date.now()}`,
            },
            ...state.boards,
          ],
        })),
      updateBoard: (id, updates) =>
        set((state) => ({
          boards: state.boards.map((b) =>
            b.id === id ? { ...b, ...updates } : b
          ),
        })),
      removeBoard: (id) =>
        set((state) => ({
          boards: state.boards.filter((b) => b.id !== id),
          currentBoard: state.currentBoard?.id === id ? null : state.currentBoard,
        })),
      setCurrentBoard: (boardId) => {
        const board = boardId
          ? get().boards.find((b) => b.id === boardId)
          : null;
        set({ currentBoard: board || null });
      },
      addHistory: (text, method) =>
        set((state) => ({
          history: [
            {
              id: `history-${Date.now()}`,
              text,
              timestamp: Date.now(),
              method,
            },
            ...state.history,
          ].slice(0, 100), // Keep last 100
        })),
      clearHistory: () => set({ history: [] }),
      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),
      getPredictions: (context) => {
        const { phrases, history } = get();
        // Simple prediction based on frequency and recent usage
        const recent = history.slice(0, 10).map((h) => h.text);
        return phrases
          .filter((p) => {
            if (context) {
              return p.text.toLowerCase().includes(context.toLowerCase());
            }
            return true;
          })
          .sort((a, b) => {
            // Sort by frequency and recency
            const aRecent = recent.includes(a.text) ? 1 : 0;
            const bRecent = recent.includes(b.text) ? 1 : 0;
            return (
              b.frequency + bRecent * 10 - (a.frequency + aRecent * 10)
            );
          })
          .slice(0, get().settings.predictionCount);
      },
      getRecentPhrases: (count = 10) => {
        const { history, phrases } = get();
        const recentTexts = history
          .slice(0, count)
          .map((h) => h.text)
          .filter((text, index, self) => self.indexOf(text) === index);
        
        return recentTexts
          .map((text) => phrases.find((p) => p.text === text))
          .filter((p): p is AACPhrase => p !== undefined)
          .slice(0, count);
      },
    }),
    {
      name: 'inclusiaid-aac-store',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

