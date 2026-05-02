import { UserMinus, UserPlus } from "lucide-react";

import { Avatar } from "@/shared/components/common/avatar";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

import {
  getParticipantInitials,
  getParticipantMeta,
  getParticipantName,
} from "./participant-utils";
import type { ParticipantRowProps } from "./types";

export function ParticipantRow({
  participant,
  removed,
  onRemoveParticipant,
  onRestoreParticipant,
}: ParticipantRowProps) {
  const participantMeta = getParticipantMeta(participant);
  const participantName = getParticipantName(participant);

  return (
    <div
      className={cn(
        "group flex items-center gap-3 px-4 py-3.5 rounded-2xl border transition duration-200",
        removed
          ? "opacity-40 bg-muted/30 border-border/30 border-dashed"
          : "bg-card border-border/40 hover:border-accent/30",
      )}
    >
      <div
        className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-lg transition-colors duration-200",
          removed
            ? "bg-muted text-muted-foreground"
            : "bg-accent/10 group-hover:bg-accent/15",
        )}
      >
        <Avatar
          src={participant.user?.avatar}
          name={participantName}
          fallback={getParticipantInitials(participant)}
          shape="rounded"
          className="h-full w-full rounded-xl bg-transparent"
          fallbackClassName="bg-transparent text-xs text-foreground/80"
        />
      </div>
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            "text-sm font-semibold leading-tight transition-colors",
            removed ? "text-muted-foreground line-through" : "text-foreground",
          )}
        >
          {participantName}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          {removed ? (
            <p className="text-xs text-muted-foreground">
              Removed from session
            </p>
          ) : (
            <>
              <p className="text-xs text-muted-foreground">
                {participantMeta.label}
              </p>
              <span
                className={cn(
                  "text-xs font-semibold px-1.5 py-0.5 rounded-md",
                  participantMeta.className,
                )}
              >
                {participantMeta.value}
              </span>
            </>
          )}
        </div>
      </div>
      {removed ? (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onRestoreParticipant(participant.userId)}
          aria-label={`Restore ${participantName}`}
          className="size-8 rounded-xl text-forge-teal bg-forge-teal/10 md:opacity-0 md:group-hover:opacity-100 hover:bg-forge-teal/10 hover:text-forge-teal transition-opacity"
        >
          <UserPlus size={14} />
        </Button>
      ) : (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onRemoveParticipant(participant.userId)}
          aria-label={`Remove ${participantName}`}
          className="size-8 rounded-xl text-destructive/60 bg-destructive/8 md:opacity-0 md:group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive transition-opacity"
        >
          <UserMinus size={14} />
        </Button>
      )}
    </div>
  );
}
