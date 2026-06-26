import { Link } from "@tanstack/react-router";
import { Handshake, type LucideIcon, ShieldCheck, Target } from "lucide-react";
import type { GroupPlanDetailMember } from "@/features/group-plan-detail/lib/group-plan-detail-contract";
import { buildProfileNavigation } from "@/features/profile/lib/profile-route";
import { AdminCrownBadge } from "@/shared/components/common/admin-crown-badge";
import { Avatar } from "@/shared/components/common/avatar";
import { IconTile } from "@/shared/components/ui/icon-tile";
import { StatusPill } from "@/shared/components/ui/status-pill";
import { cn } from "@/shared/lib/utils";
import { MemberAction } from "./member-action";

interface MemberCardProps {
  member: GroupPlanDetailMember;
  isMember: boolean;
  isViewer: boolean;
  variant: "host" | "regular";
}

interface MemberMetricViewModel {
  icon: LucideIcon;
  label: string;
  tone: "muted" | "teal";
  value: string;
}

export function MemberCard({
  member,
  isMember,
  isViewer,
  variant,
}: MemberCardProps) {
  const isHost = variant === "host";

  return (
    <article
      className={cn(
        "group relative flex min-h-16 items-center gap-3 rounded-xl px-2 py-2 transition-colors duration-150 hover:bg-muted/50",
        isHost && "bg-forge-teal/5",
      )}
    >
      <Link
        {...buildProfileNavigation(member.userId)}
        aria-label={`View ${member.name}'s profile`}
        className="absolute inset-0 z-10 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span className="sr-only">View {member.name}'s profile</span>
      </Link>
      <MemberAvatar member={member} isHost={isHost} />

      <div className="min-w-0 flex-1">
        <MemberIdentity member={member} isViewer={isViewer} />
        <MemberMeta member={member} />
      </div>

      {shouldShowMemberAction({ isMember, isViewer, member }) ? (
        <div className="relative z-20">
          <MemberAction member={member} />
        </div>
      ) : null}
    </article>
  );
}

function MemberAvatar({
  isHost,
  member,
}: {
  isHost: boolean;
  member: GroupPlanDetailMember;
}) {
  return (
    <div className="relative shrink-0">
      <Avatar
        src={member.avatar}
        media={member.avatarMedia ?? null}
        name={member.name}
        imageSize={64}
        className={cn(
          "size-10 ring-1 ring-border/20",
          member.trustScore >= 0.8
            ? "ring-2 ring-forge-teal/30"
            : "ring-border/40",
        )}
      />
      {isHost ? (
        <AdminCrownBadge
          aria-label={member.role === "ADMIN" ? "Host" : "Moderator"}
          className="absolute -top-1 -left-1"
          iconClassName="size-2.5"
        />
      ) : null}
    </div>
  );
}

function MemberIdentity({
  isViewer,
  member,
}: {
  isViewer: boolean;
  member: GroupPlanDetailMember;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <h3 className="truncate font-bold text-foreground text-sm leading-tight">
        {member.name}
      </h3>
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
      {member.personalityType ? (
        <StatusPill
          tone="teal"
          size="xs"
          surface="solid"
          className="h-4 px-1.5 py-0 leading-4"
        >
          {member.personalityType}
        </StatusPill>
      ) : null}
    </div>
  );
}

function MemberMeta({ member }: { member: GroupPlanDetailMember }) {
  const metrics = getMemberMetrics(member);

  return (
    <div className="mt-1.5 flex min-w-0 items-center gap-1.5">
      {metrics.map((metric) => (
        <MemberMetric key={metric.label} {...metric} />
      ))}
      {member.knownConnection ? (
        <KnownConnectionIndicator label={member.knownConnection} />
      ) : null}
    </div>
  );
}

function MemberMetric({
  icon: Icon,
  label,
  tone,
  value,
}: MemberMetricViewModel) {
  return (
    <StatusPill
      icon={Icon}
      size="xs"
      tone={tone === "teal" ? "teal" : "neutral"}
      surface="soft"
      className="h-5 px-1.5 text-xs"
      title={`${label} ${value}`}
    >
      <span className="sr-only">{label}</span>
      <span>{value}</span>
    </StatusPill>
  );
}

function getMemberMetrics(member: GroupPlanDetailMember) {
  return [
    getMemberMetric({
      icon: ShieldCheck,
      label: "Trust",
      score: member.trustScore,
    }),
    getMemberMetric({
      icon: Target,
      label: "Fit",
      score: member.compatibilityScore,
    }),
  ].filter(isMemberMetric);
}

function getMemberMetric({
  icon,
  label,
  score,
}: {
  icon: LucideIcon;
  label: string;
  score: number | null;
}): MemberMetricViewModel | null {
  const percent = formatPercent(score);

  return typeof percent === "number"
    ? {
        icon,
        label,
        tone: getMemberMetricTone(percent),
        value: `${percent}%`,
      }
    : null;
}

function isMemberMetric(
  metric: MemberMetricViewModel | null,
): metric is MemberMetricViewModel {
  return metric !== null;
}

function getMemberMetricTone(percent: number) {
  return percent >= 80 ? "teal" : "muted";
}

function shouldShowMemberAction({
  isMember,
  isViewer,
  member,
}: {
  isMember: boolean;
  isViewer: boolean;
  member: GroupPlanDetailMember;
}) {
  return isMember && !isViewer && !member.knownConnection;
}

function KnownConnectionIndicator({ label }: { label: string }) {
  return (
    <IconTile
      icon={Handshake}
      shape="circle"
      size="xs"
      tone="amber"
      aria-hidden={false}
      aria-label={label}
      className="bg-spark-amber/12"
      iconClassName="size-3.5"
      title={label}
    />
  );
}

function formatPercent(score: number | null) {
  if (typeof score !== "number") {
    return null;
  }

  return Math.round(score > 1 ? score : score * 100);
}
