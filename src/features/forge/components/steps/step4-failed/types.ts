import type { ForgeMode } from "@/features/forge/lib/forge-contract";

export interface Step4FailedProps {
  forgeMode: ForgeMode;
  onSwitchToManual?: () => void;
}

export interface Step4FailedContent {
  title: string;
  description: string;
  context: string;
  reasons: readonly string[];
  suggestions: readonly string[];
}
