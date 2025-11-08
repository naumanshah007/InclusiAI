import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  email?: string;
  relationship?: string; // e.g., "family", "friend", "caregiver"
  isPrimary?: boolean; // Primary emergency contact
  timestamp: number;
}

interface EmergencyContactsStore {
  contacts: EmergencyContact[];
  addContact: (contact: Omit<EmergencyContact, 'id' | 'timestamp'>) => void;
  removeContact: (id: string) => void;
  updateContact: (id: string, updates: Partial<EmergencyContact>) => void;
  getPrimaryContact: () => EmergencyContact | undefined;
  getContactById: (id: string) => EmergencyContact | undefined;
  clearHistory: () => void;
}

export const useEmergencyContactsStore = create<EmergencyContactsStore>()(
  persist(
    (set, get) => ({
      contacts: [],
      addContact: (contact) =>
        set((state) => {
          // If this is set as primary, unset others
          const updatedContacts = contact.isPrimary
            ? state.contacts.map((c) => ({ ...c, isPrimary: false }))
            : state.contacts;
          
          return {
            contacts: [
              {
                ...contact,
                id: `contact-${Date.now()}`,
                timestamp: Date.now(),
              },
              ...updatedContacts,
            ],
          };
        }),
      removeContact: (id) =>
        set((state) => ({
          contacts: state.contacts.filter((c) => c.id !== id),
        })),
      updateContact: (id, updates) =>
        set((state) => {
          // If setting as primary, unset others
          if (updates.isPrimary) {
            return {
              contacts: state.contacts.map((c) =>
                c.id === id ? { ...c, ...updates } : { ...c, isPrimary: false }
              ),
            };
          }
          return {
            contacts: state.contacts.map((c) =>
              c.id === id ? { ...c, ...updates } : c
            ),
          };
        }),
      getPrimaryContact: () => get().contacts.find((c) => c.isPrimary),
      getContactById: (id) => get().contacts.find((c) => c.id === id),
      clearHistory: () => set({ contacts: [] }),
    }),
    {
      name: 'inclusiaid-emergency-contacts',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

