import { GroupIdentityActions } from "./group-identity-section/actions";
import { GroupFactList } from "./group-identity-section/facts";
import { GroupIdentityHeaderCard } from "./group-identity-section/header-card";
import type { GroupIdentitySectionProps } from "./group-identity-section/types";
import { getGroupIdentityViewState } from "./group-identity-section/view-state";

export function GroupIdentitySection({
  activity,
  activityId,
  avatar,
  avatarMedia,
  coverImage = null,
  canCreateJoinLinks = true,
  canEditGroup: canEditGroupCapability,
  canLeaveGroup = true,
  canSuggestPlanChange = true,
  createdAt,
  currentUserRole,
  description,
  isReadOnly = false,
  isOnline = true,
  isSystemManaged = false,
  groupId,
  maxMembers,
  memberCount,
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
    canEditGroup: canEditGroupCapability,
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

      {isSystemManaged ? (
        <p className="text-slate-muted text-xs leading-relaxed">
          TeamForge formed this group. Everyone has the same member role.
        </p>
      ) : null}

      <GroupFactList
        activity={activity}
        createdLabel={createdLabel}
        maxMembers={maxMembers}
        memberCount={memberCount}
      />

      <GroupIdentityActions
        activityId={activityId}
        activityTitle={activityTitle}
        avatarSrc={avatarSrc}
        canEditGroup={canEditGroup}
        canCreateJoinLinks={canCreateJoinLinks}
        canLeaveGroup={canLeaveGroup}
        canSuggestPlanChange={canSuggestPlanChange}
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
