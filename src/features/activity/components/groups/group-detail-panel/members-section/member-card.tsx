import { type LucideIcon, ShieldCheck, Target, UserMinus } from "lucide-react";
import type { GroupMember } from "@/features/activity/lib/activity-contract";
import { AdminCrownBadge } from "@/shared/components/common/admin-crown-badge";
import { Avatar, AvatarStatus } from "@/shared/components/common/avatar";
import { ActionDialog } from "@/shared/components/ui/action-dialog";
import { Button } from "@/shared/components/ui/button";
import { StatusPill } from "@/shared/components/ui/status-pill";
import { cn } from "@/shared/lib/utils";
import {
  getMemberCardViewState,
  type MemberCardViewState,
} from "./member-card-view-state";

interface MemberCardProps {
  canRemove?: boolean;
  isViewer?: boolean;
  member: GroupMember;
  onRemove?: (memberId: string) => Promise<void> | void;
  onShowProfile?: (member: GroupMember) => void;
  removing?: boolean;
  showFit?: boolean;
}

interface MemberMetricItem {
  icon: LucideIcon;
  key: "fit" | "trust";
  label: string;
  tone: "muted" | "teal";
  value: string;
}

export function MemberCard({
  canRemove = false,
  isViewer = false,
  member,
  onRemove,
  onShowProfile,
  removing = false,
  showFit = true,
}: MemberCardProps) {
  const viewState = getMemberCardViewState(member, showFit);

  return (
    <article
      className={cn(
        "group/member flex min-h-16 w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition-colors duration-150 focus-within:bg-muted/50 hover:bg-muted/50",
        viewState.isAdmin && "bg-forge-teal/5",
      )}
    >
      {onShowProfile ? (
        <button
          type="button"
          className="flex min-w-0 flex-1 items-center justify-start gap-3 rounded-xl text-left text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-teal/30"
          aria-label={`Open ${viewState.memberName} details`}
          onClick={() => onShowProfile(member)}
        >
          <MemberSummary
            isViewer={isViewer}
            member={member}
            viewState={viewState}
          />
        </button>
      ) : (
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <MemberSummary
            isViewer={isViewer}
            member={member}
            viewState={viewState}
          />
        </div>
      )}

      {canRemove && onRemove ? (
        <RemoveMemberAction
          member={member}
          memberName={viewState.memberName}
          onRemove={onRemove}
          removing={removing}
        />
      ) : null}
    </article>
  );
}

function MemberSummary({
  isViewer,
  member,
  viewState,
}: {
  isViewer: boolean;
  member: GroupMember;
  viewState: MemberCardViewState;
}) {
  return (
    <>
      <MemberAvatar member={member} viewState={viewState} />
      <div className="min-w-0 flex-1 overflow-hidden">
        <MemberIdentityRow
          isViewer={isViewer}
          member={member}
          memberName={viewState.memberName}
        />
        <MemberMetrics viewState={viewState} />
      </div>
    </>
  );
}

function MemberAvatar({
  member,
  viewState,
}: {
  member: GroupMember;
  viewState: MemberCardViewState;
}) {
  return (
    <div className="relative shrink-0">
      <Avatar
        src={member.user?.avatar}
        media={member.user?.avatarMedia ?? null}
        name={member.user?.name}
        className={getMemberAvatarClassName(viewState)}
        imageClassName="transition-transform duration-500 group-hover/member:scale-110"
      />
      <MemberAvatarStatus viewState={viewState} />
      <MemberAdminIndicator isAdmin={viewState.isAdmin} />
    </div>
  );
}

function getMemberAvatarClassName(viewState: MemberCardViewState) {
  return cn(
    "size-10 ring-1 ring-border/20 transition-all group-hover/member:ring-border/40",
    viewState.isHighTrust ? "ring-2 ring-forge-teal/30" : "ring-border/40",
  );
}

function MemberAvatarStatus({ viewState }: { viewState: MemberCardViewState }) {
  if (!viewState.onlineStatus) {
    return null;
  }

  return (
    <AvatarStatus
      status={viewState.onlineStatus}
      borderClassName="border-canvas"
    />
  );
}

function MemberAdminIndicator({ isAdmin }: { isAdmin: boolean }) {
  if (!isAdmin) {
    return null;
  }

  return (
    <AdminCrownBadge
      aria-label="Group admin"
      className="absolute -top-1 -left-1"
      iconClassName="size-2.5"
    />
  );
}

