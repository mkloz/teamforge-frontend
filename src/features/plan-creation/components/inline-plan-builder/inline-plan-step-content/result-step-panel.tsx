import { SearchStarted } from "@/features/plan-creation/components/steps/search-started";
import { Step4Failed } from "@/features/plan-creation/components/steps/step4-failed";
import { Step4Success } from "@/features/plan-creation/components/steps/step4-success";

import type { CurrentPlanCreationStepProps } from "./types";

type ResultStepPanelProps = Pick<
  CurrentPlanCreationStepProps,
  "actions" | "fw"
>;

export function ResultStepPanel({ actions, fw }: ResultStepPanelProps) {
  if (fw.groupFormationResult === "SEARCHING") {
    return <SearchStarted activityTitle={fw.selectedActivity ?? fw.planName} />;
  }

  if (fw.groupFormationResult === "SUCCESS") {
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
        targetSize={
          fw.groupFormationMode === "AUTO" ? fw.autoMaxSize : fw.fixedSize
        }
        onRemoveParticipant={fw.handleRemoveParticipant}
        onRestoreParticipant={fw.handleRestoreParticipant}
        onRevisePlan={fw.handleRevisePlan}
      />
    );
  }

  if (fw.groupFormationResult === "FAILED") {
    return (
      <Step4Failed
        groupFormationMode={fw.groupFormationMode}
        onSwitchToManual={actions.switchFailedPlanCreationToManual}
      />
    );
  }

  return null;
}
