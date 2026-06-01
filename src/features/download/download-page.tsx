import { Link } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import {
  BatteryFull,
  Bell,
  BellOff,
  BellRing,
  Bookmark,
  CheckCircle2,
  ClipboardCheck,
  ClipboardCopy,
  Download,
  EllipsisVertical,
  ExternalLink,
  Globe,
  MonitorSmartphone,
  Plus,
  RefreshCw,
  Share,
  Smartphone,
  Wifi,
} from "lucide-react";
import { useEffect, useState } from "react";

import { TeamForgeLogo } from "@/assets/logo";
import { PwaDiagnosticsPanel } from "@/features/download/components/pwa-diagnostics-panel";
import { Footer } from "@/features/landing/components/footer";
import { Navbar } from "@/features/landing/components/navbar";
import { useLandingAuthActions } from "@/features/landing/hooks/use-landing-auth-actions";
import { useRestoreAuthSessionQuery } from "@/shared/api/current-user-query";
import { Button } from "@/shared/components/ui/button";
import { usePageMetadata } from "@/shared/hooks/use-page-metadata";
import { usePwaDisplayMode } from "@/shared/hooks/use-pwa-display-mode";
import { usePwaInstallPrompt } from "@/shared/hooks/use-pwa-install-prompt";
import { useWebPushSubscription } from "@/shared/hooks/use-web-push-subscription";
import type { PageMetadata } from "@/shared/lib/document-metadata";
import { cn } from "@/shared/lib/utils";

// ─── Metadata ────────────────────────────────────────────────────────────────

const DOWNLOAD_PAGE_METADATA = {
  title: "Download TeamForge | Mobile app",
  meta: [
    {
      name: "description",
      content:
        "Install TeamForge on your phone or desktop. Step-by-step guide for iPhone, iPad, Android, and desktop browsers.",
    },
    { name: "robots", content: "index, follow" },
    { property: "og:type", content: "website" },
    { property: "og:title", content: "Download TeamForge" },
    {
      property: "og:description",
      content:
        "Install TeamForge on your phone or desktop. Works on iPhone, Android, Chrome, Edge, and Safari.",
    },
    { name: "twitter:card", content: "summary" },
    { name: "twitter:title", content: "Download TeamForge" },
    {
      name: "twitter:description",
      content:
        "Install TeamForge on your phone or desktop. Step-by-step guide for all devices.",
    },
  ],
} as const satisfies PageMetadata;

// ─── Types ───────────────────────────────────────────────────────────────────

/**
 * Detected platform — granular, used for smart defaults and conditional logic.
 * "ios-safari"  → iPhone/iPad in Safari (can install)
 * "ios-other"   → iPhone/iPad in Chrome/Firefox/Edge (cannot install — must use Safari)
 * "android"     → Android device (can install via prompt or menu)
 * "desktop"     → Desktop/laptop browser
 * "unknown"     → Pre-hydration placeholder
 */
type DetectedPlatform =
  | "android"
  | "desktop"
  | "ios-safari"
  | "ios-other"
  | "unknown";

/**
 * User-selectable device category in the tab bar.
 * Defaults to detected platform's category.
 */
type SelectedDevice = "ios" | "android" | "desktop";

/** Desktop browser — used for browser-specific step content. */
type DesktopBrowser = "chrome" | "edge" | "firefox" | "safari" | "other";

type InstallState = "idle" | "accepted" | "dismissed" | "prompting";

// ─── Step data ───────────────────────────────────────────────────────────────

interface StepData {
  icon: LucideIcon;
  title: string;
  body: string;
  tip?: string;
  isAlternative?: boolean;
}

interface DeviceStepConfig {
  heading: string;
  subheading?: string;
  steps: StepData[];
}

const IOS_SAFARI_CONFIG: DeviceStepConfig = {
  heading: "Four steps in Safari — under a minute",
  subheading:
    "Add to Home Screen only works in Safari on iPhone and iPad. No App Store needed.",
  steps: [
    {
      icon: Globe,
      title: "Make sure you're in Safari",
      body: "If you arrived here via a link in Chrome, Firefox, or another app, tap the Share icon in that app and choose 'Open in Safari'. The installation won't work in other browsers.",
      tip: "Already in Safari? Go straight to step 2.",
    },
    {
      icon: Share,
      title: "Tap the Share button (□↑)",
      body: "In Safari's toolbar, tap the Share button — a box with an arrow pointing up. On iPhone it's at the bottom of the screen; on iPad it's at the top-right of the toolbar. If you can't see it, scroll up slightly first.",
    },
    {
      icon: Plus,
      title: "Tap 'Add to Home Screen'",
      body: "Scroll down in the share sheet until you see 'Add to Home Screen'. It has a white icon with a ⊕ symbol. Tap it — a preview of TeamForge will appear with the name and icon already set.",
    },
    {
      icon: CheckCircle2,
      title: "Tap 'Add' — you're done",
      body: "In the top-right corner of the preview, tap 'Add'. TeamForge appears on your home screen immediately and opens like a native app, without any browser chrome.",
    },
  ],
};

const ANDROID_CONFIG: DeviceStepConfig = {
  heading: "Install directly from Chrome",
  subheading:
    "No app store, no download. TeamForge installs from your browser in seconds.",
  steps: [
    {
      icon: Download,
      title: "Accept the install prompt",
      body: "Chrome automatically shows an 'Add to Home screen' banner at the bottom of this page. Tap 'Install TeamForge' or 'Add' to install immediately. This is the fastest option.",
      tip: "If you don't see the banner, use the browser menu instead:",
    },
    {
      icon: EllipsisVertical,
      title: "Or open Chrome's menu (⋮)",
      body: "Tap the three-dot menu icon (⋮) in the top-right corner of Chrome. Look for 'Install app' or 'Add to Home screen'. Both options do the same thing — the label depends on your Chrome version.",
      isAlternative: true,
    },
    {
      icon: CheckCircle2,
      title: "Confirm and you're done",
      body: "A dialog shows the TeamForge icon and name. Tap 'Install' or 'Add' to confirm. TeamForge is immediately added to your home screen and app drawer, and opens without any browser interface.",
    },
  ],
};

