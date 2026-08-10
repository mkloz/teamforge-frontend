import { Step6Invite } from "@/features/plan-creation/components/steps/step6-invite";

import type { PlanBuilderChildProps } from "../types";

export function InviteStepPanel({ fw }: PlanBuilderChildProps) {
  const inviteCounts = getInviteStepCounts({
    activeParticipantCount: fw.activeParticipants.length,
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
      groupFormationMode={fw.groupFormationMode}
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
  manualInviteeCount: number;
}

function getInviteStepCounts({
  activeParticipantCount,
  manualInviteeCount,
}: InviteStepCountParams) {
  return {
    inviteeCount: manualInviteeCount,
    participantCount: activeParticipantCount + manualInviteeCount + 1,
  };
}
