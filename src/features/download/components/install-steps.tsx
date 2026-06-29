import { Link } from "@tanstack/react-router";
import ClipboardCheck from "lucide-react/dist/esm/icons/clipboard-check.js";
import ClipboardCopy from "lucide-react/dist/esm/icons/clipboard-copy.js";
import Download from "lucide-react/dist/esm/icons/download.js";
import { Fragment } from "react";
import {
  type DeviceStepConfig,
  INSTALL_DEVICE_SWITCH_OPTIONS,
  type StepData,
} from "@/features/download/data/download-install-steps";
import { DOWNLOAD_AUTH_RETURN_TO } from "@/features/download/download.constants";
import type {
  DownloadPageViewState,
  InstallState,
  SelectedDevice,
} from "@/features/download/download-page-view-state";
import { getIosBrowserName } from "@/features/download/hooks/use-download-page";
import {
  getDownloadPageLink,
  useDownloadPageLinkCopy,
} from "@/features/download/hooks/use-download-share";
import { Button } from "@/shared/components/ui/button";
import { IconTile } from "@/shared/components/ui/icon-tile";
import { buildAuthRouteNavigation } from "@/shared/lib/auth-route";
import { cn } from "@/shared/lib/utils";

const INSTALL_DEVICE_SWITCH_BUTTON_CLASS =
  "inline-flex min-h-11 items-center rounded-md font-medium text-primary underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2";

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
          <p className="mb-3 font-semibold text-forge-teal text-xs">
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

interface InstallDeviceSwitchProps {
  onSelectedDeviceChange: (value: SelectedDevice) => void;
  selectedDevice: SelectedDevice;
}

function InstallDeviceSwitch({
  onSelectedDeviceChange,
  selectedDevice,
}: InstallDeviceSwitchProps) {
  const options = INSTALL_DEVICE_SWITCH_OPTIONS.filter(
    (option) => option.id !== selectedDevice,
  );

  return (
    <div className="mb-10 flex flex-wrap items-center gap-x-3 gap-y-2 text-slate-muted text-sm">
      <span>Wrong device?</span>
      {options.map((option, index) => (
        <Fragment key={option.id}>
          {index > 0 && "·"}
          <button
            type="button"
            className={INSTALL_DEVICE_SWITCH_BUTTON_CLASS}
            onClick={() => {
              onSelectedDeviceChange(option.id);
            }}
          >
            {option.label}
          </button>
        </Fragment>
      ))}
    </div>
  );
}

interface InstallStepsContentProps {
  stepConfig: DeviceStepConfig | null;
  viewState: DownloadPageViewState;
}

