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

  if (fw.step === 2) {
    return <Step2FooterAction fw={fw} />;
  }

  if (fw.step === 3) {
    return <Step3FooterAction fw={fw} />;
  }

  if (fw.step === 4) {
    return <Step4FooterAction fw={fw} />;
  }

  if (fw.step === 5 && fw.forgeResult === "SUCCESS") {
    return <Step5SuccessFooterAction fw={fw} />;
  }

  if (fw.step === 5 && fw.forgeResult === "FAILED") {
    return <Step5FailedFooterAction fw={fw} />;
  }

  if (fw.step === 6) {
    return <Step6FooterAction fw={fw} />;
  }

  if (fw.step === 7) {
    return <Step7FooterAction fw={fw} />;
  }

  return null;
}
