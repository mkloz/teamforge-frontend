import type { HomeViewer } from "@/features/home/lib/home-contract";
import type { User } from "@/shared/schemas";

type HomeViewerNextStep = NonNullable<HomeViewer["nextStep"]>;

interface ViewerNextStepRule {
  getNextStep: () => HomeViewerNextStep;
  isActive: (user: User) => boolean;
}

const OCEAN_PROFILE_KEYS = [
  "oceanO",
  "oceanC",
  "oceanE",
  "oceanA",
  "oceanN",
] as const satisfies readonly (keyof User)[];

const VIEWER_NEXT_STEP_RULES = [
  {
    isActive: isMissingEmailVerification,
    getNextStep: getSecurityNextStep,
  },
  {
    isActive: isMissingProfileBasics,
    getNextStep: getAccountNextStep,
  },
  {
    isActive: isMissingPersonalityProfile,
    getNextStep: getPersonalityNextStep,
  },
  {
    isActive: isMissingInterests,
    getNextStep: getInterestsNextStep,
  },
] as const satisfies readonly ViewerNextStepRule[];

function hasCompleteOceanProfile(user: User) {
  return OCEAN_PROFILE_KEYS.every((key) => user[key] !== null);
}

function isMissingEmailVerification(user: User) {
  return !user.emailVerified;
}

function isMissingProfileBasics(user: User) {
  return !user.bio || !user.city || user.age === null;
}

function isMissingPersonalityProfile(user: User) {
  return !user.personalityType || !hasCompleteOceanProfile(user);
}

function isMissingInterests(user: User) {
  return !(user.interests?.length ?? 0);
}

function getViewerNextStep(user?: User | null): HomeViewerNextStep | null {
  if (!user) {
    return null;
  }

  const nextStepRule = VIEWER_NEXT_STEP_RULES.find((rule) =>
    rule.isActive(user),
  );

  return nextStepRule?.getNextStep() ?? null;
}

function getSecurityNextStep(): HomeViewerNextStep {
  return {
    kind: "security",
    title: "Secure your account",
    body: "Check your verification and recovery settings before you start building new groups.",
    label: "Open security",
  };
}

function getAccountNextStep(): HomeViewerNextStep {
  return {
    kind: "account",
    title: "Finish your public profile",
    body: "Add the missing basics people rely on when they open your profile.",
    label: "Complete profile",
  };
}

function getPersonalityNextStep(): HomeViewerNextStep {
  return {
    kind: "personality",
    title: "Complete your personality profile",
    body: "Your forge results get sharper once your personality data is fully calibrated.",
    label: "Update personality",
  };
}

function getInterestsNextStep(): HomeViewerNextStep {
  return {
    kind: "interests",
    title: "Add your interests",
    body: "Interests help TeamForge connect you with groups that actually fit your energy.",
    label: "Choose interests",
  };
}

export function getHomeViewer(user?: User | null): HomeViewer {
  return {
    firstName: user?.name.trim().split(/\s+/)[0] ?? "there",
    mbti: user?.personalityType ?? null,
    nextStep: getViewerNextStep(user),
  };
}
