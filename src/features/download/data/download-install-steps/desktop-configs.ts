import Bookmark from "lucide-react/dist/esm/icons/bookmark.js";
import Download from "lucide-react/dist/esm/icons/download.js";
import Globe from "lucide-react/dist/esm/icons/globe.js";
import MonitorSmartphone from "lucide-react/dist/esm/icons/monitor-smartphone.js";
import Plus from "lucide-react/dist/esm/icons/plus.js";

import type { DeviceStepConfig } from "@/features/download/data/download-install-steps/types";
import type { DesktopBrowser } from "@/features/download/download-page-view-state";

export function getDesktopConfig(
  browser: DesktopBrowser,
): DeviceStepConfig | null {
  switch (browser) {
    case "chrome":
      return {
        heading: "Install from Chrome in two clicks",
        subheading:
          "Chrome installs Findafew as a standalone web app. No app store is needed.",
        steps: [
          {
            icon: MonitorSmartphone,
            title: "Find the install icon in your address bar",
            body: "Look for a small computer-screen icon (⊕) at the right edge of Chrome's address bar. If you don't see it, click the ⋮ menu at the top-right and look for 'Install Findafew' or 'Save and share → Install page as app'.",
            tip: "The icon appears automatically when Chrome detects the app is ready to install.",
          },
          {
            icon: Download,
            title: "Click 'Install' in the dialog",
            body: "A dialog asks for confirmation. Click 'Install'. Findafew opens in its own window without browser tabs or an address bar. You can pin it in the next step.",
          },
          {
            icon: Bookmark,
            title: "Pin for one-click access",
            body: "Right-click the Findafew icon in your taskbar (Windows) or Dock (macOS) and choose 'Pin to taskbar' or 'Keep in Dock'. You can then open Findafew from the pinned icon.",
          },
        ],
      };

    case "edge":
      return {
        heading: "Install Findafew from Edge",
        subheading:
          "Edge has native app installation. Findafew installs as a standalone app in seconds.",
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
            body: "An 'Install app?' dialog appears showing the Findafew icon and name. Click 'Install'. Findafew opens in its own window.",
          },
          {
            icon: Bookmark,
            title: "Pin to taskbar for quick access",
            body: "Edge will ask if you want to pin Findafew to your taskbar after installation. Click 'Allow'. You can also right-click the taskbar icon and choose 'Pin to taskbar' manually.",
          },
        ],
      };

    case "safari":
      return {
        heading: "Add Findafew to your Dock from Safari",
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
            body: "Choose 'Add to Dock…' from the File menu. A dialog appears showing the Findafew icon and name, already configured correctly. Click 'Add' to confirm.",
          },
          {
            icon: Bookmark,
            title: "Findafew is now in your Dock",
            body: "Click the Findafew icon to open it in its own window without the Safari toolbar or tabs. It opens to your groups and activity.",
          },
        ],
      };

    case "firefox":
      return null;

    default:
      return {
        heading: "Install Findafew on your desktop",
        subheading:
          "Use Chrome or Edge to install Findafew without an app store.",
        steps: [
          {
            icon: MonitorSmartphone,
            title: "Find the install icon in your address bar",
            body: "If your browser supports web app installation, look for a computer icon or download icon near the address bar. Clicking it will install Findafew as a standalone app.",
          },
          {
            icon: Download,
            title: "Click 'Install' in the dialog",
            body: "A dialog will confirm the installation. Click 'Install'. Findafew opens in its own window without any browser interface.",
          },
          {
            icon: Bookmark,
            title: "Pin for easy access",
            body: "Right-click the Findafew icon in your taskbar or Dock and choose to pin it for quick, one-click access.",
          },
        ],
      };
  }
}
