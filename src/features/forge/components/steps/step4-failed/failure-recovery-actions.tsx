import { Clock3, UserPlus } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { IconTile } from "@/shared/components/ui/icon-tile";
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
          <IconTile
            icon={Clock3}
            tone="amber"
            size="lg"
            className="size-9 bg-spark-amber/15"
            iconClassName="size-4"
          />
          <div className="min-w-0 flex-1">
            <p className="font-black text-foreground text-sm leading-tight">
              Keep searching
            </p>
            <p className="mt-1 text-muted-foreground text-xs leading-snug">
              Save this activity so you can search again later.
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
