import { ActivityStepPanel } from "./activity-step-panel";
import { GroupStepPanel } from "./group-step-panel";
import { IdentityStepPanel } from "./identity-step-panel";
import { InviteStepPanel } from "./invite-step-panel";
import { PlanStepPanel } from "./plan-step-panel";
import { ResultStepPanel } from "./result-step-panel";
import { TemplatesStepPanel } from "./templates-step-panel";
import type { CurrentForgeStepProps } from "./types";

export function CurrentForgeStep({
  actions,
  activityShakeRequestId,
  fw,
}: CurrentForgeStepProps) {
  if (fw.step === 1) {
    return (
      <ActivityStepPanel
        actions={actions}
        activityShakeRequestId={activityShakeRequestId}
        fw={fw}
      />
    );
  }

  if (fw.step === 2) {
    return <TemplatesStepPanel actions={actions} fw={fw} />;
  }

  if (fw.step === 3) {
    return <PlanStepPanel fw={fw} />;
  }

  if (fw.step === 4) {
    return <GroupStepPanel fw={fw} />;
  }

  if (fw.step === 5) {
    return <ResultStepPanel actions={actions} fw={fw} />;
  }

  if (fw.step === 6) {
    return <IdentityStepPanel fw={fw} />;
  }

  if (fw.step === 7) {
    return <InviteStepPanel fw={fw} />;
  }

  return null;
}
