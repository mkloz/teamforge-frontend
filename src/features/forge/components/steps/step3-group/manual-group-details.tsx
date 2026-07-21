import { Users } from "lucide-react";
import { EmptyInviteCandidatesVisual } from "@/assets/empty-state/empty-invite-candidates";
import { IconTile } from "@/shared/components/ui/icon-tile";
import { Slider } from "@/shared/components/ui/slider";
import { StatusPill } from "@/shared/components/ui/status-pill";
import { ManualFriendInviteRow } from "./manual-friend-invite-row";
import { ManualFriendsSkeleton } from "./manual-friends-skeleton";
import type { ManualGroupDetailsProps } from "./types";

interface ManualGroupInviteState {
  hasReachedInviteLimit: boolean;
  inviteLimit: number;
  selectedInviteeCount: number;
}

type ManualFriendship = ManualGroupDetailsProps["friends"][number];

export function ManualGroupDetails({
  fixedSize,
  friends,
  isLoadingFriends,
  manualInviteeIds,
  onFixedSizeChange,
  onManualInviteeToggle,
}: ManualGroupDetailsProps) {
  const inviteState = getManualGroupInviteState({
    fixedSize,
    manualInviteeIds,
  });

  return (
    <div className="flex flex-col gap-4">
      <ManualCapacityCard
        fixedSize={fixedSize}
        inviteState={inviteState}
        onFixedSizeChange={onFixedSizeChange}
      />

      <ManualInviteIntro />

      <ManualFriendInviteList
        friends={friends}
        inviteState={inviteState}
        isLoadingFriends={isLoadingFriends}
        manualInviteeIds={manualInviteeIds}
        onManualInviteeToggle={onManualInviteeToggle}
      />
    </div>
  );
}

function getManualGroupInviteState({
  fixedSize,
  manualInviteeIds,
}: Pick<
  ManualGroupDetailsProps,
  "fixedSize" | "manualInviteeIds"
>): ManualGroupInviteState {
  const inviteLimit = Math.max(0, fixedSize - 1);
  const selectedInviteeCount = manualInviteeIds.length;

  return {
    hasReachedInviteLimit:
      selectedInviteeCount >= inviteLimit && inviteLimit > 0,
    inviteLimit,
    selectedInviteeCount,
  };
}

function getInvitedMemberLabel(inviteLimit: number) {
  return inviteLimit !== 1 ? "invited members" : "invited member";
}

function ManualCapacityCard({
  fixedSize,
  inviteState,
  onFixedSizeChange,
}: Pick<ManualGroupDetailsProps, "fixedSize" | "onFixedSizeChange"> & {
  inviteState: ManualGroupInviteState;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border/35 bg-card/65 px-3 py-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <span className="font-bold text-muted-foreground/50 text-xs tracking-wide">
            Max group size
          </span>
          <p className="mt-0.5 text-muted-foreground/65 text-xs">
            You plus up to {inviteState.inviteLimit}{" "}
            {getInvitedMemberLabel(inviteState.inviteLimit)}.
          </p>
        </div>
        <StatusPill
          size="sm"
          tone="amber"
          numeric
          className="rounded-lg font-black"
        >
          {inviteState.selectedInviteeCount + 1}/{fixedSize}
        </StatusPill>
      </div>

      <div className="flex flex-col gap-1">
        <div className="py-1">
          <Slider
            className="h-10"
            value={[fixedSize]}
            onValueChange={(value) => onFixedSizeChange(value[0] ?? fixedSize)}
            min={2}
            max={8}
            step={1}
            aria-label="Manual group capacity"
          />
        </div>
        <div className="flex justify-between px-0.5">
          <span className="text-muted-foreground/40 text-xs">2 min</span>
          <span className="text-muted-foreground/40 text-xs">8 max</span>
        </div>
      </div>
    </div>
  );
}

function ManualInviteIntro() {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border/35 bg-muted/20 p-3">
      <div className="flex min-w-0 items-center gap-2">
        <IconTile icon={Users} size="xs" tone="amber" />
        <h5 className="min-w-0 font-black text-foreground text-sm leading-5 tracking-tight">
          Pick who to invite
        </h5>
      </div>
      <p className="min-w-0 text-muted-foreground text-xs leading-relaxed opacity-80">
        Manual groups start with you as the organiser. Selected friends receive
        real invitations after you confirm the group.
      </p>
    </div>
  );
}

function ManualFriendInviteList({
  friends,
  inviteState,
  isLoadingFriends,
  manualInviteeIds,
  onManualInviteeToggle,
}: Pick<
  ManualGroupDetailsProps,
  "friends" | "isLoadingFriends" | "manualInviteeIds" | "onManualInviteeToggle"
> & {
  inviteState: ManualGroupInviteState;
}) {
  return (
    <div className="flex flex-col gap-2">
      <ManualInviteFriendsContent
        friends={friends}
        inviteState={inviteState}
        isLoadingFriends={isLoadingFriends}
        manualInviteeIds={manualInviteeIds}
        onManualInviteeToggle={onManualInviteeToggle}
      />

      <CapacityReachedNotice show={inviteState.hasReachedInviteLimit} />
    </div>
  );
}

function ManualInviteFriendsContent({
  friends,
  inviteState,
  isLoadingFriends,
  manualInviteeIds,
  onManualInviteeToggle,
}: Pick<
  ManualGroupDetailsProps,
  "friends" | "isLoadingFriends" | "manualInviteeIds" | "onManualInviteeToggle"
> & {
  inviteState: ManualGroupInviteState;
}) {
  if (isLoadingFriends) {
    return <ManualFriendsSkeleton />;
  }

  if (friends.length === 0) {
    return <EmptyFriendsNotice />;
  }

  return (
    <ManualFriendInviteRows
      friends={friends}
      inviteState={inviteState}
      manualInviteeIds={manualInviteeIds}
      onManualInviteeToggle={onManualInviteeToggle}
    />
  );
}

function ManualFriendInviteRows({
  friends,
  inviteState,
  manualInviteeIds,
  onManualInviteeToggle,
}: Pick<
  ManualGroupDetailsProps,
  "friends" | "manualInviteeIds" | "onManualInviteeToggle"
> & {
  inviteState: ManualGroupInviteState;
}) {
  return friends.map((friendship) => (
    <ManualFriendInviteRow
      key={friendship.counterpart.id}
      friendship={friendship}
      {...getManualFriendInviteRowState(
        friendship,
        manualInviteeIds,
        inviteState,
      )}
      onToggle={onManualInviteeToggle}
    />
  ));
}

function getManualFriendInviteRowState(
  friendship: ManualFriendship,
  manualInviteeIds: string[],
  inviteState: ManualGroupInviteState,
) {
  const selected = manualInviteeIds.includes(friendship.counterpart.id);

  return {
    disabled: !selected && inviteState.hasReachedInviteLimit,
    selected,
  };
}

function CapacityReachedNotice({ show }: { show: boolean }) {
  if (!show) {
    return null;
  }

  return (
    <p className="px-1 font-semibold text-spark-amber text-xs">
      Capacity reached. Increase max group size to invite more.
    </p>
  );
}

function EmptyFriendsNotice() {
  return (
    <div className="flex min-h-28 items-center justify-center gap-3 rounded-lg border border-border/40 bg-card p-4">
      <EmptyInviteCandidatesVisual className="h-10 w-auto shrink-0 text-foreground" />
      <p className="text-muted-foreground text-xs leading-relaxed">
        You do not have friends to invite yet. You can create the group now and
        invite people later from the group workspace.
      </p>
    </div>
  );
}
