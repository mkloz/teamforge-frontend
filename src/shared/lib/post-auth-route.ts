import type { User } from "@/shared/schemas";
import type {
  OnboardingDestination,
  OnboardingProductState,
} from "@/shared/schemas/onboarding-product-state";

const OCEAN_SCORE_FIELDS = [
  "oceanO",
  "oceanC",
  "oceanE",
  "oceanA",
  "oceanN",
] as const;

type PostAuthOnboardingPath =
  | "/onboarding/profile"
  | "/onboarding/personality"
  | "/onboarding/interests";

interface PostAuthRedirectRule {
  path: PostAuthOnboardingPath;
  shouldRedirect: (user: User) => boolean;
}

function isMissingProfileBasics(user: User) {
  return user.age === null || user.gender === null || !user.city?.trim();
}

function isMissingPersonality(user: User) {
  if (user.personalitySetupComplete !== undefined) {
    return !user.personalitySetupComplete;
  }

  return (
    !user.personalityType ||
    OCEAN_SCORE_FIELDS.some((field) => user[field] === null)
  );
}

function isMissingInterests(user: User) {
  return !user.interests?.length;
}

const POST_AUTH_REDIRECT_RULES: PostAuthRedirectRule[] = [
  {
    path: "/onboarding/profile",
    shouldRedirect: isMissingProfileBasics,
  },
  {
    path: "/onboarding/personality",
    shouldRedirect: isMissingPersonality,
  },
  {
    path: "/onboarding/interests",
    shouldRedirect: isMissingInterests,
  },
];

export function getPostAuthRedirectPath(user: User | null | undefined) {
  if (!user) {
    return "/auth/login" as const;
  }

  const redirectRule = POST_AUTH_REDIRECT_RULES.find((rule) =>
    rule.shouldRedirect(user),
  );

  return redirectRule?.path ?? ("/home" as const);
}

const PRODUCT_DESTINATION_PATHS = {
  HOME: "/home",
  EXPLORE: "/explore",
  START_PLAN: "/plans/new",
  ONBOARDING_PROFILE: "/onboarding/profile",
  ONBOARDING_INTENT: "/onboarding/intent",
  ONBOARDING_INTERESTS: "/onboarding/interests",
  ONBOARDING_PERSONALITY: "/onboarding/personality",
} as const satisfies Record<OnboardingDestination, string>;

export function getProductStateRedirectPath(
  productState: Pick<OnboardingProductState, "safeDefaultDestination">,
) {
  return PRODUCT_DESTINATION_PATHS[productState.safeDefaultDestination];
}
