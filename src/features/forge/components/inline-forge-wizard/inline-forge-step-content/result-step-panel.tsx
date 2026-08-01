import { SearchStarted } from "@/features/forge/components/steps/search-started";
import { Step4Failed } from "@/features/forge/components/steps/step4-failed";
import { Step4Success } from "@/features/forge/components/steps/step4-success";

import type { CurrentForgeStepProps } from "./types";

type ResultStepPanelProps = Pick<CurrentForgeStepProps, "actions" | "fw">;

export function ResultStepPanel({ actions, fw }: ResultStepPanelProps) {
  if (fw.forgeResult === "SEARCHING") {
    return <SearchStarted activityTitle={fw.selectedActivity ?? fw.planName} />;
  }

  if (fw.forgeResult === "SUCCESS") {
    return (
      <Step4Success
        groupId={fw.groupId}
        groupName={fw.groupName}
        inviteCopied={fw.inviteCopied}
        manualInviteeIds={fw.manualInviteeIds}
        locationType={fw.locationType}
        onCopyLink={fw.handleCopyLink}
        onManualInviteeToggle={fw.handleResultInviteeToggle}
        planTitle={fw.planName}
        planDate={fw.planDate}
        planLocation={fw.planLocation}
        planScheduleMode={fw.planScheduleMode}
        planTime={fw.planTime}
        participants={fw.participants}
        removedIds={fw.removedIds}
        targetSize={fw.forgeMode === "AUTO" ? fw.autoMaxSize : fw.fixedSize}
        onRemoveParticipant={fw.handleRemoveParticipant}
        onRestoreParticipant={fw.handleRestoreParticipant}
        onReforge={fw.handleReforge}
      />
    );
  }

  if (fw.forgeResult === "FAILED") {
    return (
      <Step4Failed
        forgeMode={fw.forgeMode}
        onSwitchToManual={actions.switchFailedForgeToManual}
      />
    );
  }

  return null;
}
