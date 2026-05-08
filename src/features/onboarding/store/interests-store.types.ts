import type { InterestsScreen } from "@/features/onboarding/data/interests-data";
import type { PersonalityType } from "@/shared/schemas/enums";

export interface InterestsSnapshot {
  selectedIds: string[];
  rejectedIds: string[];
  screen: InterestsScreen;
  personalityType: PersonalityType | null;
}

export interface InterestsState extends InterestsSnapshot {
  toggle: (id: string, maxInterests: number) => void;
  toggleReject: (id: string) => void;
  setScreen: (screen: InterestsScreen) => void;
  setPersonalityType: (type: string | null) => void;
  replaceSelected: (ids: string[], maxInterests: number) => void;
  reset: () => void;
}
