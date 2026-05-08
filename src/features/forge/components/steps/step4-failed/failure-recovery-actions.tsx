import { Clock3, UserPlus } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { Switch } from "@/shared/components/ui/switch";

interface FailureRecoveryActionsProps {
  isKeepSearchingEnabled: boolean;
  isKeepingSearch: boolean;
  onKeepSearchingChange?: (enabled: boolean) => void;
  onSwitchToManual?: () => void;
}

export function FailureRecoveryActions({
  isKeepSearchingEnabled,
  isKeepingSearch,
  onKeepSearchingChange,
  onSwitchToManual,
}: FailureRecoveryActionsProps) {
  return (
    <section className="overflow-hidden rounded-lg border border-border/35 bg-card/60">
      {onKeepSearchingChange && (
        <div className="flex items-start gap-3 p-3.5">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-spark-amber/15 text-spark-amber">
            <Clock3 size={17} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-black text-foreground text-sm leading-tight">
              Keep searching
            </p>
            <p className="mt-1 text-muted-foreground text-xs leading-snug">
              Save this activity as matching so it stays available for a later
              retry.
            </p>
          </div>
          <Switch
            checked={isKeepSearchingEnabled}
            aria-label="Keep searching"
            aria-busy={isKeepingSearch}
            className="mt-0.5"
            onCheckedChange={onKeepSearchingChange}
          />
        </div>
      )}

      {onSwitchToManual && (
        <div className="flex items-start gap-3 border-border/30 border-t p-3.5">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-forge-teal/12 text-forge-teal">
            <UserPlus size={17} />
          </div>
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
            className="h-8 shrink-0 px-3 font-bold text-xs"
            onClick={onSwitchToManual}
          >
            Invite
          </Button>
        </div>
      )}
    </section>
  );
}
