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
  const trustPercent =
    typeof user.trustScore === "number"
      ? Math.round(
          user.trustScore > 1 ? user.trustScore : user.trustScore * 100,
        )
      : null;
  const isHighTrust = typeof trustPercent === "number" && trustPercent >= 80;

  return (
    <article className="group relative flex min-h-16 items-center gap-3 rounded-xl px-2 py-2 transition-colors duration-150 hover:bg-muted/50">
      {/* Invisible full-surface link — keeps the card navigable */}
      <Link
        {...buildProfileNavigation(user.id)}
        aria-label={`View ${user.name}'s profile`}
        className="absolute inset-0 z-10 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span className="sr-only">View {user.name}'s profile</span>
      </Link>

      {/* Avatar + presence dot */}
      <div className="relative shrink-0">
        <Avatar
          src={user.avatar}
          name={user.name}
          className={cn(
            "size-10 ring-1",
            isHighTrust ? "ring-2 ring-forge-teal/30" : "ring-border/40",
          )}
        />
        {user.onlineStatus && user.onlineStatus !== "OFFLINE" && (
          <span
            role="img"
            title={user.onlineStatus === "ONLINE" ? "Online" : "Away"}
            className={cn(
              "absolute -right-0.5 -bottom-0.5 size-2.5 rounded-full ring-2 ring-background",
              user.onlineStatus === "ONLINE"
                ? "bg-forge-teal"
                : "bg-spark-amber",
            )}
          />
        )}
      </div>

      {/* Identity + meta */}
      <div className="min-w-0 flex-1">
        {/* Name row */}
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

        {/* Secondary line */}
        <div className="mt-1 flex min-w-0 flex-wrap items-center gap-1.5">
          {subtitle ? (
            <span className="text-muted-foreground text-xs">{subtitle}</span>
          ) : (
            <>
              {user.city && (
                <span className="flex items-center gap-0.5 text-slate-muted text-xs">
                  <MapPin
                    className="size-3 shrink-0"
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                  {user.city}
                </span>
              )}
              {typeof trustPercent === "number" && (
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
              )}
              {friendsSince && (
                <span
                  className="text-slate-muted/70 text-xs"
                  title={`Friends since ${new Date(friendsSince).toLocaleDateString()}`}
                >
                  {formatFriendsSince(friendsSince)}
                </span>
              )}
            </>
          )}
        </div>
      </div>

      {/* Actions – raised above the link overlay; hidden on desktop until hovered */}
      {actions && (
        <div className="relative z-20 flex shrink-0 items-center gap-1 transition-opacity duration-150 md:opacity-0 md:group-hover:opacity-100">
          {actions}
        </div>
      )}
    </article>
  );
}

/** Returns a human-readable "Friends for X months" or "Just connected" label */
function formatFriendsSince(isoDate: string): string {
  const ms = Date.now() - new Date(isoDate).getTime();
  const days = Math.floor(ms / 86_400_000);
  if (days < 1) return "Just connected";
  if (days < 30) return `${days}d`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo`;
  return `${Math.floor(months / 12)}yr`;
}
