import { Link } from "@tanstack/react-router";
import { Handshake } from "lucide-react";
import type { GroupPlanDetailMember } from "@/features/group-plan-detail/lib/group-plan-detail-contract";
import { AdminCrownBadge } from "@/shared/components/common/admin-crown-badge";
import { Avatar } from "@/shared/components/common/avatar";
import { IconTile } from "@/shared/components/ui/icon-tile";
import { StatusPill } from "@/shared/components/ui/status-pill";
import { cn } from "@/shared/lib/utils";
import { buildProfileNavigation } from "@/shared/navigation/profile-navigation";
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
        className="size-10 ring-1 ring-border/40"
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
    </div>
  );
}

function MemberMeta({ member }: { member: GroupPlanDetailMember }) {
  if (!member.knownConnection) {
    return null;
  }

  return (
    <div className="mt-1.5 flex min-w-0 items-center gap-1.5">
      <KnownConnectionIndicator label={member.knownConnection} />
    </div>
  );
}

function shouldShowMemberAction({
  isMember,
  isViewer,
}: {
  isMember: boolean;
  isViewer: boolean;
  member: GroupPlanDetailMember;
}) {
  return isMember && !isViewer;
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
