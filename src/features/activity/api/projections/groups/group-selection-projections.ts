import { toMessageApi } from "@/features/activity/api/messages/message-mappers";
import type { Group } from "@/features/activity/lib/activity-contract";
import type { GroupApi } from "@/shared/schemas";

type SelectionMember = NonNullable<Group["members"]>[number];
type SelectionMemberUser = NonNullable<SelectionMember["user"]>;

export function mapApiGroupFromSelection(
  group: Group,
  baseGroup: GroupApi,
): GroupApi {
  return {
    ...baseGroup,
    id: group.id,
    name: group.name,
    description: group.description,
    avatar: group.avatar,
    ...(group.avatarMedia !== undefined && {
      avatarMedia: group.avatarMedia,
    }),
    status: group.status,
    maxMembers: group.maxMembers,
    createdAt: group.createdAt,
    updatedAt: group.updatedAt,
    version: group.version,
    disbandedAt: group.disbandedAt,
    activityId: group.activityId,
    activity: mapSelectionActivity(group.activity, baseGroup.activity),
    plan:
      group.plan === undefined
        ? baseGroup.plan
        : mapSelectionPlan(group.plan, baseGroup.plan),
    chat:
      group.chat === undefined ? baseGroup.chat : mapSelectionChat(group.chat),
    members: mapSelectionMembers(group.members, baseGroup.members),
  };
}

function mapSelectionActivity(
  activity: Group["activity"],
  baseActivity: GroupApi["activity"],
): GroupApi["activity"] {
  return activity ? { ...baseActivity, ...activity } : baseActivity;
}

function mapSelectionPlan(
  plan: Group["plan"],
  basePlan: GroupApi["plan"],
): GroupApi["plan"] {
  if (!plan) {
    return null;
  }

  return {
    ...basePlan,
    id: plan.id,
    title: plan.title,
    category: plan.category,
    coverImage: plan.coverImage,
    coverImageMedia: plan.coverImageMedia,
    status: plan.status,
    scheduleMode: plan.scheduleMode,
    dateTime: plan.dateTime,
    locationMode: plan.locationMode,
    location: plan.location,
    locationLat: plan.locationLat,
    locationLng: plan.locationLng,
    cost: plan.cost,
  };
}

function mapSelectionChat(chat: Group["chat"]): GroupApi["chat"] {
  if (!chat) {
    return null;
  }

  return {
    id: chat.id,
    isMuted: chat.isMuted,
    pinnedMessages: chat.pinnedMessages?.map((message) =>
      toMessageApi(message),
    ),
  };
}

function mapSelectionMembers(
  members: Group["members"],
  baseMembers: GroupApi["members"],
): GroupApi["members"] {
  if (!members) {
    return baseMembers;
  }

  const mappedMembers = members.map((member) =>
    mapSelectionMember(
      member,
      baseMembers.find((candidate) => candidate.userId === member.userId),
    ),
  );

  return mappedMembers.every(isDefinedSelectionMember)
    ? mappedMembers
    : baseMembers;
}

function mapSelectionMember(
  member: SelectionMember,
  baseMember: GroupApi["members"][number] | undefined,
): GroupApi["members"][number] | null {
  const user = member.user
    ? mapSelectionMemberUser(member.user)
    : baseMember?.user;

  if (!user) {
    return null;
  }

  return {
    ...baseMember,
    userId: member.userId,
    role: member.role,
    joinedAt: member.joinedAt,
    leftAt: member.leftAt,
    user,
  };
}

function mapSelectionMemberUser(
  user: SelectionMemberUser,
): GroupApi["members"][number]["user"] {
  return {
    id: user.id,
    name: user.name,
    avatar: user.avatar,
    avatarMedia: user.avatarMedia,
    bio: user.bio,
    age: user.age,
    gender: user.gender,
    city: user.city,
    onlineStatus: user.onlineStatus,
  };
}

function isDefinedSelectionMember(
  member: GroupApi["members"][number] | null,
): member is GroupApi["members"][number] {
  return member !== null;
}
