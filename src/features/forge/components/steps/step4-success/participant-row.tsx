import { UserMinus, UserPlus } from "lucide-react";

import { Avatar } from "@/shared/components/common/avatar";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

import {
  getParticipantInitials,
  getParticipantMeta,
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
  const participantMeta = getParticipantMeta(participant);
  const participantName = getParticipantName(participant);
  const scorePercent = getParticipantScorePercent(participant);

  return (
    <div
      className={cn(
        "group flex min-h-26 flex-col justify-between gap-3 rounded-lg border p-3 transition-all duration-200",
        removed
          ? "border-border/30 border-dashed bg-muted/30 opacity-40"
          : highlight
            ? "border-spark-amber/45 bg-spark-amber/8 ring-1 ring-spark-amber/15 hover:border-spark-amber/60"
            : "border-border/40 bg-card/70 hover:border-forge-teal/30 hover:bg-forge-teal/5",
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-lg text-lg transition-colors duration-200",
            removed
              ? "bg-muted text-muted-foreground"
              : highlight
                ? "bg-spark-amber text-ink shadow-sm shadow-spark-amber/20"
                : "border border-border/35 bg-muted/35 group-hover:bg-forge-teal/10",
          )}
        >
          <Avatar
            src={participant.user?.avatar}
            name={participantName}
            fallback={getParticipantInitials(participant)}
            shape="rounded"
            className="size-full rounded-lg bg-transparent"
            fallbackClassName={cn(
              "bg-transparent font-bold text-xs",
              highlight ? "text-ink" : "text-foreground/80",
            )}
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p
                className={cn(
                  "truncate font-semibold text-sm leading-tight transition-colors",
                  removed
                    ? "text-muted-foreground line-through"
                    : highlight
                      ? "text-spark-amber"
                      : "text-foreground",
                )}
              >
                {participantName}
              </p>
              <p className="mt-1 text-muted-foreground text-xs leading-snug">
                {removed ? "Removed from session" : "Suggested member"}
              </p>
            </div>

            {!removed && (
              <span
                className={cn(
                  "shrink-0 rounded-full border px-2 py-0.5 font-bold text-micro tabular-nums",
                  highlight
                    ? "border-spark-amber/30 bg-spark-amber/12 text-spark-amber"
                    : "border-border/40 bg-muted/35 text-muted-foreground",
                )}
              >
                {participantMeta.value}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {!removed && scorePercent !== null ? (
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2 font-semibold text-micro uppercase tracking-wide">
              <span className="text-muted-foreground">
                {participantMeta.label}
              </span>
              {highlight && <span className="text-spark-amber">Best fit</span>}
            </div>
            <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-muted/55">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  highlight ? "bg-spark-amber" : "bg-forge-teal",
                )}
                style={{ width: `${Math.min(scorePercent, 100)}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="min-w-0 flex-1" />
        )}

        {!removed && scorePercent !== null && (
          <span className="sr-only">
            {participantName} has a {scorePercent}% compatibility score.
          </span>
        )}

        {removed ? (
          <Button
            variant="outline"
            size="icon"
            onClick={() => onRestoreParticipant(participant.userId)}
            aria-label={`Restore ${participantName}`}
            className="size-8 max-md:opacity-100 md:opacity-0 md:group-hover:opacity-100"
          >
            <UserPlus size={14} />
          </Button>
        ) : (
          <Button
            variant="destructive"
            size="icon"
            onClick={() => onRemoveParticipant(participant.userId)}
            aria-label={`Remove ${participantName}`}
            className="size-8 max-md:opacity-100 md:opacity-0 md:group-hover:opacity-100"
          >
            <UserMinus size={14} />
          </Button>
        )}
      </div>
    </div>
  );
}
