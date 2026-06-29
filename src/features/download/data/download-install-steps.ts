import type { LucideIcon } from "lucide-react";
import Bell from "lucide-react/dist/esm/icons/bell.js";
import Bookmark from "lucide-react/dist/esm/icons/bookmark.js";
import CheckCircle2 from "lucide-react/dist/esm/icons/circle-check.js";
import Download from "lucide-react/dist/esm/icons/download.js";
import EllipsisVertical from "lucide-react/dist/esm/icons/ellipsis-vertical.js";
import Globe from "lucide-react/dist/esm/icons/globe.js";
import MonitorSmartphone from "lucide-react/dist/esm/icons/monitor-smartphone.js";
import Plus from "lucide-react/dist/esm/icons/plus.js";
import RefreshCw from "lucide-react/dist/esm/icons/refresh-cw.js";
import Share from "lucide-react/dist/esm/icons/share.js";
import Smartphone from "lucide-react/dist/esm/icons/smartphone.js";
import Wifi from "lucide-react/dist/esm/icons/wifi.js";
import type {
  DesktopBrowser,
  SelectedDevice,
} from "@/features/download/download-page-view-state";

export interface StepData {
  body: string;
  icon: LucideIcon;
  isAlternative?: boolean;
  tip?: string;
  title: string;
}

export interface DeviceStepConfig {
  heading: string;
  steps: StepData[];
  subheading?: string;
}

interface DownloadDeviceTabOption {
  icon: LucideIcon;
  id: SelectedDevice;
  label: string;
  shortLabel?: string;
}

export const IOS_SAFARI_CONFIG: DeviceStepConfig = {
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

export const ANDROID_CONFIG: DeviceStepConfig = {
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

export const CAPABILITIES = [
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

export const INSTALL_DEVICE_SWITCH_OPTIONS = [
  { id: "ios", label: "iPhone & iPad" },
  { id: "android", label: "Android" },
  { id: "desktop", label: "Desktop" },
] as const satisfies readonly {
  id: SelectedDevice;
  label: string;
}[];

export const DEVICE_TABS: readonly DownloadDeviceTabOption[] = [
  { id: "ios", label: "iPhone & iPad", shortLabel: "iPhone", icon: Smartphone },
  { id: "android", label: "Android", icon: Smartphone },
  { id: "desktop", label: "Desktop", icon: MonitorSmartphone },
] as const;

export function getDesktopConfig(
  browser: DesktopBrowser,
): DeviceStepConfig | null {
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
      return null;

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

export function getSelectedDeviceStepConfig(
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
