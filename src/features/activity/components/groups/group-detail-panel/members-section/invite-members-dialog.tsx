import { Search, UserPlus } from "lucide-react";
import { useMemo, useState } from "react";
import { EmptyInviteCandidatesVisual } from "@/assets/empty-state/empty-invite-candidates";
import { ErrorInviteSendFailedVisual } from "@/assets/error-state/error-invite-send-failed";
import type { ActivityParticipant } from "@/features/activity/lib/activity-contract";
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
import { getApiErrorMessage } from "@/shared/lib/api-error-message";
import { cn } from "@/shared/lib/utils";

interface InviteMembersDialogProps {
  candidates: ActivityParticipant[];
  disabled?: boolean;
  invitingMemberId?: string | null;
  onInvite: (inviteeId: string) => Promise<void> | void;
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

  const filteredCandidates = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return candidates;
    }

    return candidates.filter((candidate) => {
      const haystack = [
        candidate.name,
        candidate.city ?? "",
        candidate.personalityType ?? "",
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalizedQuery);
    });
  }, [candidates, query]);

  const handleInvite = async (inviteeId: string) => {
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
          className="px-3 font-bold text-xs"
          contentClassName="gap-1.5"
        >
          <UserPlus className="size-3.5" />
          Invite
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md rounded-lg border-border/60 bg-canvas p-0">
        <DialogHeader className="border-border/50 border-b px-6 py-5">
          <DialogTitle>Invite to group</DialogTitle>
          <DialogDescription>
            Invite someone you already know to join this group.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 px-6 py-5">
          {inviteError ? (
            <div className="flex items-center gap-3 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-3">
              <ErrorInviteSendFailedVisual className="w-16 shrink-0 text-foreground" />
              <p className="font-medium text-destructive text-sm leading-relaxed">
                {inviteError}
              </p>
            </div>
          ) : null}

          <div>
            <Input
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
              <div className="flex flex-col items-center rounded-lg border border-border/70 border-dashed bg-background/50 px-4 py-6 text-center">
                <EmptyInviteCandidatesVisual className="w-28 text-foreground" />
                <p className="mt-3 text-slate-muted text-sm">
                  No eligible friends to invite right now.
                </p>
              </div>
            ) : (
              filteredCandidates.map((candidate) => {
                const isInviting = invitingMemberId === candidate.id;

                return (
                  <div
                    key={candidate.id}
                    className="flex items-center gap-3 rounded-lg border border-border/60 bg-background/80 px-3 py-3"
                  >
                    <Avatar
                      src={candidate.avatar}
                      name={candidate.name}
                      fallback={candidate.name.slice(0, 1).toUpperCase()}
                      className={cn(
                        "size-11 bg-muted font-semibold text-foreground text-sm",
                        candidate.avatar && "bg-transparent",
                      )}
                    />

                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-foreground text-sm">
                        {candidate.name}
                      </p>
                      <p className="truncate text-slate-muted text-xs">
                        {candidate.city || "Location pending"}
                        {candidate.personalityType
                          ? ` · ${candidate.personalityType}`
                          : ""}
                      </p>
                    </div>

                    <Button
                      size="sm"
                      disabled={isInviting}
                      onClick={() => {
                        void handleInvite(candidate.id);
                      }}
                      className="rounded-full px-3 font-semibold text-xs"
                    >
                      {isInviting ? "Inviting..." : "Invite"}
                    </Button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
