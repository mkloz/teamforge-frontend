import CheckCircle2 from "lucide-react/dist/esm/icons/circle-check.js";
import Download from "lucide-react/dist/esm/icons/download.js";
import EllipsisVertical from "lucide-react/dist/esm/icons/ellipsis-vertical.js";
import Globe from "lucide-react/dist/esm/icons/globe.js";
import Plus from "lucide-react/dist/esm/icons/plus.js";
import Share from "lucide-react/dist/esm/icons/share.js";

import type { DeviceStepConfig } from "@/features/download/data/download-install-steps/types";

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
