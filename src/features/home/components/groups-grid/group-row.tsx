import { Link } from "@tanstack/react-router";
import {
  ArrowUpRight,
  BellOff,
  CalendarClock,
  MessageCircleMore,
  Pin,
  UsersRound,
} from "lucide-react";
import type { HomeGroup } from "@/features/home/schemas/home-group.schema";
import { Avatar } from "@/shared/components/common/avatar";
import { UnreadBadge } from "@/shared/components/common/unread-badge";
import {
  GroupedMenuAction,
  GroupedMenuItem,
} from "@/shared/components/ui/grouped-menu";
import { cn } from "@/shared/lib/utils";
import { buildActivityGroupHubNavigation } from "@/shared/navigation/activity-navigation";

interface GroupRowProps {
  group: HomeGroup;
  isMuted?: boolean;
  isPinned?: boolean;
  messagePreview?: string;
  unreadCount?: number;
}

type GroupMetaStatusKind = "muted" | "pinned";

export function GroupRow({
  group,
  isMuted = false,
  isPinned = false,
  messagePreview,
  unreadCount = 0,
}: GroupRowProps) {
  const hasUnreadMessages = unreadCount > 0;
  const activityContext = getActivityContext({
    group,
    messagePreview,
  });
  const planContext = getPlanContext(group);
  const metaStatus = formatMetaStatus({ group, isMuted, isPinned });
  const metaStatusKind = getMetaStatusKind({ group, isMuted, isPinned });

  return (
    <GroupedMenuItem className="min-w-0">
      <GroupedMenuAction asChild>
        <Link
          {...buildActivityGroupHubNavigation(group.id)}
          className={cn(
            "grid min-h-24 grid-cols-[3.5rem_minmax(0,1fr)_2rem] items-center gap-x-3 px-3 py-3 sm:grid-cols-[4.25rem_minmax(0,1fr)_2rem] sm:gap-x-4",
            hasUnreadMessages &&
              "before:absolute before:inset-y-3 before:left-0 before:w-0.5 before:rounded-full before:bg-forge-teal",
          )}
        >
          <div className="shrink-0">
            <Avatar
              src={group.avatar}
              media={group.avatarMedia ?? null}
              name={group.name}
              imageSize={128}
              className={cn(
                "size-14 bg-card ring-1 ring-border/60 transition-all group-hover:-translate-y-0.5 group-hover:shadow-soft-sm group-hover:ring-foreground/30 sm:size-16",
                hasUnreadMessages && "ring-2 ring-forge-teal/35",
              )}
              fallbackClassName="text-sm"
            />
          </div>

          <div className="min-w-0">
            {hasUnreadMessages ? (
              <span className="sr-only">
                {unreadCount} unread{" "}
                {unreadCount === 1 ? "message" : "messages"}.
              </span>
            ) : null}

            <div className="flex min-w-0 items-center gap-2">
              <h3 className="truncate font-black text-foreground text-sm leading-tight sm:text-base">
                {group.name}
              </h3>
              {hasUnreadMessages ? (
                <UnreadBadge
                  count={unreadCount}
                  isCompact
                  className="shrink-0 shadow-none"
                  aria-hidden="true"
                />
              ) : null}
            </div>
            <div
              className={cn(
                "mt-1 grid min-w-0 grid-cols-[1rem_minmax(0,1fr)] items-center gap-1.5 text-muted-foreground",
                activityContext.kind === "message" &&
                  hasUnreadMessages &&
                  "text-foreground",
              )}
            >
              <span className="grid size-4 place-items-center">
                {activityContext.kind === "message" ? (
                  <MessageCircleMore className="size-3.5" aria-hidden="true" />
                ) : (
                  <CalendarClock className="size-3.5" aria-hidden="true" />
                )}
              </span>
              <span className="truncate font-medium text-xs leading-4 sm:text-sm">
                {activityContext.text}
              </span>
            </div>

            <div className="mt-1 flex min-w-0 items-center gap-x-2">
              <span className="min-w-0 flex-1 truncate font-medium text-muted-foreground text-xs">
                {planContext}
              </span>
              <span className="inline-flex shrink-0 items-center gap-1 font-semibold text-muted-foreground text-xs">
                <span
                  className="inline-flex"
                  title={formatMemberCount(group.members.length)}
                >
                  <UsersRound className="size-3.5" aria-hidden="true" />
                </span>
                <span className="sm:hidden" aria-hidden="true">
                  {group.members.length}
                </span>
                <span className="sr-only sm:not-sr-only">
                  {formatMemberCount(group.members.length)}
                </span>
              </span>
              <GroupMetaStatus
                metaStatus={metaStatus}
                statusKind={metaStatusKind}
              />
            </div>
          </div>

          <span className="grid size-8 shrink-0 place-items-center rounded-full text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground">
            <span className="sr-only">Open {group.name}</span>
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </span>
        </Link>
      </GroupedMenuAction>
    </GroupedMenuItem>
  );
}