function getDesktopConfig(browser: DesktopBrowser): DeviceStepConfig | null {
  switch (browser) {
    case "chrome":
      return {
        heading: "Install from Chrome in two clicks",
        subheading:
          "Chrome installs TeamForge as a standalone app — no app store, no download.",
        steps: [
          {
            icon: MonitorSmartphone,
            title: "Find the install icon in your address bar",
            body: "Look for a small computer-screen icon (⊕) at the right edge of Chrome's address bar. If you don't see it, click the ⋮ menu at the top-right and look for 'Install TeamForge' or 'Save and share → Install page as app'.",
            tip: "The icon appears automatically when Chrome detects the app is ready to install.",
          },
          {
            icon: Download,
            title: "Click 'Install' in the dialog",
            body: "A dialog asks for confirmation. Click 'Install'. TeamForge opens immediately in its own window — no tabs, no address bar — and is pinned to your taskbar or Dock automatically.",
          },
          {
            icon: Bookmark,
            title: "Pin for one-click access",
            body: "Right-click the TeamForge icon in your taskbar (Windows) or Dock (macOS) and choose 'Pin to taskbar' or 'Keep in Dock'. TeamForge is now always one click away.",
          },
        ],
      };

    case "edge":
      return {
        heading: "Install from Edge — built-in support",
        subheading:
          "Edge has native app installation. TeamForge installs as a standalone app in seconds.",
        steps: [
          {
            icon: MonitorSmartphone,
            title: "Find the install icon in your address bar",
            body: "Look for a '+' icon or phone icon at the right side of Edge's address bar. If you don't see it, click the ⋯ menu and look for 'Apps → Install this site as an app'.",
            tip: "The icon only appears when Edge is ready to install the app.",
          },
          {
            icon: Download,
            title: "Click 'Install' to confirm",
            body: "An 'Install app?' dialog appears showing the TeamForge icon and name. Click 'Install'. TeamForge opens in its own window immediately.",
          },
          {
            icon: Bookmark,
            title: "Pin to taskbar for quick access",
            body: "Edge will ask if you want to pin TeamForge to your taskbar after installation. Click 'Allow'. You can also right-click the taskbar icon and choose 'Pin to taskbar' manually.",
          },
        ],
      };

    case "safari":
      return {
        heading: "Add TeamForge to your Dock from Safari",
        subheading:
          "Safari on macOS Sonoma and later supports adding web apps directly to your Dock.",
        steps: [
          {
            icon: Globe,
            title: "Open the File menu in Safari",
            body: "In the Safari menu bar at the top of your screen, click 'File'. If you're on macOS Sonoma (14) or later, you'll see the 'Add to Dock' option. Earlier macOS versions do not support this.",
            tip: "Requires macOS Sonoma (14) or later.",
          },
          {
            icon: Plus,
            title: "Click 'Add to Dock…'",
            body: "Choose 'Add to Dock…' from the File menu. A dialog appears showing the TeamForge icon and name, already configured correctly. Click 'Add' to confirm.",
          },
          {
            icon: Bookmark,
            title: "TeamForge is now in your Dock",
            body: "Click the TeamForge icon in your Dock to open it as a standalone app — no Safari toolbar, no tabs. It opens directly to your groups and activity.",
          },
        ],
      };

    case "firefox":
      return null; // Firefox doesn't support PWA installation — handled separately

    default:
      return {
        heading: "Install TeamForge on your desktop",
        subheading:
          "Use Chrome or Edge for the best installation experience — one click, no app store.",
        steps: [
          {
            icon: MonitorSmartphone,
            title: "Find the install icon in your address bar",
            body: "If your browser supports web app installation, look for a computer icon or download icon near the address bar. Clicking it will install TeamForge as a standalone app.",
          },
          {
            icon: Download,
            title: "Click 'Install' in the dialog",
            body: "A dialog will confirm the installation. Click 'Install'. TeamForge opens in its own window without any browser interface.",
          },
          {
            icon: Bookmark,
            title: "Pin for easy access",
            body: "Right-click the TeamForge icon in your taskbar or Dock and choose to pin it for quick, one-click access.",
          },
        ],
      };
  }
}

const CAPABILITIES = [
  {
    icon: Smartphone,
    title: "Home-screen launch",
    body: "Open TeamForge like an app, without hunting through browser tabs.",
  },
  {
    icon: RefreshCw,
    title: "Fast returns",
    body: "The app shell stays ready so your next visit feels immediate.",
  },
  {
    icon: Wifi,
    title: "Offline opening",
    body: "Previously loaded screens can reopen while your connection catches up.",
  },
  {
    icon: Bell,
    title: "Notification-ready",
    body: "Built for group updates, invites, and plan reminders when push is enabled.",
  },
] as const;

// ─── Platform detection ───────────────────────────────────────────────────────

function detectPlatform(): DetectedPlatform {
  if (typeof navigator === "undefined") return "unknown";

  const ua = navigator.userAgent;
  const uaLower = ua.toLowerCase();
  const isTouchMac = ua.includes("Macintosh") && navigator.maxTouchPoints > 1;
  const isIos = /iphone|ipad|ipod/.test(uaLower) || isTouchMac;

  if (isIos) {
    // Safari on iOS: has "Safari/" but NOT CriOS (Chrome), FxiOS (Firefox), EdgiOS (Edge), OPT/ (Opera)
    const isIosSafari =
      /safari\//i.test(ua) && !/crios|fxios|edgios|opt\//i.test(ua);
    return isIosSafari ? "ios-safari" : "ios-other";
  }

  if (uaLower.includes("android")) return "android";
  return "desktop";
}

