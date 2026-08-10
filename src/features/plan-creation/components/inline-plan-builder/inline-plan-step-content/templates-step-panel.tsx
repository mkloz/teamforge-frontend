import { Step2Templates } from "@/features/plan-creation/components/steps/step2-templates";

import type { CurrentPlanCreationStepProps } from "./types";

type TemplatesStepPanelProps = Pick<
  CurrentPlanCreationStepProps,
  "actions" | "fw"
>;

export function TemplatesStepPanel({ actions, fw }: TemplatesStepPanelProps) {
  return (
    <Step2Templates
      appliedTemplateId={fw.appliedTemplateId}
      selectedActivity={fw.selectedActivity}
      onStartBlank={actions.startBlankPlan}
      onTemplateSelect={actions.selectStepTemplate}
    />
  );
}
