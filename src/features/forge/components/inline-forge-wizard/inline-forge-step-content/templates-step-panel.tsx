import { Step2Templates } from "@/features/forge/components/steps/step2-templates";

import type { CurrentForgeStepProps } from "./types";

type TemplatesStepPanelProps = Pick<CurrentForgeStepProps, "actions" | "fw">;

export function TemplatesStepPanel({ actions, fw }: TemplatesStepPanelProps) {
  return (
    <Step2Templates
      appliedTemplateId={fw.appliedTemplateId}
      selectedActivity={fw.selectedActivity}
      onTemplateToggle={actions.toggleStepTemplate}
      onStartBlank={actions.startBlankPlan}
    />
  );
}
