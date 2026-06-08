import type { ForgeWizardState } from "@/features/forge/hooks/use-forge-wizard";

export interface ForgeFooterProps {
  fw: ForgeWizardState;
  onDisabledStep1Continue: () => void;
}

export interface ForgeFooterChildProps {
  fw: ForgeWizardState;
}
