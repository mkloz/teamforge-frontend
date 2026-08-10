import { Step2Plan } from "@/features/plan-creation/components/steps/step2-plan";

import type { PlanBuilderChildProps } from "../types";

export function PlanStepPanel({ fw }: PlanBuilderChildProps) {
  return (
    <Step2Plan
      coverImage={fw.coverImage}
      groupFormationMode={fw.groupFormationMode}
      onGroupFormationModeChange={fw.setGroupFormationMode}
      groupFormationScope={fw.groupFormationScope}
      hasLocalFormationCoordinates={fw.hasLocalFormationCoordinates}
      isCheckingLocalFormationCoordinates={
        fw.isCheckingLocalFormationCoordinates
      }
      onGroupFormationScopeChange={fw.setGroupFormationScope}
      planName={fw.planName}
      onPlanNameChange={fw.setPlanName}
      planDescription={fw.planDescription}
      onPlanDescriptionChange={fw.setPlanDescription}
      planDate={fw.planDate}
      onPlanDateChange={fw.setPlanDate}
      planTime={fw.planTime}
      onPlanTimeChange={fw.setPlanTime}
      planScheduleMode={fw.planScheduleMode}
      onPlanScheduleModeChange={fw.setPlanScheduleMode}
      planLocation={fw.planLocation}
      onPlanLocationChange={fw.setPlanLocation}
      planLocationLat={fw.planLocationLat}
      planLocationLng={fw.planLocationLng}
      onPlanLocationCoordinatesChange={fw.setPlanLocationCoordinates}
      locationType={fw.locationType}
      onLocationTypeChange={fw.setLocationType}
      selectedActivity={fw.selectedActivity}
    />
  );
}
