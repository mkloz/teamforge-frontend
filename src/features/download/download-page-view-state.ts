export type DetectedPlatform =
  | "android"
  | "desktop"
  | "ios-safari"
  | "ios-other"
  | "unknown";

export type SelectedDevice = "ios" | "android" | "desktop";

export type DesktopBrowser = "chrome" | "edge" | "firefox" | "safari" | "other";

export type InstallState = "idle" | "accepted" | "dismissed" | "prompting";

interface DownloadPageViewStateInput {
  canPromptInstall: boolean;
  desktopBrowser: DesktopBrowser;
  detected: DetectedPlatform;
  installState: InstallState;
  isStandalone: boolean;
  selectedDevice: SelectedDevice;
}

export interface DownloadPageViewState {
  canUseNativePrompt: boolean;
  feedback: string | null;
  heroSubtitle: string;
  installStepsHeading: string;
  showFirefoxNotice: boolean;
  showIosNonSafariNotice: boolean;
}

export function getDownloadPageViewState({
  canPromptInstall,
  desktopBrowser,
  detected,
  installState,
  isStandalone,
  selectedDevice,
}: DownloadPageViewStateInput): DownloadPageViewState {
  return {
    canUseNativePrompt: canPromptInstall && !isStandalone,
    feedback: getInstallFeedback(installState),
    heroSubtitle: getHeroSubtitle(selectedDevice, desktopBrowser),
    installStepsHeading: getInstallStepsHeading(selectedDevice),
    showFirefoxNotice:
      selectedDevice === "desktop" && desktopBrowser === "firefox",
    showIosNonSafariNotice:
      selectedDevice === "ios" && detected === "ios-other",
  };
}

export function platformToDevice(p: DetectedPlatform): SelectedDevice {
  if (p === "ios-safari" || p === "ios-other") return "ios";
  if (p === "android") return "android";
  return "desktop";
}

function getInstallFeedback(state: InstallState): string | null {
  if (state === "accepted") {
    return "Nice. TeamForge is being added to this device.";
  }

  if (state === "dismissed") {
    return "No rush. You can install it from this page at any time.";
  }

  return null;
}

function getHeroSubtitle(
  selectedDevice: SelectedDevice,
  desktopBrowser: DesktopBrowser,
): string {
  if (selectedDevice === "ios") {
    return "Uses Safari's built-in Share menu. No download required.";
  }

  if (selectedDevice === "android") {
    return "Chrome installs it straight to your home screen and app drawer.";
  }

  if (desktopBrowser === "firefox") {
    return "Firefox doesn't support web app installation. Chrome or Edge work best.";
  }

  return "Installs from your address bar as a standalone app — no browser chrome.";
}

function getInstallStepsHeading(selectedDevice: SelectedDevice): string {
  if (selectedDevice === "ios") {
    return "Installing on iPhone & iPad";
  }

  if (selectedDevice === "android") {
    return "Installing on Android";
  }

  return "Installing on desktop";
}
