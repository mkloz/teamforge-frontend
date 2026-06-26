import type { ComponentType } from "react";

import {
  Step1FooterAction,
  Step2FooterAction,
  Step3FooterAction,
  Step4FooterAction,
  Step5FailedFooterAction,
  Step5SuccessFooterAction,
  Step6FooterAction,
  Step7FooterAction,
} from "./footer-step-actions";
import type { ForgeFooterChildProps } from "./types";

type FooterActionComponent = ComponentType<ForgeFooterChildProps>;
type ForgeFooterStep = ForgeFooterChildProps["fw"]["step"];

const FOOTER_ACTION_BY_STEP = new Map<ForgeFooterStep, FooterActionComponent>([
  [2, Step2FooterAction],
  [3, Step3FooterAction],
  [4, Step4FooterAction],
  [6, Step6FooterAction],
  [7, Step7FooterAction],
]);

interface FooterActionProps extends ForgeFooterChildProps {
  continuePulse: boolean;
  onDisabledStep1Continue: () => void;
}

export function FooterAction({
  continuePulse,
  fw,
  onDisabledStep1Continue,
}: FooterActionProps) {
  if (fw.step === 1) {
    return (
      <Step1FooterAction
        continuePulse={continuePulse}
        fw={fw}
        onDisabledStep1Continue={onDisabledStep1Continue}
      />
    );
  }

  if (fw.step === 5) {
    return renderStep5FooterAction(fw);
  }

  const StepFooterAction = getStepFooterAction(fw.step);

  if (StepFooterAction) {
    return <StepFooterAction fw={fw} />;
  }

  return null;
}

function renderStep5FooterAction(fw: ForgeFooterChildProps["fw"]) {
  if (fw.forgeResult === "SUCCESS") {
    return <Step5SuccessFooterAction fw={fw} />;
  }

  if (fw.forgeResult === "FAILED") {
    return <Step5FailedFooterAction fw={fw} />;
  }

  return null;
}

function getStepFooterAction(
  step: ForgeFooterStep,
): FooterActionComponent | null {
  return FOOTER_ACTION_BY_STEP.get(step) ?? null;
}
