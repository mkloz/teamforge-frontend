import {
  Step1FooterAction,
  Step2FooterAction,
  Step3FooterAction,
  Step4FooterAction,
  Step5FailedFooterAction,
  Step5SearchingFooterAction,
  Step5SuccessFooterAction,
  Step6FooterAction,
  Step7FooterAction,
} from "./footer-step-actions";
import type { PlanBuilderFooterChildProps } from "./types";

interface FooterActionProps extends PlanBuilderFooterChildProps {
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

  return renderStepFooterAction(fw);
}

function renderStepFooterAction(fw: PlanBuilderFooterChildProps["fw"]) {
  switch (fw.step) {
    case 2:
      return <Step2FooterAction fw={fw} />;
    case 3:
      return <Step3FooterAction fw={fw} />;
    case 4:
      return <Step4FooterAction fw={fw} />;
    case 6:
      return <Step6FooterAction fw={fw} />;
    case 7:
      return <Step7FooterAction fw={fw} />;
    default:
      return null;
  }
}

function renderStep5FooterAction(fw: PlanBuilderFooterChildProps["fw"]) {
  if (fw.groupFormationResult === "SUCCESS") {
    return <Step5SuccessFooterAction fw={fw} />;
  }

  if (fw.groupFormationResult === "SEARCHING") {
    return <Step5SearchingFooterAction fw={fw} />;
  }

  if (fw.groupFormationResult === "FAILED") {
    return <Step5FailedFooterAction fw={fw} />;
  }

  return null;
}
