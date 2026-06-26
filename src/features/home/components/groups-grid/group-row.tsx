import { Link } from "@tanstack/react-router";
import { BellOff, type LucideIcon, Pin, Users } from "lucide-react";
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

interface RelativeTimeParts {
  unit: "d" | "h" | "m" | "w";
  value: number;
}

const RELATIVE_TIME_THRESHOLDS = [
  { maxMinutes: 60, minutesPerUnit: 1, unit: "m" },
  { maxMinutes: 24 * 60, minutesPerUnit: 60, unit: "h" },
  { maxMinutes: 7 * 24 * 60, minutesPerUnit: 24 * 60, unit: "d" },
] as const;
const MINUTES_PER_WEEK = 7 * 24 * 60;

function formatRelativeTime(value: string) {
  const parts = getRelativeTimeParts(value);

  return parts ? `${parts.value}${parts.unit} ago` : "Recently";
}

function getRelativeTimeParts(value: string): RelativeTimeParts | null {
  const timestamp = new Date(value).getTime();

  if (Number.isNaN(timestamp)) {
    return null;
  }

  const diffMs = Date.now() - timestamp;
  const diffMinutes = Math.max(1, Math.floor(diffMs / 60_000));
  const threshold = RELATIVE_TIME_THRESHOLDS.find(
    ({ maxMinutes }) => diffMinutes < maxMinutes,
  );

  if (threshold) {
    return {
      unit: threshold.unit,
      value: Math.floor(diffMinutes / threshold.minutesPerUnit),
    };
  }

  return { unit: "w", value: Math.floor(diffMinutes / MINUTES_PER_WEEK) };
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
  return (
    messagePreview ||
    getPlanContextLine(group) ||
    getInterestContextLine(group) ||
    group.activity.title
  );
}

function getPlanContextLine(group: HomeGroup) {
  return getOnlinePlanContextLine(group) ?? getLocationPlanContextLine(group);
}

function getOnlinePlanContextLine(group: HomeGroup) {
  return group.plan?.locationMode === "ONLINE"
    ? "Online plan in progress"
    : null;
}

function getLocationPlanContextLine(group: HomeGroup) {
  if (!group.plan?.location) {
    return null;
  }

  return `Plan near ${group.plan.location}`;
}

function getInterestContextLine(group: HomeGroup) {
  const interests = group.activity.interests
    .map((interest) => interest.name)
    .slice(0, 2);

  if (interests.length > 0) {
    return `Around ${interests.join(" + ")}`;
  }

  return null;
}

function getMetaStatusIcon({ isMuted, isPinned }: GroupRowProps) {
  if (isMuted) {
    return BellOff;
  }

  if (isPinned) {
    return Pin;
  }

  return null;
}

function getGroupRowClassName(hasUnreadMessages: boolean) {
  return cn(
    "group relative grid min-h-16 cursor-pointer grid-cols-[2.75rem_minmax(0,1fr)_auto] items-center gap-x-3 overflow-hidden rounded-md px-2.5 py-2.5",
    "transition-all duration-150 hover:translate-x-0.5",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-canvas",
    hasUnreadMessages
      ? "bg-forge-teal/8 hover:bg-forge-teal/12"
      : "bg-transparent hover:bg-card/55",
  );
}

function getGroupAvatarClassName(hasUnreadMessages: boolean) {
  return cn(
    "size-11 rounded-md bg-canvas shadow-sm ring-1 ring-border/50 transition-all duration-150 group-hover:scale-105 group-hover:ring-forge-teal/30",
    hasUnreadMessages
      ? "ring-2 ring-forge-teal/35 group-hover:ring-forge-teal/50"
      : null,
  );
}

function getContextLineClassName(hasUnreadMessages: boolean) {
  return cn(
    "truncate text-xs leading-4",
    hasUnreadMessages
      ? "font-semibold text-foreground/85"
      : "font-semibold text-slate-muted",
  );
}

function GroupUnreadIndicator({
  hasUnreadMessages,
}: {
  hasUnreadMessages: boolean;
}) {
  return hasUnreadMessages ? (
    <span
      className="absolute inset-y-2 left-0 w-1 rounded-r-md bg-forge-teal"
      aria-hidden="true"
    />
  ) : null;
}

function GroupAvatar({
  group,
  hasUnreadMessages,
}: {
  group: HomeGroup;
  hasUnreadMessages: boolean;
}) {
  return (
    <div className="relative shrink-0">
      <Avatar
        src={group.avatar}
        media={group.avatarMedia ?? null}
        name={group.name}
        imageSize={72}
        shape="rounded"
        className={getGroupAvatarClassName(hasUnreadMessages)}
        fallbackClassName="text-foreground text-xs"
      />
    </div>
  );
}

function GroupMetaStatus({
  metaStatus,
  MetaStatusIcon,
}: {
  metaStatus: string | null;
  MetaStatusIcon: LucideIcon | null;
}) {
  if (!metaStatus) {
    return null;
  }

  return (
    <>
      <span className="size-1 rounded-full bg-border" aria-hidden="true" />
      <span className="flex shrink-0 items-center gap-1 font-semibold text-slate-muted text-xs">
        {MetaStatusIcon ? (
          <MetaStatusIcon className="size-2.5" aria-hidden="true" />
        ) : null}
        {metaStatus}
      </span>
    </>
  );
}

function GroupUnreadCountBadge({
  hasUnreadMessages,
  unreadCount,
}: {
  hasUnreadMessages: boolean;
  unreadCount: number;
}) {
  return hasUnreadMessages ? (
    <UnreadBadge
      count={unreadCount}
      className="justify-self-end"
      aria-hidden="true"
    />
  ) : null;
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
  const MetaStatusIcon = getMetaStatusIcon({ group, isMuted, isPinned });

  return (
    <li>
      <Link
        {...buildActivityGroupHubNavigation(group.id)}
        className={getGroupRowClassName(hasUnreadMessages)}
      >
        <GroupUnreadIndicator hasUnreadMessages={hasUnreadMessages} />

        <GroupAvatar group={group} hasUnreadMessages={hasUnreadMessages} />

        <div className="flex min-w-0 flex-col gap-0">
          <span className="truncate font-bold text-foreground text-sm leading-tight transition-colors duration-150 group-hover:text-primary">
            {group.name}
          </span>
          <span className={getContextLineClassName(hasUnreadMessages)}>
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
            <GroupMetaStatus
              metaStatus={metaStatus}
              MetaStatusIcon={MetaStatusIcon}
            />
          </div>
        </div>

        <GroupUnreadCountBadge
          hasUnreadMessages={hasUnreadMessages}
          unreadCount={unreadCount}
        />
      </Link>
    </li>
  );
}
