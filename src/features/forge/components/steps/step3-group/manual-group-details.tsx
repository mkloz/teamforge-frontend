import * as RadixSlider from "@radix-ui/react-slider";
import { AlertCircle, Check, Plus, Users } from "lucide-react";

import { Avatar } from "@/shared/components/common/avatar";
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
    <div className="space-y-5 animate-in fade-in zoom-in-95 duration-500">
      <div className="px-0.5 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <span className="text-xs font-bold text-muted-foreground/50 tracking-wide">
              Max group size
            </span>
            <p className="mt-0.5 text-xs text-muted-foreground/65">
              You plus up to {inviteLimit} invited member
              {inviteLimit !== 1 ? "s" : ""}.
            </p>
          </div>
          <span className="rounded-lg border border-accent/20 bg-accent/10 px-2.5 py-1 text-xs font-black tabular-nums text-accent">
            {selectedInviteeCount + 1}/{fixedSize}
          </span>
        </div>

        <div className="space-y-1">
          <div className="py-1">
            <RadixSlider.Root
              className="relative flex items-center select-none touch-none w-full h-10"
              value={[fixedSize]}
              onValueChange={([v]) => onFixedSizeChange(v)}
              min={2}
              max={8}
              step={1}
            >
              <RadixSlider.Track className="bg-muted relative grow rounded-full h-1.5">
                <RadixSlider.Range className="absolute bg-accent rounded-full h-full" />
              </RadixSlider.Track>
              <RadixSlider.Thumb
                className="block w-6 h-6 bg-background border-2 border-accent rounded-full shadow-md shadow-accent/20 hover:scale-110 active:scale-95 transition-transform outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 cursor-grab active:cursor-grabbing"
                aria-label="Manual group capacity"
              />
            </RadixSlider.Root>
          </div>
          <div className="flex justify-between px-0.5">
            <span className="text-micro text-muted-foreground/40">2 min</span>
            <span className="text-micro text-muted-foreground/40">8 max</span>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-muted/20 bg-muted/5 p-4 flex gap-3.5">
        <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center shrink-0 mt-0.5">
          <Users size={16} className="text-accent" />
        </div>
        <div className="space-y-1">
          <h5 className="text-sm font-black tracking-tight text-foreground">
            Pick who to invite
          </h5>
          <p className="text-xs text-muted-foreground leading-relaxed opacity-80">
            Manual groups start with you as the organiser. Selected friends
            receive real invitations after you confirm the group.
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {isLoadingFriends && (
          <div className="rounded-xl border border-border/40 bg-card p-4 text-xs font-medium text-muted-foreground">
            Loading friends...
          </div>
        )}

        {!isLoadingFriends && friends.length === 0 && (
          <div className="rounded-xl border border-border/40 bg-card p-4 flex gap-3">
            <AlertCircle
              size={16}
              className="mt-0.5 shrink-0 text-muted-foreground/60"
            />
            <p className="text-xs text-muted-foreground leading-relaxed">
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
            <button
              key={friend.id}
              type="button"
              disabled={disabled}
              onClick={() => onManualInviteeToggle(friend.id)}
              className={cn(
                "w-full rounded-2xl border bg-card p-3 text-left transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50",
                selected
                  ? "border-accent/35 bg-accent/8 ring-1 ring-accent/20"
                  : "border-border/45 hover:border-accent/25 hover:bg-accent/4",
              )}
            >
              <div className="flex items-center gap-3">
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
                      ? "border-accent bg-accent text-accent-foreground"
                      : "border-border/60 bg-background text-muted-foreground",
                  )}
                >
                  {selected ? <Check size={15} /> : <Plus size={15} />}
                </span>
              </div>
            </button>
          );
        })}

        {selectedInviteeCount >= inviteLimit && inviteLimit > 0 && (
          <p className="px-1 text-micro font-semibold text-accent/85">
            Capacity reached. Increase max group size to invite more.
          </p>
        )}
      </div>
    </div>
  );
}
