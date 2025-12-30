import { createStore } from "zustand";
import { persist, createJSONStorage, type StateStorage } from "zustand/middleware";

export interface PreferencesState {
  // State
  locale: string | null; // null = use device/browser default
  onboardingComplete: boolean;

  // Actions
  setLocale: (locale: string | null) => void;
  completeOnboarding: () => void;
  resetPreferences: () => void;
}

const initialState = {
  locale: null,
  onboardingComplete: false,
};

export const createPreferencesStore = (storage: StateStorage) =>
  createStore<PreferencesState>()(
    persist(
      (set) => ({
        ...initialState,

        setLocale: (locale) => set({ locale }),
        completeOnboarding: () => set({ onboardingComplete: true }),
        resetPreferences: () => set(initialState),
      }),
      {
        name: "app-preferences",
        storage: createJSONStorage(() => storage),
      }
    )
  );

export type PreferencesStore = ReturnType<typeof createPreferencesStore>;
