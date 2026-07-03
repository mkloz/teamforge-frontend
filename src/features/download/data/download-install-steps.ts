import { getDesktopConfig } from "@/features/download/data/download-install-steps/desktop-configs";
import {
  ANDROID_CONFIG,
  IOS_SAFARI_CONFIG,
} from "@/features/download/data/download-install-steps/mobile-configs";
import type { DeviceStepConfig } from "@/features/download/data/download-install-steps/types";
import type {
  DesktopBrowser,
  SelectedDevice,
} from "@/features/download/download-page-view-state";

export {
  CAPABILITIES,
  DEVICE_TABS,
  INSTALL_DEVICE_SWITCH_OPTIONS,
} from "@/features/download/data/download-install-steps/options";
export type {
  DeviceStepConfig,
  StepData,
} from "@/features/download/data/download-install-steps/types";

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
