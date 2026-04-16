import { create } from "zustand";

interface ForgeStore {
  isWizardActive: boolean;
  setIsWizardActive: (active: boolean) => void;
  openWizard: () => void;
  closeWizard: () => void;
}

export const useForgeStore = create<ForgeStore>((set) => ({
  isWizardActive: false,
  setIsWizardActive: (active) => set({ isWizardActive: active }),
  openWizard: () => set({ isWizardActive: true }),
  closeWizard: () => set({ isWizardActive: false }),
}));
