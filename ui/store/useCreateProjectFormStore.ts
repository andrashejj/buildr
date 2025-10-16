import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, devtools, persist } from 'zustand/middleware';

import { Step1Values, Step2Values, Step3Values } from '@/components/create-project/schema';

const stepVariant: Record<number, 'step1' | 'step2' | 'step3' | 'step4'> = {
  1: 'step1',
  2: 'step2',
  3: 'step3',
};

type setDataType =
  | { step: 1; data: Step1Values }
  | { step: 2; data: Step2Values }
  | { step: 3; data: Step3Values };

type FormStore = {
  step1: Step1Values | null;
  step2: Step2Values | null;
  step3: Step3Values | null;
  setData: ({ step, data }: setDataType) => void;
  reset: () => void;
};

export const useCreateProjectFormStore = create<FormStore>()(
  devtools(
    persist(
      (set, get, store) => ({
        step1: null,
        step2: null,
        step3: null,
        setData: ({ step, data }: setDataType) => {
          set((state) => ({
            ...state,
            [stepVariant[step]]: data,
          }));
        },
        reset: () => {
          set(store.getInitialState());
        },
      }),
      {
        name: 'user-store',
        storage: createJSONStorage(() => AsyncStorage),
      }
    )
  )
);
