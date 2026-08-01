import { Search, UserRoundPlus } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  GroupedMenuItem,
  GroupedMenuList,
} from "@/shared/components/ui/grouped-menu";
import { IconTile } from "@/shared/components/ui/icon-tile";
import { Input } from "@/shared/components/ui/input";
import { Slider } from "@/shared/components/ui/slider";
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
  compatibilityByUserId,
  compatibilityPending,
  fixedSize,
  friendSearch,
  friends,
  hasMoreFriends,
  isFriendsError,
  isLoadingMoreFriends,
  isLoadingFriends,
  manualInviteeIds,
  onFixedSizeChange,
  onFriendSearchChange,
  onLoadMoreFriends,
  onManualInviteeToggle,
  onRetryFriends,
  totalFriends,
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

      <ManualInviteIntro
        friendSearch={friendSearch}
        onFriendSearchChange={onFriendSearchChange}
        totalFriends={totalFriends}
      />

      <ManualFriendInviteList
        compatibilityByUserId={compatibilityByUserId}
        compatibilityPending={compatibilityPending}
        friendSearch={friendSearch}
        friends={friends}
        hasMoreFriends={hasMoreFriends}
        inviteState={inviteState}
        isFriendsError={isFriendsError}
        isLoadingMoreFriends={isLoadingMoreFriends}
        isLoadingFriends={isLoadingFriends}
        manualInviteeIds={manualInviteeIds}
        onLoadMoreFriends={onLoadMoreFriends}
        onManualInviteeToggle={onManualInviteeToggle}
        onRetryFriends={onRetryFriends}
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
    <div className="flex flex-col gap-4 border-border/35 border-y py-4">
      <div className="grid grid-cols-2">
        <div className="grid gap-1">
          <span className="font-semibold text-muted-foreground text-xs">
            Group capacity
          </span>
          <span className="flex items-baseline gap-1.5">
            <strong className="font-black text-3xl text-foreground tabular-nums tracking-tight">
              {fixedSize}
            </strong>
            <span className="font-medium text-muted-foreground text-xs">
              people
            </span>
          </span>
        </div>
        <div className="grid gap-1 border-border/35 border-l pl-5">
          <span className="font-semibold text-muted-foreground text-xs">
            Seats planned
          </span>
          <span className="flex items-baseline gap-1.5">
            <strong className="font-black text-3xl text-foreground tabular-nums tracking-tight">
              {inviteState.selectedInviteeCount + 1}
            </strong>
            <span className="font-medium text-muted-foreground text-xs">
              of {fixedSize}
            </span>
          </span>
        </div>
      </div>

      <div className="grid gap-1 px-0.5">
        <Slider
          className="h-9"
          value={[fixedSize]}
          onValueChange={(value) => onFixedSizeChange(value[0] ?? fixedSize)}
          min={2}
          max={8}
          segments={6}
          step={1}
          aria-label="Manual group capacity"
        />
        <div className="flex justify-between px-0.5">
          <span className="text-muted-foreground/60 text-xs">2</span>
          <span className="text-muted-foreground/60 text-xs">8</span>
        </div>
      </div>

      <p className="text-muted-foreground text-xs">
        You plus up to {inviteState.inviteLimit}{" "}
        {getInvitedMemberLabel(inviteState.inviteLimit)}.
      </p>
    </div>
  );
}

function ManualInviteIntro({
  friendSearch,
  onFriendSearchChange,
  totalFriends,
}: Pick<
  ManualGroupDetailsProps,
  "friendSearch" | "onFriendSearchChange" | "totalFriends"
>) {
  return (
    <div className="grid gap-3 px-0.5 pt-1">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h4 className="font-black text-base text-foreground tracking-tight">
            Pick who to invite
          </h4>
          <p className="mt-1 min-w-0 text-muted-foreground text-xs leading-relaxed opacity-80">
            Fit with you and the projected group update as you choose people.
            Group fit reflects the weakest connection.
          </p>
        </div>
        <span className="shrink-0 text-muted-foreground text-xs tabular-nums">
          {totalFriends} {totalFriends === 1 ? "friend" : "friends"}
        </span>
      </div>

      <label className="relative block" htmlFor="forge-friend-search">
        <span className="sr-only">Search friends</span>
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          id="forge-friend-search"
          type="search"
          value={friendSearch}
          onChange={(event) => onFriendSearchChange(event.target.value)}
          placeholder="Search friends"
          className="pl-9"
        />
      </label>
    </div>
  );
}

