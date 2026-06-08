import type { ForgeWizardState } from "@/features/forge/hooks/use-forge-wizard";

export interface InlineForgeWizardProps {
  onCancel: () => void;
}

export interface ForgeWizardChildProps {
  fw: ForgeWizardState;
}
