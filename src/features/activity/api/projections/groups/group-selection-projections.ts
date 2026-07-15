import { toMessageApi } from "@/features/activity/api/messages/message-mappers";
import type { Group } from "@/features/activity/lib/activity-contract";
import type { GroupApi } from "@/shared/schemas";

type SelectionActivity = NonNullable<Group["activity"]>;
type SelectionMember = NonNullable<Group["members"]>[number];
type SelectionMemberUser = NonNullable<SelectionMember["user"]>;

export function mapApiGroupFromSelection(group: Group): GroupApi {
  return {
    id: group.id,
    name: group.name,
    description: group.description,
    avatar: group.avatar,
    avatarMedia: group.avatarMedia,
    status: group.status,
    maxMembers: group.maxMembers,
    createdAt: group.createdAt,
    updatedAt: group.updatedAt,
    version: group.version,
    disbandedAt: group.disbandedAt,
    activityId: group.activityId,
    activity: mapSelectionActivity(group),
    plan: mapSelectionPlan(group.plan),
    chat: mapSelectionChat(group.chat),
    members: mapSelectionMembers(group.members),
  };
}

function mapSelectionActivity(group: Group): GroupApi["activity"] {
  const { activity } = group;

  return {
    id: getSelectionActivityField(activity, ({ id }) => id, group.activityId),
    title: getSelectionActivityField(
      activity,
      ({ title }) => title,
      group.name,
    ),
    city: getSelectionActivityField(activity, ({ city }) => city, null),
    status: getSelectionActivityField(
      activity,
      ({ status }) => status,
      "MATCHED",
    ),
    visibility: getSelectionActivityField(
      activity,
      ({ visibility }) => visibility,
      "PUBLIC",
    ),
    access: getSelectionActivityField(activity, ({ access }) => access, "OPEN"),
    forgeMode: getSelectionActivityField(
      activity,
      ({ forgeMode }) => forgeMode,
      "AUTO",
    ),
    interests: [],
  };
}

function mapSelectionPlan(plan: Group["plan"]): GroupApi["plan"] {
  if (!plan) {
    return null;
  }

  return {
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

function mapSelectionMembers(members: Group["members"]): GroupApi["members"] {
  return members?.map(mapSelectionMember) ?? [];
}

function mapSelectionMember(
  member: SelectionMember,
): GroupApi["members"][number] {
  return {
    userId: member.userId,
    role: member.role,
    joinedAt: member.joinedAt,
    leftAt: member.leftAt,
    compatibilityScore: member.compatibilityScore,
    user: mapSelectionMemberUser(member),
  };
}

function mapSelectionMemberUser(
  member: SelectionMember,
): GroupApi["members"][number]["user"] {
  const { user } = member;

  return {
    id: getSelectionMemberUserField(user, ({ id }) => id, member.userId),
    name: getSelectionMemberUserField(user, ({ name }) => name, "Member"),
    avatar: getSelectionMemberUserField(user, ({ avatar }) => avatar, null),
    avatarMedia: readSelectionMemberUserField(
      user,
      ({ avatarMedia }) => avatarMedia,
    ),
    personalityType: getSelectionMemberUserField(
      user,
      ({ personalityType }) => personalityType,
      null,
    ),
    trustScore: getSelectionMemberUserField(
      user,
      ({ trustScore }) => trustScore,
      0,
    ),
    onlineStatus: readSelectionMemberUserField(
      user,
      ({ onlineStatus }) => onlineStatus,
    ),
  };
}

function getSelectionActivityField<T>(
  activity: Group["activity"],
  readField: (activity: SelectionActivity) => T | null | undefined,
  fallback: T,
): T {
  if (!activity) {
    return fallback;
  }

  return readField(activity) ?? fallback;
}

function getSelectionMemberUserField<T>(
  user: SelectionMember["user"],
  readField: (user: SelectionMemberUser) => T | null | undefined,
  fallback: T,
): T {
  if (!user) {
    return fallback;
  }

  return readField(user) ?? fallback;
}

function readSelectionMemberUserField<T>(
  user: SelectionMember["user"],
  readField: (user: SelectionMemberUser) => T,
): T | undefined {
  if (!user) {
    return undefined;
  }

  return readField(user);
}
