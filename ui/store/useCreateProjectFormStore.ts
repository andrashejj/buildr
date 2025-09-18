import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import {
  Step1Values,
  Step2Values,
  Step3Values,
  StepReviewValues,
} from '@/components/create-project/schema';

const stepVariant: Record<number, 'step1' | 'step2' | 'step3' | 'step4'> = {
  1: 'step1',
  2: 'step2',
  3: 'step3',
  4: 'step4',
};

type setDataType =
  | { step: 1; data: Step1Values }
  | { step: 2; data: Step2Values }
  | { step: 3; data: Step3Values }
  | { step: 4; data: StepReviewValues };

type FormStore = {
  step1: Step1Values | null;
  step2: Step2Values | null;
  step3: Step3Values | null;
  step4: StepReviewValues | null;
  setData: ({ step, data }: setDataType) => void;
};

export const useCreateProjectFormStore = create<FormStore>()(
  devtools(
    (set) => ({
      step1: null,
      step2: null,
      step3: null,
      step4: null,
      setData: ({ step, data }: setDataType) => {
        set((state) => ({
          ...state,
          [stepVariant[step]]: data,
        }));
      },
    }),
    { name: 'user-store' }
  )
);
