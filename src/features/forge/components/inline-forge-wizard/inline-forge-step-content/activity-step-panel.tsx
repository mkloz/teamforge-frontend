import { Step1Activity } from "@/features/forge/components/steps/step1-activity";

import type { CurrentForgeStepProps } from "./types";

type ActivityStepPanelProps = Pick<
  CurrentForgeStepProps,
  "actions" | "activityShakeRequestId" | "fw"
>;

export function ActivityStepPanel({
  actions,
  activityShakeRequestId,
  fw,
}: ActivityStepPanelProps) {
  return (
    <Step1Activity
      forgeMode={fw.forgeMode}
      onForgeModeChange={fw.setForgeMode}
      appliedTemplateId={fw.appliedTemplateId}
      selectedActivity={fw.selectedActivity}
      onSelect={(activity) => fw.setSelectedActivity(activity)}
      onTemplateToggle={actions.toggleRecentActivityTemplate}
      shakeRequestId={activityShakeRequestId}
    />
  );
}
