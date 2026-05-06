import { useMemo, useState } from "react";
import { Search, UserPlus } from "lucide-react";

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
    await onInvite(inviteeId);
    setOpen(false);
    setQuery("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled}
          className="h-8 text-[11px] font-bold uppercase tracking-wider"
        >
          <UserPlus size={13} className="mr-1" />
          Invite
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md rounded-3xl border-border/60 bg-canvas p-0">
        <DialogHeader className="border-b border-border/50 px-6 py-5">
          <DialogTitle>Invite to group</DialogTitle>
          <DialogDescription>
            Invite someone you already know to join this group.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 px-6 py-5">
          <div>
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search friends by name, city, or personality"
              leftIcon={<Search size={14} />}
            />
          </div>

          <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
            {filteredCandidates.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border/70 bg-background/50 px-4 py-6 text-center text-sm text-slate-muted">
                No eligible friends to invite right now.
              </div>
            ) : (
              filteredCandidates.map((candidate) => {
                const isInviting = invitingMemberId === candidate.id;

                return (
                  <div
                    key={candidate.id}
                    className="flex items-center gap-3 rounded-2xl border border-border/60 bg-background/80 px-3 py-3"
                  >
                    <Avatar
                      src={candidate.avatar}
                      name={candidate.name}
                      fallback={candidate.name.slice(0, 1).toUpperCase()}
                      className={cn(
                        "h-11 w-11 bg-muted text-sm font-semibold text-foreground",
                        candidate.avatar && "bg-transparent",
                      )}
                    />

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {candidate.name}
                      </p>
                      <p className="truncate text-xs text-slate-muted">
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
                      className="rounded-full px-3 text-xs font-semibold"
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
