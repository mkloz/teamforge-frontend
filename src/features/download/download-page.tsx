import { Link } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import Bell from "lucide-react/dist/esm/icons/bell.js";
import Bookmark from "lucide-react/dist/esm/icons/bookmark.js";
import CheckCircle2 from "lucide-react/dist/esm/icons/circle-check.js";
import ClipboardCheck from "lucide-react/dist/esm/icons/clipboard-check.js";
import ClipboardCopy from "lucide-react/dist/esm/icons/clipboard-copy.js";
import Download from "lucide-react/dist/esm/icons/download.js";
import EllipsisVertical from "lucide-react/dist/esm/icons/ellipsis-vertical.js";
import Globe from "lucide-react/dist/esm/icons/globe.js";
import MonitorSmartphone from "lucide-react/dist/esm/icons/monitor-smartphone.js";
import Plus from "lucide-react/dist/esm/icons/plus.js";
import QrCode from "lucide-react/dist/esm/icons/qr-code.js";
import RefreshCw from "lucide-react/dist/esm/icons/refresh-cw.js";
import Share from "lucide-react/dist/esm/icons/share.js";
import Smartphone from "lucide-react/dist/esm/icons/smartphone.js";
import Wifi from "lucide-react/dist/esm/icons/wifi.js";
import { Fragment, lazy, Suspense, useState } from "react";
import {
  type DesktopBrowser,
  type DetectedPlatform,
  type DownloadPageViewState,
  getDownloadPageViewState,
  type InstallState,
  platformToDevice,
  type SelectedDevice,
} from "@/features/download/download-page-view-state";
import { Footer } from "@/features/landing/components/footer";
import { Navbar } from "@/features/landing/components/navbar";
import { useLandingAuthActions } from "@/features/landing/hooks/use-landing-auth-actions";
import { QrShareDialog } from "@/shared/components/qr-share-dialog";
import { Button } from "@/shared/components/ui/button";
import { IconTile } from "@/shared/components/ui/icon-tile";
import { useDeferredRender } from "@/shared/hooks/use-deferred-render";
import { usePageMetadata } from "@/shared/hooks/use-page-metadata";
import { usePwaDisplayMode } from "@/shared/hooks/use-pwa-display-mode";
import { usePwaInstallPrompt } from "@/shared/hooks/use-pwa-install-prompt";
import { buildAppUrl } from "@/shared/lib/app-url";
import { buildAuthRouteNavigation } from "@/shared/lib/auth-route";
import { getCurrentBrowserOrigin } from "@/shared/lib/browser-capabilities";
import type { PageMetadata } from "@/shared/lib/document-metadata";
import { cn } from "@/shared/lib/utils";

interface DownloadPreviewImage {
  height: number;
  sizes: string;
  src: string;
  srcSet: string;
  width: number;
}

const DOWNLOAD_PREVIEW_IMAGES = {
  android: {
    height: 900,
    sizes: "(min-width: 640px) 17rem, min(20rem, calc(100vw - 3rem))",
    src: "/download/install-preview-android.png",
    srcSet:
      "/download/install-preview-android-256w.png 256w, /download/install-preview-android-360w.png 360w, /download/install-preview-android.png 465w",
    width: 465,
  },
  desktop: {
    height: 510,
    sizes: "(min-width: 1024px) 30rem, min(30rem, calc(100vw - 3rem))",
    src: "/download/install-preview-desktop.png",
    srcSet:
      "/download/install-preview-desktop-480w.png 480w, /download/install-preview-desktop.png 815w",
    width: 815,
  },
  ios: {
    height: 647,
    sizes: "(min-width: 1024px) 35rem, min(35rem, calc(100vw - 3rem))",
    src: "/download/install-preview-ios.png",
    srcSet:
      "/download/install-preview-ios-480w.png 480w, /download/install-preview-ios-720w.png 720w, /download/install-preview-ios.png 984w",
    width: 984,
  },
} as const satisfies Record<SelectedDevice, DownloadPreviewImage>;

const DOWNLOAD_AUTH_RETURN_TO = "/download";

const DeferredPushNotificationBand = lazy(() =>
  import("@/features/download/components/push-notification-band").then((m) => ({
    default: m.PushNotificationBand,
  })),
);

const DeferredPwaDiagnosticsPanel = lazy(() =>
  import("@/features/download/components/pwa-diagnostics-panel").then((m) => ({
    default: m.PwaDiagnosticsPanel,
  })),
);

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

const INSTALL_DEVICE_SWITCH_OPTIONS = [
  { id: "ios", label: "iPhone & iPad" },
  { id: "android", label: "Android" },
  { id: "desktop", label: "Desktop" },
] as const satisfies readonly {
  id: SelectedDevice;
  label: string;
}[];

const INSTALL_DEVICE_SWITCH_BUTTON_CLASS =
  "inline-flex min-h-11 items-center rounded-md font-medium text-primary underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2";
const DOWNLOAD_PAGE_LINK_COPY_RESET_MS = 2500;

// ─── Platform detection ───────────────────────────────────────────────────────

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
  return typeof navigator === "undefined" ? null : navigator.userAgent;
}

