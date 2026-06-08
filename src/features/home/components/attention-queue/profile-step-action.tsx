import { Link } from "@tanstack/react-router";
import type { HomeViewer } from "@/features/home/lib/home-contract";
import {
  buildInterestsEditNavigation,
  buildPersonalityEditNavigation,
} from "@/features/onboarding/lib/onboarding-route";
import { buildSettingsNavigation } from "@/features/settings/lib/settings-route";

interface ProfileStepActionProps {
  nextStep: NonNullable<HomeViewer["nextStep"]>;
}

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

export function ProfileStepAction({ nextStep }: ProfileStepActionProps) {
  return <Link {...getProfileStepNavigation(nextStep)}>{nextStep.label}</Link>;
}
