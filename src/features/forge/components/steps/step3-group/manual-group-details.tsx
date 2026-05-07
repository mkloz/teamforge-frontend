import { AlertCircle, Check, Plus, Users } from "lucide-react";

import { Avatar } from "@/shared/components/common/avatar";
import { Button } from "@/shared/components/ui/button";
import { Slider } from "@/shared/components/ui/slider";
import { cn } from "@/shared/lib/utils";

import { formatTrustScore } from "./step3-group.utils";
import type { ManualGroupDetailsProps } from "./types";

export function ManualGroupDetails({
  fixedSize,
  friends,
  isLoadingFriends,
  manualInviteeIds,
  onFixedSizeChange,
  onManualInviteeToggle,
}: ManualGroupDetailsProps) {
  const inviteLimit = Math.max(0, fixedSize - 1);
  const selectedInviteeCount = manualInviteeIds.length;

  return (
    <div className="animate-in space-y-4 duration-300 zoom-in-95 fade-in">
      <div className="space-y-3 rounded-lg border border-border/35 bg-card/65 px-3 py-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <span className="text-xs font-bold tracking-wide text-muted-foreground/50">
              Max group size
            </span>
            <p className="mt-0.5 text-xs text-muted-foreground/65">
              You plus up to {inviteLimit} invited member
              {inviteLimit !== 1 ? "s" : ""}.
            </p>
          </div>
          <span className="rounded-lg border border-spark-amber/20 bg-spark-amber/10 px-2.5 py-1 text-xs font-black text-spark-amber tabular-nums">
            {selectedInviteeCount + 1}/{fixedSize}
          </span>
        </div>

        <div className="space-y-1">
          <div className="py-1">
            <Slider
              className="h-10"
              value={[fixedSize]}
              onValueChange={(value) =>
                onFixedSizeChange(value[0] ?? fixedSize)
              }
              min={2}
              max={8}
              step={1}
              aria-label="Manual group capacity"
            />
          </div>
          <div className="flex justify-between px-0.5">
            <span className="text-micro text-muted-foreground/40">2 min</span>
            <span className="text-micro text-muted-foreground/40">8 max</span>
          </div>
        </div>
      </div>

      <div className="flex gap-3 rounded-lg border border-border/35 bg-muted/20 p-3">
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-spark-amber/10">
          <Users size={16} className="text-spark-amber" />
        </div>
        <div className="space-y-1">
          <h5 className="text-sm font-black tracking-tight text-foreground">
            Pick who to invite
          </h5>
          <p className="text-xs leading-relaxed text-muted-foreground opacity-80">
            Manual groups start with you as the organiser. Selected friends
            receive real invitations after you confirm the group.
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {isLoadingFriends && (
          <div className="rounded-lg border border-border/40 bg-card p-4 text-xs font-medium text-muted-foreground">
            Loading friends...
          </div>
        )}

        {!isLoadingFriends && friends.length === 0 && (
          <div className="flex gap-3 rounded-lg border border-border/40 bg-card p-4">
            <AlertCircle
              size={16}
              className="mt-0.5 shrink-0 text-muted-foreground/60"
            />
            <p className="text-xs leading-relaxed text-muted-foreground">
              You do not have friends to invite yet. The group can still be
              created now, then shared later from the group hub.
            </p>
          </div>
        )}

        {friends.map((friendship) => {
          const friend = friendship.counterpart;
          const selected = manualInviteeIds.includes(friend.id);
          const atLimit = selectedInviteeCount >= inviteLimit;
          const disabled = !selected && atLimit;

          return (
            <Button
              key={friend.id}
              type="button"
              variant="ghost"
              disabled={disabled}
              onClick={() => onManualInviteeToggle(friend.id)}
              className={cn(
                "h-auto w-full justify-start rounded-lg border bg-card p-3 text-left transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50",
                selected
                  ? "border-spark-amber/35 bg-spark-amber/10 ring-1 ring-spark-amber/20"
                  : "border-border/45 hover:border-spark-amber/25 hover:bg-spark-amber/5",
              )}
              contentClassName="w-full items-center justify-start gap-3"
            >
              <Avatar
                src={friend.avatar}
                name={friend.name}
                className="size-11"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">
                  {friend.name}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-1.5 text-micro text-muted-foreground/65">
                  {friend.city && <span>{friend.city}</span>}
                  {friend.personalityType && (
                    <span>{friend.personalityType}</span>
                  )}
                  <span>Trust {formatTrustScore(friend.trustScore)}</span>
                </div>
              </div>
              <span
                className={cn(
                  "flex size-8 items-center justify-center rounded-full border transition-colors",
                  selected
                    ? "border-spark-amber bg-spark-amber text-ink"
                    : "border-border/60 bg-background text-muted-foreground",
                )}
              >
                {selected ? <Check size={15} /> : <Plus size={15} />}
              </span>
            </Button>
          );
        })}

        {selectedInviteeCount >= inviteLimit && inviteLimit > 0 && (
          <p className="px-1 text-micro font-semibold text-spark-amber">
            Capacity reached. Increase max group size to invite more.
          </p>
        )}
      </div>
    </div>
  );
}
