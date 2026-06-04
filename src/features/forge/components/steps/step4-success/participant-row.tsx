import { Link } from "@tanstack/react-router";
import { ShieldCheck, UserMinus, UserPlus } from "lucide-react";

import { buildProfileNavigation } from "@/features/profile/lib/profile-route";
import { Avatar } from "@/shared/components/common/avatar";
import { Button } from "@/shared/components/ui/button";
import { StatusPill } from "@/shared/components/ui/status-pill";
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
  const profileNavigation = buildProfileNavigation(participant.userId);

  return (
    <div
      className={cn(
        "group relative flex items-center gap-3 rounded-xl px-2 py-2 transition-colors duration-150",
        removed
          ? "opacity-40"
          : highlight
            ? "hover:bg-spark-amber/5"
            : "hover:bg-muted/50",
      )}
    >
      {/* Full-surface link */}
      <Link
        {...profileNavigation}
        aria-label={`View ${participantName}'s profile`}
        className="absolute inset-0 z-10 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span className="sr-only">View {participantName}'s profile</span>
      </Link>

      {/* Avatar */}
      <div className="relative shrink-0">
        <Avatar
          src={participant.user?.avatar}
          name={participantName}
          fallback={getParticipantInitials(participant)}
          className={cn(
            "size-10 ring-1",
            removed
              ? "ring-border/30 grayscale"
              : highlight
                ? "ring-2 ring-spark-amber/35"
                : "ring-border/40",
          )}
          fallbackClassName={cn(
            "font-bold text-xs",
            highlight ? "text-spark-amber" : "text-foreground/80",
          )}
        />
      </div>

      {/* Identity + meta */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p
            className={cn(
              "truncate font-black text-sm leading-tight transition-colors",
              removed
                ? "text-muted-foreground line-through"
                : highlight
                  ? "text-spark-amber"
                  : "text-foreground",
            )}
          >
            {participantName}
          </p>
          {!removed && highlight && (
            <StatusPill
              tone="amber"
              size="xs"
              surface="soft"
              className="h-4 shrink-0 px-1.5 py-0 leading-4"
            >
              Best fit
            </StatusPill>
          )}
        </div>

        {/* Score bar or removed label */}
        {removed ? (
          <p className="mt-0.5 text-muted-foreground text-xs">Removed</p>
        ) : scorePercent !== null ? (
          <div className="mt-1.5 flex items-center gap-2">
            <div className="h-1 min-w-0 flex-1 overflow-hidden rounded-full bg-muted/55">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  highlight ? "bg-spark-amber" : "bg-forge-teal",
                )}
                style={{ width: `${Math.min(scorePercent, 100)}%` }}
              />
            </div>
            <StatusPill
              icon={ShieldCheck}
              tone={highlight ? "amber" : "neutral"}
              size="xs"
              surface="soft"
              className="h-4 shrink-0 px-1.5 py-0 leading-4"
              numeric
            >
              {participantMeta.value}
            </StatusPill>
          </div>
        ) : null}

        {scorePercent !== null && !removed && (
          <span className="sr-only">
            {participantName} has a {scorePercent}% compatibility score.
          </span>
        )}
      </div>

      {/* Action button – z-20, revealed on hover on desktop */}
      <div className="relative z-20 shrink-0 transition-opacity duration-150 md:opacity-0 md:group-hover:opacity-100">
        {removed ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onRestoreParticipant(participant.userId)}
            aria-label={`Restore ${participantName}`}
            className="size-7 rounded-full text-muted-foreground hover:text-forge-teal"
          >
            <UserPlus size={13} />
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onRemoveParticipant(participant.userId)}
            aria-label={`Remove ${participantName}`}
            className="size-7 rounded-full text-muted-foreground hover:text-destructive"
          >
            <UserMinus size={13} />
          </Button>
        )}
      </div>
    </div>
  );
}
