import { InstallDeviceSwitch } from "@/features/download/components/install-steps/device-switch";
import { InstallStepsContent } from "@/features/download/components/install-steps/install-steps-content";
import { NativeInstallCallout } from "@/features/download/components/install-steps/native-install-callout";
import type { DeviceStepConfig } from "@/features/download/data/download-install-steps";
import type {
  DownloadPageViewState,
  InstallState,
  SelectedDevice,
} from "@/features/download/download-page-view-state";

interface InstallStepsSectionProps {
  installState: InstallState;
  onInstallClick: () => void;
  onSelectedDeviceChange: (value: SelectedDevice) => void;
  selectedDevice: SelectedDevice;
  stepConfig: DeviceStepConfig | null;
  viewState: DownloadPageViewState;
}

export function InstallStepsSection({
  installState,
  onInstallClick,
  onSelectedDeviceChange,
  selectedDevice,
  stepConfig,
  viewState,
}: InstallStepsSectionProps) {
  return (
    <section
      id="install-steps"
      className="bg-canvas"
      aria-label="How to install"
    >
      <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
        <div className="mb-3">
          <p className="mb-3 font-semibold text-muted-foreground text-xs">
            Step-by-step
          </p>
          <h2 className="font-extrabold text-3xl text-ink sm:text-4xl">
            {viewState.installStepsHeading}
          </h2>
          {stepConfig?.subheading && (
            <p className="mt-3 max-w-xl text-pretty text-slate-muted leading-relaxed">
              {stepConfig.subheading}
            </p>
          )}
        </div>

        <InstallDeviceSwitch
          selectedDevice={selectedDevice}
          onSelectedDeviceChange={onSelectedDeviceChange}
        />

        {viewState.canUseNativePrompt && (
          <NativeInstallCallout
            installState={installState}
            feedback={viewState.feedback}
            onInstallClick={onInstallClick}
          />
        )}

        <InstallStepsContent stepConfig={stepConfig} viewState={viewState} />
      </div>
    </section>
  );
}
