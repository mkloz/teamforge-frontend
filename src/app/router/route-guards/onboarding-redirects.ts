import type { getPostAuthRedirectPath } from "@/shared/lib/post-auth-route";

type EditableOnboardingDestination =
  | "/onboarding/personality"
  | "/onboarding/interests";
type PostAuthRedirectPath =
  | ReturnType<typeof getPostAuthRedirectPath>
  | "/explore"
  | "/forge"
  | "/onboarding/intent";

export function isOnboardingEditMode(searchStr: string) {
  return new URLSearchParams(searchStr).get("mode") === "edit";
}

export function getEditableOnboardingRedirectTarget({
  canonicalDestination,
  expectedDestination,
  isEditMode,
}: {
  canonicalDestination: PostAuthRedirectPath;
  expectedDestination: EditableOnboardingDestination;
  isEditMode: boolean;
}) {
  return isEditMode
    ? getEditModeOnboardingRedirectTarget(canonicalDestination)
    : getLinearOnboardingRedirectTarget({
        canonicalDestination,
        expectedDestination,
      });
}

function getEditModeOnboardingRedirectTarget(
  canonicalDestination: PostAuthRedirectPath,
) {
  const canEditOnboardingInputs =
    canonicalDestination === "/home" ||
    canonicalDestination === "/explore" ||
    canonicalDestination === "/forge";

  return canEditOnboardingInputs ? null : canonicalDestination;
}

function getLinearOnboardingRedirectTarget({
  canonicalDestination,
  expectedDestination,
}: {
  canonicalDestination: PostAuthRedirectPath;
  expectedDestination: EditableOnboardingDestination;
}) {
  if (
    canStayOnEditableOnboardingRoute({
      canonicalDestination,
      expectedDestination,
    })
  ) {
    return null;
  }

  return canonicalDestination;
}

function canStayOnEditableOnboardingRoute({
  canonicalDestination,
  expectedDestination,
}: {
  canonicalDestination: PostAuthRedirectPath;
  expectedDestination: EditableOnboardingDestination;
}) {
  return (
    canonicalDestination === expectedDestination ||
    isReturningFromInterestsToPersonality({
      canonicalDestination,
      expectedDestination,
    })
  );
}

function isReturningFromInterestsToPersonality({
  canonicalDestination,
  expectedDestination,
}: {
  canonicalDestination: PostAuthRedirectPath;
  expectedDestination: EditableOnboardingDestination;
}) {
  return (
    expectedDestination === "/onboarding/personality" &&
    canonicalDestination === "/onboarding/interests"
  );
}
