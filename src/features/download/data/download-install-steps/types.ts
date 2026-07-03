import type { LucideIcon } from "lucide-react";

import type { SelectedDevice } from "@/features/download/download-page-view-state";

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

export interface DownloadDeviceTabOption {
  icon: LucideIcon;
  id: SelectedDevice;
  label: string;
  shortLabel?: string;
}
