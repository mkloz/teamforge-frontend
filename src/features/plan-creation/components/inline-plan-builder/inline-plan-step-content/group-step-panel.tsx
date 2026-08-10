import { Step3Group } from "@/features/plan-creation/components/steps/step3-group";

import type { PlanBuilderChildProps } from "../types";

export function GroupStepPanel({ fw }: PlanBuilderChildProps) {
  return (
    <Step3Group
      groupFormationMode={fw.groupFormationMode}
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
      groupFormationScope={fw.groupFormationScope}
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