function MemberIdentityRow({
  isViewer,
  member,
  memberName,
}: {
  isViewer: boolean;
  member: GroupMember;
  memberName: string;
}) {
  return (
    <div className="mb-0.5 flex min-w-0 items-center gap-1.5">
      <p className="min-w-0 truncate font-black text-foreground text-sm leading-tight">
        {memberName}
      </p>
      {isViewer ? (
        <StatusPill
          tone="neutral"
          size="xs"
          surface="soft"
          className="bg-muted px-1.5"
        >
          You
        </StatusPill>
      ) : null}
      {member.user?.personalityType ? (
        <StatusPill
          tone="teal"
          size="xs"
          surface="solid"
          className="h-4 px-1.5 py-0 leading-4"
        >
          {member.user.personalityType}
        </StatusPill>
      ) : null}
    </div>
  );
}

function MemberMetrics({ viewState }: { viewState: MemberCardViewState }) {
  const metricItems = getMemberMetricItems(viewState);

  if (!viewState.hasMetrics || metricItems.length === 0) {
    return null;
  }

  return (
    <div className="mt-1.5 flex min-w-0 items-center gap-1.5">
      {metricItems.map((item, index) => (
        <MetricWithSeparator
          key={item.key}
          item={item}
          showSeparator={index > 0}
        />
      ))}
    </div>
  );
}

function getMemberMetricItems(
  viewState: MemberCardViewState,
): MemberMetricItem[] {
  return [
    getMemberMetricItem({
      icon: ShieldCheck,
      isHighlighted: viewState.isHighTrust,
      key: "trust",
      label: "Trust",
      score: viewState.trustPercent,
    }),
    getMemberMetricItem({
      icon: Target,
      isHighlighted: viewState.isHighCompatibility,
      key: "fit",
      label: "Fit",
      score: viewState.fitScore,
    }),
  ].filter((item): item is MemberMetricItem => item !== null);
}

function getMemberMetricItem({
  icon,
  isHighlighted,
  key,
  label,
  score,
}: {
  icon: LucideIcon;
  isHighlighted: boolean;
  key: MemberMetricItem["key"];
  label: string;
  score: number | null;
}): MemberMetricItem | null {
  if (typeof score !== "number") {
    return null;
  }

  return {
    icon,
    key,
    label,
    tone: isHighlighted ? "teal" : "muted",
    value: `${score}%`,
  };
}

function MetricWithSeparator({
  item,
  showSeparator,
}: {
  item: MemberMetricItem;
  showSeparator: boolean;
}) {
  return (
    <>
      {showSeparator ? <MetricSeparator /> : null}
      <MemberMetric
        icon={item.icon}
        label={item.label}
        tone={item.tone}
        value={item.value}
      />
    </>
  );
}

function RemoveMemberAction({
  member,
  memberName,
  onRemove,
  removing,
}: {
  member: GroupMember;
  memberName: string;
  onRemove: NonNullable<MemberCardProps["onRemove"]>;
  removing: boolean;
}) {
  return (
    <div className="relative z-20 shrink-0">
      <ActionDialog
        cancelLabel="Keep member"
        confirmLabel={removing ? "Removing..." : "Remove member"}
        description={`${
          member.user?.name ?? "This member"
        } will lose access to the group chat and planning workspace.`}
        loading={removing}
        onConfirm={() => onRemove(member.userId)}
        onContentClick={(event) => event.stopPropagation()}
        title="Remove member?"
        tone="danger"
        trigger={
          <Button
            variant="destructive"
            size="icon-xs"
            type="button"
            disabled={removing}
            onClick={(event) => {
              event.stopPropagation();
            }}
            className="size-8 max-md:opacity-100 md:opacity-0 md:transition-all md:duration-150 md:group-hover/member:opacity-100 focus-visible:md:opacity-100"
            aria-label={`Remove ${memberName} from group`}
          >
            <UserMinus className="size-3.5" />
          </Button>
        }
      />
    </div>
  );
}

interface MemberMetricProps {
  icon: LucideIcon;
  label: string;
  tone: "muted" | "teal";
  value: string;
}

function MemberMetric({ icon: Icon, label, tone, value }: MemberMetricProps) {
  return (
    <StatusPill
      icon={Icon}
      iconClassName="size-3.5"
      tone={tone === "teal" ? "teal" : "neutral"}
      surface="ghost"
      className={cn(
        "gap-1 p-0 text-xs leading-tight",
        tone !== "teal" && "text-muted-foreground",
      )}
      title={`${label} ${value}`}
    >
      <span className="sr-only">{label}</span>
      <span>{value}</span>
    </StatusPill>
  );
}

function MetricSeparator() {
  return (
    <span
      className="size-1 shrink-0 rounded-full bg-muted-foreground/35"
      aria-hidden="true"
    />
  );
}