function isIosDevice(ua: string, uaLower: string) {
  const isTouchMac =
    ua.includes("Macintosh") &&
    typeof navigator !== "undefined" &&
    navigator.maxTouchPoints > 1;

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

function getIosBrowserName(): string {
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

// ─── Helpers ─────────────────────────────────────────────────────────────────

function scrollToSteps() {
  document
    .getElementById("install-steps")
    ?.scrollIntoView({ behavior: "smooth" });
}

function getSelectedDeviceStepConfig(
  selectedDevice: SelectedDevice,
  desktopBrowser: DesktopBrowser,
): DeviceStepConfig | null {
  if (selectedDevice === "ios") {
    return IOS_SAFARI_CONFIG;
  }

  if (selectedDevice === "android") {
    return ANDROID_CONFIG;
  }

  return getDesktopConfig(desktopBrowser);
}

// ─── Page ────────────────────────────────────────────────────────────────────

export function DownloadPage() {
  usePageMetadata(DOWNLOAD_PAGE_METADATA);

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

  const stepConfig = getSelectedDeviceStepConfig(
    selectedDevice,
    desktopBrowser,
  );

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <Navbar
        actionSet="download"
        forceSolid
        staticPublicTheme
        installAction={
          viewState.canUseNativePrompt
            ? {
                isLoading: installState === "prompting",
                onInstallClick: handleInstallClick,
              }
            : undefined
        }
      />

      <main>
        <DownloadHeroSection
          desktopBrowser={desktopBrowser}
          detected={detected}
          downloadQrUrl={downloadQrUrl}
          installState={installState}
          isStandalone={isStandalone}
          onInstallClick={handleInstallClick}
          onSelectedDeviceChange={setSelectedDevice}
          selectedDevice={selectedDevice}
          viewState={viewState}
        />

        <InstallStepsSection
          installState={installState}
          onInstallClick={handleInstallClick}
          onSelectedDeviceChange={setSelectedDevice}
          selectedDevice={selectedDevice}
          stepConfig={stepConfig}
          viewState={viewState}
        />

        <DeferredPwaSections />

        <InstallBenefitsSection />
      </main>
      <Footer />
    </div>
  );
}

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

function DownloadHeroSection({
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
          <HeroVisual
            selectedDevice={selectedDevice}
            detected={detected}
            desktopBrowser={desktopBrowser}
          />
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

interface InstallStepsSectionProps {
  installState: InstallState;
  onInstallClick: () => void;
  onSelectedDeviceChange: (value: SelectedDevice) => void;
  selectedDevice: SelectedDevice;
  stepConfig: DeviceStepConfig | null;
  viewState: DownloadPageViewState;
}

function InstallStepsSection({
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

function DeferredPwaSections() {
  const { sentinelRef, shouldRender } = useDeferredRender({
    rootMargin: "240px 0px",
  });

  return (
    <>
      <div ref={sentinelRef} aria-hidden="true" />

      {shouldRender && (
        <Suspense fallback={null}>
          <DeferredPushNotificationBand />
          <DeferredPwaDiagnosticsPanel />
        </Suspense>
      )}
    </>
  );
}

function InstallBenefitsSection() {
  return (
    <section className="bg-canvas" aria-labelledby="install-benefits-title">
      <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-5 lg:gap-12">
          <div className="lg:col-span-2">
            <p className="font-semibold text-forge-teal text-xs">
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
                <IconTile
                  bordered
                  icon={Download}
                  shape="circle"
                  size="lg"
                  tone="teal"
                  className="size-11 bg-forge-teal/8"
                  iconClassName="size-5"
                />
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
  );
}

// ─── Device selector ─────────────────────────────────────────────────────────

interface DownloadDeviceTabOption {
  icon: LucideIcon;
  id: SelectedDevice;
  label: string;
  shortLabel?: string;
}

interface DownloadDeviceTabsProps {
  ariaLabel: string;
  onChange: (value: SelectedDevice) => void;
  options: readonly DownloadDeviceTabOption[];
  value: SelectedDevice;
}

const DEVICE_TABS: readonly DownloadDeviceTabOption[] = [
  { id: "ios", label: "iPhone & iPad", shortLabel: "iPhone", icon: Smartphone },
  { id: "android", label: "Android", icon: Smartphone },
  { id: "desktop", label: "Desktop", icon: MonitorSmartphone },
] as const;

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

// ─── Hero visuals (per device) ────────────────────────────────────────────────

interface HeroVisualProps {
  selectedDevice: SelectedDevice;
  detected: DetectedPlatform;
  desktopBrowser: DesktopBrowser;
}

function HeroVisual({ selectedDevice }: HeroVisualProps) {
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

/** iPad visual: optimized screenshot preview */
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

/** Android visual: optimized screenshot preview */
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

/** Desktop visual: optimized screenshot preview */
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

// ─── Special notices ──────────────────────────────────────────────────────────

interface DownloadPageLinkCopyControlProps {
  copied: boolean;
  onCopy: () => Promise<void>;
}

function useDownloadPageLinkCopy() {
  const [copied, setCopied] = useState(false);

  async function copyCurrentPageUrl() {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, DOWNLOAD_PAGE_LINK_COPY_RESET_MS);
  }

  return { copied, copyCurrentPageUrl };
}

function getDownloadPageLink() {
  return typeof window !== "undefined"
    ? window.location.href
    : buildAppUrl("/download");
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

/** Shown when user is on iOS but not in Safari. */
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
        <IconTile
          bordered
          icon={CapIcon}
          shape="circle"
          size="xl"
          tone="teal"
          className="bg-forge-teal/8"
          iconClassName="size-5.5"
        />
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
