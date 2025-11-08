import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface ObjectLocation {
  id: string;
  objectName: string;
  location: string; // Description of location
  image?: string; // Base64 image of the object
  timestamp: number;
  tags?: string[]; // Additional tags for search
}

interface ObjectMemoryStore {
  objects: ObjectLocation[];
  addObject: (object: Omit<ObjectLocation, 'id' | 'timestamp'>) => void;
  removeObject: (id: string) => void;
  findObject: (objectName: string) => ObjectLocation[];
  searchObjects: (query: string) => ObjectLocation[];
  clearHistory: () => void;
}

export const useObjectMemoryStore = create<ObjectMemoryStore>()(
  persist(
    (set, get) => ({
      objects: [],
      addObject: (object) =>
        set((state) => ({
          objects: [
            {
              ...object,
              id: `object-${Date.now()}`,
              timestamp: Date.now(),
            },
            ...state.objects,
          ],
        })),
      removeObject: (id) =>
        set((state) => ({
          objects: state.objects.filter((o) => o.id !== id),
        })),
      findObject: (objectName) => {
        const lowerName = objectName.toLowerCase();
        return get().objects.filter(
          (o) =>
            o.objectName.toLowerCase().includes(lowerName) ||
            o.tags?.some((tag) => tag.toLowerCase().includes(lowerName))
        );
      },
      searchObjects: (query) => {
        const lowerQuery = query.toLowerCase();
        return get().objects.filter(
          (o) =>
            o.objectName.toLowerCase().includes(lowerQuery) ||
            o.location.toLowerCase().includes(lowerQuery) ||
            o.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery))
        );
      },
      clearHistory: () => set({ objects: [] }),
    }),
    {
      name: 'inclusiaid-object-memory',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

