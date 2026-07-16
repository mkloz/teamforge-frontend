import { Link } from "@tanstack/react-router";
import { Avatar } from "@/shared/components/common/avatar";
import { cn } from "@/shared/lib/utils";
import { buildProfileNavigation } from "@/shared/navigation/profile-navigation";

import {
  getParticipantInitials,
  getParticipantName,
  getParticipantRoleLabel,
} from "./participant-utils";
import type { ParticipantRowProps } from "./types";

type ParticipantViewState = ReturnType<typeof getParticipantViewState>;

export function ParticipantRow({ participant }: ParticipantRowProps) {
  const viewState = getParticipantViewState({
    participant,
  });

  return (
    <div
      className={cn(
        "group relative flex items-center gap-3 rounded-xl px-2 py-2 transition-colors duration-150",
        "hover:bg-muted/50",
      )}
    >
      <ParticipantProfileLink viewState={viewState} />
      <ParticipantAvatar participant={participant} viewState={viewState} />
      <ParticipantIdentity viewState={viewState} />
    </div>
  );
}

function getParticipantViewState({
  participant,
}: {
  participant: ParticipantRowProps["participant"];
}) {
  const participantName = getParticipantName(participant);

  return {
    avatarClassName: "size-10 ring-1 ring-border/40",
    avatarFallbackClassName: "font-bold text-foreground/80 text-xs",
    nameClassName:
      "truncate font-black text-foreground text-sm leading-tight transition-colors",
    participantName,
    participantRole: getParticipantRoleLabel(participant),
    profileNavigation: buildProfileNavigation(participant.userId),
  };
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
        src={participant.user.avatar}
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
      <ParticipantStatus viewState={viewState} />
    </div>
  );
}

function ParticipantNameLine({
  viewState,
}: {
  viewState: ParticipantViewState;
}) {
  return <p className={viewState.nameClassName}>{viewState.participantName}</p>;
}

function ParticipantStatus({ viewState }: { viewState: ParticipantViewState }) {
  return (
    <p className="mt-0.5 text-muted-foreground text-xs">
      {viewState.participantRole}
    </p>
  );
}
