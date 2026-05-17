import { Link } from "@tanstack/react-router";
import dayjs from "dayjs";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  CircleDot,
  Clock3,
  Globe2,
  Lock,
  MapPin,
  Pencil,
  UserCheck,
  UsersRound,
  XCircle,
} from "lucide-react";
import type { ReactNode } from "react";
import type {
  Group,
  GroupStatus,
  MemberRole,
} from "@/features/activity/lib/activity-contract";
import { buildGroupPlanDetailNavigation } from "@/features/group-plan-detail/lib/group-plan-detail-route";
import { Avatar } from "@/shared/components/common/avatar";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import { formatPanelToken } from "./lib/constants";
import { PlanChangeDialog } from "./plan-section/plan-change-dialog";

interface GroupIdentitySectionProps {
  activity?: Group["activity"];
  avatar?: string | null;
  coverImage?: string | null;
  createdAt: string;
  currentUserRole: MemberRole;
  description: string | null;
  isReadOnly?: boolean;
  memberCount: number;
  maxMembers: number;
  groupId: string;
  name: string;
  onEditGroup: () => void;
  plan?: Group["plan"];
  status: GroupStatus;
}

export function GroupIdentitySection({
  activity,
  avatar,
  coverImage = null,
  createdAt,
  currentUserRole,
  description,
  isReadOnly = false,
  memberCount,
  maxMembers,
  groupId,
  name,
  onEditGroup,
  plan,
  status,
}: GroupIdentitySectionProps) {
  const canEditGroup = currentUserRole === "ADMIN" && !isReadOnly;
  const createdLabel = dayjs(createdAt).isValid()
    ? `Created ${dayjs(createdAt).format("MMM D, YYYY")}`
    : "Created recently";
  const statusLabel = formatPanelToken(status);
  const displayName = stripStatusPrefix(name, statusLabel);
  const activityTitle = activity?.title
    ? stripStatusPrefix(activity.title, statusLabel)
    : null;
  const avatarSrc = avatar && avatar !== coverImage ? avatar : null;
  const displayDescription = getDisplayDescription(
    description,
    displayName,
    isReadOnly,
  );

  return (
    <section className="relative -mt-12 flex flex-col gap-4">
      <div className="flex items-end gap-4">
        <div className="group pointer-events-auto shrink-0">
          <Avatar
            src={avatarSrc}
            name={displayName}
            alt={`${displayName} avatar`}
            shape="rounded"
            className="size-20 rounded-xl bg-muted shadow-lg ring-4 ring-canvas"
            imageClassName="transition-transform duration-500 group-hover:scale-105"
          />
        </div>

        <div className="relative min-w-0 flex-1 pr-10 pb-1">
          <GroupStatusIcon label={statusLabel} status={status} />

          <h2 className="wrap-break-word line-clamp-2 font-bold text-2xl text-ink leading-tight tracking-tight">
            {displayName}
          </h2>

          {activityTitle ? (
            <p className="wrap-break-word mt-2 line-clamp-2 font-semibold text-forge-teal text-xs leading-snug">
              {activityTitle}
            </p>
          ) : null}
        </div>
      </div>

      {displayDescription && (
        <p className="wrap-break-word text-pretty text-ink/75 text-sm leading-relaxed">
          {displayDescription}
        </p>
      )}

      <GroupFactList
        activity={activity}
        createdLabel={createdLabel}
        isReadOnly={isReadOnly}
        memberCount={memberCount}
        maxMembers={maxMembers}
      />

      <div className="flex flex-wrap gap-2">
        <Button
          asChild
          variant="outline"
          size="xs"
          className="min-w-0 flex-1 basis-32 px-3"
          contentClassName="gap-1.5"
        >
          <Link
            {...buildGroupPlanDetailNavigation(groupId, { source: "activity" })}
            aria-label={`View ${displayName} group details`}
          >
            <span className="truncate">View more</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </Button>

        {!isReadOnly ? (
          canEditGroup ? (
            <Button
              type="button"
              variant="outline"
              size="xs"
              className="min-w-0 flex-1 basis-32 px-3"
              contentClassName="gap-1.5"
              onClick={onEditGroup}
            >
              <Pencil className="size-3.5" />
              <span className="truncate">Edit details</span>
            </Button>
          ) : plan ? (
            <PlanChangeDialog
              plan={plan}
              className="min-w-0 flex-1 basis-32 px-3"
            />
          ) : null
        ) : null}
      </div>
    </section>
  );
}

function GroupStatusIcon({
  label,
  status,
}: {
  label: string;
  status: GroupStatus;
}) {
  const Icon = GROUP_STATUS_ICONS[status];

  return (
    <span
      aria-label={`Group status: ${label}`}
      className={cn(
        "absolute top-0 right-0 flex size-8 items-center justify-center rounded-lg border",
        status === "ACTIVE"
          ? "border-forge-teal/20 bg-forge-teal/10 text-forge-teal"
          : "border-slate-muted/15 bg-slate-muted/10 text-slate-muted",
      )}
      role="img"
      title={label}
    >
      <Icon className="size-3.5" strokeWidth={2} />
    </span>
  );
}

