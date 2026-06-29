import { Link } from "@tanstack/react-router";
import CheckCircle2 from "lucide-react/dist/esm/icons/circle-check.js";
import QrCode from "lucide-react/dist/esm/icons/qr-code.js";
import { DEVICE_TABS } from "@/features/download/data/download-install-steps";
import {
  DOWNLOAD_PREVIEW_IMAGES,
  type DownloadPreviewImage,
} from "@/features/download/data/download-preview-images";
import { DOWNLOAD_AUTH_RETURN_TO } from "@/features/download/download.constants";
import type {
  DesktopBrowser,
  DetectedPlatform,
  DownloadPageViewState,
  InstallState,
  SelectedDevice,
} from "@/features/download/download-page-view-state";
import { useLandingAuthActions } from "@/shared/components/public-site/public-site-shell";
import { QrShareDialog } from "@/shared/components/qr-share-dialog";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

interface DownloadHeroSectionProps {
  desktopBrowser: DesktopBrowser;
  detected: DetectedPlatform;
  downloadQrUrl: string;
  installState: InstallState;
  isStandalone: boolean;
  onInstallClick: () => void;
  onSelectedDeviceChange: (value: SelectedDevice) => void;
  selectedDevice: SelectedDevice;
  viewState: DownloadPageViewState;
}

export function DownloadHeroSection({
  desktopBrowser,
  detected,
  downloadQrUrl,
  installState,
  isStandalone,
  onInstallClick,
  onSelectedDeviceChange,
  selectedDevice,
  viewState,
}: DownloadHeroSectionProps) {
  return (
    <section
      className="dark public-forge-theme relative h-svh min-h-0 overflow-hidden border-canvas border-b bg-hero-bg pt-16"
      aria-label="Install TeamForge"
    >
      <DownloadHeroGrid />

      <div className="relative z-10 mx-auto grid h-[calc(100svh-4rem)] min-h-0 max-w-6xl grid-cols-1 gap-10 overflow-hidden px-6 py-10 sm:py-12 lg:grid-cols-2 lg:gap-16">
        <div className="flex min-h-0 flex-col items-center justify-center text-center lg:items-start lg:text-left">
          <h1 className="mb-4 text-balance font-extrabold text-4xl text-white leading-none sm:text-5xl lg:text-6xl">
            Your groups, <span className="text-forge-teal">one tap away.</span>
          </h1>

          <p className="mb-8 max-w-md text-pretty text-base text-text-dark-secondary leading-relaxed">
            Install TeamForge directly from your browser — no app store, no
            waiting. Select your device below for step-by-step instructions.
          </p>

          <DownloadDeviceTabs
            ariaLabel="Select your device"
            options={DEVICE_TABS}
            value={selectedDevice}
            onChange={onSelectedDeviceChange}
          />

          <p className="mt-5 mb-7 min-h-12 w-full max-w-md text-pretty text-sm text-text-dark-secondary leading-relaxed">
            {viewState.heroSubtitle}
          </p>

          <HeroCTAButtons
            selectedDevice={selectedDevice}
            detected={detected}
            isStandalone={isStandalone}
            canUseNativePrompt={viewState.canUseNativePrompt}
            installState={installState}
            desktopBrowser={desktopBrowser}
            onInstallClick={onInstallClick}
          />

          <HeroInstallFeedback
            feedback={viewState.feedback}
            isStandalone={isStandalone}
          />
        </div>

        <div className="hidden items-center justify-center lg:flex lg:justify-end">
          <HeroVisual selectedDevice={selectedDevice} />
        </div>
      </div>

      <QrShareDialog
        url={downloadQrUrl}
        title="Install TeamForge"
        description="Scan this on your phone to open the install guide."
        trigger={
          <Button
            variant="outline"
            size="icon"
            className="absolute right-5 bottom-7 z-20 size-11 rounded-full border-white/25 bg-white/8 text-white backdrop-blur-md hover:translate-y-0! hover:border-forge-teal hover:bg-forge-teal/20 hover:shadow-none! focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-hero-bg active:translate-y-0! active:shadow-none! sm:right-8 sm:bottom-10"
            aria-label="Show install QR code"
          >
            <QrCode size={18} strokeWidth={2.25} aria-hidden="true" />
          </Button>
        }
      />
    </section>
  );
}

