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
      onGroupNameChange={fw.setGroupName}
      groupDescription={fw.groupDescription}
      onGroupDescriptionChange={fw.setGroupDescription}
      manualInviteeIds={fw.manualInviteeIds}
      onManualInviteeToggle={fw.toggleManualInvitee}
      selectedActivity={fw.selectedActivity}
    />
  );
}
