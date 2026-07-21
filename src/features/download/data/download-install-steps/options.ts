import Bell from "lucide-react/dist/esm/icons/bell.js";
import MonitorSmartphone from "lucide-react/dist/esm/icons/monitor-smartphone.js";
import RefreshCw from "lucide-react/dist/esm/icons/refresh-cw.js";
import Smartphone from "lucide-react/dist/esm/icons/smartphone.js";
import Wifi from "lucide-react/dist/esm/icons/wifi.js";

import type { DownloadDeviceTabOption } from "@/features/download/data/download-install-steps/types";
import type { SelectedDevice } from "@/features/download/download-page-view-state";

export const CAPABILITIES = [
  {
    icon: Smartphone,
    title: "Home-screen launch",
    body: "Open TeamForge in its own window without hunting through browser tabs.",
  },
  {
    icon: RefreshCw,
    title: "Fast returns",
    body: "The app shell stays ready so your next visit feels immediate.",
  },
  {
    icon: Wifi,
    title: "Reopen while reconnecting",
    body: "TeamForge can reopen its basic screen while your connection comes back.",
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
