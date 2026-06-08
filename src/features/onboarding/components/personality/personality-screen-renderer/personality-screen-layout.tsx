import { ArrowLeft, ArrowRight } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

interface PersonalityScreenShellProps {
  children: ReactNode;
  className?: string;
}

interface BackLinkProps {
  label?: string;
  onBack: () => void;
}

interface StepNavigationProps {
  backClassName?: string;
  className?: string;
  nextLabel?: string;
  onBack: () => void;
  onNext: () => void;
  backLabel?: string;
}

export function PersonalityScreenShell({
  children,
  className,
}: PersonalityScreenShellProps) {
  return (
    <div
      className={cn(
        "mx-auto flex min-h-0 w-full flex-1 flex-col justify-start gap-0 pt-4 sm:pt-0",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function MotionStep({
  children,
  className,
}: PersonalityScreenShellProps) {
  return <div className={className}>{children}</div>;
}

export function BackLink({ label = "Back", onBack }: BackLinkProps) {
  return (
    <MotionStep className="mb-5 self-start">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onBack}
        className="h-8 rounded-md px-2 font-bold text-muted-foreground text-sm underline-offset-4 hover:bg-transparent hover:text-ink hover:underline focus-visible:ring-forge-teal dark:hover:text-white"
      >
        <ArrowLeft size={15} strokeWidth={2.5} aria-hidden="true" />
        <span>{label}</span>
      </Button>
    </MotionStep>
  );
}

export function StepNavigation({
  backClassName,
  backLabel = "Back",
  className,
  nextLabel = "Next step",
  onBack,
  onNext,
}: StepNavigationProps) {
  return (
    <MotionStep
      className={cn(
        "mt-auto flex w-full xs:flex-row flex-col-reverse xs:items-center items-stretch gap-3 pt-6",
        className,
      )}
    >
      <Button
        size="md"
        variant="outline"
        onClick={onBack}
        className={cn("w-full xs:w-auto min-w-0 xs:shrink-0", backClassName)}
      >
        <ArrowLeft size={16} strokeWidth={2.5} />
        <span className="truncate">{backLabel}</span>
      </Button>
      <Button size="md" onClick={onNext} className="w-full min-w-0 xs:flex-1">
        <span className="truncate">{nextLabel}</span>
        <ArrowRight size={16} strokeWidth={2.5} />
      </Button>
    </MotionStep>
  );
}
