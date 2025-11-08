import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface TrustedPerson {
  id: string;
  name: string;
  description?: string; // Physical description
  image?: string; // Base64 image (encrypted/local only)
  relationship?: string; // e.g., "friend", "family", "caregiver"
  contactInfo?: {
    phone?: string;
    email?: string;
  };
  timestamp: number;
  lastSeen?: number; // Last time this person was detected
}

interface TrustedPeopleStore {
  people: TrustedPerson[];
  addPerson: (person: Omit<TrustedPerson, 'id' | 'timestamp'>) => void;
  removePerson: (id: string) => void;
  updatePerson: (id: string, updates: Partial<TrustedPerson>) => void;
  getPersonById: (id: string) => TrustedPerson | undefined;
  getPersonByName: (name: string) => TrustedPerson | undefined;
  searchPeople: (query: string) => TrustedPerson[];
  updateLastSeen: (id: string) => void;
  clearHistory: () => void;
}

export const useTrustedPeopleStore = create<TrustedPeopleStore>()(
  persist(
    (set, get) => ({
      people: [],
      addPerson: (person) =>
        set((state) => ({
          people: [
            {
              ...person,
              id: `person-${Date.now()}`,
              timestamp: Date.now(),
            },
            ...state.people,
          ],
        })),
      removePerson: (id) =>
        set((state) => ({
          people: state.people.filter((p) => p.id !== id),
        })),
      updatePerson: (id, updates) =>
        set((state) => ({
          people: state.people.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
        })),
      getPersonById: (id) => get().people.find((p) => p.id === id),
      getPersonByName: (name) => {
        const lowerName = name.toLowerCase();
        return get().people.find((p) => p.name.toLowerCase() === lowerName);
      },
      searchPeople: (query) => {
        const lowerQuery = query.toLowerCase();
        return get().people.filter(
          (p) =>
            p.name.toLowerCase().includes(lowerQuery) ||
            p.description?.toLowerCase().includes(lowerQuery) ||
            p.relationship?.toLowerCase().includes(lowerQuery)
        );
      },
      updateLastSeen: (id) =>
        set((state) => ({
          people: state.people.map((p) =>
            p.id === id ? { ...p, lastSeen: Date.now() } : p
          ),
        })),
      clearHistory: () => set({ people: [] }),
    }),
    {
      name: 'inclusiaid-trusted-people',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

