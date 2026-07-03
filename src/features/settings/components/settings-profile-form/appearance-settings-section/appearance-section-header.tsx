import { RotateCcw } from "lucide-react";
import { SectionHeading } from "@/features/settings/components/settings-profile-form/preference-section-parts";
import { Button } from "@/shared/components/ui/button";

interface AppearanceSectionHeaderProps {
  isResetDisabled: boolean;
  isResetLoading: boolean;
  onReset: () => void;
}

export function AppearanceSectionHeader({
  isResetDisabled,
  isResetLoading,
  onReset,
}: AppearanceSectionHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <SectionHeading
        title="Appearance"
        description="Layer the mode, material style, and color pack that make TeamForge feel right for you."
      />
      <Button
        type="button"
        variant="subtle"
        size="xs"
        className="self-start"
        disabled={isResetDisabled}
        loading={isResetLoading}
        onClick={onReset}
      >
        <RotateCcw size={14} strokeWidth={2} aria-hidden="true" />
        Reset defaults
      </Button>
    </div>
  );
}
