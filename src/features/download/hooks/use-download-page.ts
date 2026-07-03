import { useState } from "react";
import {
  type DesktopBrowser,
  type DetectedPlatform,
  getDownloadPageViewState,
  type InstallState,
  platformToDevice,
  type SelectedDevice,
} from "@/features/download/download-page-view-state";
import { usePwaDisplayMode } from "@/shared/hooks/use-pwa-display-mode";
import { usePwaInstallPrompt } from "@/shared/hooks/use-pwa-install-prompt";
import { getCurrentBrowserOrigin } from "@/shared/lib/browser-capabilities";
import { getBrowserNavigator } from "@/shared/lib/browser-environment";

const DESKTOP_BROWSER_RULES = [
  { browser: "edge", pattern: /edg\//i },
  { browser: "firefox", pattern: /firefox|fxios/i },
  { browser: "safari", pattern: /safari/i, exclude: /chrome|chromium|crios/i },
  { browser: "chrome", pattern: /chrome|chromium|crios/i },
] as const satisfies readonly {
  browser: DesktopBrowser;
  exclude?: RegExp;
  pattern: RegExp;
}[];

const IOS_BROWSER_NAME_RULES = [
  { name: "Chrome", pattern: /crios/i },
  { name: "Firefox", pattern: /fxios/i },
  { name: "Edge", pattern: /edgios/i },
  { name: "Opera", pattern: /opt\//i },
] as const;

export function useDownloadPage() {
  const { detected, desktopBrowser } = getDeviceDetectionSnapshot();
  const { isStandalone } = usePwaDisplayMode();
  const { canPromptInstall, promptInstall } = usePwaInstallPrompt("download");
  const [installState, setInstallState] = useState<InstallState>("idle");
  const [selectedDevice, setSelectedDevice] = useState<SelectedDevice>(() =>
    platformToDevice(detected),
  );
  const downloadQrUrl = `${getCurrentBrowserOrigin()}/download`;

  const viewState = getDownloadPageViewState({
    canPromptInstall,
    desktopBrowser,
    detected,
    installState,
    isStandalone,
    selectedDevice,
  });

  async function handleInstallClick() {
    setInstallState("prompting");
    const result = await promptInstall();
    setInstallState(result.outcome === "accepted" ? "accepted" : "dismissed");
  }

  return {
    desktopBrowser,
    detected,
    downloadQrUrl,
    handleInstallClick,
    installState,
    isStandalone,
    selectedDevice,
    setSelectedDevice,
    viewState,
  };
}

function detectPlatform(): DetectedPlatform {
  const ua = getNavigatorUserAgent();

  if (!ua) return "unknown";

  const uaLower = ua.toLowerCase();

  if (isIosDevice(ua, uaLower)) {
    return isIosSafari(ua) ? "ios-safari" : "ios-other";
  }

  if (uaLower.includes("android")) return "android";
  return "desktop";
}

function detectDesktopBrowser(): DesktopBrowser {
  const ua = getNavigatorUserAgent();

  if (!ua) return "chrome";

  return getDesktopBrowserFromUserAgent(ua);
}

function getNavigatorUserAgent() {
  return getBrowserNavigator()?.userAgent ?? null;
}

function isIosDevice(ua: string, uaLower: string) {
  const isTouchMac =
    ua.includes("Macintosh") &&
    (getBrowserNavigator()?.maxTouchPoints ?? 0) > 1;

  return /iphone|ipad|ipod/.test(uaLower) || isTouchMac;
}

function isIosSafari(ua: string) {
  return /safari\//i.test(ua) && !/crios|fxios|edgios|opt\//i.test(ua);
}

function getDesktopBrowserFromUserAgent(ua: string): DesktopBrowser {
  return (
    DESKTOP_BROWSER_RULES.find((rule) => isDesktopBrowserRuleMatch(rule, ua))
      ?.browser ?? "other"
  );
}

function isDesktopBrowserRuleMatch(
  rule: (typeof DESKTOP_BROWSER_RULES)[number],
  ua: string,
) {
  return (
    rule.pattern.test(ua) && (!("exclude" in rule) || !rule.exclude.test(ua))
  );
}

export function getIosBrowserName(): string {
  const ua = getNavigatorUserAgent();

  if (!ua) return "this browser";

  return (
    IOS_BROWSER_NAME_RULES.find((rule) => rule.pattern.test(ua))?.name ??
    "this browser"
  );
}

function getDeviceDetectionSnapshot() {
  const detected = detectPlatform();

  return {
    desktopBrowser: detected === "desktop" ? detectDesktopBrowser() : "chrome",
    detected,
  };
}
