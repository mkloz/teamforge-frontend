import { apiClient } from "@/shared/api/api";
import type { OnboardingProductState } from "@/shared/schemas/onboarding-product-state";

export const onboardingObservationEventNames = {
  draftAvailable: "DRAFT_RECOVERY_AVAILABLE",
  draftResumed: "DRAFT_RECOVERY_RESUMED",
  draftDiscarded: "DRAFT_RECOVERY_DISCARDED",
  educationDecision: "EDUCATION_NUDGE_DECIDED",
  practiceTaskCompleted: "PRACTICE_TASK_COMPLETED",
  screenViewed: "ONBOARDING_SCREEN_VIEWED",
} as const;

type OnboardingObservationEventName =
  (typeof onboardingObservationEventNames)[keyof typeof onboardingObservationEventNames];
type OnboardingObservationOutcome =
  | "SHOWN"
  | "SELECTED"
  | "COMPLETED"
  | "DISMISSED"
  | "SKIPPED"
  | "REPLAYED"
  | "RESUMED"
  | "DISCARDED"
  | "SUCCEEDED"
  | "FAILED";
type OnboardingObservationRoute = "ONBOARDING_PERSONALITY" | "EXPLORE" | "HOME";

type OnboardingExposureTreatment = "RECOVERY" | "EDUCATION";

export type OnboardingPracticeTaskCode =
  | "NAVIGATION"
  | "GROUP_AND_PLAN"
  | "WAYS_TO_JOIN"
  | "PLAN_CHANGES"
  | "PRIVACY_AND_SAFETY";

interface RecordOnboardingObservationInput {
  eventName: OnboardingObservationEventName;
  experimentVersion?: "ONB-GATE-RECOVERY-V1" | "ONB-GATE-EDUCATION-V1";
  outcomeCode?: OnboardingObservationOutcome;
  productState: OnboardingProductState;
  routeCode?: OnboardingObservationRoute;
  taskCode?: OnboardingPracticeTaskCode;
  tutorialVersion?: "education-v1";
}

/** Best-effort, bounded observation. Product behavior never depends on it. */
export async function recordOnboardingObservation({
  eventName,
  experimentVersion,
  outcomeCode,
  productState,
  routeCode,
  taskCode,
  tutorialVersion,
}: RecordOnboardingObservationInput) {
  const response = await apiClient.post("onboarding/events", {
    json: {
      events: [
        {
          eventName,
          operationId: crypto.randomUUID(),
          policyVersion: productState.policyVersion,
          stage: productState.stage,
          ...(routeCode ? { routeCode } : {}),
          ...(tutorialVersion ? { tutorialVersion } : {}),
          ...(experimentVersion ? { experimentVersion } : {}),
          ...(outcomeCode ? { outcomeCode } : {}),
          ...(taskCode ? { taskCode } : {}),
          clientOccurredAt: new Date().toISOString(),
        },
      ],
    },
  });
  return response;
}

/** Claims first exposure only after treatment-specific UI is actually visible. */
export async function recordOnboardingExposure({
  routeCode,
  treatment,
}: {
  routeCode: OnboardingObservationRoute;
  treatment: OnboardingExposureTreatment;
}) {
  const response = await apiClient.post("onboarding/exposures", {
    json: {
      routeCode,
      treatment,
    },
  });
  return response;
}