function detectDesktopBrowser(): DesktopBrowser {
  if (typeof navigator === "undefined") return "chrome";
  const ua = navigator.userAgent;
  if (/edg\//i.test(ua)) return "edge"; // must check before Chrome
  if (/firefox|fxios/i.test(ua)) return "firefox";
  if (/safari/i.test(ua) && !/chrome|chromium|crios/i.test(ua)) return "safari";
  if (/chrome|chromium|crios/i.test(ua)) return "chrome";
  return "other";
}

function platformToDevice(p: DetectedPlatform): SelectedDevice {
  if (p === "ios-safari" || p === "ios-other") return "ios";
  if (p === "android") return "android";
  return "desktop"; // desktop + unknown → desktop
}

function getIosBrowserName(): string {
  if (typeof navigator === "undefined") return "this browser";
  const ua = navigator.userAgent;
  if (/crios/i.test(ua)) return "Chrome";
  if (/fxios/i.test(ua)) return "Firefox";
  if (/edgios/i.test(ua)) return "Edge";
  if (/opt\//i.test(ua)) return "Opera";
  return "this browser";
}

function useDeviceDetection() {
  const [detected, setDetected] = useState<DetectedPlatform>("unknown");
  const [desktopBrowser, setDesktopBrowser] =
    useState<DesktopBrowser>("chrome");

  useEffect(() => {
    const p = detectPlatform();
    setDetected(p);
    if (p === "desktop") setDesktopBrowser(detectDesktopBrowser());
  }, []);

  return { detected, desktopBrowser };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getInstallFeedback(state: InstallState): string | null {
  if (state === "accepted")
    return "Nice. TeamForge is being added to this device.";
  if (state === "dismissed")
    return "No rush — you can install it from this page any time.";
  return null;
}

function scrollToSteps() {
  document
    .getElementById("install-steps")
    ?.scrollIntoView({ behavior: "smooth" });
}

function getPushDeniedHelp(): string {
  if (typeof navigator === "undefined") {
    return "Open your browser's site settings and allow notifications for TeamForge.";
  }
  const ua = navigator.userAgent;
  if (/safari/i.test(ua) && !/chrome|chromium/i.test(ua)) {
    return "Go to Safari → Settings for this Website → Notifications → Allow.";
  }
  if (/firefox/i.test(ua)) {
    return "Click the shield icon in your address bar and disable notification blocking.";
  }
  if (/edg\//i.test(ua)) {
    return "Click the lock icon in your address bar → Permissions → Notifications → Allow.";
  }
  return "Click the lock icon in your address bar → Notifications → Allow.";
}

// ─── Push copy ───────────────────────────────────────────────────────────────

type PushState = ReturnType<typeof useWebPushSubscription>;

function getPushCopy(push: PushState) {
  if (!push.support.isSupported) {
    return {
      title: "Alerts unavailable here",
      body: "This browser can still install TeamForge, but it cannot receive push notifications.",
    };
  }
  if (!push.isOnline || push.isPublicKeyNetworkError) {
    return {
      title: "Reconnect to manage alerts",
      body: "Push settings need the network. Existing device alerts stay as they are until you are back online.",
    };
  }
  if (!push.isAuthenticated) {
    return {
      title: "Unlock mobile alerts",
      body: "Sign in on this device to turn on group invites, messages, and plan updates.",
    };
  }
  if (push.isPublicKeyLoading) {
    return {
      title: "Checking alert capability",
      body: "TeamForge is checking whether this environment can send mobile alerts.",
    };
  }
  if (!push.isWebPushEnabled) {
    return {
      title: "Alerts not enabled yet",
      body: "Installation works now. Push delivery can be turned on when this environment is configured.",
    };
  }
  if (push.permission === "denied") {
    return {
      title: "Alerts are blocked in this browser",
      body: "Notifications are blocked. Re-enable them in your site settings to receive group and plan updates.",
    };
  }
  if (push.isSubscribed) {
    return {
      title: "Alerts are on",
      body: "This device will show TeamForge updates even when the app is closed.",
    };
  }
  return {
    title: "Turn on mobile alerts",
    body: "Allow this device to show group invites, messages, and plan reminders.",
  };
}

// ─── Page ────────────────────────────────────────────────────────────────────

export function DownloadPage() {
  usePageMetadata(DOWNLOAD_PAGE_METADATA);
  useRestoreAuthSessionQuery();

  const { detected, desktopBrowser } = useDeviceDetection();
  const { isStandalone } = usePwaDisplayMode();
  const { canPromptInstall, promptInstall } = usePwaInstallPrompt("download");
  const [installState, setInstallState] = useState<InstallState>("idle");
  const [selectedDevice, setSelectedDevice] =
    useState<SelectedDevice>("desktop");

  // Sync selected device once detection completes
  useEffect(() => {
    if (detected !== "unknown") {
      setSelectedDevice(platformToDevice(detected));
    }
  }, [detected]);

  const canUseNativePrompt = canPromptInstall && !isStandalone;
  const feedback = getInstallFeedback(installState);

  async function handleInstallClick() {
    setInstallState("prompting");
    const result = await promptInstall();
    setInstallState(result.outcome === "accepted" ? "accepted" : "dismissed");
  }

  // Resolve step config for currently selected device
  const stepConfig: DeviceStepConfig | null =
    selectedDevice === "ios"
      ? IOS_SAFARI_CONFIG
      : selectedDevice === "android"
        ? ANDROID_CONFIG
        : getDesktopConfig(desktopBrowser);

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <Navbar
        actionSet="download"
        forceSolid
        installAction={
          canUseNativePrompt
            ? {
                isLoading: installState === "prompting",
                onInstallClick: handleInstallClick,
              }
            : undefined
        }
      />

      <main>
        {/* ── Hero ──────────────────────────────────────────────────── */}
        <section
          className="dark relative overflow-hidden bg-hero-bg pt-16"
          aria-label="Install TeamForge"
        >
          <DownloadHeroGrid />

          <div className="relative z-10 mx-auto grid max-w-6xl grid-cols-1 gap-12 px-6 pt-20 pb-28 lg:grid-cols-2 lg:gap-16 lg:pt-24 lg:pb-32">
            {/* Left column: copy + selector + CTA */}
            <div className="flex flex-col items-center text-center lg:items-start lg:justify-center lg:text-left">
              <h1 className="mb-4 text-balance font-extrabold text-4xl text-white leading-none sm:text-5xl lg:text-6xl">
                Your groups,{" "}
                <span className="text-forge-teal">one tap away.</span>
              </h1>

              <p className="mb-8 max-w-md text-pretty text-base text-text-dark-secondary leading-relaxed">
                Install TeamForge directly from your browser — no app store, no
                waiting. Select your device below for step-by-step instructions.
              </p>

              {/* Device selector */}
              <DeviceSelector
                selected={selectedDevice}
                onSelect={setSelectedDevice}
              />

              {/* Dynamic subtitle per device */}
              <p className="mt-5 mb-7 min-h-12 w-full max-w-md text-pretty text-sm text-text-dark-secondary leading-relaxed">
                {selectedDevice === "ios" &&
                  "Uses Safari's built-in Share menu. No download required."}
                {selectedDevice === "android" &&
                  "Chrome installs it straight to your home screen and app drawer."}
                {selectedDevice === "desktop" &&
                  desktopBrowser === "firefox" &&
                  "Firefox doesn't support web app installation. Chrome or Edge work best."}
                {selectedDevice === "desktop" &&
                  desktopBrowser !== "firefox" &&
                  "Installs from your address bar as a standalone app — no browser chrome."}
              </p>

              {/* CTA */}
              <HeroCTAButtons
                selectedDevice={selectedDevice}
                detected={detected}
                isStandalone={isStandalone}
                canUseNativePrompt={canUseNativePrompt}
                installState={installState}
                desktopBrowser={desktopBrowser}
                onInstallClick={handleInstallClick}
              />

              {/* Feedback */}
              {isStandalone ? (
                <p className="mt-4 flex items-center gap-2 font-medium text-forge-teal text-sm">
                  <CheckCircle2 size={15} strokeWidth={2} aria-hidden="true" />
                  TeamForge is already installed on this device.
                </p>
              ) : feedback ? (
                <p className="mt-4 font-medium text-sm text-text-dark-secondary">
                  {feedback}
                </p>
              ) : null}
            </div>

            {/* Right column: device visual */}
            <div className="flex items-center justify-center lg:justify-end">
              <HeroVisual
                selectedDevice={selectedDevice}
                detected={detected}
                desktopBrowser={desktopBrowser}
              />
            </div>
          </div>

          {/* Bottom fade */}
          <div className="pointer-events-none absolute right-0 bottom-0 left-0 h-20 bg-linear-to-b from-transparent to-canvas" />
        </section>

        {/* ── Install Steps ──────────────────────────────────────────── */}
        <section
          id="install-steps"
          className="bg-canvas"
          aria-label="How to install"
        >
          <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
            {/* Section eyebrow + heading */}
            <div className="mb-3">
              <p className="mb-3 font-semibold text-forge-teal text-xs uppercase tracking-widest">
                Step-by-step
              </p>
              <h2 className="font-extrabold text-3xl text-ink sm:text-4xl">
                {selectedDevice === "ios" && "Installing on iPhone & iPad"}
                {selectedDevice === "android" && "Installing on Android"}
                {selectedDevice === "desktop" && "Installing on desktop"}
              </h2>
              {stepConfig?.subheading && (
                <p className="mt-3 max-w-xl text-pretty text-slate-muted leading-relaxed">
                  {stepConfig.subheading}
                </p>
              )}
            </div>

            {/* Inline device switch */}
            <div className="mb-10 flex flex-wrap items-center gap-x-3 gap-y-2 text-slate-muted text-sm">
              <span>Wrong device?</span>
              {selectedDevice !== "ios" && (
                <button
                  type="button"
                  className="inline-flex min-h-11 items-center rounded-md font-medium text-forge-teal underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-teal focus-visible:ring-offset-2"
                  onClick={() => {
                    setSelectedDevice("ios");
                  }}
                >
                  iPhone & iPad
                </button>
              )}
              {selectedDevice !== "ios" && selectedDevice !== "android" && "·"}
              {selectedDevice !== "android" && (
                <button
                  type="button"
                  className="inline-flex min-h-11 items-center rounded-md font-medium text-forge-teal underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-teal focus-visible:ring-offset-2"
                  onClick={() => {
                    setSelectedDevice("android");
                  }}
                >
                  Android
                </button>
              )}
              {selectedDevice !== "desktop" && "·"}
              {selectedDevice !== "desktop" && (
                <button
                  type="button"
                  className="inline-flex min-h-11 items-center rounded-md font-medium text-forge-teal underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-teal focus-visible:ring-offset-2"
                  onClick={() => {
                    setSelectedDevice("desktop");
                  }}
                >
                  Desktop
                </button>
              )}
            </div>

            {canUseNativePrompt && (
              <NativeInstallCallout
                installState={installState}
                feedback={feedback}
                onInstallClick={handleInstallClick}
              />
            )}

            {/* Content: special notices or numbered steps */}
            {selectedDevice === "ios" && detected === "ios-other" ? (
              <IosNonSafariNotice />
            ) : selectedDevice === "desktop" && desktopBrowser === "firefox" ? (
              <FirefoxNotice />
            ) : stepConfig ? (
              <ol
                className="divide-y divide-border/60"
                aria-label="Installation steps"
              >
                {stepConfig.steps.map((step, i) => (
                  <InstallStep key={step.title} step={step} index={i + 1} />
                ))}
              </ol>
            ) : null}
          </div>
        </section>

        {/* ── Push Notifications Band ──────────────────────────────── */}
        <PushNotificationBand />

        {/* ── PWA Diagnostics ──────────────────────────────────────── */}
        <PwaDiagnosticsPanel />

        {/* ── Capabilities ─────────────────────────────────────────── */}
        <section className="bg-canvas" aria-labelledby="install-benefits-title">
          <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
            <div className="grid gap-10 lg:grid-cols-5 lg:gap-12">
              <div className="lg:col-span-2">
                <p className="font-semibold text-forge-teal text-xs uppercase tracking-widest">
                  Why install it
                </p>
                <h2
                  id="install-benefits-title"
                  className="mt-3 max-w-lg font-extrabold text-3xl text-ink leading-tight sm:text-4xl"
                >
                  Make TeamForge feel closer than another tab.
                </h2>
                <p className="mt-4 max-w-md text-pretty text-slate-muted leading-relaxed">
                  Install gives the group flow a permanent place on your device,
                  with faster returns and alerts ready when plans move.
                </p>

                <div className="mt-8 border-forge-teal/20 border-y py-5">
                  <div className="flex items-start gap-4">
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-full border border-forge-teal/20 bg-forge-teal/8 text-forge-teal">
                      <Download
                        size={20}
                        strokeWidth={1.5}
                        aria-hidden="true"
                      />
                    </div>
                    <div>
                      <p className="font-bold text-ink">
                        Browser install, app-like focus
                      </p>
                      <p className="mt-1 text-slate-muted text-sm leading-relaxed">
                        No app store. No tab hunting when a group is waiting.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <ul
                className="grid sm:grid-cols-2 lg:col-span-3 lg:border-border/60 lg:border-l lg:pl-8"
                aria-label="App capabilities"
              >
                {CAPABILITIES.map((cap, i) => (
                  <CapabilityTile
                    capability={cap}
                    index={i}
                    key={cap.title}
                    total={CAPABILITIES.length}
                  />
                ))}
              </ul>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

// ─── Device selector ─────────────────────────────────────────────────────────

const DEVICE_TABS: { id: SelectedDevice; label: string; Icon: LucideIcon }[] = [
  { id: "ios", label: "iPhone & iPad", Icon: Smartphone },
  { id: "android", label: "Android", Icon: Smartphone },
  { id: "desktop", label: "Desktop", Icon: MonitorSmartphone },
];

interface DeviceSelectorProps {
  selected: SelectedDevice;
  onSelect: (d: SelectedDevice) => void;
}

function DeviceSelector({ selected, onSelect }: DeviceSelectorProps) {
  return (
    <div
      role="tablist"
      aria-label="Select your device"
      className="flex gap-1 rounded-full border border-white/10 bg-white/4 p-1 backdrop-blur-sm"
    >
      {DEVICE_TABS.map(({ id, label, Icon }) => {
        const isActive = selected === id;
        return (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => {
              onSelect(id);
            }}
            className={cn(
              "flex min-h-11 items-center gap-1.5 rounded-full px-3 py-2 font-medium text-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-teal focus-visible:ring-offset-1 focus-visible:ring-offset-hero-bg",
              isActive
                ? "bg-forge-teal text-white shadow-sm"
                : "text-text-dark-secondary hover:text-white",
            )}
          >
            <Icon
              size={14}
              strokeWidth={isActive ? 2 : 1.5}
              aria-hidden="true"
            />
            <span className="hidden sm:inline">{label}</span>
            <span className="sm:hidden">
              {id === "ios"
                ? "iPhone"
                : id === "android"
                  ? "Android"
                  : "Desktop"}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ─── Hero CTA buttons ─────────────────────────────────────────────────────────

interface HeroCTAButtonsProps {
  selectedDevice: SelectedDevice;
  detected: DetectedPlatform;
  isStandalone: boolean;
  canUseNativePrompt: boolean;
  installState: InstallState;
  desktopBrowser: DesktopBrowser;
  onInstallClick: () => void;
}

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
    "w-full hover:-translate-y-1 hover:shadow-button-primary active:translate-y-0 active:shadow-none sm:w-auto";
  const outlineBase = "w-full sm:w-auto";
  const row = "flex w-full flex-col gap-3 sm:w-auto sm:flex-row";
  const { isResolvingAuthAction, secondaryAction } = useLandingAuthActions(
    "Get started",
    "Sign in",
  );

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

  // Already installed
  if (isStandalone) {
    return (
      <div className={row}>
        <Button size="hero" asChild className={btnBase}>
          <Link to="/home">Open TeamForge</Link>
        </Button>
      </div>
    );
  }

  // Native install prompt available (Android/desktop Chromium)
  if (canUseNativePrompt) {
    return (
      <div className={row}>
        <Button
          size="hero"
          loading={installState === "prompting"}
          className={btnBase}
          onClick={onInstallClick}
        >
          Install TeamForge
        </Button>
        {renderSecondaryActionButton()}
      </div>
    );
  }

  // iOS Safari — scroll to manual steps
  if (selectedDevice === "ios" && detected !== "ios-other") {
    return (
      <div className={row}>
        <Button size="hero" className={btnBase} onClick={scrollToSteps}>
          See install steps ↓
        </Button>
        {renderSecondaryActionButton()}
      </div>
    );
  }

  // iOS non-Safari — must switch browser
  if (selectedDevice === "ios" && detected === "ios-other") {
    return (
      <div className={row}>
        <Button size="hero" className={btnBase} onClick={scrollToSteps}>
          How to switch to Safari ↓
        </Button>
        {renderSecondaryActionButton()}
      </div>
    );
  }

  // Desktop Firefox — can't install natively, show the workaround steps first
  if (selectedDevice === "desktop" && desktopBrowser === "firefox") {
    return (
      <div className={row}>
        <Button size="hero" className={btnBase} onClick={scrollToSteps}>
          See install options ↓
        </Button>
        {renderSecondaryActionButton()}
      </div>
    );
  }

  // Desktop without a native prompt yet — scroll to browser-specific install steps
  if (selectedDevice === "desktop") {
    return (
      <div className={row}>
        <Button size="hero" className={btnBase} onClick={scrollToSteps}>
          See install steps ↓
        </Button>
        {renderSecondaryActionButton()}
      </div>
    );
  }

  // Android without prompt / user manually selected Android from another device
  return (
    <div className={row}>
      <Button size="hero" className={btnBase} onClick={scrollToSteps}>
        See install steps ↓
      </Button>
      {renderSecondaryActionButton()}
    </div>
  );
}

// ─── Hero visuals (per device) ────────────────────────────────────────────────

interface HeroVisualProps {
  selectedDevice: SelectedDevice;
  detected: DetectedPlatform;
  desktopBrowser: DesktopBrowser;
}

function HeroVisual({ selectedDevice, desktopBrowser }: HeroVisualProps) {
  const isDesktop = selectedDevice === "desktop";
  const isIos = selectedDevice === "ios";

  return (
    <div
      className={cn(
        "relative flex w-full min-w-0 items-center justify-center py-8 sm:py-10 lg:min-h-136 lg:py-0",
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
        <DesktopBrowserVisual browser={desktopBrowser} />
      )}
    </div>
  );
}

/** iPad visual: Safari install guide inside the device frame */
function IpadVisual() {
  return (
    <div
      className="relative w-full animate-download-device-drift select-none motion-reduce:animate-none"
      aria-hidden="true"
    >
      <div className="absolute inset-8 -z-10 scale-95 rounded-4xl bg-forge-teal/50 opacity-25 blur-3xl" />
      <div className="relative mx-auto aspect-3/2 w-full max-w-140 rounded-4xl border-8 border-black/80 bg-forge-deep-panel shadow-teal-glow-lg ring-1 ring-white/10">
        <div className="absolute top-1/2 left-2 z-10 size-2 -translate-y-1/2 rounded-full bg-white/15" />
        <div className="absolute top-14 -right-1 h-14 w-1 rounded-r-full bg-white/10" />
        <div className="absolute bottom-2 left-1/2 z-10 h-1 w-20 -translate-x-1/2 rounded-full bg-white/20" />

        <div className="flex h-full flex-col overflow-hidden rounded-[1.65rem] bg-forge-deep-panel text-white">
          <TabletBrowserChrome />

          <div className="flex min-h-0 flex-1 flex-col gap-2 px-3 py-3 sm:px-5 sm:pt-4">
            <div className="grid min-h-0 flex-1 grid-cols-1 gap-2 sm:grid-cols-[16rem_minmax(0,1fr)] sm:gap-4">
              <TabletInstallIntro />
              <div className="hidden sm:block">
                <TabletInstallSteps />
              </div>
            </div>
            <TabletInstallBar />
          </div>
        </div>
      </div>
    </div>
  );
}

function TabletBrowserChrome() {
  return (
    <header className="border-white/8 border-b bg-white/5 px-5 py-2">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-[9px] text-white/45">9:41</span>
        <div className="flex items-center gap-1.5 text-white/40">
          <Wifi size={11} strokeWidth={1.5} aria-hidden="true" />
          <BatteryFull size={14} strokeWidth={1.5} aria-hidden="true" />
        </div>
      </div>

      <div className="mt-2 flex items-center gap-3">
        <span className="shrink-0 font-semibold text-white/45 text-xs">
          Safari
        </span>
        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-full border border-white/8 bg-white/6 px-3 py-1.5">
          <span className="type-signature-label font-semibold text-white/30">
            Aa
          </span>
          <span className="truncate font-mono text-[9px] text-white/35">
            teamforge.app/download
          </span>
        </div>
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-forge-teal/25 bg-forge-teal/10 text-forge-teal">
          <Share className="size-3.5" strokeWidth={1.5} aria-hidden="true" />
        </span>
      </div>
    </header>
  );
}

function TabletInstallIntro() {
  return (
    <section className="min-w-0 pt-1">
      <div className="flex items-center gap-3">
        <div className="shrink-0 rounded-xl bg-canvas p-1.5">
          <TeamForgeLogo className="size-8" showBackground={false} />
        </div>
        <div className="min-w-0">
          <p className="truncate font-extrabold text-base text-white leading-none">
            Team<span className="text-forge-teal">Forge</span>
          </p>
          <p className="type-signature-label mt-1 text-text-dark-muted leading-tight">
            Find your people, intelligently.
          </p>
        </div>
      </div>
      <h2 className="mt-2 text-balance font-extrabold text-sm text-white leading-tight sm:mt-4 sm:text-lg">
        Add TeamForge to your Home Screen.
      </h2>
      <p className="type-signature-label mt-1.5 hidden text-pretty text-text-dark-muted leading-snug sm:block">
        Install from Safari, then open it like a focused app.
      </p>
    </section>
  );
}

function TabletInstallSteps() {
  const steps = [
    {
      body: "Use the Safari share button.",
      Icon: Share,
      label: "01",
      title: "Open Share",
    },
    {
      active: true,
      body: "Choose Add to Home Screen.",
      Icon: Plus,
      label: "02",
      title: "Add TeamForge",
    },
    {
      body: "Launch it from your apps.",
      Icon: CheckCircle2,
      label: "03",
      title: "Open anytime",
    },
  ];

  return (
    <ol className="grid content-center gap-2">
      {steps.map(({ active = false, body, Icon, label, title }) => (
        <li
          key={label}
          className="grid min-w-0 grid-cols-[1.75rem_minmax(0,1fr)] items-start gap-2"
        >
          <span
            className={cn(
              "flex size-7 items-center justify-center rounded-full",
              active
                ? "bg-forge-teal text-white"
                : "border border-white/10 bg-white/7 text-white/40",
            )}
          >
            <Icon size={13} strokeWidth={2} aria-hidden="true" />
          </span>
          <div className="min-w-0 border-white/8 border-b pb-1.5 last:border-b-0 last:pb-0">
            <p className="font-bold text-white text-xs leading-tight">
              <span className="mr-2 text-[9px] text-white/35">{label}</span>
              {title}
            </p>
            <p className="mt-0.5 text-[9px] text-text-dark-muted leading-snug">
              {body}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}

function TabletInstallBar() {
  return (
    <div className="flex items-center justify-between gap-2 rounded-xl border border-forge-teal/30 bg-forge-teal/14 px-2.5 py-2 sm:gap-3 sm:px-3">
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-forge-teal text-white">
          <Plus size={14} strokeWidth={2} aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="truncate font-bold text-white text-xs leading-tight">
            Add to Home Screen
          </p>
          <p className="mt-0.5 truncate text-[9px] text-text-dark-muted leading-tight">
            Icon, name, and app view are ready.
          </p>
        </div>
      </div>
      <span className="type-signature-label shrink-0 rounded-md bg-forge-teal px-2.5 py-1.5 font-bold text-white sm:px-3">
        Add
      </span>
    </div>
  );
}

/** Android visual: phone with Chrome install banner at bottom */
function AndroidPhoneVisual() {
  return (
    <div
      className="relative w-full min-w-0 animate-download-device-drift select-none motion-reduce:animate-none"
      aria-hidden="true"
    >
      <div className="absolute inset-6 -z-10 scale-95 rounded-[3rem] bg-forge-teal/50 opacity-30 blur-3xl" />
      <div className="relative mx-auto w-full max-w-64 rounded-[3rem] border-8 border-black/80 bg-black/80 shadow-teal-glow-lg ring-1 ring-white/10 sm:max-w-68">
        <div className="absolute top-24 -right-1 h-16 w-1 rounded-r-full bg-white/10" />
        <div className="absolute top-3 left-1/2 z-20 size-2.5 -translate-x-1/2 rounded-full border border-white/10 bg-black/80 shadow-inner" />
        <div className="flex aspect-9/17.5 h-full flex-col overflow-hidden rounded-[2.4rem] bg-forge-deep-panel">
          <PreviewStatusBar />

          <div className="mx-4 flex items-center gap-2 rounded-full border border-white/8 bg-white/6 px-3 py-2">
            <Globe size={11} className="shrink-0 text-white/25" />
            <span className="min-w-0 flex-1 truncate font-mono text-[9px] text-white/35">
              teamforge.app/download
            </span>
            <EllipsisVertical size={12} className="shrink-0 text-white/30" />
          </div>

          {/* App content */}
          <div className="flex flex-1 flex-col px-6 pt-8">
            <PreviewBrandLockup centered size="phone" />
            <PreviewStatRows
              className="mt-5 border-white/8 border-t pt-4"
              compact
              rows={[
                { label: "Groups", value: "2 active", tone: "teal" },
                { label: "Invites", value: "1 pending", tone: "amber" },
              ]}
            />
            <div className="mt-5 grid gap-2">
              <div className="h-2 w-4/5 rounded-full bg-white/8" />
              <div className="h-2 w-3/5 rounded-full bg-white/8" />
            </div>
          </div>

          <PreviewInstallBanner />

          {/* Android nav bar (gesture handle) */}
          <div className="mx-auto mb-3 h-1 w-20 rounded-full bg-white/18" />
        </div>
      </div>
    </div>
  );
}

/** Desktop visual: browser window with address bar install icon + install dialog */
function DesktopBrowserVisual({ browser }: { browser: DesktopBrowser }) {
  const browserLabel =
    browser === "edge"
      ? "Edge"
      : browser === "firefox"
        ? "Firefox"
        : browser === "safari"
          ? "Safari"
          : "Chrome";

  const showInstallDialog = browser !== "firefox";

  return (
    <div className="relative w-full select-none" aria-hidden="true">
      <div className="absolute inset-4 -z-10 scale-105 rounded-3xl bg-forge-teal/50 opacity-25 blur-3xl" />
      {/* Desktop monitor */}
      <div className="relative mx-auto w-full max-w-120 pb-9">
        <div className="rounded-4xl border-8 border-black/80 bg-black/80 p-2 shadow-teal-glow-lg ring-1 ring-white/10">
          <div className="flex aspect-16/10 flex-col overflow-hidden rounded-2xl border border-white/10 bg-forge-deep-panel">
            {/* Browser chrome */}
            <div className="flex items-center gap-3 border-white/8 border-b bg-white/5 px-4 py-2.5">
              <div className="flex shrink-0 gap-1.5">
                <div className="size-2.5 rounded-full bg-white/25" />
                <div className="size-2.5 rounded-full bg-spark-amber/60" />
                <div className="size-2.5 rounded-full bg-forge-teal/70" />
              </div>
              <div className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-white/8 bg-white/6 px-3 py-2">
                <div className="size-2.5 shrink-0 rounded-full border border-white/20" />
                <span className="flex-1 font-mono text-[9px] text-white/30">
                  teamforge.app/download
                </span>
              </div>
              <span className="hidden font-medium text-[9px] text-white/20 sm:inline">
                {browserLabel}
              </span>
              {showInstallDialog && (
                <div className="flex shrink-0 items-center gap-1 rounded-lg border border-forge-teal/40 bg-forge-teal/20 px-2 py-1">
                  <MonitorSmartphone size={10} className="text-forge-teal" />
                  <span className="font-semibold text-[8px] text-forge-teal">
                    Install
                  </span>
                </div>
              )}
            </div>

            {/* Page content preview */}
            <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,0.92fr)_minmax(0,1fr)]">
              <div className="flex min-w-0 flex-col justify-center border-white/8 border-r px-8">
                <PreviewBrandLockup />
                <PreviewStatRows
                  className="mt-6 border-white/8 border-t pt-4"
                  compact
                  rows={[
                    { label: "Groups", value: "2 active", tone: "teal" },
                    { label: "Plans", value: "Today 7 PM" },
                  ]}
                />
              </div>

              <div className="flex min-w-0 items-center justify-center p-6">
                {showInstallDialog ? (
                  <DesktopInstallDialog />
                ) : (
                  <FirefoxInstallNotice />
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto h-7 w-24 rounded-b-xl border-white/10 border-x border-b bg-black/70" />
        <div className="mx-auto h-2 w-44 rounded-full border border-white/10 bg-black/70" />
      </div>
    </div>
  );
}

interface PreviewRow {
  label: string;
  value: string;
  tone?: "amber" | "teal";
}

function PreviewStatusBar() {
  return (
    <div className="flex items-center justify-between px-5 pt-3 pb-2">
      <span className="font-semibold text-[9px] text-white/45">9:41</span>
      <div className="flex items-center gap-1.5 text-white/40">
        <Wifi size={11} strokeWidth={1.5} aria-hidden="true" />
        <BatteryFull size={14} strokeWidth={1.5} aria-hidden="true" />
      </div>
    </div>
  );
}

function PreviewBrandLockup({
  centered = false,
  size = "default",
}: {
  centered?: boolean;
  size?: "default" | "large" | "phone";
}) {
  const logoSize =
    size === "large" ? "size-14" : size === "phone" ? "size-16" : "size-10";
  const logoPadding =
    size === "large" ? "p-3" : size === "phone" ? "p-3.5" : "p-2.5";
  const textSize =
    size === "large" ? "text-lg" : size === "phone" ? "text-base" : "text-sm";

  return (
    <div
      className={cn(
        "flex min-w-0 items-center gap-4",
        centered && "flex-col gap-3 text-center",
      )}
    >
      <div className={cn("shrink-0 rounded-lg bg-canvas", logoPadding)}>
        <TeamForgeLogo className={logoSize} showBackground={false} />
      </div>
      <div className="min-w-0">
        <p className={cn("font-bold text-white leading-tight", textSize)}>
          Team<span className="text-forge-teal">Forge</span>
        </p>
        <p className="mt-1 text-text-dark-muted text-xs leading-tight">
          Find your people, intelligently.
        </p>
      </div>
    </div>
  );
}

function PreviewStatRows({
  className,
  compact = false,
  rows,
}: {
  className?: string;
  compact?: boolean;
  rows: PreviewRow[];
}) {
  return (
    <div className={cn("grid gap-3", compact && "gap-2", className)}>
      {rows.map((row) => (
        <div
          key={row.label}
          className="flex items-center justify-between gap-5"
        >
          <span className="type-signature-label text-text-dark-muted">
            {row.label}
          </span>
          <span
            className={cn(
              "type-signature-label rounded-full px-2 py-0.5 font-semibold",
              row.tone === "teal" && "bg-forge-teal/15 text-forge-teal",
              row.tone === "amber" && "bg-spark-amber/15 text-spark-amber",
              !row.tone && "text-text-dark-secondary",
            )}
          >
            {row.value}
          </span>
        </div>
      ))}
    </div>
  );
}

function PreviewInstallBanner() {
  return (
    <div className="mx-3 mb-3 rounded-lg border border-white/10 bg-white/7 p-2.5">
      <div className="grid grid-cols-[1.75rem_minmax(0,1fr)_3rem] items-center gap-2">
        <div className="flex size-7 shrink-0 items-center justify-center rounded-sm bg-canvas">
          <TeamForgeLogo className="size-6" showBackground={false} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="type-signature-label whitespace-nowrap font-bold text-white">
            Install TeamForge
          </p>
          <p className="truncate text-[9px] text-white/45">teamforge.app</p>
        </div>
        <div className="type-signature-label rounded-full bg-forge-teal p-1 text-center font-bold text-white">
          Install
        </div>
      </div>
    </div>
  );
}

function DesktopInstallDialog() {
  return (
    <section className="w-full max-w-52 rounded-xl border border-forge-teal/25 bg-forge-teal/10 p-4 text-center">
      <p className="type-signature-label font-semibold text-white">
        Install TeamForge?
      </p>
      <p className="mx-auto mt-1 max-w-40 text-[9px] text-white/40 leading-relaxed">
        Opens as a focused app without browser tabs.
      </p>
      <div className="mt-4 flex justify-center gap-2">
        <div className="w-18 rounded-full border border-white/10 px-2 py-1 text-center font-semibold text-[9px] text-white/40">
          Cancel
        </div>
        <div className="w-18 rounded-full bg-forge-teal px-2 py-1 text-center font-semibold text-[9px] text-white">
          Install
        </div>
      </div>
    </section>
  );
}

function FirefoxInstallNotice() {
  return (
    <section className="w-full rounded-2xl border border-spark-amber/20 bg-spark-amber/8 p-4">
      <p className="type-signature-label font-semibold text-spark-amber">
        Firefox uses the browser view
      </p>
      <p className="mt-1 text-[9px] text-white/40 leading-relaxed">
        Open this page in Chrome or Edge to install TeamForge as an app.
      </p>
    </section>
  );
}

// ─── Install steps ────────────────────────────────────────────────────────────

interface NativeInstallCalloutProps {
  installState: InstallState;
  feedback: string | null;
  onInstallClick: () => void;
}

function NativeInstallCallout({
  installState,
  feedback,
  onInstallClick,
}: NativeInstallCalloutProps) {
  return (
    <div className="mb-8 rounded-2xl border border-forge-teal/20 bg-forge-teal/6 px-5 py-4 sm:flex sm:items-center sm:justify-between sm:gap-6">
      <div className="min-w-0">
        <p className="font-bold text-ink">Direct install is available here</p>
        <p className="mt-1 max-w-xl text-pretty text-slate-muted text-sm leading-relaxed">
          This browser can add TeamForge directly. Use the manual steps below
          only if the prompt does not appear.
        </p>
        {feedback && (
          <p className="mt-2 font-medium text-forge-teal text-sm">{feedback}</p>
        )}
      </div>
      <Button
        size="lg"
        loading={installState === "prompting"}
        className="mt-4 w-full sm:mt-0 sm:w-auto"
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
      {/* Step number */}
      <span
        className="shrink-0 select-none font-extrabold text-5xl text-forge-teal/20 tabular-nums leading-none transition-colors duration-200 group-hover:text-forge-teal/40 sm:text-7xl"
        aria-hidden="true"
      >
        {step.isAlternative ? "↳" : index}
      </span>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <h3 className="flex items-center gap-2 font-bold text-ink text-lg leading-tight">
          <span className="flex size-6 shrink-0 items-center justify-center rounded-full border border-forge-teal/15 bg-forge-teal/8 text-forge-teal">
            <StepIcon
              className="size-3.5"
              strokeWidth={1.5}
              aria-hidden="true"
            />
          </span>
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

// ─── Special notices ──────────────────────────────────────────────────────────

/** Shown when user is on iOS but not in Safari. */
function IosNonSafariNotice() {
  const browserName = getIosBrowserName();
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2500);
  }

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

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden rounded-xl border border-border/80 bg-background px-3 py-2">
                <span className="truncate font-mono text-slate-muted text-xs">
                  {typeof window !== "undefined"
                    ? window.location.href
                    : "teamforge.app/download"}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="shrink-0"
                onClick={handleCopy}
              >
                {copied ? (
                  <>
                    <ClipboardCheck
                      size={14}
                      strokeWidth={2}
                      aria-hidden="true"
                    />
                    Copied!
                  </>
                ) : (
                  <>
                    <ClipboardCopy
                      size={14}
                      strokeWidth={2}
                      aria-hidden="true"
                    />
                    Copy link
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Steps to open in Safari */}
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

/** Shown when user is on Firefox desktop — which doesn't support PWA install. */
function FirefoxNotice() {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2500);
  }

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

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden rounded-xl border border-border/80 bg-background px-3 py-2">
              <span className="truncate font-mono text-slate-muted text-xs">
                {typeof window !== "undefined"
                  ? window.location.href
                  : "teamforge.app/download"}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="shrink-0"
              onClick={handleCopy}
            >
              {copied ? (
                <>
                  <ClipboardCheck
                    size={14}
                    strokeWidth={2}
                    aria-hidden="true"
                  />
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

          <p className="mt-4 text-slate-muted text-sm">
            You can still use TeamForge in Firefox as a regular web page.{" "}
            <Link
              to="/auth/login"
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

// ─── Capabilities section ─────────────────────────────────────────────────────

interface CapabilityTileProps {
  capability: (typeof CAPABILITIES)[number];
  index: number;
  total: number;
}

function getCapabilityCellBorderClasses(index: number, total: number) {
  return cn(
    index < total - 1 ? "border-b" : "border-b-0",
    index % 2 === 0 ? "sm:border-r" : "sm:border-r-0",
    index < total - 2 ? "sm:border-b" : "sm:border-b-0",
  );
}

function CapabilityTile({ capability, index, total }: CapabilityTileProps) {
  const CapIcon = capability.icon;

  return (
    <li
      className={cn(
        "min-w-0 border-border/60 py-6 transition-colors duration-200 hover:bg-background/45 sm:p-6",
        getCapabilityCellBorderClasses(index, total),
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-full border border-forge-teal/15 bg-forge-teal/8 text-forge-teal">
          <CapIcon size={22} strokeWidth={1.5} aria-hidden="true" />
        </div>
        <span
          className="font-extrabold text-3xl text-slate-muted/30 leading-none"
          aria-hidden="true"
        >
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>
      <h3 className="mt-5 font-bold text-ink text-lg">{capability.title}</h3>
      <p className="mt-2 max-w-sm text-slate-muted leading-relaxed">
        {capability.body}
      </p>
    </li>
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

// ─── Push notification band ───────────────────────────────────────────────────

function PushNotificationBand() {
  const push = useWebPushSubscription();
  const copy = getPushCopy(push);
  const Icon = push.isSubscribed ? BellRing : Bell;
  const isBusy =
    push.isTurningOn || push.isTurningOff || push.isCheckingBrowserSubscription;
  const canTurnOn =
    push.canRequestPermission && !push.isSubscribed && !push.isPublicKeyLoading;
  const isActionDisabled =
    !push.isOnline ||
    isBusy ||
    push.isPublicKeyLoading ||
    (!push.isSubscribed && !push.canRequestPermission);
  const isDenied = push.permission === "denied";

  return (
    <div className="border-forge-teal/12 border-y bg-forge-teal/5">
      <div className="mx-auto flex max-w-6xl flex-col gap-5 px-6 py-8 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
        <div className="flex items-start gap-4">
          <span
            className={cn(
              "flex size-11 shrink-0 items-center justify-center rounded-full",
              push.isSubscribed
                ? "bg-forge-teal/12 text-forge-teal"
                : isDenied
                  ? "bg-spark-amber/10 text-spark-amber"
                  : "bg-slate-muted/10 text-slate-muted",
            )}
          >
            <Icon size={20} strokeWidth={1.5} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="font-bold text-ink">{copy.title}</p>
            <p className="mt-0.5 max-w-lg text-pretty text-slate-muted text-sm leading-relaxed">
              {copy.body}
            </p>
            {isDenied && (
              <p className="mt-2 flex items-start gap-1.5 text-slate-muted text-sm">
                <ExternalLink
                  size={13}
                  className="mt-0.5 shrink-0 text-spark-amber"
                  aria-hidden="true"
                />
                <span>{getPushDeniedHelp()}</span>
              </p>
            )}
          </div>
        </div>

        <div className="shrink-0">
          {!push.isAuthenticated ? (
            <Button
              variant="outline"
              size="sm"
              asChild
              className="min-h-11 lg:min-h-9"
            >
              <Link to="/auth/login">Sign in to enable alerts</Link>
            </Button>
          ) : push.isSubscribed ? (
            <Button
              variant="outline"
              size="sm"
              className="min-h-11 lg:min-h-9"
              disabled={!push.isOnline || isBusy}
              loading={push.isTurningOff}
              onClick={() => {
                void push.turnOff("download");
              }}
            >
              <BellOff size={15} strokeWidth={2} aria-hidden="true" />
              Turn off alerts
            </Button>
          ) : (
            <Button
              size="sm"
              className="min-h-11 lg:min-h-9"
              disabled={!canTurnOn || isActionDisabled}
              loading={push.isTurningOn}
              onClick={() => {
                void push.turnOn("download");
              }}
            >
              <BellRing size={15} strokeWidth={2} aria-hidden="true" />
              {isDenied ? "Blocked in browser" : "Turn on alerts"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
