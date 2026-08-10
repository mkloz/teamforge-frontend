import type {
  HomeSetupStep,
  HomeViewer,
} from "@/features/home/lib/home-contract";
import type { User } from "@/shared/schemas";
import type { OnboardingProductState } from "@/shared/schemas/onboarding-product-state";

type HomeViewerNextStep = NonNullable<HomeViewer["nextStep"]>;

interface ViewerNextStepRule {
  getNextStep: (
    user: User,
    productState?: OnboardingProductState,
  ) => HomeViewerNextStep;
  isActive: (user: User, productState?: OnboardingProductState) => boolean;
}

const HOME_SETUP_STEP_COUNT = 6;

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
    isActive: isMissingBio,
    getNextStep: getBioNextStep,
  },
  {
    isActive: isMissingAvatar,
    getNextStep: getAvatarNextStep,
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

function isMissingProfileBasics(
  user: User,
  productState?: OnboardingProductState,
) {
  return productState
    ? !productState.milestones.basicsComplete
    : !user.age || !user.gender || !user.city?.trim();
}

function isMissingPersonalityProfile(
  user: User,
  productState?: OnboardingProductState,
) {
  return productState
    ? !productState.milestones.fullAssessmentAccepted
    : !user.personalityType || !hasCompleteOceanProfile(user);
}

function isMissingBio(user: User) {
  return !user.bio?.trim();
}

function isMissingAvatar(user: User) {
  return !user.avatar?.trim();
}

function isMissingInterests(user: User, productState?: OnboardingProductState) {
  return productState
    ? !productState.milestones.interestsComplete
    : (user.interests?.length ?? 0) < 10;
}

function getViewerSetupSteps(
  user?: User | null,
  productState?: OnboardingProductState,
): HomeSetupStep[] {
  if (!user) {
    return [];
  }

  return VIEWER_NEXT_STEP_RULES.filter((rule) =>
    rule.isActive(user, productState),
  ).map((rule) => rule.getNextStep(user, productState));
}

function getSecurityNextStep(): HomeViewerNextStep {
  return {
    id: "email",
    kind: "security",
    title: "Confirm your email",
    body: "Secure your account and receive important plan updates.",
    label: "Verify email",
  };
}

function getAccountNextStep(user: User): HomeViewerNextStep {
  const missingFields = [
    !user.age ? "age" : null,
    !user.gender ? "gender" : null,
    !user.city?.trim() ? "city" : null,
  ].filter((field): field is string => field !== null);
  const instruction = missingFields.length
    ? `Add your ${formatList(missingFields)}`
    : "Review your age, gender, and city";

  return {
    id: "basics",
    kind: "account",
    title: "Complete your profile basics",
    body: `${instruction} so people know who they may meet.`,
    label: "Add details",
  };
}

function getBioNextStep(): HomeViewerNextStep {
  return {
    id: "bio",
    kind: "account",
    title: "Introduce yourself",
    body: "Help people get to know you before making plans.",
    label: "Write bio",
  };
}

function getAvatarNextStep(): HomeViewerNextStep {
  return {
    id: "avatar",
    kind: "account",
    title: "Add a profile photo",
    body: "Help group members recognise you before you meet.",
    label: "Add photo",
  };
}

function getPersonalityNextStep(
  _user: User,
  productState?: OnboardingProductState,
): HomeViewerNextStep {
  const hasStarterAnswers = productState?.milestones.starterSatisfied ?? false;

  return {
    id: "assessment",
    kind: "personality",
    title: hasStarterAnswers
      ? "Finish your personality assessment"
      : "Start your personality assessment",
    body: hasStarterAnswers
      ? "More context for group proposals · 10–15 min"
      : "10 starter questions · about 2 min",
    label: hasStarterAnswers ? "Continue assessment" : "Start assessment",
  };
}

function getInterestsNextStep(
  _user: User,
  productState?: OnboardingProductState,
): HomeViewerNextStep {
  const minimumCount = productState?.requirements.minimumInterestCount;
  const minimumCategoryCount =
    productState?.requirements.minimumInterestCategoryCount;
  const requirement =
    minimumCount && minimumCategoryCount
      ? `${minimumCount} interests across ${minimumCategoryCount} areas`
      : "interests from different areas";

  return {
    id: "interests",
    kind: "interests",
    title: "Choose what you enjoy",
    body: `Pick ${requirement} for more relevant suggestions.`,
    label: "Choose interests",
  };
}

function formatList(values: string[]) {
  if (values.length < 2) {
    return values[0] ?? "details";
  }

  if (values.length === 2) {
    return values.join(" and ");
  }

  return `${values.slice(0, -1).join(", ")}, and ${values.at(-1)}`;
}

export function getHomeViewer(
  user?: User | null,
  productState?: OnboardingProductState,
): HomeViewer {
  const setupSteps = getViewerSetupSteps(user, productState);

  return {
    firstName: user?.name.trim().split(/\s+/)[0] ?? "there",
    mbti: user?.personalityType ?? null,
    nextStep: setupSteps[0] ?? null,
    setupCompletedCount: user ? HOME_SETUP_STEP_COUNT - setupSteps.length : 0,
    setupSteps,
    setupTotalCount: HOME_SETUP_STEP_COUNT,
  };
}
