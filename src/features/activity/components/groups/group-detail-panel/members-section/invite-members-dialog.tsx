import { Link } from "@tanstack/react-router";
import { Search, SearchX, UserPlus } from "lucide-react";
import { type ReactNode, useState } from "react";
import type { ActivityParticipant } from "@/features/activity/lib/activity-contract";
import { Avatar } from "@/shared/components/common/avatar";
import { PresenceLabel } from "@/shared/components/common/presence-label";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import {
  GroupedMenuItem,
  GroupedMenuList,
} from "@/shared/components/ui/grouped-menu";
import { Input } from "@/shared/components/ui/input";
import { Notice } from "@/shared/components/ui/notice";
import { getApiErrorMessage } from "@/shared/lib/api-error-message";
import { cn } from "@/shared/lib/utils";
import { buildProfileNavigation } from "@/shared/navigation/profile-navigation";
import { formatMemberPercent } from "./member-card-view-state";

interface InviteMembersDialogProps {
  candidates: ActivityParticipant[];
  disabled?: boolean;
  invitingMemberId?: string | null;
  onInvite: (inviteeId: string) => Promise<void> | void;
  trigger?: ReactNode;
}

interface InviteCandidateRowProps {
  candidate: ActivityParticipant;
  disabled: boolean;
  isInviting: boolean;
  onInvite: (inviteeId: string) => Promise<void> | void;
}

function filterInviteCandidates(
  candidates: ActivityParticipant[],
  query: string,
) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return candidates;
  }

  return candidates.filter((candidate) =>
    getInviteCandidateSearchText(candidate).includes(normalizedQuery),
  );
}

function getInviteCandidateSearchText(candidate: ActivityParticipant) {
  return [candidate.name, candidate.city ?? "", candidate.personalityType ?? ""]
    .join(" ")
    .toLowerCase();
}

function getCandidateCountLabel(filteredCount: number, totalCount: number) {
  if (filteredCount !== totalCount) {
    return `${filteredCount} of ${totalCount}`;
  }

  return `${totalCount} ${totalCount === 1 ? "person" : "people"}`;
}

