import { Link } from "@tanstack/react-router";
import { BellOff, Pin, Users } from "lucide-react";
import { buildActivityGroupHubNavigation } from "@/features/activity/lib/activity-route";
import type { HomeGroup } from "@/features/home/schemas/home-group.schema";
import { Avatar } from "@/shared/components/common/avatar";
import { UnreadBadge } from "@/shared/components/common/unread-badge";
import { cn } from "@/shared/lib/utils";

interface GroupRowProps {
  group: HomeGroup;
  isMuted?: boolean;
  isPinned?: boolean;
  lastActivityAt?: string;
  messagePreview?: string;
  unreadCount?: number;
}

function formatRelativeTime(value: string) {
  const timestamp = new Date(value).getTime();

  if (Number.isNaN(timestamp)) {
    return "Recently";
  }

  const diffMs = Date.now() - timestamp;
  const diffMinutes = Math.max(1, Math.floor(diffMs / 60_000));

  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);

  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  const diffDays = Math.floor(diffHours / 24);

  if (diffDays < 7) {
    return `${diffDays}d ago`;
  }

  return `${Math.floor(diffDays / 7)}w ago`;
}

function formatMetaStatus({ isMuted, isPinned }: GroupRowProps) {
  if (isMuted) {
    return "Muted";
  }

  if (isPinned) {
    return "Pinned";
  }

  return null;
}

function getGroupContextLine(group: HomeGroup, messagePreview?: string) {
  if (messagePreview) {
    return messagePreview;
  }

  if (group.plan?.locationMode === "ONLINE") {
    return "Online plan in progress";
  }

  if (group.plan?.location) {
    return `Plan near ${group.plan.location}`;
  }

  const interests = group.activity.interests
    .map((interest) => interest.name)
    .slice(0, 2);

  if (interests.length > 0) {
    return `Around ${interests.join(" + ")}`;
  }

  return group.activity.title;
}

export function GroupRow({
  group,
  isMuted = false,
  isPinned = false,
  lastActivityAt = group.updatedAt,
  messagePreview,
  unreadCount = 0,
}: GroupRowProps) {
  const lastActivity = formatRelativeTime(lastActivityAt);
  const hasUnreadMessages = unreadCount > 0;
  const contextLine = getGroupContextLine(group, messagePreview);
  const metaStatus = formatMetaStatus({ group, isMuted, isPinned });

  return (
    <li>
      <Link
        {...buildActivityGroupHubNavigation(group.id)}
        className={cn(
          "group relative grid min-h-16 cursor-pointer grid-cols-[2.75rem_minmax(0,1fr)_auto] items-center gap-x-3 overflow-hidden rounded-md px-2.5 py-2.5",
          "transition-all duration-150 hover:translate-x-0.5",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-canvas",
          hasUnreadMessages
            ? "bg-forge-teal/8 hover:bg-forge-teal/12"
            : "bg-transparent hover:bg-card/55",
        )}
      >
        {hasUnreadMessages ? (
          <span
            className="absolute inset-y-2 left-0 w-1 rounded-r-md bg-forge-teal"
            aria-hidden="true"
          />
        ) : null}

        <div className="relative shrink-0">
          <Avatar
            src={group.avatar}
            name={group.name}
            imageSize={72}
            shape="rounded"
            className={cn(
              "size-11 rounded-md bg-canvas shadow-sm ring-1 ring-border/50 transition-all duration-150 group-hover:scale-105 group-hover:ring-forge-teal/30",
              hasUnreadMessages
                ? "ring-2 ring-forge-teal/35 group-hover:ring-forge-teal/50"
                : null,
            )}
            fallbackClassName="text-foreground text-xs"
          />
        </div>

        <div className="flex min-w-0 flex-col gap-0">
          <span className="truncate font-black text-foreground text-sm leading-tight transition-colors duration-150 group-hover:text-primary">
            {group.name}
          </span>
          <span
            className={cn(
              "truncate text-xs leading-4",
              hasUnreadMessages
                ? "font-bold text-foreground/85"
                : "font-semibold text-slate-muted",
            )}
          >
            {contextLine}
          </span>
          <div className="flex min-w-0 items-center gap-2">
            <span className="flex shrink-0 items-center gap-1 font-semibold text-slate-muted text-xs">
              <Users className="size-2.5 shrink-0" aria-hidden="true" />
              {group.members.length}
            </span>
            <span
              className="size-1 rounded-full bg-border"
              aria-hidden="true"
            />
            <span className="truncate font-semibold text-slate-muted text-xs">
              {lastActivity}
            </span>
            {metaStatus ? (
              <>
                <span
                  className="size-1 rounded-full bg-border"
                  aria-hidden="true"
                />
                <span className="flex shrink-0 items-center gap-1 font-semibold text-slate-muted text-xs">
                  {isMuted ? (
                    <BellOff className="size-2.5" aria-hidden="true" />
                  ) : (
                    <Pin className="size-2.5" aria-hidden="true" />
                  )}
                  {metaStatus}
                </span>
              </>
            ) : null}
          </div>
        </div>

        {hasUnreadMessages ? (
          <UnreadBadge
            count={unreadCount}
            className="justify-self-end"
            aria-hidden="true"
          />
        ) : null}
      </Link>
    </li>
  );
}
