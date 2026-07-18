import { UserPlus } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { IconTile } from "@/shared/components/ui/icon-tile";

interface FailureRecoveryActionsProps {
  onSwitchToManual?: () => void;
}

export function FailureRecoveryActions({
  onSwitchToManual,
}: FailureRecoveryActionsProps) {
  return (
    <section className="overflow-hidden rounded-lg border border-border/35 bg-card/60">
      {onSwitchToManual && (
        <div className="flex items-start gap-3 p-3.5">
          <IconTile
            icon={UserPlus}
            tone="teal"
            size="lg"
            className="size-9 bg-forge-teal/12"
            iconClassName="size-4"
          />
          <div className="min-w-0 flex-1">
            <p className="font-black text-foreground text-sm leading-tight">
              Invite people manually
            </p>
            <p className="mt-1 text-muted-foreground text-xs leading-snug">
              Keep this plan and switch to invite mode instead of rebuilding it
              from scratch.
            </p>
          </div>
          <Button
            variant="outline"
            size="xs"
            className="h-8 shrink-0"
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
