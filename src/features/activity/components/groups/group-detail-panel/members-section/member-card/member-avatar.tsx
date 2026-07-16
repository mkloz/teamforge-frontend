import type { GroupMember } from "@/features/activity/lib/activity-contract";
import { AdminCrownBadge } from "@/shared/components/common/admin-crown-badge";
import { Avatar, AvatarStatus } from "@/shared/components/common/avatar";
import type { MemberCardViewState } from "../member-card-view-state";

export function MemberAvatar({
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
        className="size-10 ring-1 ring-border/40 transition-all group-hover/member:ring-border/60"
        imageClassName="transition-transform duration-500 group-hover/member:scale-110"
      />
      <MemberAvatarStatus viewState={viewState} />
      <MemberAdminIndicator isAdmin={viewState.isAdmin} />
    </div>
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
