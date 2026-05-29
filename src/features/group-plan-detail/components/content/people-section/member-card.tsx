import { Link } from "@tanstack/react-router";
import { Handshake, type LucideIcon, ShieldCheck, Target } from "lucide-react";
import type { GroupPlanDetailMember } from "@/features/group-plan-detail/lib/group-plan-detail-contract";
import { buildProfileNavigation } from "@/features/profile/lib/profile-route";
import { AdminCrownBadge } from "@/shared/components/common/admin-crown-badge";
import { Avatar } from "@/shared/components/common/avatar";
import { cn } from "@/shared/lib/utils";
import { MemberAction } from "./member-action";

interface MemberCardProps {
  member: GroupPlanDetailMember;
  isMember: boolean;
  isViewer: boolean;
  variant: "host" | "regular";
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

      {isMember && !isViewer && !member.knownConnection ? (
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
      <h3 className="truncate font-black text-foreground text-sm leading-tight">
        {member.name}
      </h3>
      {isViewer ? (
        <span className="shrink-0 rounded-full bg-muted px-1.5 py-0.5 font-bold text-micro text-muted-foreground">
          You
        </span>
      ) : null}
      {member.personalityType ? (
        <span className="h-4 shrink-0 rounded-full bg-forge-teal px-1.5 font-bold text-micro text-white leading-4">
          {member.personalityType}
        </span>
      ) : null}
    </div>
  );
}

function MemberMeta({ member }: { member: GroupPlanDetailMember }) {
  const trustPercent = formatPercent(member.trustScore);
  const compatibilityPercent = formatPercent(member.compatibilityScore);
  const isHighTrust = typeof trustPercent === "number" && trustPercent >= 80;
  const isHighCompatibility =
    typeof compatibilityPercent === "number" && compatibilityPercent >= 80;

  return (
    <div className="mt-1.5 flex min-w-0 items-center gap-1.5">
      {typeof trustPercent === "number" ? (
        <MemberMetric
          icon={ShieldCheck}
          label="Trust"
          tone={isHighTrust ? "teal" : "muted"}
          value={`${trustPercent}%`}
        />
      ) : null}
      {typeof compatibilityPercent === "number" ? (
        <MemberMetric
          icon={Target}
          label="Fit"
          tone={isHighCompatibility ? "teal" : "muted"}
          value={`${compatibilityPercent}%`}
        />
      ) : null}
      {member.knownConnection ? (
        <KnownConnectionIndicator label={member.knownConnection} />
      ) : null}
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
    <span
      className={cn(
        "inline-flex h-5 shrink-0 items-center gap-1 rounded-full px-1.5 font-bold text-xs",
        tone === "teal"
          ? "bg-forge-teal/10 text-forge-teal"
          : "bg-muted/50 text-muted-foreground",
      )}
      title={`${label} ${value}`}
    >
      <Icon className="size-3.5" strokeWidth={1.75} aria-hidden="true" />
      <span className="sr-only">{label}</span>
      <span>{value}</span>
    </span>
  );
}

function KnownConnectionIndicator({ label }: { label: string }) {
  return (
    <span
      className="inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-spark-amber/12 text-spark-amber"
      title={label}
    >
      <Handshake className="size-3.5" strokeWidth={1.75} aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </span>
  );
}

function formatPercent(score: number | null) {
  if (typeof score !== "number") {
    return null;
  }

  return Math.round(score > 1 ? score : score * 100);
}
