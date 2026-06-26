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
import { buildAppUrl } from "@/shared/lib/app-url";
import { cn } from "@/shared/lib/utils";
import type { ImageMedia } from "@/shared/schemas/media";
import { formatPanelToken } from "./lib/constants";
import { PlanChangeDialog } from "./plan-section/plan-change-dialog";
import { stripPanelStatusPrefix } from "./status-prefix";

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

interface GroupIdentityViewState {
  activityTitle: string | null;
  avatarSrc: string | null;
  canEditGroup: boolean;
  createdLabel: string;
  displayDescription: string | null;
  displayName: string;
  groupLink: string;
}

interface CapacityDisplayState {
  capacitySegments: string[];
  filledCapacitySegments: number;
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
  const {
    activityTitle,
    avatarSrc,
    canEditGroup,
    createdLabel,
    displayDescription,
    displayName,
    groupLink,
  } = getGroupIdentityViewState({
    activity,
    avatar,
    coverImage,
    createdAt,
    currentUserRole,
    description,
    groupId,
    isReadOnly,
    name,
    status,
  });

  return (
    <section className="relative flex flex-col gap-4 pt-5">
      <GroupIdentityHeaderCard
        activityTitle={activityTitle}
        avatarMedia={avatarMedia}
        avatarSrc={avatarSrc}
        displayName={displayName}
      />

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

      <GroupIdentityActions
        avatarSrc={avatarSrc}
        canEditGroup={canEditGroup}
        displayName={displayName}
        groupId={groupId}
        groupLink={groupLink}
        isOnline={isOnline}
        isReadOnly={isReadOnly}
        plan={plan}
        onEditGroup={onEditGroup}
      />
    </section>
  );
}

function getGroupIdentityViewState({
  activity,
  avatar,
  coverImage,
  createdAt,
  currentUserRole,
  description,
  groupId,
  isReadOnly = false,
  name,
  status,
}: Pick<
  GroupIdentitySectionProps,
  | "activity"
  | "avatar"
  | "coverImage"
  | "createdAt"
  | "currentUserRole"
  | "description"
  | "groupId"
  | "isReadOnly"
  | "name"
  | "status"
>): GroupIdentityViewState {
  const statusLabel = formatPanelToken(status);
  const displayName = stripPanelStatusPrefix(name, statusLabel);
  const displayDescription = getDisplayDescription(
    description,
    displayName,
    isReadOnly,
  );
  const groupLink = buildAppUrl(`/groups/${encodeURIComponent(groupId)}`);

  return {
    activityTitle: getDisplayActivityTitle(activity, statusLabel),
    avatarSrc: getDisplayAvatarSrc(avatar, coverImage),
    canEditGroup: canEditGroupDetails(currentUserRole, isReadOnly),
    createdLabel: getCreatedLabel(createdAt),
    displayDescription,
    displayName,
    groupLink,
  };
}

function canEditGroupDetails(currentUserRole: MemberRole, isReadOnly: boolean) {
  return currentUserRole === "ADMIN" && !isReadOnly;
}

function getCreatedLabel(createdAt: string) {
  const createdDate = dayjs(createdAt);

  return createdDate.isValid()
    ? `Created ${createdDate.format("MMM D, YYYY")}`
    : "Created recently";
}

function getDisplayActivityTitle(
  activity: Group["activity"] | undefined,
  statusLabel: string,
) {
  return activity?.title
    ? stripPanelStatusPrefix(activity.title, statusLabel)
    : null;
}

function getDisplayAvatarSrc(
  avatar: string | null | undefined,
  coverImage: string | null | undefined,
) {
  return avatar && avatar !== coverImage ? avatar : null;
}

function GroupIdentityHeaderCard({
  activityTitle,
  avatarMedia,
  avatarSrc,
  displayName,
}: {
  activityTitle: string | null;
  avatarMedia?: ImageMedia | null;
  avatarSrc: string | null;
  displayName: string;
}) {
  return (
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
  );
}

function GroupIdentityActions({
  avatarSrc,
  canEditGroup,
  displayName,
  groupId,
  groupLink,
  isOnline,
  isReadOnly,
  plan,
  onEditGroup,
}: {
  avatarSrc: string | null;
  canEditGroup: boolean;
  displayName: string;
  groupId: string;
  groupLink: string;
  isOnline: boolean;
  isReadOnly: boolean;
  plan?: Group["plan"];
  onEditGroup: () => void;
}) {
  return (
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

      <GroupMutableAction
        canEditGroup={canEditGroup}
        isOnline={isOnline}
        isReadOnly={isReadOnly}
        plan={plan}
        onEditGroup={onEditGroup}
      />
    </div>
  );
}

