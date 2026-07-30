import { Step3Group } from "@/features/forge/components/steps/step3-group";

import type { ForgeWizardChildProps } from "../types";

export function GroupStepPanel({ fw }: ForgeWizardChildProps) {
  return (
    <Step3Group
      forgeMode={fw.forgeMode}
      fixedSize={fw.fixedSize}
      onFixedSizeChange={fw.setFixedSize}
      autoMinSize={fw.autoMinSize}
      autoMaxSize={fw.autoMaxSize}
      onAutoSizeRangeChange={fw.setAutoSizeRange}
      visibility={fw.visibility}
      onVisibilityChange={fw.setVisibility}
      groupName={fw.groupName}
      groupDescription={fw.groupDescription}
      manualInviteeIds={fw.manualInviteeIds}
      onManualInviteeToggle={fw.toggleManualInvitee}
      selectedActivity={fw.selectedActivity}
      coverImage={fw.coverImage}
      forgeScope={fw.forgeScope}
      locationType={fw.locationType}
      planDate={fw.planDate}
      planDescription={fw.planDescription}
      planLocation={fw.planLocation}
      planName={fw.planName}
      planScheduleMode={fw.planScheduleMode}
      planTime={fw.planTime}
    />
  );
}
