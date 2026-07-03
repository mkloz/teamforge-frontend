import type { HomeViewer } from "@/features/home/lib/home-contract";
import {
  buildInterestsEditNavigation,
  buildPersonalityEditNavigation,
} from "@/shared/navigation";
import { buildSettingsNavigation } from "@/shared/navigation/settings-navigation";

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
