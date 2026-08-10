"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { Search, UserRoundPlus, X } from "lucide-react";
import { useDeferredValue, useState } from "react";

import {
  planCreationFriendCandidatesQueryOptions,
  planCreationFriendCompatibilityQueryOptions,
} from "@/features/plan-creation/api/plan-creation-query-options";
import { ManualFriendInviteRow } from "@/features/plan-creation/components/steps/step3-group/manual-friend-invite-row";
import type { FriendCompatibilityPreview } from "@/features/plan-creation/lib/plan-creation-contract";
import { Avatar } from "@/shared/components/common/avatar";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import {
  GroupedMenuItem,
  GroupedMenuList,
} from "@/shared/components/ui/grouped-menu";
import { Input } from "@/shared/components/ui/input";
import { cn } from "@/shared/lib/utils";
import type { FriendshipApi } from "@/shared/schemas";

interface ParticipantInviteSlotsProps {
  availableSeatCount: number;
  groupId: string | null;
  groupMemberIds: string[];
  participantIds: Set<string>;
  selectedInviteeIds: string[];
  onInviteeToggle: (id: string) => void;
}

type FriendProfile = FriendshipApi["counterpart"];

export function ParticipantInviteSlots({
  availableSeatCount,
  groupId,
  groupMemberIds,
  participantIds,
  selectedInviteeIds,
  onInviteeToggle,
}: ParticipantInviteSlotsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [knownFriends, setKnownFriends] = useState<
    Record<string, FriendProfile>
  >({});
  const deferredSearch = useDeferredValue(search.trim());
  const friendsQuery = useInfiniteQuery({
    ...planCreationFriendCandidatesQueryOptions(deferredSearch),
    enabled: isOpen,
  });
  const candidates =
    friendsQuery.data?.pages
      .flatMap((page) => page.items)
      .filter((friendship) => !participantIds.has(friendship.counterpart.id)) ??
    [];
  const compatibilityCandidateIds = [
    ...new Set([
      ...candidates.map(({ counterpart }) => counterpart.id),
      ...selectedInviteeIds,
    ]),
  ];
  const compatibilityQuery = useQuery({
    ...planCreationFriendCompatibilityQueryOptions({
      candidateIds: compatibilityCandidateIds,
      groupId,
      groupMemberIds: [...groupMemberIds, ...selectedInviteeIds],
    }),
    enabled: compatibilityCandidateIds.length > 0,
  });
  const compatibilityByUserId = new Map(
    compatibilityQuery.data?.map((item) => [item.userId, item]),
  );
  const selectedFriends = selectedInviteeIds.map(
    (id) =>
      knownFriends[id] ??
      candidates.find((item) => item.counterpart.id === id)?.counterpart ??
      null,
  );
  const emptySeatCount = Math.max(
    0,
    availableSeatCount - selectedInviteeIds.length,
  );
  const openSeatIds = createOpenSeatIds(emptySeatCount);
  const isAtCapacity = selectedInviteeIds.length >= availableSeatCount;

  function handleFriendToggle(friend: FriendProfile) {
    setKnownFriends((current) => ({ ...current, [friend.id]: friend }));
    onInviteeToggle(friend.id);
  }

  return (
    <>
      {selectedInviteeIds.map((inviteeId, index) => (
        <GroupedMenuItem key={inviteeId} className="bg-card/80">
          <SelectedInviteeRow
            compatibility={compatibilityByUserId.get(inviteeId)}
            compatibilityPending={compatibilityQuery.isFetching}
            friend={selectedFriends[index]}
            onRemove={() => onInviteeToggle(inviteeId)}
          />
        </GroupedMenuItem>
      ))}

      {openSeatIds.map((seatId) => (
        <GroupedMenuItem key={seatId} className="bg-card/45">
          <button
            type="button"
            className="group flex min-h-20 w-full items-center gap-3 px-3 py-3 text-left text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
            onClick={() => setIsOpen(true)}
          >
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full border border-border/60 border-dashed transition-colors group-hover:border-foreground/35 group-hover:text-foreground">
              <UserRoundPlus className="size-4" aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-black text-foreground text-sm">
                Open place
              </span>
              <span className="mt-1 block text-xs leading-relaxed">
                Choose a friend to invite.
              </span>
            </span>
            <span className="font-bold text-foreground text-xs">Add</span>
          </button>
        </GroupedMenuItem>
      ))}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-xl">
          <DialogHeader className="px-5 pt-5 pr-14 pb-4 text-left sm:px-6 sm:pt-6">
            <DialogTitle>Invite someone you know</DialogTitle>
            <DialogDescription>
              Fill an open place with a friend. They receive the invitation when
              you finish creating the group. Group fit shows the weakest
              connection after they join.
            </DialogDescription>
          </DialogHeader>

          <div className="border-border/45 border-y px-4 py-3 sm:px-5">
            <label className="relative block" htmlFor="result-friend-search">
              <span className="sr-only">Search friends</span>
              <Search
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                id="result-friend-search"
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search friends"
                className="pl-9"
              />
            </label>
          </div>

          <div className="max-h-80 overflow-y-auto px-4 py-4 sm:px-5">
            <FriendPickerContent
              candidates={candidates}
              compatibilityByUserId={compatibilityByUserId}
              compatibilityPending={compatibilityQuery.isFetching}
              isAtCapacity={isAtCapacity}
              isError={friendsQuery.isError}
              isLoading={friendsQuery.isPending}
              selectedInviteeIds={selectedInviteeIds}
              onFriendToggle={handleFriendToggle}
              onRetry={() => void friendsQuery.refetch()}
            />
            {friendsQuery.hasNextPage ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-3 w-full"
                disabled={friendsQuery.isFetchingNextPage}
                onClick={() => void friendsQuery.fetchNextPage()}
              >
                {friendsQuery.isFetchingNextPage
                  ? "Loading…"
                  : "Load more friends"}
              </Button>
            ) : null}
          </div>

          <DialogFooter className="border-border/45 border-t px-4 py-4 sm:px-5">
            <p className="mr-auto self-center text-muted-foreground text-xs">
              {selectedInviteeIds.length} of {availableSeatCount} open places
              filled
            </p>
            <Button type="button" size="sm" onClick={() => setIsOpen(false)}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function createOpenSeatIds(count: number) {
  const seatIds: string[] = [];

  for (let seatNumber = 1; seatNumber <= count; seatNumber += 1) {
    seatIds.push(`open-seat-${seatNumber}`);
  }

  return seatIds;
}

function SelectedInviteeRow({
  compatibility,
  compatibilityPending,
  friend,
  onRemove,
}: {
  compatibility?: FriendCompatibilityPreview;
  compatibilityPending: boolean;
  friend: FriendProfile | null;
  onRemove: () => void;
}) {
  const name = friend?.name.trim() || "Selected friend";

  return (
    <div className="flex min-h-20 items-center gap-3 px-3 py-3">
      <Avatar
        src={friend?.avatar ?? null}
        name={name}
        className="size-11 shrink-0 ring-1 ring-brand-teal/35"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate font-black text-foreground text-sm">{name}</p>
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
          <span className="text-foreground">Invitation ready to send</span>
          <CompactFitSignal
            label="You"
            pending={compatibilityPending}
            value={compatibility?.personalFit ?? null}
          />
          <CompactFitSignal
            label="Group"
            pending={compatibilityPending}
            value={compatibility?.groupFit ?? null}
          />
        </div>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-9 shrink-0 rounded-full text-muted-foreground hover:bg-destructive-soft hover:text-destructive"
        aria-label={`Remove ${name} from the invitation list`}
        title={`Remove ${name}`}
        onClick={onRemove}
      >
        <X className="size-4" aria-hidden="true" />
      </Button>
    </div>
  );
}

function FriendPickerContent({
  candidates,
  compatibilityByUserId,
  compatibilityPending,
  isAtCapacity,
  isError,
  isLoading,
  selectedInviteeIds,
  onFriendToggle,
  onRetry,
}: {
  candidates: FriendshipApi[];
  compatibilityByUserId: ReadonlyMap<string, FriendCompatibilityPreview>;
  compatibilityPending: boolean;
  isAtCapacity: boolean;
  isError: boolean;
  isLoading: boolean;
  selectedInviteeIds: string[];
  onFriendToggle: (friend: FriendProfile) => void;
  onRetry: () => void;
}) {
  if (isLoading) {
    return (
      <p
        className="py-8 text-center text-muted-foreground text-sm"
        role="status"
      >
        Loading friends…
      </p>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-28 flex-col items-center justify-center gap-3 text-center">
        <p className="text-muted-foreground text-sm">
          We couldn't load your friends.
        </p>
        <Button type="button" variant="outline" size="sm" onClick={onRetry}>
          Try again
        </Button>
      </div>
    );
  }

  if (candidates.length === 0) {
    return (
      <p className="py-8 text-center text-muted-foreground text-sm">
        No available friends found.
      </p>
    );
  }

  return (
    <GroupedMenuList aria-label="Friends available to invite">
      {candidates.map((friendship) => {
        const friend = friendship.counterpart;
        const selected = selectedInviteeIds.includes(friend.id);

        return (
          <GroupedMenuItem key={friend.id}>
            <ManualFriendInviteRow
              compatibility={compatibilityByUserId.get(friend.id)}
              compatibilityPending={compatibilityPending}
              friendship={friendship}
              selected={selected}
              disabled={!selected && isAtCapacity}
              onToggle={() => onFriendToggle(friend)}
            />
          </GroupedMenuItem>
        );
      })}
    </GroupedMenuList>
  );
}

function CompactFitSignal({
  label,
  pending,
  value,
}: {
  label: "Group" | "You";
  pending: boolean;
  value: number | null;
}) {
  return (
    <span className="font-semibold text-muted-foreground">
      {label}{" "}
      <strong
        className={cn(
          "font-black tabular-nums",
          pending || value === null
            ? "text-muted-foreground/55"
            : value >= 70
              ? "text-foreground"
              : value < 50
                ? "text-brand-amber"
                : "text-foreground",
        )}
      >
        {pending ? "…" : value === null ? "—" : `${Math.round(value)}%`}
      </strong>
    </span>
  );
}
