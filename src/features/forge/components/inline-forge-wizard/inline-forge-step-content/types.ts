import type { ForgeWizardChildProps } from "../types";
import type { useInlineForgeStepActions } from "../use-inline-forge-step-actions";

export interface InlineForgeStepContentProps extends ForgeWizardChildProps {
  activityShakeRequestId: number;
}

export type InlineForgeStepActions = ReturnType<
  typeof useInlineForgeStepActions
>;

export interface CurrentForgeStepProps extends InlineForgeStepContentProps {
  actions: InlineForgeStepActions;
}
