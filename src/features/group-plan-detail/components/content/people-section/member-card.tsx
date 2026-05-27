import { Link } from "@tanstack/react-router";
import { Crown } from "lucide-react";
import type { GroupPlanDetailMember } from "@/features/group-plan-detail/lib/group-plan-detail-contract";
import { buildProfileNavigation } from "@/features/profile/lib/profile-route";
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
        "group relative flex items-center gap-3 px-2 py-2 transition-colors duration-150 hover:bg-muted/50",
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
        <MemberIdentity member={member} isHost={isHost} isViewer={isViewer} />
        <MemberMeta member={member} />
      </div>

      {isMember && !isViewer ? (
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
        className={cn(
          "size-10 ring-1 ring-border/20",
          member.trustScore >= 0.8
            ? "ring-2 ring-forge-teal/30"
            : "ring-border/40",
        )}
      />
      {isHost ? (
        <div className="absolute -top-1 -left-1 flex size-5 items-center justify-center rounded-md border border-spark-amber/35 bg-spark-amber/15 text-spark-amber shadow-sm ring-2 ring-canvas">
          <Crown className="size-2.5" aria-hidden="true" />
        </div>
      ) : null}
    </div>
  );
}

function MemberIdentity({
  isHost,
  isViewer,
  member,
}: {
  isHost: boolean;
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
      {isHost ? (
        <span className="shrink-0 font-bold text-forge-teal text-micro">
          {member.role === "ADMIN" ? "Host" : "Mod"}
        </span>
      ) : null}
    </div>
  );
}

function MemberMeta({ member }: { member: GroupPlanDetailMember }) {
  const trustPercent = formatPercent(member.trustScore);
  const compatibilityPercent = formatPercent(member.compatibilityScore);
  const isHighCompatibility =
    typeof compatibilityPercent === "number" && compatibilityPercent >= 80;

  return (
    <div className="mt-0.5 flex min-w-0 items-center gap-2.5">
      <span className="shrink-0 font-bold text-muted-foreground text-xs">
        Trust {trustPercent}%
      </span>
      {typeof compatibilityPercent === "number" ? (
        <>
          <div className="h-2 w-px shrink-0 bg-border/50" />
          <span
            className={cn(
              "shrink-0 font-bold text-xs",
              isHighCompatibility
                ? "text-forge-teal"
                : "text-muted-foreground/60",
            )}
          >
            {compatibilityPercent}% fit
          </span>
        </>
      ) : null}
      {member.knownConnection ? (
        <span className="min-w-0 truncate font-medium text-muted-foreground/70 text-xs">
          {member.knownConnection}
        </span>
      ) : null}
    </div>
  );
}

function formatPercent(score: number | null) {
  if (typeof score !== "number") {
    return null;
  }

  return Math.round(score > 1 ? score : score * 100);
}
