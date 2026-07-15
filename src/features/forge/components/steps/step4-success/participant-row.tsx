import { Link } from "@tanstack/react-router";
import { ShieldCheck, UserMinus, UserPlus } from "lucide-react";
import { Avatar } from "@/shared/components/common/avatar";
import { Button } from "@/shared/components/ui/button";
import { StatusPill } from "@/shared/components/ui/status-pill";
import { cn } from "@/shared/lib/utils";
import { buildProfileNavigation } from "@/shared/navigation/profile-navigation";

import {
  getParticipantInitials,
  getParticipantMeta,
  getParticipantName,
  getParticipantScorePercent,
} from "./participant-utils";
import type { ParticipantRowProps } from "./types";

type ParticipantViewState = ReturnType<typeof getParticipantViewState>;

export function ParticipantRow({
  participant,
  removed,
  highlight = false,
  onRemoveParticipant,
  onRestoreParticipant,
}: ParticipantRowProps) {
  const viewState = getParticipantViewState({
    highlight,
    participant,
    removed,
  });

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
      <ParticipantProfileLink viewState={viewState} />

      {/* Avatar */}
      <ParticipantAvatar participant={participant} viewState={viewState} />

      {/* Identity + meta */}
      <ParticipantIdentity viewState={viewState} />

      {/* Action button – z-20, revealed on hover on desktop */}
      <ParticipantActionButton
        participant={participant}
        removed={removed}
        viewState={viewState}
        onRemoveParticipant={onRemoveParticipant}
        onRestoreParticipant={onRestoreParticipant}
      />
    </div>
  );
}

function getParticipantViewState({
  highlight,
  participant,
  removed,
}: {
  highlight: boolean;
  participant: ParticipantRowProps["participant"];
  removed: boolean;
}) {
  const participantName = getParticipantName(participant);
  const scorePercent = getParticipantScorePercent(participant);

  return {
    avatarClassName: getParticipantAvatarClassName({ highlight, removed }),
    avatarFallbackClassName: getParticipantAvatarFallbackClassName(highlight),
    bestFitVisible: !removed && highlight,
    nameClassName: getParticipantNameClassName({ highlight, removed }),
    participantMeta: getParticipantMeta(participant),
    participantName,
    profileNavigation: buildProfileNavigation(participant.userId),
    removed,
    scoreBarClassName: getParticipantScoreBarClassName(highlight),
    scoreBarWidth:
      scorePercent === null ? null : `${Math.min(scorePercent, 100)}%`,
    scorePercent,
    scoreVisible: !removed && scorePercent !== null,
    statusTone: getParticipantScoreTone(highlight),
  };
}

function getParticipantAvatarClassName({
  highlight,
  removed,
}: {
  highlight: boolean;
  removed: boolean;
}) {
  return cn(
    "size-10 ring-1",
    removed
      ? "ring-border/30 grayscale"
      : highlight
        ? "ring-2 ring-spark-amber/35"
        : "ring-border/40",
  );
}

function getParticipantAvatarFallbackClassName(highlight: boolean) {
  return cn(
    "font-bold text-xs",
    highlight ? "text-spark-amber" : "text-foreground/80",
  );
}

function getParticipantNameClassName({
  highlight,
  removed,
}: {
  highlight: boolean;
  removed: boolean;
}) {
  return cn(
    "truncate font-black text-sm leading-tight transition-colors",
    removed
      ? "text-muted-foreground line-through"
      : highlight
        ? "text-spark-amber"
        : "text-foreground",
  );
}

function getParticipantScoreBarClassName(highlight: boolean) {
  return cn(
    "h-full rounded-full transition-all duration-500",
    highlight ? "bg-spark-amber" : "bg-forge-teal",
  );
}

function getParticipantScoreTone(highlight: boolean): "amber" | "neutral" {
  return highlight ? "amber" : "neutral";
}

function ParticipantProfileLink({
  viewState,
}: {
  viewState: ParticipantViewState;
}) {
  return (
    <Link
      {...viewState.profileNavigation}
      aria-label={`View ${viewState.participantName}'s profile`}
      className="absolute inset-0 z-10 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span className="sr-only">
        {`View ${viewState.participantName}'s profile`}
      </span>
    </Link>
  );
}

function ParticipantAvatar({
  participant,
  viewState,
}: {
  participant: ParticipantRowProps["participant"];
  viewState: ParticipantViewState;
}) {
  return (
    <div className="relative shrink-0">
      <Avatar
        src={participant.user?.avatar}
        name={viewState.participantName}
        fallback={getParticipantInitials(participant)}
        className={viewState.avatarClassName}
        fallbackClassName={viewState.avatarFallbackClassName}
      />
    </div>
  );
}

function ParticipantIdentity({
  viewState,
}: {
  viewState: ParticipantViewState;
}) {
  return (
    <div className="min-w-0 flex-1">
      <ParticipantNameLine viewState={viewState} />

      {/* Score bar or removed label */}
      <ParticipantScoreStatus viewState={viewState} />

      {viewState.scoreVisible && (
        <span className="sr-only">
          {`${viewState.participantName} has a ${viewState.scorePercent}% compatibility score.`}
        </span>
      )}
    </div>
  );
}

function ParticipantNameLine({
  viewState,
}: {
  viewState: ParticipantViewState;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <p className={viewState.nameClassName}>{viewState.participantName}</p>
      {viewState.bestFitVisible && (
        <StatusPill
          tone="amber"
          size="xs"
          surface="soft"
          className="h-4 shrink-0 px-1.5 py-0 leading-4"
        >
          Highest score
        </StatusPill>
      )}
    </div>
  );
}

function ParticipantScoreStatus({
  viewState,
}: {
  viewState: ParticipantViewState;
}) {
  if (viewState.removed) {
    return <p className="mt-0.5 text-muted-foreground text-xs">Removed</p>;
  }

  if (viewState.scorePercent === null) {
    return null;
  }

  return (
    <div className="mt-1.5 flex items-center gap-2">
      <div className="h-1 min-w-0 flex-1 overflow-hidden rounded-full bg-muted/55">
        <div
          className={viewState.scoreBarClassName}
          style={{ width: viewState.scoreBarWidth ?? undefined }}
        />
      </div>
      <StatusPill
        icon={ShieldCheck}
        tone={viewState.statusTone}
        size="xs"
        surface="soft"
        className="h-4 shrink-0 px-1.5 py-0 leading-4"
        numeric
      >
        {viewState.participantMeta.value}
      </StatusPill>
    </div>
  );
}

function ParticipantActionButton({
  participant,
  removed,
  viewState,
  onRemoveParticipant,
  onRestoreParticipant,
}: {
  participant: ParticipantRowProps["participant"];
  removed: boolean;
  viewState: ParticipantViewState;
  onRemoveParticipant: ParticipantRowProps["onRemoveParticipant"];
  onRestoreParticipant: ParticipantRowProps["onRestoreParticipant"];
}) {
  return (
    <div className="relative z-20 shrink-0 transition-opacity duration-150 md:opacity-0 md:group-hover:opacity-100">
      {removed ? (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onRestoreParticipant(participant.userId)}
          aria-label={`Restore ${viewState.participantName}`}
          className="size-7 rounded-full text-muted-foreground hover:text-forge-teal"
        >
          <UserPlus size={13} />
        </Button>
      ) : (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onRemoveParticipant(participant.userId)}
          aria-label={`Remove ${viewState.participantName}`}
          className="size-7 rounded-full text-muted-foreground hover:text-destructive"
        >
          <UserMinus size={13} />
        </Button>
      )}
    </div>
  );
}
