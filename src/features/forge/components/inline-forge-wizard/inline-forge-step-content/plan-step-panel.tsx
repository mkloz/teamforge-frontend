import { Step2Plan } from "@/features/forge/components/steps/step2-plan";

import type { ForgeWizardChildProps } from "../types";

export function PlanStepPanel({ fw }: ForgeWizardChildProps) {
  return (
    <Step2Plan
      forgeMode={fw.forgeMode}
      forgeScope={fw.forgeScope}
      onForgeScopeChange={fw.setForgeScope}
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
    />
  );
}
