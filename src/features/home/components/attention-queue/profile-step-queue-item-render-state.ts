import type { HomeViewer } from "@/features/home/lib/home-contract";

import { getProfileStepMeta } from "./attention-queue-formatters";
import { getProfileStepNavigation } from "./profile-step-action";

export function getProfileStepQueueItemRenderState(
  nextStep: NonNullable<HomeViewer["nextStep"]>,
) {
  return {
    navigation: getProfileStepNavigation(nextStep),
    stepMeta: getProfileStepMeta(nextStep),
  };
}
