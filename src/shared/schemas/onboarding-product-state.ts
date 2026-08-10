import { z } from "zod";

export const ONBOARDING_AUTHORIZATION_POLICY_VERSION =
  "onboarding-authorization-v1";

export const productCapabilityValues = [
  "BROWSE_PUBLIC_CONTENT",
  "VIEW_PUBLIC_GROUP_PLAN",
  "VIEW_PUBLIC_PROFILE",
  "EDIT_OWN_PROFILE",
  "USE_ONBOARDING_PRACTICE",
  "CREATE_ACTIVITY",
  "CREATE_PLAN",
  "REQUEST_PLACE",
  "ACCEPT_GROUP_INVITE",
  "ACCEPT_PLAN_SEAT",
  "START_FRIENDSHIP",
  "ACCEPT_FRIEND_REQUEST",
  "SEND_DIRECT_INVITATION",
  "RECEIVE_DIRECT_INVITATION",
  "CREATE_GROUP",
  "START_GROUP_FORMATION",
  "START_INTRODUCTORY_GROUP_FORMATION",
  "RECEIVE_PROPOSAL",
  "START_DIRECT_CHAT",
  "START_GROUP_CHAT",
  "PUBLISH_PERSONALITY",
] as const;

export const onboardingDestinationValues = [
  "HOME",
  "EXPLORE",
  "START_PLAN",
  "ONBOARDING_PROFILE",
  "ONBOARDING_INTENT",
  "ONBOARDING_INTERESTS",
  "ONBOARDING_PERSONALITY",
] as const;

export const capabilityReasonValues = [
  "PROFILE_BASICS_REQUIRED",
  "INTERESTS_REQUIRED",
  "STARTER_REQUIRED",
  "FULL_ASSESSMENT_REQUIRED",
  "ASSESSMENT_OUTDATED",
  "COMPATIBILITY_NOT_ELIGIBLE",
  "FEATURE_NOT_AVAILABLE",
  "RELATIONSHIP_REQUIRED",
] as const;

const onboardingStageValues = [
  "SETUP",
  "STARTER_REQUIRED",
  "INTRODUCTORY",
  "MATCHING_READY",
  "MATCHING_PAUSED",
] as const;

const recommendedActionValues = [
  "COMPLETE_BASICS",
  "CHOOSE_INTENT",
  "CHOOSE_INTERESTS",
  "COMPLETE_STARTER",
  "REVIEW_ASSESSMENT_RESULT",
  "RESUME_FULL_ASSESSMENT",
  "COMPLETE_FULL_ASSESSMENT",
  "NONE",
] as const;

const onboardingClientPolicyCategoryValues = [
  "LEGACY_V1",
  "COMPATIBLE",
  "INCOMPATIBLE",
] as const;

export const onboardingIntentValues = [
  "BRING_A_PLAN",
  "EXPLORE_AND_JOIN",
  "BOTH_OR_UNSURE",
] as const;

const onboardingFirstMissionValues = [
  "CREATE_INTRODUCTORY_PLAN",
  "EXPLORE_RECOMMENDATIONS",
  "EXPLORE_WITH_START_PLAN_OPTION",
] as const;

export const onboardingCoachmarkCodeValues = [
  "EXPLORE",
  "START_PLAN",
  "ACTIVITY",
] as const;

export const onboardingDestinationSchema = z.enum(onboardingDestinationValues);
const productCapabilitySchema = z.enum(productCapabilityValues);
const capabilityReasonSchema = z.enum(capabilityReasonValues);

const capabilityDecisionSchema = z.discriminatedUnion("allowed", [
  z.object({
    allowed: z.literal(true),
    policyVersion: z.string().min(1),
  }),
  z.object({
    allowed: z.literal(false),
    policyVersion: z.string().min(1),
    reasonCode: capabilityReasonSchema,
  }),
]);

export const onboardingProductStateSchema = z.object({
  policyVersion: z.string().min(1),
  authorizationPolicyVersion: z.string().min(1),
  minimumCompatibleClientPolicyVersion: z.string().min(1),
  clientPolicy: z.object({
    category: z.enum(onboardingClientPolicyCategoryValues),
    declaredVersion: z.string().min(1).nullable(),
    treatmentEligible: z.boolean(),
  }),
  rollout: z.object({
    recovery: z.string().min(1),
    introductoryAccess: z.string().min(1),
    starter: z.string().min(1),
    education: z.string().min(1),
    stitchedScoring: z.string().min(1),
  }),
  requirements: z.object({
    minimumInterestCount: z.number().int().positive(),
    minimumInterestCategoryCount: z.number().int().positive(),
    fullFormVersion: z.literal("IPIP_30_V1"),
  }),
  milestones: z.object({
    basicsComplete: z.boolean(),
    intentStepComplete: z.boolean().default(true),
    interestsComplete: z.boolean(),
    starterSatisfied: z.boolean(),
    starterAnswersRetained: z.boolean(),
    fullAssessmentAccepted: z.boolean(),
    compatibilityCurrent: z.boolean(),
    reviewableAssessmentResult: z.boolean(),
    activeFullAttempt: z.boolean(),
    introductoryGroupFormationAvailable: z.boolean().default(false),
    introductoryGroupFormationUsed: z.boolean().default(false),
  }),
  stage: z.enum(onboardingStageValues),
  safeDefaultDestination: onboardingDestinationSchema,
  recommendedAction: z.object({
    code: z.enum(recommendedActionValues),
    routeCode: onboardingDestinationSchema,
  }),
  presentation: z
    .object({
      intent: z.enum(onboardingIntentValues).nullable(),
      firstMission: z.enum(onboardingFirstMissionValues),
      destination: onboardingDestinationSchema,
      coachmarkOrder: z.array(z.enum(onboardingCoachmarkCodeValues)).max(3),
    })
    .default({
      intent: null,
      firstMission: "EXPLORE_WITH_START_PLAN_OPTION",
      destination: "EXPLORE",
      coachmarkOrder: ["EXPLORE", "START_PLAN", "ACTIVITY"],
    }),
  capabilities: z.record(productCapabilitySchema, capabilityDecisionSchema),
});

export type OnboardingDestination = z.infer<typeof onboardingDestinationSchema>;
export type ProductCapability = z.infer<typeof productCapabilitySchema>;
export type ProductCapabilityReason = z.infer<typeof capabilityReasonSchema>;
export type OnboardingProductState = z.infer<
  typeof onboardingProductStateSchema
>;
