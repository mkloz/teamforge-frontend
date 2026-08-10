import { Step1Activity } from "@/features/plan-creation/components/steps/step1-activity";

import type { CurrentPlanCreationStepProps } from "./types";

type ActivityStepPanelProps = Pick<
  CurrentPlanCreationStepProps,
  "actions" | "activityShakeRequestId" | "fw"
>;

export function ActivityStepPanel({
  actions,
  activityShakeRequestId,
  fw,
}: ActivityStepPanelProps) {
  return (
    <Step1Activity
      appliedTemplateId={fw.appliedTemplateId}
      selectedActivity={fw.selectedActivity}
      onSelect={(activity) => fw.setSelectedActivity(activity)}
      onTemplateToggle={actions.toggleRecentActivityTemplate}
      shakeRequestId={activityShakeRequestId}
    />
  );
}
