import { FirefoxNotice } from "@/features/download/components/install-steps/firefox-notice";
import { InstallStep } from "@/features/download/components/install-steps/install-step-row";
import { IosNonSafariNotice } from "@/features/download/components/install-steps/ios-non-safari-notice";
import type { DeviceStepConfig } from "@/features/download/data/download-install-steps";
import type { DownloadPageViewState } from "@/features/download/download-page-view-state";

interface InstallStepsContentProps {
  stepConfig: DeviceStepConfig | null;
  viewState: DownloadPageViewState;
}

export function InstallStepsContent({
  stepConfig,
  viewState,
}: InstallStepsContentProps) {
  if (viewState.showIosNonSafariNotice) {
    return <IosNonSafariNotice />;
  }

  if (viewState.showFirefoxNotice) {
    return <FirefoxNotice />;
  }

  if (!stepConfig) {
    return null;
  }

  return (
    <ol className="divide-y divide-border/60" aria-label="Installation steps">
      {stepConfig.steps.map((step, i) => (
        <InstallStep key={step.title} step={step} index={i + 1} />
      ))}
    </ol>
  );
}
