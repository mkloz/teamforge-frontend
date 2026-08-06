import type { HomeSetupStep } from "@/features/home/lib/home-contract";
import {
  buildInterestsEditNavigation,
  buildPersonalityEditNavigation,
} from "@/shared/navigation";
import { buildSettingsNavigation } from "@/shared/navigation/settings-navigation";

export function getHomeSetupNavigation(step: HomeSetupStep) {
  if (step.kind === "security") {
    return buildSettingsNavigation("security");
  }

  if (step.kind === "account") {
    return buildSettingsNavigation("account");
  }

  if (step.kind === "personality") {
    return buildPersonalityEditNavigation({ returnTo: "/home" });
  }

  return buildInterestsEditNavigation({ returnTo: "/home" });
}
