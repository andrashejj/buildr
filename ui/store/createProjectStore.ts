import { create } from 'zustand';

import type { FormValues } from '@/components/create-project/schema';

export type CreateProjectState = {
  step: number;
  setStep: (s: number) => void;
  next: () => void;
  prev: () => void;
  resetStep: () => void;
  formData: Partial<FormValues>;
  updateForm: (patch: Partial<FormValues>) => void;
  setForm: (data: Partial<FormValues>) => void;
  resetForm: () => void;
};

export const useCreateProjectStore = create<CreateProjectState>((set) => ({
  step: 0,
  setStep: (s: number) => set({ step: s }),
  next: () => set((state) => ({ step: state.step + 1 })),
  prev: () => set((state) => ({ step: Math.max(0, state.step - 1) })),
  resetStep: () => set({ step: 0 }),
  formData: {},
  updateForm: (patch: Partial<FormValues>) =>
    set((state) => ({ formData: { ...state.formData, ...patch } })),
  setForm: (data: Partial<FormValues>) => set({ formData: data }),
  resetForm: () => set({ formData: {} }),
}));
