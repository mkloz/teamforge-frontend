import { Link } from "@tanstack/react-router";
import { RotateCcw, UserMinus } from "lucide-react";

import { Avatar } from "@/shared/components/common/avatar";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import { buildProfileNavigation } from "@/shared/navigation/profile-navigation";

import {
  getParticipantInitials,
  getParticipantName,
  getParticipantScorePercent,
} from "./participant-utils";
import type { ParticipantRowProps } from "./types";

export function ParticipantRow({
  participant,
  removed,
  highlight = false,
  onRemoveParticipant,
  onRestoreParticipant,
}: ParticipantRowProps) {
  const participantName = getParticipantName(participant);
  const matchScore = getParticipantScorePercent(participant);

  return (
    <div
      className={cn(
        "group relative flex min-h-20 items-center gap-3 px-3 py-3",
        removed && "opacity-45",
      )}
    >
      <Link
        {...buildProfileNavigation(participant.userId)}
        aria-label={`View ${participantName}'s profile`}
        className="absolute inset-0 z-10 rounded-[inherit] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
      >
        <span className="sr-only">{`View ${participantName}'s profile`}</span>
      </Link>

      <Avatar
        src={participant.user.avatar}
        name={participantName}
        fallback={getParticipantInitials(participant)}
        className={cn(
          "size-11 shrink-0 ring-1",
          removed
            ? "ring-border/30 grayscale"
            : highlight
              ? "ring-2 ring-spark-amber/55"
              : "ring-border/45",
        )}
        fallbackClassName="font-bold text-foreground/80 text-xs"
      />

      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-2">
          <p
            className={cn(
              "truncate font-black text-sm",
              removed
                ? "text-muted-foreground line-through"
                : "text-foreground",
            )}
          >
            {participantName}
          </p>
          {highlight && !removed ? (
            <span className="shrink-0 font-bold text-spark-amber text-xs">
              Best match
            </span>
          ) : null}
        </div>

        {removed ? (
          <p className="mt-1 text-muted-foreground text-xs">
            Removed from this group
          </p>
        ) : (
          <>
            <div className="mt-1 flex flex-wrap items-center gap-x-2 text-xs">
              <ScoreLabel
                label="Match"
                value={matchScore}
                highlight={highlight}
              />
            </div>
            {matchScore !== null ? (
              <div className="mt-2 h-1.5 max-w-56 overflow-hidden rounded-full bg-muted/55">
                <div
                  className={cn(
                    "h-full rounded-full",
                    highlight ? "bg-spark-amber" : "bg-forge-teal",
                  )}
                  style={{ width: `${Math.min(matchScore, 100)}%` }}
                />
              </div>
            ) : null}
          </>
        )}
      </div>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() =>
          removed
            ? onRestoreParticipant(participant.userId)
            : onRemoveParticipant(participant.userId)
        }
        aria-label={`${removed ? "Restore" : "Remove"} ${participantName}`}
        title={`${removed ? "Restore" : "Remove"} ${participantName}`}
        className={cn(
          "relative z-20 size-9 shrink-0 rounded-full",
          removed
            ? "text-muted-foreground hover:text-foreground"
            : "text-muted-foreground hover:bg-destructive/10 hover:text-destructive",
        )}
      >
        {removed ? (
          <RotateCcw className="size-4" />
        ) : (
          <UserMinus className="size-4" />
        )}
      </Button>
    </div>
  );
}

function ScoreLabel({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: number | null;
  highlight?: boolean;
}) {
  if (value === null) return null;

  return (
    <span className="font-semibold text-muted-foreground">
      {label}{" "}
      <strong
        className={cn(
          "font-black tabular-nums",
          highlight ? "text-spark-amber" : "text-foreground",
        )}
      >
        {value}%
      </strong>
    </span>
  );
}
