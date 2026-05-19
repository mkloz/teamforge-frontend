import { Step3Group } from "@/features/forge/components/steps/step3-group";

import type { ForgeWizardChildProps } from "../types";

export function GroupStepPanel({ fw }: ForgeWizardChildProps) {
  return (
    <Step3Group
      forgeMode={fw.forgeMode}
      onForgeModeChange={fw.setForgeMode}
      fixedSize={fw.fixedSize}
      onFixedSizeChange={fw.setFixedSize}
      groupSizeMode={fw.groupSizeMode}
      onGroupSizeModeChange={fw.setGroupSizeMode}
      autoMinSize={fw.autoMinSize}
      autoMaxSize={fw.autoMaxSize}
      onAutoSizeRangeChange={fw.setAutoSizeRange}
      locationType={fw.locationType}
      compatibilityWeight={fw.compatibilityWeight}
      onCompatibilityWeightChange={fw.setCompatibilityWeight}
      diversityWeight={fw.diversityWeight}
      onDiversityWeightChange={fw.setDiversityWeight}
      networkReachWeight={fw.networkReachWeight}
      onNetworkReachWeightChange={fw.setNetworkReachWeight}
      maxDistanceKm={fw.maxDistanceKm}
      onMaxDistanceKmChange={fw.setMaxDistanceKm}
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
