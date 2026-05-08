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

export function ProfileStepAction({ nextStep }: ProfileStepActionProps) {
  if (nextStep.kind === "security") {
    return (
      <Link {...buildSettingsNavigation("security")}>{nextStep.label}</Link>
    );
  }

  if (nextStep.kind === "account") {
    return (
      <Link {...buildSettingsNavigation("account")}>{nextStep.label}</Link>
    );
  }

  if (nextStep.kind === "personality") {
    return (
      <Link {...buildPersonalityEditNavigation({ returnTo: "/home" })}>
        {nextStep.label}
      </Link>
    );
  }

  return (
    <Link {...buildInterestsEditNavigation({ returnTo: "/home" })}>
      {nextStep.label}
    </Link>
  );
}
