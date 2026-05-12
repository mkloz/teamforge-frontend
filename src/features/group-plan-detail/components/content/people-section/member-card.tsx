import { Crown, ShieldCheck, Sparkles, UserRoundCheck } from "lucide-react";
import type { GroupPlanDetailMember } from "@/features/group-plan-detail/lib/group-plan-detail-contract";
import { Avatar } from "@/shared/components/common/avatar";
import { cn } from "@/shared/lib/utils";
import { MemberAction } from "./member-action";
import { MemberBadge } from "./member-badge";
import { getCompatLabel, getTrustLabel } from "./people-section-model";

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
  const trustLabel = getTrustLabel(member.trustScore);
  const compatLabel = getCompatLabel(member.compatibilityScore);

  return (
    <article
      className={cn(
        "group flex items-center gap-3.5 rounded-xl p-2.5 transition-colors duration-200",
        isHost ? "bg-forge-teal/5 hover:bg-forge-teal/8" : "hover:bg-muted/50",
      )}
    >
      <MemberAvatar member={member} isHost={isHost} />

      <div className="min-w-0 flex-1">
        <MemberIdentity member={member} isHost={isHost} isViewer={isViewer} />
        <MemberMeta
          member={member}
          compatLabel={compatLabel}
          trustLabel={trustLabel}
        />
      </div>

      {isMember && !isViewer ? <MemberAction member={member} /> : null}
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
          "size-10 border-2",
          member.trustScore >= 0.8
            ? "border-forge-teal/40"
            : "border-border/60",
        )}
      />
      {isHost ? (
        <div className="absolute -right-0.5 -bottom-0.5 flex size-5 items-center justify-center rounded-full bg-forge-teal text-white shadow-sm">
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
        <span className="type-signature-label shrink-0 rounded-full bg-muted px-1.5 py-0.5 font-bold text-muted-foreground uppercase tracking-widest">
          You
        </span>
      ) : null}
      {isHost ? (
        <span className="type-signature-label shrink-0 font-bold text-forge-teal uppercase tracking-widest">
          {member.role === "ADMIN" ? "Host" : "Mod"}
        </span>
      ) : null}
    </div>
  );
}

function MemberMeta({
  compatLabel,
  member,
  trustLabel,
}: {
  compatLabel: string | null;
  member: GroupPlanDetailMember;
  trustLabel: string | null;
}) {
  return (
    <div className="mt-1 flex flex-wrap items-center gap-1.5">
      {member.personalityType ? (
        <MemberBadge
          text={member.personalityType}
          icon={Sparkles}
          color="teal"
        />
      ) : null}
      {member.knownConnection ? (
        <MemberBadge
          text={member.knownConnection}
          icon={UserRoundCheck}
          color="amber"
        />
      ) : null}
      {trustLabel ? (
        <MemberBadge text={trustLabel} icon={ShieldCheck} color="muted" />
      ) : null}
      {compatLabel ? (
        <span className="type-signature-label font-medium text-muted-foreground">
          {compatLabel}
        </span>
      ) : null}
    </div>
  );
}