function InstallStepsContent({
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

interface NativeInstallCalloutProps {
  feedback: string | null;
  installState: InstallState;
  onInstallClick: () => void;
}

function NativeInstallCallout({
  installState,
  feedback,
  onInstallClick,
}: NativeInstallCalloutProps) {
  return (
    <div className="mb-8 rounded-2xl border border-primary/20 bg-primary/6 px-5 py-4 sm:flex sm:items-center sm:justify-between sm:gap-6">
      <div className="min-w-0">
        <p className="font-bold text-ink">Direct install is available here</p>
        <p className="mt-1 max-w-xl text-pretty text-slate-muted text-sm leading-relaxed">
          This browser can add TeamForge directly. Use the manual steps below
          only if the prompt does not appear.
        </p>
        {feedback && (
          <p className="mt-2 font-medium text-primary text-sm">{feedback}</p>
        )}
      </div>
      <Button
        size="lg"
        loading={installState === "prompting"}
        className="mt-4 w-full text-white sm:mt-0 sm:w-auto"
        onClick={onInstallClick}
      >
        <Download size={16} strokeWidth={2} aria-hidden="true" />
        Install TeamForge
      </Button>
    </div>
  );
}

interface InstallStepProps {
  index: number;
  step: StepData;
}

function InstallStep({ index, step }: InstallStepProps) {
  const StepIcon = step.icon;

  return (
    <li
      className={cn(
        "group flex items-start gap-6 py-9 sm:gap-10",
        step.isAlternative && "opacity-80",
      )}
    >
      <span
        className="shrink-0 select-none font-extrabold text-5xl text-forge-teal/20 tabular-nums leading-none transition-colors duration-200 group-hover:text-forge-teal/40 sm:text-7xl"
        aria-hidden="true"
      >
        {step.isAlternative ? "↳" : index}
      </span>

      <div className="min-w-0 flex-1">
        <h3 className="flex items-center gap-2 font-bold text-ink text-lg leading-tight">
          <IconTile
            bordered
            icon={StepIcon}
            shape="circle"
            size="sm"
            tone="teal"
            className="size-6 bg-forge-teal/8"
          />
          <span>{step.title}</span>
        </h3>
        <p className="mt-2 max-w-xl text-pretty text-slate-muted leading-relaxed">
          {step.body}
        </p>
        {step.tip && (
          <p className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-forge-teal/8 px-3 py-1.5 font-medium text-forge-teal text-sm">
            {step.tip}
          </p>
        )}
      </div>
    </li>
  );
}

interface DownloadPageLinkCopyControlProps {
  copied: boolean;
  onCopy: () => Promise<void>;
}

function DownloadPageLinkCopyControl({
  copied,
  onCopy,
}: DownloadPageLinkCopyControlProps) {
  return (
    <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden rounded-xl border border-border/80 bg-background px-3 py-2">
        <span className="truncate font-mono text-slate-muted text-xs">
          {getDownloadPageLink()}
        </span>
      </div>
      <Button variant="outline" size="sm" className="shrink-0" onClick={onCopy}>
        {copied ? (
          <>
            <ClipboardCheck size={14} strokeWidth={2} aria-hidden="true" />
            Copied!
          </>
        ) : (
          <>
            <ClipboardCopy size={14} strokeWidth={2} aria-hidden="true" />
            Copy link
          </>
        )}
      </Button>
    </div>
  );
}

function IosNonSafariNotice() {
  const browserName = getIosBrowserName();
  const { copied, copyCurrentPageUrl } = useDownloadPageLinkCopy();

  return (
    <div className="grid gap-6">
      <div className="rounded-2xl border border-spark-amber/20 bg-spark-amber/5 px-6 py-8 sm:px-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-8">
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-ink text-xl">
              {browserName} can't install web apps on iPhone
            </h3>
            <p className="mt-2 max-w-lg text-pretty text-slate-muted leading-relaxed">
              On iPhone and iPad, only{" "}
              <strong className="text-ink">Safari</strong> supports Add to Home
              Screen. You need to open this page in Safari to install TeamForge.
            </p>

            <DownloadPageLinkCopyControl
              copied={copied}
              onCopy={copyCurrentPageUrl}
            />
          </div>
        </div>
      </div>

      <ol
        className="divide-y divide-border/60"
        aria-label="How to open in Safari"
      >
        {[
          {
            title: "Copy the link above",
            body: "Tap 'Copy link' to copy this page's address to your clipboard.",
          },
          {
            title: "Open Safari",
            body: "Find Safari on your home screen (the compass icon) and tap to open it.",
          },
          {
            title: "Paste the link and navigate",
            body: "Tap Safari's address bar at the top, paste the link, and tap Go. You'll arrive at this page inside Safari.",
          },
          {
            title: "Follow the Safari installation steps",
            body: "Once you're here in Safari, tap the Share button (□↑) at the bottom of the screen and choose 'Add to Home Screen'.",
          },
        ].map((step, i) => (
          <li
            key={step.title}
            className="flex items-start gap-6 py-7 sm:gap-10"
          >
            <span className="shrink-0 select-none font-extrabold text-4xl text-spark-amber/30 tabular-nums leading-none sm:text-6xl">
              {i + 1}
            </span>
            <div className="min-w-0">
              <h3 className="font-bold text-ink text-lg">{step.title}</h3>
              <p className="mt-1.5 max-w-xl text-pretty text-slate-muted leading-relaxed">
                {step.body}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

function FirefoxNotice() {
  const { copied, copyCurrentPageUrl } = useDownloadPageLinkCopy();

  return (
    <div className="rounded-2xl border border-spark-amber/20 bg-spark-amber/5 px-6 py-8 sm:px-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-8">
        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-ink text-xl">
            Firefox doesn't support web app installation
          </h3>
          <p className="mt-2 max-w-lg text-pretty text-slate-muted leading-relaxed">
            Firefox doesn't yet support installing web apps as standalone
            applications. To install TeamForge on this computer, open this page
            in <strong className="text-ink">Google Chrome</strong> or{" "}
            <strong className="text-ink">Microsoft Edge</strong> — the
            installation takes two clicks.
          </p>

          <DownloadPageLinkCopyControl
            copied={copied}
            onCopy={copyCurrentPageUrl}
          />

          <p className="mt-4 text-slate-muted text-sm">
            You can still use TeamForge in Firefox as a regular web page.{" "}
            <Link
              {...buildAuthRouteNavigation(
                "/auth/login",
                DOWNLOAD_AUTH_RETURN_TO,
              )}
              className="font-medium text-forge-teal underline-offset-2 hover:underline"
            >
              Sign in here.
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
