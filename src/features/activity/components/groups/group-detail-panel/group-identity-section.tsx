import { Link } from "@tanstack/react-router";
import dayjs from "dayjs";
import {
  ArrowRight,
  CalendarDays,
  Globe2,
  Lock,
  MapPin,
  Pencil,
  UserCheck,
  UsersRound,
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
import type { ImageMedia } from "@/shared/schemas/media";
import { formatPanelToken } from "./lib/constants";
import { PlanChangeDialog } from "./plan-section/plan-change-dialog";

interface GroupIdentitySectionProps {
  activity?: Group["activity"];
  avatar?: string | null;
  avatarMedia?: ImageMedia | null;
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
  avatarMedia,
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
    <section className="relative flex flex-col gap-4 pt-5">
      <div
        className="transform-[translate3d(0,var(--collapsible-panel-original-card-y,0px),0)] flex items-center gap-4 opacity-(--collapsible-panel-original-card-opacity,1) transition-[opacity,transform] duration-300 ease-out [pointer-events:var(--collapsible-panel-original-pointer-events,auto)] [transition-delay:var(--collapsible-panel-original-card-delay,0ms)] motion-reduce:transition-none"
        data-collapsible-panel-original-card=""
      >
        <div className="group pointer-events-auto shrink-0">
          <Avatar
            src={avatarSrc}
            media={avatarSrc ? avatarMedia : null}
            name={displayName}
            alt={`${displayName} avatar`}
            shape="rounded"
            className="size-16 rounded-xl bg-muted ring-1 ring-border/70"
            imageClassName="transition-transform duration-500 group-hover:scale-105"
          />
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="wrap-break-word line-clamp-2 font-bold text-ink text-xl leading-tight tracking-tight">
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
          className="min-w-0 flex-1 basis-32"
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
              className="min-w-0 flex-1 basis-32"
              contentClassName="gap-1.5"
              onClick={onEditGroup}
            >
              <Pencil className="size-3.5" />
              <span className="truncate">Edit details</span>
            </Button>
          ) : plan ? (
            <PlanChangeDialog plan={plan} className="min-w-0 flex-1 basis-32" />
          ) : null
        ) : null}
      </div>
    </section>
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
