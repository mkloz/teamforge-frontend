import { InviteLinkSection } from "@/features/plan-creation/components/steps/step6-invite/invite-link-section";

import { ParticipantsSection } from "./participants-section";
import { SuccessHero } from "./success-hero";
import type { Step4SuccessProps } from "./types";

export function Step4Success({
  groupId,
  groupName,
  inviteCopied,
  manualInviteeIds,
  locationType,
  onCopyLink,
  onManualInviteeToggle,
  planTitle,
  planDate,
  planLocation,
  planScheduleMode,
  planTime,
  participants,
  removedIds,
  targetSize,
  onRemoveParticipant,
  onRestoreParticipant,
  onRevisePlan,
}: Step4SuccessProps) {
  return (
    <div className="flex flex-col gap-5 pb-10">
      <SuccessHero
        groupName={groupName}
        locationType={locationType}
        planTitle={planTitle}
        planDate={planDate}
        planLocation={planLocation}
        planScheduleMode={planScheduleMode}
        planTime={planTime}
        participants={participants}
        removedIds={removedIds}
        inviteeCount={manualInviteeIds.length}
        targetSize={targetSize}
      />
      <ParticipantsSection
        groupId={groupId}
        manualInviteeIds={manualInviteeIds}
        participants={participants}
        removedIds={removedIds}
        targetSize={targetSize}
        onManualInviteeToggle={onManualInviteeToggle}
        onRemoveParticipant={onRemoveParticipant}
        onRestoreParticipant={onRestoreParticipant}
        onRevisePlan={onRevisePlan}
      />
      <InviteLinkSection
        className="mt-0"
        groupId={groupId}
        inviteCopied={inviteCopied}
        heading="Invite someone yourself"
        description="Copy the group link and send it to anyone you want to add."
        onCopyLink={onCopyLink}
      />
    </div>
  );
}

export type { Step4SuccessProps } from "./types";
