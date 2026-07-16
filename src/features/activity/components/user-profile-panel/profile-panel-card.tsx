import { Link } from "@tanstack/react-router";
import { ExternalLink, MapPin, MessageSquareText } from "lucide-react";
import { Avatar, AvatarStatus } from "@/shared/components/common/avatar";
import { AvatarPreviewDialog } from "@/shared/components/common/avatar-preview-dialog";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import type { buildActivityDmNavigation } from "@/shared/navigation/activity-navigation";
import type { ProfileNavigation } from "@/shared/navigation/profile-navigation";
import type { OnlineStatus } from "@/shared/schemas/enums";
import type { UserProfilePanelParticipant } from "./types";

interface ProfilePanelOriginalCardProps {
  chatNavigation?: ReturnType<typeof buildActivityDmNavigation>;
  onlineStatus?: OnlineStatus;
  participant: UserProfilePanelParticipant;
  profileNavigation?: ProfileNavigation;
  roleLabel?: string;
  typeLabel?: string;
}

export function ProfilePanelOriginalCard({
  chatNavigation,
  onlineStatus,
  participant,
  profileNavigation,
  roleLabel,
  typeLabel,
}: ProfilePanelOriginalCardProps) {
  return (
    <section
      className="relative border-border/70 border-b bg-canvas opacity-(--profile-panel-original-opacity) transition-opacity duration-150 ease-out [pointer-events:var(--profile-panel-original-pointer-events,auto)] motion-reduce:transition-none"
      data-profile-panel-original-card=""
    >
      <div className="relative z-10 flex min-w-0 flex-row items-start gap-3 px-4 pt-6 pb-3">
        <PanelProfileAvatar
          name={participant.name}
          src={participant.avatar}
          onlineStatus={onlineStatus}
        />

        <div className="min-w-0 flex-1 pt-2 text-left">
          <h3 className="truncate font-bold text-2xl text-foreground leading-tight tracking-tight">
            {participant.name}
          </h3>
          <ProfileMetaRow participant={participant} />
        </div>
      </div>

      <div className="px-4 pb-4">
        <ProfileActionButtons
          chatNavigation={chatNavigation}
          profileNavigation={profileNavigation}
        />
      </div>

      <PanelProfileSignals roleLabel={roleLabel} typeLabel={typeLabel} />
    </section>
  );
}

function ProfileActionButtons({
  chatNavigation,
  profileNavigation,
}: {
  chatNavigation?: ReturnType<typeof buildActivityDmNavigation>;
  profileNavigation?: ProfileNavigation;
}) {
  if (!chatNavigation && !profileNavigation) {
    return null;
  }

  return (
    <div
      className={cn(
        "grid min-w-0 gap-2",
        hasBothProfileActions({ chatNavigation, profileNavigation })
          ? "grid-cols-2"
          : "grid-cols-1",
      )}
    >
      <ProfileNavigationAction profileNavigation={profileNavigation} />
      <ChatNavigationAction chatNavigation={chatNavigation} />
    </div>
  );
}

function hasBothProfileActions({
  chatNavigation,
  profileNavigation,
}: {
  chatNavigation?: ReturnType<typeof buildActivityDmNavigation>;
  profileNavigation?: ProfileNavigation;
}) {
  return Boolean(chatNavigation && profileNavigation);
}

function ProfileNavigationAction({
  profileNavigation,
}: {
  profileNavigation?: ProfileNavigation;
}) {
  if (!profileNavigation) {
    return null;
  }

  return (
    <Button asChild variant="outline" size="xs" className="min-w-0 flex-1">
      <Link {...profileNavigation}>
        <ExternalLink className="size-4" />
        <span className="truncate">View profile</span>
      </Link>
    </Button>
  );
}

function ChatNavigationAction({
  chatNavigation,
}: {
  chatNavigation?: ReturnType<typeof buildActivityDmNavigation>;
}) {
  if (!chatNavigation) {
    return null;
  }

  return (
    <Button asChild variant="primary" size="xs" className="min-w-0 flex-1">
      <Link {...chatNavigation}>
        <MessageSquareText className="size-4" />
        <span className="truncate">Message</span>
      </Link>
    </Button>
  );
}

