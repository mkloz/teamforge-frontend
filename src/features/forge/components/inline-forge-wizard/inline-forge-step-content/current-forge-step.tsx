import type { ReactNode } from "react";
import { ActivityStepPanel } from "./activity-step-panel";
import { GroupStepPanel } from "./group-step-panel";
import { IdentityStepPanel } from "./identity-step-panel";
import { InviteStepPanel } from "./invite-step-panel";
import { PlanStepPanel } from "./plan-step-panel";
import { ResultStepPanel } from "./result-step-panel";
import { TemplatesStepPanel } from "./templates-step-panel";
import type { CurrentForgeStepProps } from "./types";

type ForgeStepRenderer = (props: CurrentForgeStepProps) => ReactNode;

const FORGE_STEP_RENDERERS = {
  1: renderActivityStep,
  2: renderTemplatesStep,
  3: renderPlanStep,
  4: renderGroupStep,
  5: renderResultStep,
  6: renderIdentityStep,
  7: renderInviteStep,
} satisfies Record<number, ForgeStepRenderer>;

export function CurrentForgeStep(props: CurrentForgeStepProps) {
  const renderStep = FORGE_STEP_RENDERERS[props.fw.step] ?? renderEmptyStep;

  return renderStep(props);
}

function renderActivityStep({
  actions,
  activityShakeRequestId,
  fw,
}: CurrentForgeStepProps) {
  return (
    <ActivityStepPanel
      actions={actions}
      activityShakeRequestId={activityShakeRequestId}
      fw={fw}
    />
  );
}

function renderTemplatesStep({ fw }: CurrentForgeStepProps) {
  return <TemplatesStepPanel fw={fw} />;
}

function renderPlanStep({ fw }: CurrentForgeStepProps) {
  return <PlanStepPanel fw={fw} />;
}

function renderGroupStep({ fw }: CurrentForgeStepProps) {
  return <GroupStepPanel fw={fw} />;
}

function renderResultStep({ actions, fw }: CurrentForgeStepProps) {
  return <ResultStepPanel actions={actions} fw={fw} />;
}

function renderIdentityStep({ fw }: CurrentForgeStepProps) {
  return <IdentityStepPanel fw={fw} />;
}

function renderInviteStep({ fw }: CurrentForgeStepProps) {
  return <InviteStepPanel fw={fw} />;
}

function renderEmptyStep() {
  return null;
}
