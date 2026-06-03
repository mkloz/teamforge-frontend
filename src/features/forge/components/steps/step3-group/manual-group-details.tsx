import { Users } from "lucide-react";
import { EmptyInviteCandidatesVisual } from "@/assets/empty-state/empty-invite-candidates";
import { IconTile } from "@/shared/components/ui/icon-tile";
import { Slider } from "@/shared/components/ui/slider";
import { StatusPill } from "@/shared/components/ui/status-pill";
import { ManualFriendInviteRow } from "./manual-friend-invite-row";
import { ManualFriendsSkeleton } from "./manual-friends-skeleton";
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
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 rounded-lg border border-border/35 bg-card/65 px-3 py-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <span className="font-bold text-muted-foreground/50 text-xs tracking-wide">
              Max group size
            </span>
            <p className="mt-0.5 text-muted-foreground/65 text-xs">
              You plus up to {inviteLimit} invited member
              {inviteLimit !== 1 ? "s" : ""}.
            </p>
          </div>
          <StatusPill
            size="sm"
            tone="amber"
            numeric
            className="rounded-lg font-black"
          >
            {selectedInviteeCount + 1}/{fixedSize}
          </StatusPill>
        </div>

        <div className="flex flex-col gap-1">
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
        <IconTile
          icon={Users}
          size="lg"
          tone="amber"
          className="mt-0.5 size-9"
        />
        <div className="flex flex-col gap-1">
          <h5 className="font-black text-foreground text-sm tracking-tight">
            Pick who to invite
          </h5>
          <p className="text-muted-foreground text-xs leading-relaxed opacity-80">
            Manual groups start with you as the organiser. Selected friends
            receive real invitations after you confirm the group.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {isLoadingFriends && <ManualFriendsSkeleton />}

        {!isLoadingFriends && friends.length === 0 && (
          <div className="flex min-h-28 items-center justify-center gap-3 rounded-lg border border-border/40 bg-card p-4">
            <EmptyInviteCandidatesVisual className="h-10 w-auto shrink-0 text-foreground" />
            <p className="text-muted-foreground text-xs leading-relaxed">
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
            <ManualFriendInviteRow
              key={friend.id}
              friendship={friendship}
              selected={selected}
              disabled={disabled}
              onToggle={onManualInviteeToggle}
            />
          );
        })}

        {selectedInviteeCount >= inviteLimit && inviteLimit > 0 && (
          <p className="px-1 font-semibold text-micro text-spark-amber">
            Capacity reached. Increase max group size to invite more.
          </p>
        )}
      </div>
    </div>
  );
}
