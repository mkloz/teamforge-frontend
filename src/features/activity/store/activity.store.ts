import { create } from "zustand";
import { createActivityStoreActions } from "@/features/activity/store/activity-store/activity-store.actions";
import { initialActivityState } from "@/features/activity/store/activity-store/activity-store.initial-state";
import type { ActivityStore } from "@/features/activity/store/activity-store/activity-store.types";

export const useActivityStore = create<ActivityStore>((set) => ({
  ...initialActivityState,
  ...createActivityStoreActions(set),
}));
