import type { ForgeWizardState } from "@/features/forge/hooks/use-forge-wizard";

import type { InvitesSentSummary, StatusFactItem } from "./types";

export function getInvitesSentSummary(
  fw: ForgeWizardState,
): InvitesSentSummary {
  const isManual = fw.forgeMode === "MANUAL";
  const inviteCount = fw.manualInviteeIds.length;
  const memberCount = isManual
    ? inviteCount + 1
    : fw.activeParticipants.length + 1;

  return {
    avatarImage: fw.avatarImage,
    coverImage: fw.coverImage,
    displayGroupName: fw.groupName.trim() || fw.planName.trim() || "Your group",
    groupDescription:
      fw.groupDescription.trim() ||
      "A shared place to plan, talk, and keep the group moving.",
    inviteCount,
    isManual,
    memberCount,
    planName: fw.planName || "Untitled plan",
  };
}

export function getStatusFacts({
  inviteCount,
  isManual,
  memberCount,
  planName,
}: InvitesSentSummary): StatusFactItem[] {
  const hasPendingInvitations = isManual && inviteCount > 0;

  return [
    {
      label: hasPendingInvitations ? "Invited" : "Members",
      value: hasPendingInvitations
        ? `${inviteCount} friend${inviteCount !== 1 ? "s" : ""}`
        : `${memberCount} ${memberCount === 1 ? "person" : "people"}`,
    },
    {
      label: "First plan",
      value: planName,
    },
  ];
}
