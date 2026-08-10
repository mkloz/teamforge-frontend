import { z } from "zod";

export const groupGovernanceCapabilitiesSchema = z
  .object({
    canCancelPlanDirectly: z.boolean(),
    canCompletePlanDirectly: z.boolean(),
    canConfirmPlanDirectly: z.boolean(),
    canCreateNextPlan: z.boolean(),
    canDisbandGroup: z.boolean(),
    canEditGroupIdentity: z.boolean(),
    canInviteMembers: z.boolean(),
    canLeaveGroup: z.boolean(),
    canRemoveMembers: z.boolean(),
    canSuggestPlanChange: z.boolean(),
    canUpdatePlanDirectly: z.boolean(),
    canVoteOnPlanChange: z.boolean(),
  })
  .strict();

export const groupChatReadOnlyReasonSchema = z.enum([
  "ACCESS_RESTRICTED",
  "GROUP_CLOSED",
  "MEMBERSHIP_ENDED",
  "OPERATOR_COVERAGE_UNAVAILABLE",
  "BELOW_MINIMUM_MEMBERS",
]);

export const groupChatGovernanceSchema = z
  .object({
    mode: z.enum(["TEXT_ONLY", "READ_ONLY"]),
    writable: z.boolean(),
    readOnlyReason: groupChatReadOnlyReasonSchema.nullable(),
    capabilities: z
      .object({
        canAttachMedia: z.boolean(),
        canCreateJoinLinks: z.boolean(),
        canFetchLinkPreviews: z.boolean(),
        canForwardMessages: z.boolean(),
        canSendText: z.boolean(),
        canSendGifs: z.boolean(),
        canSendVoiceMessages: z.boolean(),
      })
      .strict(),
  })
  .strict();

export const groupGovernanceSchema = z
  .object({
    origin: z.literal("AUTOMATIC_GROUP_FORMATION"),
    mode: z.literal("SYSTEM_MANAGED"),
    capabilityPolicyVersion: z.string().min(1),
    capabilities: groupGovernanceCapabilitiesSchema,
    chat: groupChatGovernanceSchema,
  })
  .strict();

export type GroupGovernance = z.infer<typeof groupGovernanceSchema>;
export type GroupChatReadOnlyReason = z.infer<
  typeof groupChatReadOnlyReasonSchema
>;

export const NO_GROUP_GOVERNANCE_CAPABILITIES = {
  canCancelPlanDirectly: false,
  canCompletePlanDirectly: false,
  canConfirmPlanDirectly: false,
  canCreateNextPlan: false,
  canDisbandGroup: false,
  canEditGroupIdentity: false,
  canInviteMembers: false,
  canLeaveGroup: false,
  canRemoveMembers: false,
  canSuggestPlanChange: false,
  canUpdatePlanDirectly: false,
  canVoteOnPlanChange: false,
} satisfies GroupGovernance["capabilities"];

export function isSystemManagedGroupGovernance(
  governance: GroupGovernance | null | undefined,
): governance is GroupGovernance {
  return (
    governance?.origin === "AUTOMATIC_GROUP_FORMATION" &&
    governance.mode === "SYSTEM_MANAGED"
  );
}

export function hasMissingAutoGovernance({
  groupFormationMode,
  governance,
}: {
  groupFormationMode: "AUTO" | "MANUAL" | null | undefined;
  governance: GroupGovernance | null | undefined;
}) {
  return groupFormationMode === "AUTO" && governance == null;
}
