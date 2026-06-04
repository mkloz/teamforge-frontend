import { Step6Invite } from "@/features/forge/components/steps/step6-invite";

import type { ForgeWizardChildProps } from "../types";

export function InviteStepPanel({ fw }: ForgeWizardChildProps) {
  const inviteCounts = getInviteStepCounts({
    activeParticipantCount: fw.activeParticipants.length,
    isManual: fw.forgeMode === "MANUAL",
    manualInviteeCount: fw.manualInviteeIds.length,
  });

  return (
    <Step6Invite
      planTitle={fw.planName}
      planDate={fw.planDate}
      planLocation={fw.planLocation}
      activityTitle={fw.selectedActivity || ""}
      groupName={fw.groupName}
      groupDescription={fw.groupDescription}
      participantCount={inviteCounts.participantCount}
      inviteeCount={inviteCounts.inviteeCount}
      forgeMode={fw.forgeMode}
      coverImage={fw.coverImage}
      avatarImage={fw.avatarImage}
      groupId={fw.groupId}
      inviteCopied={fw.inviteCopied}
      onCopyLink={fw.handleCopyLink}
    />
  );
}

interface InviteStepCountParams {
  activeParticipantCount: number;
  isManual: boolean;
  manualInviteeCount: number;
}

function getInviteStepCounts({
  activeParticipantCount,
  isManual,
  manualInviteeCount,
}: InviteStepCountParams) {
  return {
    inviteeCount: isManual ? manualInviteeCount : activeParticipantCount,
    participantCount: isManual
      ? manualInviteeCount + 1
      : activeParticipantCount + 1,
  };
}
