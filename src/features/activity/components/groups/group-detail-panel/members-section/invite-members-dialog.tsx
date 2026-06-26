import { Link } from "@tanstack/react-router";
import { Search, UserPlus } from "lucide-react";
import { useMemo, useState } from "react";
import { EmptyInviteCandidatesVisual } from "@/assets/empty-state/empty-invite-candidates";
import { ErrorInviteSendFailedVisual } from "@/features/activity/assets/error-invite-send-failed";
import type { ActivityParticipant } from "@/features/activity/lib/activity-contract";
import { buildProfileNavigation } from "@/features/profile/lib/profile-route";
import { Avatar } from "@/shared/components/common/avatar";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Notice } from "@/shared/components/ui/notice";
import { getApiErrorMessage } from "@/shared/lib/api-error-message";
import { cn } from "@/shared/lib/utils";

interface InviteMembersDialogProps {
  candidates: ActivityParticipant[];
  disabled?: boolean;
  invitingMemberId?: string | null;
  onInvite: (inviteeId: string) => Promise<void> | void;
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

function getInviteCandidateMeta(candidate: ActivityParticipant) {
  return `${candidate.city || "Location pending"}${
    candidate.personalityType ? ` · ${candidate.personalityType}` : ""
  }`;
}

export function InviteMembersDialog({
  candidates,
  disabled = false,
  invitingMemberId = null,
  onInvite,
}: InviteMembersDialogProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [inviteError, setInviteError] = useState<string | null>(null);

  const filteredCandidates = useMemo(
    () => filterInviteCandidates(candidates, query),
    [candidates, query],
  );

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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
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
      </DialogTrigger>
      <DialogContent className="max-w-md rounded-lg border-border/60 bg-popover p-0">
        <DialogHeader className="border-border/50 border-b px-6 py-5">
          <DialogTitle>Invite to group</DialogTitle>
          <DialogDescription>
            Invite someone you already know to join this group.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 px-6 py-5">
          {inviteError ? (
            <Notice
              role="alert"
              tone="danger"
              size="md"
              icon={
                <ErrorInviteSendFailedVisual className="h-8 w-auto text-foreground" />
              }
              className="items-center gap-3 rounded-lg"
              iconClassName="mt-0"
            >
              {inviteError}
            </Notice>
          ) : null}

          <div>
            <Input
              type="search"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setInviteError(null);
              }}
              placeholder="Search friends by name, city, or personality"
              leftIcon={<Search className="size-4" />}
            />
          </div>

          <div className="flex max-h-80 flex-col gap-2 overflow-y-auto pr-1">
            {filteredCandidates.length === 0 ? (
              <div className="flex min-h-48 flex-col items-center justify-center rounded-lg border border-border/70 border-dashed bg-muted/40 px-4 py-6 text-center">
                <EmptyInviteCandidatesVisual className="h-24 w-auto text-foreground" />
                <p className="mt-3 text-slate-muted text-sm">
                  No eligible friends to invite right now.
                </p>
              </div>
            ) : (
              filteredCandidates.map((candidate) => (
                <InviteCandidateRow
                  key={candidate.id}
                  candidate={candidate}
                  disabled={disabled}
                  isInviting={invitingMemberId === candidate.id}
                  onInvite={handleInvite}
                />
              ))
            )}
          </div>
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
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-card px-3 py-3">
      <Link
        {...buildProfileNavigation(candidate.id)}
        aria-label={`View ${candidate.name}'s profile`}
        className="group flex min-w-0 flex-1 items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Avatar
          src={candidate.avatar}
          name={candidate.name}
          fallback={candidate.name.slice(0, 1).toUpperCase()}
          className={cn(
            "size-11 bg-muted font-semibold text-foreground text-sm transition-transform group-hover:scale-105",
            candidate.avatar && "bg-transparent",
          )}
        />

        <span className="min-w-0 flex-1">
          <span className="block truncate font-semibold text-foreground text-sm transition-colors group-hover:text-forge-teal">
            {candidate.name}
          </span>
          <span className="block truncate text-slate-muted text-xs">
            {getInviteCandidateMeta(candidate)}
          </span>
        </span>
      </Link>

      <Button
        size="xs"
        disabled={disabled || isInviting}
        onClick={() => {
          void onInvite(candidate.id);
        }}
        title={disabled ? "Reconnect before inviting members." : undefined}
      >
        <UserPlus className="size-3.5" aria-hidden="true" />
        {isInviting ? "Inviting..." : "Invite"}
      </Button>
    </div>
  );
}
