import { ArrowRight, RefreshCcw } from "lucide-react";

import { Button } from "@/shared/components/ui/button";

interface PersonalityResultActionsProps {
  continueLabel: string;
  onContinue: () => void;
  onRetake: () => void;
}

export function PersonalityResultActions({
  continueLabel,
  onContinue,
  onRetake,
}: PersonalityResultActionsProps) {
  return (
    <>
      <section className="mt-auto flex flex-col gap-3 border-t border-border/70 pt-6 sm:flex-row">
        <Button
          size="md"
          onClick={onContinue}
          className="w-full min-w-0 sm:flex-1"
        >
          <span className="truncate">{continueLabel}</span>
          <ArrowRight size={18} className="shrink-0" />
        </Button>
        <Button
          variant="outline"
          size="md"
          onClick={onRetake}
          className="w-full min-w-0 sm:w-auto sm:shrink-0"
        >
          <RefreshCcw size={18} className="shrink-0" />
          <span className="truncate">Retake</span>
        </Button>
      </section>

      <p className="text-center text-xs font-medium text-muted-foreground">
        Retaking replaces this result and can change the groups TeamForge
        prioritizes.
      </p>
    </>
  );
}
