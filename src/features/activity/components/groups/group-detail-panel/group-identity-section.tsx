import { Link } from "@tanstack/react-router";
import dayjs from "dayjs";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  CalendarDays,
  Globe2,
  Lock,
  MapPin,
  Pencil,
  QrCode,
  UserCheck,
  UsersRound,
} from "lucide-react";
import type {
  Group,
  GroupStatus,
  MemberRole,
} from "@/features/activity/lib/activity-contract";
import { buildGroupPlanDetailNavigation } from "@/features/group-plan-detail/lib/group-plan-detail-route";
import { Avatar } from "@/shared/components/common/avatar";
import { QrShareDialog } from "@/shared/components/qr-share-dialog";
import { Button } from "@/shared/components/ui/button";
import { FactItem } from "@/shared/components/ui/fact-item";
import type { IconTileTone } from "@/shared/components/ui/icon-tile";
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
  isOnline?: boolean;
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
  isOnline = true,
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
  const groupLink = `${window.location.origin}/groups/${groupId}`;

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

        <QrShareDialog
          url={groupLink}
          title="Group link"
          description="Scan to open this group in TeamForge. Only members can access it."
          avatarSrc={avatarSrc}
          bottomText={displayName}
          trigger={
            <Button
              variant="outline"
              size="xs"
              className="min-w-0 flex-1 basis-32"
              contentClassName="gap-1.5"
              aria-label={`Show ${displayName} group link QR code`}
            >
              <QrCode className="size-3.5" aria-hidden="true" />
              <span className="truncate">Group link</span>
            </Button>
          }
        />

        {!isReadOnly ? (
          canEditGroup ? (
            <Button
              type="button"
              variant="outline"
              size="xs"
              className="min-w-0 flex-1 basis-32"
              contentClassName="gap-1.5"
              disabled={!isOnline}
              onClick={onEditGroup}
              title={
                isOnline ? undefined : "Reconnect before editing group details."
              }
            >
              <Pencil className="size-3.5" />
              <span className="truncate">Edit details</span>
            </Button>
          ) : plan ? (
            <PlanChangeDialog
              plan={plan}
              className="min-w-0 flex-1 basis-32"
              trigger={
                <Button
                  variant="primary"
                  size="xs"
                  className="min-w-0 flex-1 basis-32"
                  contentClassName="gap-1.5"
                  disabled={!isOnline}
                  title={
                    isOnline
                      ? undefined
                      : "Reconnect before suggesting plan changes."
                  }
                >
                  <Pencil className="size-3.5" aria-hidden="true" />
                  <span className="truncate">Suggest</span>
                </Button>
              }
            />
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
  const facts: GroupFactProps[] = [
    {
      icon: UsersRound,
      label: "Members",
      value: `${memberCount}/${maxMembers}`,
      tone: "teal" as const,
    },
    {
      icon: CalendarDays,
      label: "Created",
      value: createdLabel.replace("Created ", ""),
      tone: "amber" as const,
    },
  ];

  if (activity?.city) {
    facts.splice(1, 0, {
      icon: MapPin,
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
          <FactItem
            key={fact.label}
            icon={fact.icon}
            iconTone={fact.tone}
            label={fact.label}
            value={fact.value}
          />
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

interface GroupFactProps {
  icon: LucideIcon;
  label: string;
  tone: Extract<IconTileTone, "amber" | "muted" | "teal">;
  value: string;
}

function getAccessDisplay(activity: NonNullable<Group["activity"]>) {
  const visibility = formatPanelToken(activity.visibility);

  if (activity.visibility === "PUBLIC") {
    return {
      icon: Globe2,
      label: activity.access === "OPEN" ? "Open" : `Request · ${visibility}`,
    };
  }

  if (activity.visibility === "FRIENDS_ONLY") {
    return {
      icon: UserCheck,
      label: "Friends only",
    };
  }

  return {
    icon: Lock,
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