function GroupFactList({
  activity,
  createdLabel,
  isReadOnly,
  memberCount,
  maxMembers,
}: {
  activity?: Group["activity"];
  createdLabel: string;
  isReadOnly: boolean;
  memberCount: number;
  maxMembers: number;
}) {
  const access = activity ? getAccessDisplay(activity) : null;
  const visibleCapacitySegments = Math.max(1, Math.min(maxMembers, 8));
  const filledCapacitySegments = Math.min(memberCount, visibleCapacitySegments);
  const capacitySegments = CAPACITY_SEGMENT_KEYS.slice(
    0,
    visibleCapacitySegments,
  );
  const facts: CompactFactProps[] = [
    {
      icon: <UsersRound className="size-4" />,
      label: "Members",
      value: `${memberCount}/${maxMembers}`,
      tone: "teal" as const,
    },
    {
      icon: <CalendarDays className="size-4" />,
      label: "Created",
      value: createdLabel.replace("Created ", ""),
      tone: "amber" as const,
    },
  ];

  if (activity?.city) {
    facts.splice(1, 0, {
      icon: <MapPin className="size-4" />,
      label: "Area",
      value: activity.city,
      tone: "muted",
    });
  }

  if (access) {
    facts.splice(2, 0, {
      icon: access.icon,
      label: "Joining",
      value: access.label,
      tone: "muted",
    });
  }

  return (
    <div className="flex flex-col gap-3 border-border/70 border-y py-3">
      <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
        {facts.map((fact) => (
          <CompactFact key={fact.label} {...fact} />
        ))}
      </dl>

      {!isReadOnly ? (
        <div className="flex items-center gap-2">
          <meter
            className="sr-only"
            max={maxMembers}
            min={0}
            value={memberCount}
          >
            {memberCount} of {maxMembers} seats filled
          </meter>
          <span className="shrink-0 text-slate-muted text-xs">Capacity</span>
          <div className="flex min-w-0 flex-1 gap-1">
            {capacitySegments.map((segment) => {
              const segmentNumber = Number(segment);

              return (
                <span
                  key={segment}
                  className={cn(
                    "h-1.5 min-w-0 flex-1 rounded-full transition-colors duration-300",
                    segmentNumber <= filledCapacitySegments
                      ? "bg-forge-teal"
                      : "bg-slate-muted/20",
                  )}
                />
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}

const CAPACITY_SEGMENT_KEYS = ["1", "2", "3", "4", "5", "6", "7", "8"];

const GROUP_STATUS_ICONS = {
  ACTIVE: CheckCircle2,
  COMPLETED: CheckCircle2,
  DISBANDED: XCircle,
  FORMING: CircleDot,
  PENDING: Clock3,
  PLANNING: Clock3,
} satisfies Record<GroupStatus, typeof Clock3>;

interface CompactFactProps {
  icon: ReactNode;
  label: string;
  tone: "amber" | "muted" | "teal";
  value: string;
}

function CompactFact({ icon, label, tone, value }: CompactFactProps) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <span
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-lg",
          tone === "teal" && "bg-forge-teal/10 text-forge-teal",
          tone === "amber" && "bg-spark-amber/10 text-spark-amber",
          tone === "muted" && "bg-slate-muted/10 text-slate-muted",
        )}
        aria-hidden="true"
      >
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <dt className="text-slate-muted text-xs">{label}</dt>
        <dd className="wrap-break-word font-semibold text-ink text-sm leading-snug">
          {value}
        </dd>
      </div>
    </div>
  );
}

function getAccessDisplay(activity: NonNullable<Group["activity"]>) {
  const visibility = formatPanelToken(activity.visibility);

  if (activity.visibility === "PUBLIC") {
    return {
      icon: <Globe2 className="size-4" />,
      label: activity.access === "OPEN" ? "Open" : `Request · ${visibility}`,
    };
  }

  if (activity.visibility === "FRIENDS_ONLY") {
    return {
      icon: <UserCheck className="size-4" />,
      label: "Friends only",
    };
  }

  return {
    icon: <Lock className="size-4" />,
    label: visibility,
  };
}

function stripStatusPrefix(value: string, statusLabel: string) {
  const prefix = `${statusLabel} `;

  if (!value.toLowerCase().startsWith(prefix.toLowerCase())) {
    return value;
  }

  const strippedValue = value.slice(prefix.length).trim();
  return strippedValue || value;
}

function getDisplayDescription(
  description: string | null,
  groupName: string,
  isReadOnly: boolean,
) {
  if (!description) {
    return null;
  }

  const looksInternal =
    /historical group volume|extra ratings|mini retro|seed data|fixture/i.test(
      description,
    );

  if (!isReadOnly || !looksInternal) {
    return description;
  }

  return `${groupName} is saved in this group's history.`;
}
