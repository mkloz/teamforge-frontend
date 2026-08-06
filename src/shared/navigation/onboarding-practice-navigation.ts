export const onboardingPracticeReturnTargets = ["/home", "/explore"] as const;

export type OnboardingPracticeReturnTarget =
  (typeof onboardingPracticeReturnTargets)[number];

export interface OnboardingPracticeSearch {
  returnTo: OnboardingPracticeReturnTarget;
}

export function validateOnboardingPracticeSearch(
  search: Record<string, unknown>,
): OnboardingPracticeSearch {
  const returnTo = typeof search.returnTo === "string" ? search.returnTo : null;

  return {
    returnTo: isOnboardingPracticeReturnTarget(returnTo)
      ? returnTo
      : "/explore",
  };
}

function isOnboardingPracticeReturnTarget(
  value: string | null,
): value is OnboardingPracticeReturnTarget {
  return onboardingPracticeReturnTargets.some((target) => target === value);
}

export function buildOnboardingPracticeNavigation(
  returnTo: OnboardingPracticeReturnTarget = "/explore",
) {
  return {
    to: "/practice" as const,
    search: { returnTo },
  };
}