interface HeroInstallFeedbackProps {
  feedback: string | null;
  isStandalone: boolean;
}

function HeroInstallFeedback({
  feedback,
  isStandalone,
}: HeroInstallFeedbackProps) {
  if (isStandalone) {
    return (
      <p className="mt-4 flex items-center gap-2 font-medium text-forge-teal text-sm">
        <CheckCircle2 size={15} strokeWidth={2} aria-hidden="true" />
        TeamForge is already installed on this device.
      </p>
    );
  }

  if (feedback) {
    return (
      <p className="mt-4 font-medium text-sm text-text-dark-secondary">
        {feedback}
      </p>
    );
  }

  return null;
}

interface DownloadDeviceTabsProps {
  ariaLabel: string;
  onChange: (value: SelectedDevice) => void;
  options: typeof DEVICE_TABS;
  value: SelectedDevice;
}

function DownloadDeviceTabs({
  ariaLabel,
  onChange,
  options,
  value,
}: DownloadDeviceTabsProps) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className="inline-flex max-w-full items-center gap-1 rounded-full border border-white/15 bg-white/8 p-0.5 shadow-sm backdrop-blur-sm"
    >
      {options.map((option) => {
        const active = value === option.id;
        const Icon = option.icon;

        return (
          <button
            key={option.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => {
              onChange(option.id);
            }}
            className={cn(
              "relative inline-flex h-9 min-w-0 items-center justify-center gap-1.5 rounded-full px-3 font-bold text-xs leading-none outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-forge-teal/70 focus-visible:ring-offset-1 focus-visible:ring-offset-hero-bg",
              active
                ? "bg-forge-teal text-white shadow-[0_2px_0_#063b37]"
                : "text-white/62 hover:bg-white/8 hover:text-white",
            )}
          >
            <Icon
              className={cn(
                "size-3.5 shrink-0 transition-opacity duration-200",
                active ? "opacity-100" : "opacity-70",
              )}
              strokeWidth={active ? 2 : 1.5}
              aria-hidden="true"
            />
            <span
              className={cn(
                "min-w-0 truncate",
                option.shortLabel && "hidden sm:inline",
              )}
            >
              {option.label}
            </span>
            {option.shortLabel && (
              <span className="min-w-0 truncate sm:hidden">
                {option.shortLabel}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

interface HeroCTAButtonsProps {
  canUseNativePrompt: boolean;
  desktopBrowser: DesktopBrowser;
  detected: DetectedPlatform;
  installState: InstallState;
  isStandalone: boolean;
  onInstallClick: () => void;
  selectedDevice: SelectedDevice;
}

type HeroPrimaryCtaState =
  | { kind: "home"; label: "Open TeamForge"; showSecondaryAction: false }
  | {
      isLoading: boolean;
      kind: "install";
      label: "Install TeamForge";
      showSecondaryAction: true;
    }
  | {
      kind: "steps";
      label:
        | "How to switch to Safari ↓"
        | "See install options ↓"
        | "See install steps ↓";
      showSecondaryAction: true;
    };

function HeroCTAButtons({
  selectedDevice,
  detected,
  isStandalone,
  canUseNativePrompt,
  installState,
  desktopBrowser,
  onInstallClick,
}: HeroCTAButtonsProps) {
  const btnBase =
    "w-full border-forge-teal bg-forge-teal text-white hover:-translate-y-1 hover:shadow-[0_4px_0_#042f2e] focus-visible:ring-forge-teal active:translate-y-0 active:shadow-none sm:w-auto";
  const outlineBase =
    "w-full border-white bg-transparent text-white hover:shadow-[0_4px_0_rgba(242,245,241,0.88)] focus-visible:ring-white sm:w-auto";
  const row = "flex w-full flex-col gap-3 sm:w-auto sm:flex-row";
  const { isResolvingAuthAction, secondaryAction } = useLandingAuthActions(
    "Get started",
    "Sign in",
    DOWNLOAD_AUTH_RETURN_TO,
  );
  const primaryCta = getHeroPrimaryCtaState({
    canUseNativePrompt,
    desktopBrowser,
    detected,
    installState,
    isStandalone,
    selectedDevice,
  });

  function renderSecondaryActionButton() {
    if (isResolvingAuthAction) {
      return (
        <Button
          variant="outline"
          size="hero"
          loading
          className={outlineBase}
          aria-label="Checking TeamForge session"
        >
          {secondaryAction.label}
        </Button>
      );
    }

    return (
      <Button variant="outline" size="hero" asChild className={outlineBase}>
        <Link {...secondaryAction.navigation}>{secondaryAction.label}</Link>
      </Button>
    );
  }

  return (
    <div className={row}>
      {primaryCta.kind === "home" ? (
        <Button size="hero" asChild className={btnBase}>
          <Link to="/home">{primaryCta.label}</Link>
        </Button>
      ) : primaryCta.kind === "install" ? (
        <Button
          size="hero"
          loading={primaryCta.isLoading}
          className={btnBase}
          onClick={onInstallClick}
        >
          {primaryCta.label}
        </Button>
      ) : (
        <Button size="hero" className={btnBase} onClick={scrollToSteps}>
          {primaryCta.label}
        </Button>
      )}
      {primaryCta.showSecondaryAction ? renderSecondaryActionButton() : null}
    </div>
  );
}

function getHeroPrimaryCtaState({
  canUseNativePrompt,
  desktopBrowser,
  detected,
  installState,
  isStandalone,
  selectedDevice,
}: Pick<
  HeroCTAButtonsProps,
  | "canUseNativePrompt"
  | "desktopBrowser"
  | "detected"
  | "installState"
  | "isStandalone"
  | "selectedDevice"
>): HeroPrimaryCtaState {
  if (isStandalone) {
    return {
      kind: "home",
      label: "Open TeamForge",
      showSecondaryAction: false,
    };
  }

  if (canUseNativePrompt) {
    return {
      isLoading: installState === "prompting",
      kind: "install",
      label: "Install TeamForge",
      showSecondaryAction: true,
    };
  }

  return {
    kind: "steps",
    label: getHeroStepsCtaLabel({ desktopBrowser, detected, selectedDevice }),
    showSecondaryAction: true,
  };
}

function getHeroStepsCtaLabel({
  desktopBrowser,
  detected,
  selectedDevice,
}: Pick<
  HeroCTAButtonsProps,
  "desktopBrowser" | "detected" | "selectedDevice"
>): Extract<HeroPrimaryCtaState, { kind: "steps" }>["label"] {
  if (selectedDevice === "ios" && detected === "ios-other") {
    return "How to switch to Safari ↓";
  }

  if (selectedDevice === "desktop" && desktopBrowser === "firefox") {
    return "See install options ↓";
  }

  return "See install steps ↓";
}

function HeroVisual({ selectedDevice }: { selectedDevice: SelectedDevice }) {
  const isDesktop = selectedDevice === "desktop";
  const isIos = selectedDevice === "ios";

  return (
    <div
      className={cn(
        "relative flex w-full min-w-0 items-center justify-center py-8 sm:py-10 lg:py-0",
        isDesktop
          ? "max-w-120 lg:justify-end"
          : isIos
            ? "max-w-140"
            : "max-w-[20rem]",
      )}
    >
      {selectedDevice === "ios" ? (
        <IpadVisual />
      ) : selectedDevice === "android" ? (
        <AndroidPhoneVisual />
      ) : (
        <DesktopBrowserVisual />
      )}
    </div>
  );
}

function IpadVisual() {
  return (
    <div
      className="relative w-full animate-download-device-drift select-none motion-reduce:animate-none"
      aria-hidden="true"
    >
      <div className="absolute inset-8 -z-10 scale-95 rounded-4xl bg-forge-teal/50 opacity-25 blur-3xl" />
      <div className="relative mx-auto w-full max-w-140 rounded-4xl border-8 border-black/80 bg-forge-deep-panel shadow-teal-glow-lg ring-1 ring-white/10">
        <div className="absolute top-1/2 left-2 z-10 size-2 -translate-y-1/2 rounded-full bg-white/15" />
        <div className="absolute top-14 -right-1 h-14 w-1 rounded-r-full bg-white/10" />
        <div className="absolute bottom-1 left-1/2 z-10 h-1 w-20 -translate-x-1/2 rounded-full bg-white/20" />
        <PreviewScreenImage
          image={DOWNLOAD_PREVIEW_IMAGES.ios}
          className="rounded-[1.65rem]"
        />
      </div>
    </div>
  );
}

function AndroidPhoneVisual() {
  return (
    <div
      className="relative w-full min-w-0 animate-download-device-drift select-none motion-reduce:animate-none"
      aria-hidden="true"
    >
      <div className="absolute inset-6 -z-10 scale-95 rounded-[3rem] bg-forge-teal/50 opacity-30 blur-3xl" />
      <div className="relative mx-auto w-full max-w-64 rounded-[3rem] border-8 border-black/80 bg-black/80 shadow-teal-glow-lg ring-1 ring-white/10 sm:max-w-68">
        <div className="absolute top-24 -right-1 z-10 h-16 w-1 rounded-r-full bg-white/10" />
        <div className="absolute top-3 left-1/2 z-20 size-2 -translate-x-1/2 rounded-full bg-white/15" />
        <PreviewScreenImage
          image={DOWNLOAD_PREVIEW_IMAGES.android}
          className="rounded-[2.4rem]"
        />
        <div className="absolute bottom-1 left-1/2 z-20 h-1 w-20 -translate-x-1/2 rounded-full bg-white/18" />
      </div>
    </div>
  );
}

function DesktopBrowserVisual() {
  return (
    <div className="relative w-full select-none" aria-hidden="true">
      <div className="absolute inset-4 -z-10 scale-105 rounded-3xl bg-forge-teal/50 opacity-25 blur-3xl" />
      <div className="relative mx-auto w-full max-w-120 pb-9">
        <div className="rounded-4xl border-8 border-black/80 bg-black/80 p-2 shadow-teal-glow-lg ring-1 ring-white/10">
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-forge-deep-panel">
            <PreviewScreenImage image={DOWNLOAD_PREVIEW_IMAGES.desktop} />
          </div>
        </div>

        <div className="mx-auto h-7 w-24 rounded-b-xl border-white/10 border-x border-b bg-black/70" />
        <div className="mx-auto h-2 w-44 rounded-full border border-white/10 bg-black/70" />
      </div>
    </div>
  );
}

interface PreviewScreenImageProps {
  className?: string;
  image: DownloadPreviewImage;
}

function PreviewScreenImage({ className, image }: PreviewScreenImageProps) {
  return (
    <img
      src={image.src}
      srcSet={image.srcSet}
      sizes={image.sizes}
      width={image.width}
      height={image.height}
      alt=""
      decoding="async"
      fetchPriority="high"
      loading="eager"
      draggable={false}
      className={cn("block h-auto w-full object-cover", className)}
    />
  );
}

function DownloadHeroGrid() {
  return (
    <div
      className="download-hero-grid pointer-events-none absolute inset-0"
      aria-hidden="true"
    />
  );
}

function scrollToSteps() {
  document
    .getElementById("install-steps")
    ?.scrollIntoView({ behavior: "smooth" });
}
