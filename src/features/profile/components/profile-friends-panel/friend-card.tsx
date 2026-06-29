import { Link } from "@tanstack/react-router";
import { MapPin, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";
import { buildProfileNavigation } from "@/features/profile/lib/profile-route";
import { Avatar } from "@/shared/components/common/avatar";
import { StatusPill } from "@/shared/components/ui/status-pill";
import { cn } from "@/shared/lib/utils";
import type { OnlineStatus } from "@/shared/schemas/enums";

interface FriendCardUser {
  id: string;
  name: string;
  avatar: string | null;
  personalityType?: string | null;
  city?: string | null;
  trustScore?: number;
  onlineStatus?: OnlineStatus;
}

interface FriendCardProps {
  user: FriendCardUser;
  /** Optional override for the secondary line (e.g. "Waiting for response") */
  subtitle?: ReactNode;
  /** Rendered inside a z-20 wrapper so they stay clickable above the link overlay */
  actions?: ReactNode;
  /** ISO date string for when the friendship was created */
  friendsSince?: string | null;
}

export function FriendCard({
  user,
  subtitle,
  actions,
  friendsSince,
}: FriendCardProps) {
  const trustPercent = getFriendTrustPercent(user.trustScore);
  const isHighTrust = isHighTrustPercent(trustPercent);

  return (
    <article className="group relative flex min-h-16 items-center gap-3 rounded-xl px-2 py-2 transition-colors duration-150 hover:bg-muted/50">
      <FriendCardLink user={user} />

      <FriendCardAvatar user={user} isHighTrust={isHighTrust} />

      <FriendCardIdentity
        friendsSince={friendsSince}
        isHighTrust={isHighTrust}
        subtitle={subtitle}
        trustPercent={trustPercent}
        user={user}
      />

      {actions && (
        <div className="relative z-20 flex shrink-0 items-center gap-1 transition-opacity duration-150 md:opacity-0 md:group-hover:opacity-100">
          {actions}
        </div>
      )}
    </article>
  );
}

function FriendCardLink({ user }: { user: FriendCardUser }) {
  return (
    <Link
      {...buildProfileNavigation(user.id)}
      aria-label={`View ${user.name}'s profile`}
      className="absolute inset-0 z-10 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span className="sr-only">View {user.name}'s profile</span>
    </Link>
  );
}

function FriendCardAvatar({
  isHighTrust,
  user,
}: {
  isHighTrust: boolean;
  user: FriendCardUser;
}) {
  return (
    <div className="relative shrink-0">
      <Avatar
        src={user.avatar}
        name={user.name}
        className={cn(
          "size-10 ring-1",
          isHighTrust ? "ring-2 ring-forge-teal/30" : "ring-border/40",
        )}
      />
      <PresenceIndicator onlineStatus={user.onlineStatus} />
    </div>
  );
}

function PresenceIndicator({ onlineStatus }: { onlineStatus?: OnlineStatus }) {
  if (!shouldShowPresenceIndicator(onlineStatus)) {
    return null;
  }

  return (
    <>
      <span
        aria-hidden="true"
        title={getPresenceTitle(onlineStatus)}
        className={cn(
          "absolute -right-0.5 -bottom-0.5 size-2.5 rounded-full ring-2 ring-background",
          getPresenceClassName(onlineStatus),
        )}
      />
      <span className="sr-only">{getPresenceTitle(onlineStatus)}</span>
    </>
  );
}

function FriendCardIdentity({
  friendsSince,
  isHighTrust,
  subtitle,
  trustPercent,
  user,
}: {
  friendsSince: string | null | undefined;
  isHighTrust: boolean;
  subtitle: ReactNode;
  trustPercent: number | null;
  user: FriendCardUser;
}) {
  return (
    <div className="min-w-0 flex-1">
      <FriendNameRow user={user} />
      <FriendSecondaryLine
        friendsSince={friendsSince}
        isHighTrust={isHighTrust}
        subtitle={subtitle}
        trustPercent={trustPercent}
        user={user}
      />
    </div>
  );
}

function FriendNameRow({ user }: { user: FriendCardUser }) {
  return (
    <div className="flex items-center gap-1.5">
      <h3 className="truncate font-black text-foreground text-sm leading-tight">
        {user.name}
      </h3>
      {user.personalityType && (
        <StatusPill
          tone="teal"
          size="xs"
          surface="solid"
          className="h-4 shrink-0 px-1.5 py-0 leading-4"
        >
          {user.personalityType}
        </StatusPill>
      )}
    </div>
  );
}

function FriendSecondaryLine({
  friendsSince,
  isHighTrust,
  subtitle,
  trustPercent,
  user,
}: {
  friendsSince: string | null | undefined;
  isHighTrust: boolean;
  subtitle: ReactNode;
  trustPercent: number | null;
  user: FriendCardUser;
}) {
  return (
    <div className="mt-1 flex min-w-0 flex-wrap items-center gap-1.5">
      {subtitle ? (
        <span className="text-muted-foreground text-xs">{subtitle}</span>
      ) : (
        <>
          <FriendCity city={user.city} />
          <FriendTrustPill
            isHighTrust={isHighTrust}
            trustPercent={trustPercent}
          />
          <FriendsSinceLabel friendsSince={friendsSince} />
        </>
      )}
    </div>
  );
}

function FriendCity({ city }: { city?: string | null }) {
  if (!city) {
    return null;
  }

  return (
    <span className="flex items-center gap-0.5 text-slate-muted text-xs">
      <MapPin className="size-3 shrink-0" strokeWidth={2} aria-hidden="true" />
      {city}
    </span>
  );
}

function FriendTrustPill({
  isHighTrust,
  trustPercent,
}: {
  isHighTrust: boolean;
  trustPercent: number | null;
}) {
  if (typeof trustPercent !== "number") {
    return null;
  }

  return (
    <StatusPill
      icon={ShieldCheck}
      size="xs"
      tone={isHighTrust ? "teal" : "neutral"}
      surface="soft"
      className="h-5 px-1.5 text-xs"
      title={`Trust score ${trustPercent}%`}
    >
      <span className="sr-only">Trust</span>
      <span>{trustPercent}%</span>
    </StatusPill>
  );
}

function FriendsSinceLabel({
  friendsSince,
}: {
  friendsSince: string | null | undefined;
}) {
  if (!friendsSince) {
    return null;
  }

  return (
    <span
      className="text-slate-muted/70 text-xs"
      title={`Friends since ${new Date(friendsSince).toLocaleDateString()}`}
    >
      {formatFriendsSince(friendsSince)}
    </span>
  );
}

function getFriendTrustPercent(score: number | undefined) {
  return typeof score === "number"
    ? Math.round(score > 1 ? score : score * 100)
    : null;
}

function isHighTrustPercent(trustPercent: number | null) {
  return typeof trustPercent === "number" && trustPercent >= 80;
}

function shouldShowPresenceIndicator(
  onlineStatus: OnlineStatus | undefined,
): onlineStatus is Exclude<OnlineStatus, "OFFLINE"> {
  return onlineStatus !== undefined && onlineStatus !== "OFFLINE";
}

function getPresenceTitle(onlineStatus: Exclude<OnlineStatus, "OFFLINE">) {
  return onlineStatus === "ONLINE" ? "Online" : "Away";
}

function getPresenceClassName(onlineStatus: Exclude<OnlineStatus, "OFFLINE">) {
  return onlineStatus === "ONLINE" ? "bg-forge-teal" : "bg-spark-amber";
}

function formatFriendsSince(isoDate: string): string {
  const ms = Date.now() - new Date(isoDate).getTime();
  const days = Math.floor(ms / 86_400_000);
  if (days < 1) return "Just connected";
  if (days < 30) return `${days}d`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo`;
  return `${Math.floor(months / 12)}yr`;
}
