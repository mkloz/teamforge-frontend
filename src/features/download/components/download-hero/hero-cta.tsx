import { Link } from "@tanstack/react-router";
import { DOWNLOAD_AUTH_RETURN_TO } from "@/features/download/download.constants";
import type {
  DesktopBrowser,
  DetectedPlatform,
  InstallState,
  SelectedDevice,
} from "@/features/download/download-page-view-state";
import { usePublicSiteAuthActions } from "@/shared/components/public-site/public-site-shell";
import { Button } from "@/shared/components/ui/button";
import { getBrowserElementById } from "@/shared/lib/browser-environment";
import { scrollElementIntoView } from "@/shared/lib/browser-scroll";

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
  | { kind: "home"; label: "Open Findafew"; showSecondaryAction: false }
  | {
      isLoading: boolean;
      kind: "install";
      label: "Install Findafew";
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

export function HeroCTAButtons({
  selectedDevice,
  detected,
  isStandalone,
  canUseNativePrompt,
  installState,
  desktopBrowser,
  onInstallClick,
}: HeroCTAButtonsProps) {
  const btnBase =
    "w-full border-brand-teal bg-brand-teal text-white hover:-translate-y-1 hover:shadow-button-primary focus-visible:ring-brand-teal active:translate-y-0 active:shadow-none sm:w-auto";
  const outlineBase =
    "w-full border-white bg-transparent text-white hover:shadow-button-outline-dark focus-visible:ring-white sm:w-auto";
  const row = "flex w-full flex-col gap-3 sm:w-auto sm:flex-row";
  const { isResolvingAuthAction, secondaryAction } = usePublicSiteAuthActions(
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
          aria-label="Checking Findafew session"
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
      label: "Open Findafew",
      showSecondaryAction: false,
    };
  }

  if (canUseNativePrompt) {
    return {
      isLoading: installState === "prompting",
      kind: "install",
      label: "Install Findafew",
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

function scrollToSteps() {
  scrollElementIntoView(getBrowserElementById("install-steps"), {
    intent: "locate",
  });
}