function ManualFriendInviteList({
  compatibilityByUserId,
  compatibilityPending,
  friendSearch,
  friends,
  hasMoreFriends,
  inviteState,
  isFriendsError,
  isLoadingMoreFriends,
  isLoadingFriends,
  manualInviteeIds,
  onLoadMoreFriends,
  onManualInviteeToggle,
  onRetryFriends,
}: Pick<
  ManualGroupDetailsProps,
  | "friendSearch"
  | "compatibilityByUserId"
  | "compatibilityPending"
  | "friends"
  | "hasMoreFriends"
  | "isFriendsError"
  | "isLoadingMoreFriends"
  | "isLoadingFriends"
  | "manualInviteeIds"
  | "onLoadMoreFriends"
  | "onManualInviteeToggle"
  | "onRetryFriends"
> & {
  inviteState: ManualGroupInviteState;
}) {
  return (
    <div className="flex flex-col gap-2">
      <ManualInviteFriendsContent
        compatibilityByUserId={compatibilityByUserId}
        compatibilityPending={compatibilityPending}
        friendSearch={friendSearch}
        friends={friends}
        inviteState={inviteState}
        isFriendsError={isFriendsError}
        isLoadingFriends={isLoadingFriends}
        manualInviteeIds={manualInviteeIds}
        onManualInviteeToggle={onManualInviteeToggle}
        onRetryFriends={onRetryFriends}
      />

      {hasMoreFriends ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isLoadingMoreFriends}
          onClick={onLoadMoreFriends}
          className="w-full"
        >
          {isLoadingMoreFriends ? "Loading…" : "Load more friends"}
        </Button>
      ) : null}

      <CapacityReachedNotice show={inviteState.hasReachedInviteLimit} />
    </div>
  );
}

function ManualInviteFriendsContent({
  compatibilityByUserId,
  compatibilityPending,
  friendSearch,
  friends,
  inviteState,
  isFriendsError,
  isLoadingFriends,
  manualInviteeIds,
  onManualInviteeToggle,
  onRetryFriends,
}: Pick<
  ManualGroupDetailsProps,
  | "friendSearch"
  | "compatibilityByUserId"
  | "compatibilityPending"
  | "friends"
  | "isFriendsError"
  | "isLoadingFriends"
  | "manualInviteeIds"
  | "onManualInviteeToggle"
  | "onRetryFriends"
> & {
  inviteState: ManualGroupInviteState;
}) {
  if (isLoadingFriends) {
    return <ManualFriendsSkeleton />;
  }

  if (isFriendsError) {
    return <FriendsErrorNotice onRetry={onRetryFriends} />;
  }

  if (friends.length === 0) {
    return friendSearch.trim() ? (
      <NoMatchingFriendsNotice />
    ) : (
      <EmptyFriendsNotice />
    );
  }

  return (
    <ManualFriendInviteRows
      compatibilityByUserId={compatibilityByUserId}
      compatibilityPending={compatibilityPending}
      friends={friends}
      inviteState={inviteState}
      manualInviteeIds={manualInviteeIds}
      onManualInviteeToggle={onManualInviteeToggle}
    />
  );
}

function FriendsErrorNotice({ onRetry }: { onRetry: () => void }) {
  return (
    <div
      className="flex min-h-28 items-center justify-between gap-3 border-border/40 border-y px-1 py-4"
      role="alert"
    >
      <p className="text-muted-foreground text-xs leading-relaxed">
        We couldn't load your friends. Check your connection and try again.
      </p>
      <Button type="button" variant="outline" size="sm" onClick={onRetry}>
        Try again
      </Button>
    </div>
  );
}

function ManualFriendInviteRows({
  compatibilityByUserId,
  compatibilityPending,
  friends,
  inviteState,
  manualInviteeIds,
  onManualInviteeToggle,
}: Pick<
  ManualGroupDetailsProps,
  | "compatibilityByUserId"
  | "compatibilityPending"
  | "friends"
  | "manualInviteeIds"
  | "onManualInviteeToggle"
> & {
  inviteState: ManualGroupInviteState;
}) {
  return (
    <GroupedMenuList aria-label="Friends to invite">
      {friends.map((friendship) => (
        <GroupedMenuItem key={friendship.counterpart.id}>
          <ManualFriendInviteRow
            compatibility={compatibilityByUserId.get(friendship.counterpart.id)}
            compatibilityPending={compatibilityPending}
            friendship={friendship}
            {...getManualFriendInviteRowState(
              friendship,
              manualInviteeIds,
              inviteState,
            )}
            onToggle={onManualInviteeToggle}
          />
        </GroupedMenuItem>
      ))}
    </GroupedMenuList>
  );
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
    <div className="flex min-h-28 items-center justify-center gap-3 border-border/40 border-y px-1 py-4">
      <IconTile icon={UserRoundPlus} size="lg" shape="circle" tone="neutral" />
      <p className="text-muted-foreground text-xs leading-relaxed">
        You do not have friends to invite yet. You can create the group now and
        invite people later from the group workspace.
      </p>
    </div>
  );
}

function NoMatchingFriendsNotice() {
  return (
    <div className="grid min-h-24 place-items-center border-border/40 border-y px-4 py-5 text-center">
      <p className="text-muted-foreground text-xs leading-relaxed">
        No friends found for that search.
      </p>
    </div>
  );
}
