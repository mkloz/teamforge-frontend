import type { ForgeMode } from "@/features/forge/lib/forge-contract";

export interface Step4FailedProps {
  forgeMode: ForgeMode;
  onSwitchToManual?: () => void;
}

export interface Step4FailedContent {
  description: string;
  context: string;
  reasons: readonly string[];
  suggestions: readonly string[];
}
