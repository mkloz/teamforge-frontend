import type { HomeViewer } from "@/features/home/lib/home-contract";
import {
  buildInterestsEditNavigation,
  buildPersonalityEditNavigation,
} from "@/features/onboarding/lib/onboarding-route";
import { buildSettingsNavigation } from "@/features/settings/lib/settings-route";

export function getProfileStepNavigation(
  nextStep: NonNullable<HomeViewer["nextStep"]>,
) {
  if (nextStep.kind === "security") {
    return buildSettingsNavigation("security");
  }

  if (nextStep.kind === "account") {
    return buildSettingsNavigation("account");
  }

  if (nextStep.kind === "personality") {
    return buildPersonalityEditNavigation({ returnTo: "/home" });
  }

  return buildInterestsEditNavigation({ returnTo: "/home" });
}
