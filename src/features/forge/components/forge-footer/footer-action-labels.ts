import type { ForgeMode } from "@/features/forge/lib/forge-contract";

export function getStep1ContinueLabel(hasSelectedActivity: boolean) {
  return hasSelectedActivity ? "Continue to plan" : "Select a category";
}

export function getStep6ContinueLabel(hasCoverImage: boolean) {
  return hasCoverImage ? "Continue to invitations" : "I'll set this later";
}

interface Step7InviteLabelParams {
  forgeMode: ForgeMode;
  hasManualInvitees: boolean;
  isSendingInvites: boolean;
}

export function getStep7InviteLabel({
  forgeMode,
  hasManualInvitees,
  isSendingInvites,
}: Step7InviteLabelParams) {
  if (isSendingInvites) {
    return "Sending...";
  }

  return forgeMode === "AUTO" || !hasManualInvitees
    ? "Finish group"
    : "Send invitations";
}
