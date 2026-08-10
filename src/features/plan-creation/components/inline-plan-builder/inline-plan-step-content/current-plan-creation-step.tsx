import type { ReactNode } from "react";
import { ActivityStepPanel } from "./activity-step-panel";
import { GroupStepPanel } from "./group-step-panel";
import { IdentityStepPanel } from "./identity-step-panel";
import { InviteStepPanel } from "./invite-step-panel";
import { PlanStepPanel } from "./plan-step-panel";
import { ResultStepPanel } from "./result-step-panel";
import { TemplatesStepPanel } from "./templates-step-panel";
import type { CurrentPlanCreationStepProps } from "./types";

type PlanCreationStepRenderer = (
  props: CurrentPlanCreationStepProps,
) => ReactNode;

const PLAN_CREATION_STEP_RENDERERS = {
  1: renderActivityStep,
  2: renderTemplatesStep,
  3: renderPlanStep,
  4: renderGroupStep,
  5: renderResultStep,
  6: renderIdentityStep,
  7: renderInviteStep,
} satisfies Record<number, PlanCreationStepRenderer>;

export function CurrentPlanCreationStep(props: CurrentPlanCreationStepProps) {
  const renderStep =
    PLAN_CREATION_STEP_RENDERERS[props.fw.step] ?? renderEmptyStep;

  return renderStep(props);
}

function renderActivityStep({
  actions,
  activityShakeRequestId,
  fw,
}: CurrentPlanCreationStepProps) {
  return (
    <ActivityStepPanel
      actions={actions}
      activityShakeRequestId={activityShakeRequestId}
      fw={fw}
    />
  );
}

function renderTemplatesStep({ actions, fw }: CurrentPlanCreationStepProps) {
  return <TemplatesStepPanel actions={actions} fw={fw} />;
}

function renderPlanStep({ fw }: CurrentPlanCreationStepProps) {
  return <PlanStepPanel fw={fw} />;
}

function renderGroupStep({ fw }: CurrentPlanCreationStepProps) {
  return <GroupStepPanel fw={fw} />;
}

function renderResultStep({ actions, fw }: CurrentPlanCreationStepProps) {
  return <ResultStepPanel actions={actions} fw={fw} />;
}

function renderIdentityStep({ fw }: CurrentPlanCreationStepProps) {
  return <IdentityStepPanel fw={fw} />;
}

function renderInviteStep({ fw }: CurrentPlanCreationStepProps) {
  return <InviteStepPanel fw={fw} />;
}

function renderEmptyStep() {
  return null;
}