function PanelProfileAvatar({
  name,
  onlineStatus,
  src,
}: {
  name: string;
  onlineStatus?: OnlineStatus;
  src: string | null;
}) {
  return (
    <AvatarPreviewDialog name={name} src={src}>
      <button
        type="button"
        className="group relative shrink-0 cursor-zoom-in appearance-none rounded-full border-0 bg-transparent p-0 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-teal/45 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
        aria-label={`Expand ${name} avatar`}
      >
        <div className="absolute inset-0 rounded-full bg-spark-amber/20 opacity-0 blur-xl transition-opacity duration-700 group-hover:opacity-100" />
        <div className="absolute -inset-1.5 rounded-full border-2 border-forge-teal/30 opacity-0 transition duration-700 group-hover:rotate-180 group-hover:scale-105 group-hover:opacity-100" />
        <div className="relative z-10 size-20 transition-transform duration-300 group-hover:scale-105">
          <Avatar
            src={src}
            name={name}
            className="size-full border-canvas border-thick bg-muted text-2xl shadow-lg ring-1 ring-border/70"
            fallbackClassName="bg-muted text-forge-teal text-2xl"
            loading="eager"
          />
          {onlineStatus ? (
            <AvatarStatus
              status={onlineStatus}
              borderClassName="border-canvas"
              sizeClassName="size-4"
            />
          ) : null}
        </div>
      </button>
    </AvatarPreviewDialog>
  );
}

function PanelProfileSignals({
  roleLabel,
  typeLabel,
}: {
  roleLabel?: string;
  typeLabel?: string;
}) {
  const signals = [
    typeLabel ? { label: "Type", value: typeLabel } : null,
    roleLabel ? { label: "Role", value: roleLabel } : null,
  ].filter((signal): signal is { label: string; value: string } =>
    Boolean(signal),
  );

  if (signals.length === 0) {
    return null;
  }

  return (
    <div className="border-border border-t px-4 py-3">
      <div
        className={cn(
          "grid overflow-hidden",
          signals.length === 2 ? "grid-cols-2" : "grid-cols-1",
        )}
      >
        {signals.map((signal, index) => (
          <ProfileSignal
            key={signal.label}
            label={signal.label}
            value={signal.value}
            className={index > 0 ? "border-border border-l pl-3" : undefined}
          />
        ))}
      </div>
    </div>
  );
}

function ProfileMetaRow({
  participant,
}: {
  participant: UserProfilePanelParticipant;
}) {
  const items = [
    typeof participant.age === "number"
      ? { kind: "age", value: `${participant.age} yrs` }
      : null,
    participant.city ? { kind: "city", value: participant.city } : null,
    formatGender(participant.gender)
      ? { kind: "gender", value: formatGender(participant.gender) }
      : null,
  ].filter((item): item is { kind: string; value: string } => Boolean(item));

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="mt-2 flex min-w-0 items-center overflow-hidden text-slate-muted">
      {items.map((item, index) => (
        <div key={item.kind} className="flex min-w-0 items-center">
          {index > 0 ? (
            <span
              aria-hidden="true"
              className="mx-2 h-3 w-px shrink-0 bg-slate-muted/35"
            />
          ) : null}
          <ProfileMetaItem item={item} />
        </div>
      ))}
    </div>
  );
}

function ProfileMetaItem({ item }: { item: { kind: string; value: string } }) {
  if (item.kind === "city") {
    return (
      <span className="flex h-4 min-w-0 items-center gap-1 font-semibold text-sm leading-4">
        <MapPin
          aria-hidden="true"
          className="size-3 shrink-0 -translate-y-px"
        />
        <span className="truncate leading-4">{item.value}</span>
      </span>
    );
  }

  return (
    <span className="flex h-4 shrink-0 items-center font-semibold text-sm leading-4">
      {item.value}
    </span>
  );
}

function ProfileSignal({
  accent = "text-ink",
  className,
  label,
  value,
}: {
  accent?: string;
  className?: string;
  label: string;
  value: string;
}) {
  return (
    <div className={cn("min-w-0 pr-2", className)}>
      <p className="font-semibold text-slate-muted text-xs leading-tight">
        {label}
      </p>
      <p
        className={cn(
          "mt-0.5 truncate font-extrabold text-sm leading-tight",
          accent,
        )}
      >
        {value}
      </p>
    </div>
  );
}

function formatGender(gender?: UserProfilePanelParticipant["gender"] | null) {
  switch (gender) {
    case "MALE":
      return "Male";
    case "FEMALE":
      return "Female";
    case "NON_BINARY":
      return "Non-binary";
    case "OTHER":
      return "Other";
    default:
      return null;
  }
}
