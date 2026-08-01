import { UserPlus } from "lucide-react";

import { Button } from "@/shared/components/ui/button";

interface FailureRecoveryActionsProps {
  onSwitchToManual?: () => void;
}

export function FailureRecoveryActions({
  onSwitchToManual,
}: FailureRecoveryActionsProps) {
  return (
    <section className="rounded-xl border border-border/60 border-dashed">
      {onSwitchToManual && (
        <div className="flex min-h-36 flex-col items-center justify-center px-5 py-6 text-center">
          <UserPlus
            className="size-5 text-muted-foreground"
            aria-hidden="true"
          />
          <div className="mt-3 min-w-0">
            <p className="font-black text-foreground text-sm leading-tight">
              Invite people manually
            </p>
            <p className="mx-auto mt-1.5 max-w-md text-muted-foreground text-xs leading-relaxed">
              Keep this plan and switch to invite mode instead of rebuilding it
              from scratch.
            </p>
          </div>
          <Button
            variant="outline"
            size="xs"
            className="mt-4 h-9 shrink-0"
            onClick={onSwitchToManual}
          >
            <UserPlus className="size-3.5" aria-hidden="true" />
            Invite
          </Button>
        </div>
      )}
    </section>
  );
}