function getActivityContext({
  group,
  messagePreview,
}: {
  group: HomeGroup;
  messagePreview?: string;
}) {
  if (messagePreview) {
    return {
      kind: "message" as const,
      text: formatMessageContext(messagePreview),
    };
  }

  const plan = group.plan;

  if (!plan) {
    return {
      kind: "plan" as const,
      text: "Ready for a new plan",
    };
  }

  if (normalizeContext(plan.title) !== normalizeContext(group.name)) {
    return {
      kind: "plan" as const,
      text: `Next plan · ${plan.title}`,
    };
  }

  return {
    kind: "plan" as const,
    text: getPlanStatusLabel(plan.status),
  };
}

function getPlanContext(group: HomeGroup) {
  const plan = group.plan;

  if (!plan) {
    return "No plan scheduled";
  }

  const schedule = formatPlanSchedule(plan.dateTime);
  const place =
    plan.locationMode === "ONLINE"
      ? "Online"
      : plan.location || "Location to be decided";

  return [schedule, place].filter(Boolean).join(" · ");
}

function formatPlanSchedule(value?: string | null) {
  if (!value) {
    return "Time to be decided";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Time to be decided";
  }

  const dayLabel = getRelativeDayLabel(date);
  const timeLabel = new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);

  if (dayLabel) {
    return `${dayLabel} at ${timeLabel}`;
  }

  const dateLabel = new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "short",
  }).format(date);

  return `${dateLabel} · ${timeLabel}`;
}

function getRelativeDayLabel(date: Date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const target = new Date(date);
  target.setHours(0, 0, 0, 0);

  const dayDifference = Math.round(
    (target.getTime() - today.getTime()) / 86_400_000,
  );

  if (dayDifference === 0) {
    return "Today";
  }

  if (dayDifference === 1) {
    return "Tomorrow";
  }

  return null;
}

function formatMemberCount(count: number) {
  return `${count} ${count === 1 ? "member" : "members"}`;
}

function formatMessageContext(messagePreview: string) {
  return messagePreview.replace(": ", " · ");
}

function getPlanStatusLabel(status: NonNullable<HomeGroup["plan"]>["status"]) {
  switch (status) {
    case "DRAFT":
      return "Planning the next activity";
    case "PROPOSED":
      return "Plan awaiting responses";
    case "CONFIRMED":
      return "Plan confirmed";
    case "IN_PROGRESS":
      return "Activity happening now";
    case "COMPLETED":
      return "Latest plan completed";
    case "CANCELLED":
      return "Plan cancelled";
    default:
      return "Plan updated";
  }
}

function normalizeContext(value: string) {
  return value.trim().toLocaleLowerCase();
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

function getMetaStatusKind({ isMuted, isPinned }: GroupRowProps) {
  if (isMuted) {
    return "muted";
  }

  if (isPinned) {
    return "pinned";
  }

  return null;
}

function GroupMetaStatus({
  metaStatus,
  statusKind,
}: {
  metaStatus: string | null;
  statusKind: GroupMetaStatusKind | null;
}) {
  if (!metaStatus) {
    return null;
  }

  return (
    <span
      className="inline-flex shrink-0 items-center gap-1 font-semibold text-muted-foreground text-xs"
      title={metaStatus}
    >
      {statusKind === "muted" ? (
        <BellOff className="size-3" aria-hidden="true" />
      ) : (
        <Pin className="size-3" aria-hidden="true" />
      )}
      <span className="sr-only sm:not-sr-only">{metaStatus}</span>
    </span>
  );
}
