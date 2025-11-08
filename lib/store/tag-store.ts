import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface Tag {
  id: string;
  name: string;
  description: string;
  location: string; // Description of location
  image?: string; // Base64 image
  qrCode?: string; // QR code data if applicable
  nfcId?: string; // NFC ID if applicable
  timestamp: number;
  category?: string; // e.g., 'shelf', 'container', 'folder', 'door'
}

interface TagStore {
  tags: Tag[];
  addTag: (tag: Omit<Tag, 'id' | 'timestamp'>) => void;
  removeTag: (id: string) => void;
  getTagById: (id: string) => Tag | undefined;
  getTagByName: (name: string) => Tag | undefined;
  getTagByQR: (qrCode: string) => Tag | undefined;
  getTagByNFC: (nfcId: string) => Tag | undefined;
  searchTags: (query: string) => Tag[];
  getTagsByCategory: (category: string) => Tag[];
  clearHistory: () => void;
}

export const useTagStore = create<TagStore>()(
  persist(
    (set, get) => ({
      tags: [],
      addTag: (tag) =>
        set((state) => ({
          tags: [
            {
              ...tag,
              id: `tag-${Date.now()}`,
              timestamp: Date.now(),
            },
            ...state.tags,
          ],
        })),
      removeTag: (id) =>
        set((state) => ({
          tags: state.tags.filter((t) => t.id !== id),
        })),
      getTagById: (id) => get().tags.find((t) => t.id === id),
      getTagByName: (name) => {
        const lowerName = name.toLowerCase();
        return get().tags.find((t) => t.name.toLowerCase() === lowerName);
      },
      getTagByQR: (qrCode) => get().tags.find((t) => t.qrCode === qrCode),
      getTagByNFC: (nfcId) => get().tags.find((t) => t.nfcId === nfcId),
      searchTags: (query) => {
        const lowerQuery = query.toLowerCase();
        return get().tags.filter(
          (t) =>
            t.name.toLowerCase().includes(lowerQuery) ||
            t.description.toLowerCase().includes(lowerQuery) ||
            t.location.toLowerCase().includes(lowerQuery) ||
            t.category?.toLowerCase().includes(lowerQuery)
        );
      },
      getTagsByCategory: (category) => {
        const lowerCategory = category.toLowerCase();
        return get().tags.filter((t) => t.category?.toLowerCase() === lowerCategory);
      },
      clearHistory: () => set({ tags: [] }),
    }),
    {
      name: 'inclusiaid-tag-store',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