function GroupMutableAction({
  canEditGroup,
  isOnline,
  isReadOnly,
  plan,
  onEditGroup,
}: {
  canEditGroup: boolean;
  isOnline: boolean;
  isReadOnly: boolean;
  plan?: Group["plan"];
  onEditGroup: () => void;
}) {
  const actionKind = getGroupMutableActionKind({
    canEditGroup,
    hasPlan: Boolean(plan),
    isReadOnly,
  });

  if (actionKind === "hidden") {
    return null;
  }

  if (actionKind === "edit") {
    return (
      <Button
        type="button"
        variant="outline"
        size="xs"
        className="min-w-0 flex-1 basis-32"
        contentClassName="gap-1.5"
        disabled={!isOnline}
        onClick={onEditGroup}
        title={getGroupEditDisabledTitle(isOnline)}
      >
        <Pencil className="size-3.5" />
        <span className="truncate">Edit details</span>
      </Button>
    );
  }

  if (!plan) {
    return null;
  }

  return (
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
          title={getPlanSuggestionDisabledTitle(isOnline)}
        >
          <Pencil className="size-3.5" aria-hidden="true" />
          <span className="truncate">Suggest</span>
        </Button>
      }
    />
  );
}

function getGroupMutableActionKind({
  canEditGroup,
  hasPlan,
  isReadOnly,
}: {
  canEditGroup: boolean;
  hasPlan: boolean;
  isReadOnly: boolean;
}) {
  if (isReadOnly) {
    return "hidden";
  }

  if (canEditGroup) {
    return "edit";
  }

  return hasPlan ? "suggest" : "hidden";
}

function getGroupEditDisabledTitle(isOnline: boolean) {
  return isOnline ? undefined : "Reconnect before editing group details.";
}

function getPlanSuggestionDisabledTitle(isOnline: boolean) {
  return isOnline ? undefined : "Reconnect before suggesting plan changes.";
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
  const facts = getGroupFacts({
    access,
    activity,
    createdLabel,
    maxMembers,
    memberCount,
  });
  const capacityState = getCapacityDisplayState(memberCount, maxMembers);

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
        <GroupCapacityMeter
          capacityState={capacityState}
          maxMembers={maxMembers}
          memberCount={memberCount}
        />
      ) : null}
    </div>
  );
}

function getGroupFacts({
  access,
  activity,
  createdLabel,
  maxMembers,
  memberCount,
}: {
  access: ReturnType<typeof getAccessDisplay> | null;
  activity?: Group["activity"];
  createdLabel: string;
  maxMembers: number;
  memberCount: number;
}) {
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

  return facts;
}

function getCapacityDisplayState(
  memberCount: number,
  maxMembers: number,
): CapacityDisplayState {
  const visibleCapacitySegments = Math.max(1, Math.min(maxMembers, 8));

  return {
    capacitySegments: CAPACITY_SEGMENT_KEYS.slice(0, visibleCapacitySegments),
    filledCapacitySegments: Math.min(memberCount, visibleCapacitySegments),
  };
}

function GroupCapacityMeter({
  capacityState,
  maxMembers,
  memberCount,
}: {
  capacityState: CapacityDisplayState;
  maxMembers: number;
  memberCount: number;
}) {
  return (
    <div className="flex items-center gap-2">
      <meter className="sr-only" max={maxMembers} min={0} value={memberCount}>
        {memberCount} of {maxMembers} seats filled
      </meter>
      <span className="shrink-0 text-slate-muted text-xs">Capacity</span>
      <div className="flex min-w-0 flex-1 gap-1">
        {capacityState.capacitySegments.map((segment) => (
          <CapacitySegment
            key={segment}
            filledCapacitySegments={capacityState.filledCapacitySegments}
            segment={segment}
          />
        ))}
      </div>
    </div>
  );
}

function CapacitySegment({
  filledCapacitySegments,
  segment,
}: {
  filledCapacitySegments: number;
  segment: string;
}) {
  const segmentNumber = Number(segment);

  return (
    <span
      className={cn(
        "h-1.5 min-w-0 flex-1 rounded-full transition-colors duration-300",
        segmentNumber <= filledCapacitySegments
          ? "bg-forge-teal"
          : "bg-slate-muted/20",
      )}
    />
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