export function InviteMembersDialog({
  candidates,
  disabled = false,
  invitingMemberId = null,
  onInvite,
  trigger,
}: InviteMembersDialogProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [inviteError, setInviteError] = useState<string | null>(null);
  const filteredCandidates = filterInviteCandidates(candidates, query);

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);

    if (!nextOpen) {
      setQuery("");
      setInviteError(null);
    }
  };

  const handleInvite = async (inviteeId: string) => {
    if (disabled) {
      return;
    }

    setInviteError(null);

    try {
      await onInvite(inviteeId);
      setOpen(false);
      setQuery("");
    } catch (error) {
      setInviteError(
        getApiErrorMessage(
          error,
          "We couldn't send that invite. Please try again.",
        ),
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button
            variant="outline"
            size="xs"
            disabled={disabled}
            contentClassName="gap-1.5"
            title={disabled ? "Reconnect before inviting members." : undefined}
          >
            <UserPlus className="size-3.5" />
            Invite
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="flex max-h-[calc(100dvh-1.5rem)] w-[calc(100%-1.5rem)] max-w-xl flex-col gap-0 overflow-hidden rounded-2xl border-border/50 bg-popover p-0">
        <div className="flex flex-col gap-5 px-5 pt-6 pb-5 sm:px-6">
          <DialogHeader className="gap-2 pr-10 text-left">
            <DialogTitle className="text-xl">Invite to group</DialogTitle>
            <DialogDescription className="max-w-md text-pretty leading-relaxed">
              Choose a friend to fill an open place in this group.
            </DialogDescription>
          </DialogHeader>

          {inviteError ? (
            <Notice role="alert" tone="danger" size="md" className="rounded-xl">
              {inviteError}
            </Notice>
          ) : null}

          <Input
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setInviteError(null);
            }}
            placeholder="Search by name, city, or personality type"
            aria-label="Search people to invite"
            leftIcon={<Search className="size-4" />}
          />
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-3 px-5 pt-1 pb-5 sm:px-6">
          <div className="flex items-center justify-between gap-4 px-1">
            <p className="font-semibold text-foreground text-sm">
              People you know
            </p>
            <p className="shrink-0 text-muted-foreground text-xs">
              {getCandidateCountLabel(
                filteredCandidates.length,
                candidates.length,
              )}
            </p>
          </div>

          <div className="min-h-0 overflow-y-auto pr-1">
            {filteredCandidates.length === 0 ? (
              <div className="flex min-h-48 flex-col items-center justify-center rounded-2xl border border-border/60 border-dashed px-6 py-8 text-center">
                <span className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <SearchX className="size-5" aria-hidden="true" />
                </span>
                <p className="mt-4 font-semibold text-foreground text-sm">
                  {query ? "No one found" : "No one is available right now"}
                </p>
                <p className="mt-1 max-w-xs text-pretty text-muted-foreground text-xs leading-relaxed">
                  {query
                    ? "Try another name, city, or personality type."
                    : "Your friends may already be here or have a pending invitation."}
                </p>
              </div>
            ) : (
              <GroupedMenuList>
                {filteredCandidates.map((candidate) => (
                  <GroupedMenuItem key={candidate.id}>
                    <InviteCandidateRow
                      candidate={candidate}
                      disabled={disabled}
                      isInviting={invitingMemberId === candidate.id}
                      onInvite={handleInvite}
                    />
                  </GroupedMenuItem>
                ))}
              </GroupedMenuList>
            )}
          </div>

          <p className="px-1 text-muted-foreground/75 text-xs">
            They can review the group before deciding whether to join.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function InviteCandidateRow({
  candidate,
  disabled,
  isInviting,
  onInvite,
}: InviteCandidateRowProps) {
  const trustPercent = formatMemberPercent(candidate.trustScore);

  return (
    <div className="group/row flex min-h-18 items-center gap-3 px-3 py-2.5 transition-colors hover:bg-foreground/5">
      <Link
        {...buildProfileNavigation(candidate.id)}
        aria-label={`View ${candidate.name}'s profile`}
        className="group/profile flex min-w-0 flex-1 items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Avatar
          src={candidate.avatar}
          media={candidate.avatarMedia ?? null}
          name={candidate.name}
          fallback={candidate.name.slice(0, 1).toUpperCase()}
          className={cn(
            "size-11 bg-muted font-semibold text-foreground text-sm ring-1 ring-border/45 transition-transform group-hover/profile:scale-105",
            candidate.avatar && "bg-transparent",
          )}
        />

        <span className="min-w-0 flex-1">
          <span className="block truncate font-semibold text-foreground text-sm transition-colors group-hover/profile:text-forge-teal">
            {candidate.name}
          </span>
          <span className="mt-1 flex min-w-0 items-center gap-2">
            {candidate.city ? (
              <span className="truncate text-muted-foreground text-xs">
                {candidate.city}
              </span>
            ) : null}
            <PresenceLabel
              status={candidate.onlineStatus}
              lastSeenAt={candidate.lastSeenAt}
              className="max-w-40"
            />
          </span>
          <span className="mt-1 flex items-center gap-1.5 text-muted-foreground/80 text-xs">
            {candidate.personalityType ? (
              <span>{candidate.personalityType}</span>
            ) : null}
            {candidate.personalityType && trustPercent !== null ? (
              <span
                className="size-1 rounded-full bg-muted-foreground/35"
                aria-hidden="true"
              />
            ) : null}
            {trustPercent !== null ? <span>Trust {trustPercent}%</span> : null}
          </span>
        </span>
      </Link>

      <Button
        variant="ghost"
        size="xs"
        disabled={disabled || isInviting}
        loading={isInviting}
        className="shrink-0"
        onClick={() => {
          void onInvite(candidate.id);
        }}
        title={disabled ? "Reconnect before inviting members." : undefined}
      >
        <UserPlus className="size-3.5" aria-hidden="true" />
        Invite
      </Button>
    </div>
  );
}
