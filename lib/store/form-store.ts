import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { FormInfo, FormField } from '@/lib/utils/form-parser';

export interface FormAnswer {
  fieldId: string;
  answer: string;
  timestamp: number;
}

export interface SavedForm {
  id: string;
  formInfo: FormInfo;
  answers: FormAnswer[];
  image: string; // Base64 image
  timestamp: number;
}

interface FormStore {
  forms: SavedForm[];
  addForm: (form: Omit<SavedForm, 'id' | 'timestamp'>) => void;
  updateFormAnswers: (formId: string, answers: FormAnswer[]) => void;
  removeForm: (id: string) => void;
  getFormById: (id: string) => SavedForm | undefined;
  clearHistory: () => void;
}

export const useFormStore = create<FormStore>()(
  persist(
    (set, get) => ({
      forms: [],
      addForm: (form) =>
        set((state) => ({
          forms: [
            {
              ...form,
              id: `form-${Date.now()}`,
              timestamp: Date.now(),
            },
            ...state.forms,
          ],
        })),
      updateFormAnswers: (formId, answers) =>
        set((state) => ({
          forms: state.forms.map((form) =>
            form.id === formId ? { ...form, answers } : form
          ),
        })),
      removeForm: (id) =>
        set((state) => ({
          forms: state.forms.filter((f) => f.id !== id),
        })),
      getFormById: (id) => get().forms.find((f) => f.id === id),
      clearHistory: () => set({ forms: [] }),
    }),
    {
      name: 'inclusiaid-form-store',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

