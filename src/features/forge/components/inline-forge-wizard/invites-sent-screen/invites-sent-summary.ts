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
    displayGroupName: fw.groupName.trim() || fw.planName.trim() || "Your group",
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
  return [
    {
      label: isManual ? "Invited" : "Members",
      value: isManual
        ? `${inviteCount} friend${inviteCount !== 1 ? "s" : ""}`
        : `${memberCount} people`,
    },
    {
      label: "Plan",
      value: planName,
    },
  ];
}
