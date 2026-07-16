import { ArrowLeft, ArrowRight, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/shared/components/ui/button";
import { IconTile } from "@/shared/components/ui/icon-tile";

interface OnboardingIntroBenefit {
  icon: LucideIcon;
  text: string;
}

interface OnboardingIntroBenefitListProps {
  benefits: readonly OnboardingIntroBenefit[];
  iconTileClassName?: string;
  textClassName: string;
}

interface OnboardingIntroActionsProps {
  backLabel: string;
  onBack: () => void;
  onStart: () => void;
  startDisabled?: boolean;
  startLabel: ReactNode;
  startLoading?: boolean;
}

export function OnboardingIntroBenefitList({
  benefits,
  iconTileClassName,
  textClassName,
}: OnboardingIntroBenefitListProps) {
  return (
    <div className="mb-8 flex w-full flex-col gap-4 text-left">
      {benefits.map(({ icon: Icon, text }) => (
        <div key={text} className="flex items-start gap-3.5">
          <IconTile
            icon={Icon}
            size="md"
            tone="teal"
            className={iconTileClassName}
          />
          <p className={textClassName}>{text}</p>
        </div>
      ))}
    </div>
  );
}

export function OnboardingIntroActions({
  backLabel,
  onBack,
  onStart,
  startDisabled = false,
  startLabel,
  startLoading = false,
}: OnboardingIntroActionsProps) {
  return (
    <div className="mt-auto flex w-full xs:flex-row flex-col-reverse xs:items-center items-stretch gap-3 pt-6">
      <Button
        size="md"
        variant="outline"
        onClick={onBack}
        className="w-full xs:w-auto min-w-0 xs:shrink-0 px-4"
      >
        <ArrowLeft size={16} strokeWidth={2.5} />
        <span className="truncate">{backLabel}</span>
      </Button>
      <Button
        size="md"
        onClick={onStart}
        disabled={startDisabled}
        loading={startLoading}
        className="flex w-full min-w-0 xs:flex-1 items-center justify-center gap-2"
      >
        <span className="truncate">{startLabel}</span>
        <ArrowRight size={16} strokeWidth={2.5} />
      </Button>
    </div>
  );
}
