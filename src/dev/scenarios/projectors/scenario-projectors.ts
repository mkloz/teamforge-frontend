import type { ScenarioWorld } from "@/dev/scenarios/world/scenario-world";
import { groupPlanDetailSchema } from "@/features/group-plan-detail/schemas/group-plan-detail.schema";
import { homeGroupSchema } from "@/features/home/schemas/home-group.schema";
import {
  type CurrentUser,
  chatApiSchema,
  exploreGroupSchema,
  groupApiSchema,
} from "@/shared/schemas";

export function projectHomeGroups(world: ScenarioWorld) {
  if (!world.viewerId) {
    return [];
  }

  return Object.values(world.entities.groups)
    .filter((group) => group.memberIds.includes(world.viewerId ?? ""))
    .map((group) => {
      const activity = world.entities.activities[group.activityId];
      const plan = getCurrentPlan(world, group.id);

      return homeGroupSchema.parse({
        activity: {
          id: activity.id,
          interests: activity.interestIds.map(
            (id) => world.entities.interests[id],
          ),
          title: activity.title,
        },
        avatar: group.avatar,
        continuationCheckIn: null,
        id: group.id,
        maxMembers: group.maxMembers,
        members: group.memberIds.map((userId) => ({ userId })),
        name: group.name,
        pendingParticipationPlan: null,
        plan: plan ? toHomePlan(plan) : null,
        status: group.status,
        updatedAt: group.updatedAt,
        version: Date.parse(group.updatedAt),
      });
    });
}

export function projectExploreGroups(world: ScenarioWorld) {
  return Object.values(world.entities.groups).map((group, index) => {
    const activity = world.entities.activities[group.activityId];
    const plan = getCurrentPlan(world, group.id);

    return exploreGroupSchema.parse({
      access: group.access,
      activeMembersCount: group.memberIds.length,
      activity: {
        access: activity.access,
        city: activity.city,
        id: activity.id,
        interests: activity.interestIds.map(
          (id) => world.entities.interests[id],
        ),
        title: activity.title,
        visibility: activity.visibility,
      },
      avatar: group.avatar,
      avatarMedia: null,
      compatibility: {
        ageAlignment: 82 - index * 2,
        cityAlignment: activity.city ? 95 : 70,
        friendshipProximity: 58 + index * 3,
        interestOverlap: 90 - index * 4,
        total: 88 - index * 4,
      },
      description: group.description,
      id: group.id,
      maxMembers: group.maxMembers,
      members: group.memberIds
        .map((id) => world.entities.users[id])
        .filter(Boolean)
        .map((user) => ({
          avatar: user.avatar,
          avatarMedia: null,
          id: user.id,
          name: user.name,
        })),
      name: group.name,
      plan: plan
        ? {
            category: plan.category,
            cost: plan.cost,
            dateTime: plan.dateTime,
            id: plan.id,
            locationMode: plan.locationMode,
            scheduleMode: plan.scheduleMode,
            title: plan.title,
          }
        : null,
      status: group.status,
      updatedAt: group.updatedAt,
      version: Date.parse(group.updatedAt),
    });
  });
}

export function projectExploreFeed(world: ScenarioWorld) {
  return projectExploreGroups(world).map((group) => ({
    group,
    type: "GROUP" as const,
  }));
}

export function projectActivityGroups(world: ScenarioWorld) {
  return Object.values(world.entities.groups)
    .filter((group) =>
      world.viewerId ? group.memberIds.includes(world.viewerId) : false,
    )
    .map((group) => projectActivityGroupEntity(world, group.id))
    .filter((group) => group !== null);
}

export function projectActivityGroup(world: ScenarioWorld, groupId: string) {
  const group = world.entities.groups[groupId];
  if (!group || !world.viewerId || !group.memberIds.includes(world.viewerId)) {
    return null;
  }

  return projectActivityGroupEntity(world, groupId);
}

export function projectActivityChats(world: ScenarioWorld) {
  return Object.values(world.entities.chats)
    .map((chat) => chatApiSchema.safeParse(chat))
    .filter((result) => result.success)
    .map((result) => result.data);
}

export function projectActivityChat(world: ScenarioWorld, chatId: string) {
  const parsed = chatApiSchema.safeParse(world.entities.chats[chatId]);
  return parsed.success ? parsed.data : null;
}

function projectActivityGroupEntity(world: ScenarioWorld, groupId: string) {
  const group = world.entities.groups[groupId];
  if (!group) {
    return null;
  }

  const activity = world.entities.activities[group.activityId];
  const plan = getCurrentPlan(world, group.id);
  const chatId = `scenario-chat-${group.id}`;

  return groupApiSchema.parse({
    activity: {
      access: activity.access,
      city: activity.city,
      forgeMode: "MANUAL",
      id: activity.id,
      interests: activity.interestIds.map((id) => world.entities.interests[id]),
      status: "MATCHED",
      title: activity.title,
      visibility: activity.visibility,
    },
    activityId: activity.id,
    avatar: group.avatar,
    avatarMedia: null,
    chat: world.entities.chats[chatId]
      ? {
          governance: null,
          id: chatId,
          isMuted: false,
          pinnedMessages: [],
        }
      : null,
    createdAt: group.createdAt,
    currentPlanId: plan?.id ?? null,
    description: group.description,
    disbandedAt: null,
    governance: null,
    id: group.id,
    maxMembers: group.maxMembers,
    members: group.memberIds
      .map((id) => world.entities.users[id])
      .filter(Boolean)
      .map((user, index) => ({
        compatibilityScore: user.id === world.viewerId ? null : 90 - index * 4,
        joinedAt: group.createdAt,
        leftAt: null,
        role: index === 0 ? "ADMIN" : "MEMBER",
        user: {
          age: user.age,
          avatar: user.avatar,
          avatarMedia: null,
          bio: user.bio,
          city: user.city,
          gender: user.gender,
          id: user.id,
          lastSeenAt: user.lastSeenAt ?? null,
          name: user.name,
          onlineStatus: user.onlineStatus,
          personalityType: user.personalityType,
          trustScore: user.trustScore,
        },
        userId: user.id,
      })),
    name: group.name,
    plan: plan
      ? {
          ...toDetailPlan(plan),
          governance: null,
        }
      : null,
    planHistory: [],
    status: group.status,
    updatedAt: group.updatedAt,
    version: Date.parse(group.updatedAt),
  });
}

export function projectGroupDetail(world: ScenarioWorld, groupId: string) {
  const group = world.entities.groups[groupId];
  if (!group) {
    return null;
  }

  const activity = world.entities.activities[group.activityId];
  const plan = getCurrentPlan(world, group.id);
  const relationship = world.viewerId
    ? group.memberIds.includes(world.viewerId)
      ? "MEMBER"
      : group.pendingInvitationIds.some(
            (id) =>
              world.entities.invitations[id]?.inviteeId === world.viewerId,
          )
        ? "INVITED"
        : "NOT_MEMBER"
    : "NOT_MEMBER";
  const isMember = relationship === "MEMBER";
  const isAdmin = isMember && group.memberIds.at(0) === world.viewerId;

  return groupPlanDetailSchema.parse({
    activity: {
      city: activity.city,
      id: activity.id,
      interests: activity.interestIds.map((id) => world.entities.interests[id]),
      title: activity.title,
    },
    fit: isMember
      ? null
      : {
          signals: [
            {
              detail: "Several interests overlap with this group.",
              key: "SHARED_INTERESTS",
              label: "Shared interests",
              strength: "HIGH",
            },
            {
              detail: activity.city
                ? `The plan is near ${activity.city}.`
                : "This group meets online.",
              key: "LOCATION",
              label: "Location",
              strength: "HIGH",
            },
          ],
          summary: "This group aligns with several parts of your profile.",
          totalScore: 88,
        },
    governance: null,
    group: {
      access: group.access,
      activeMembersCount: group.memberIds.length,
      avatar: group.avatar,
      avatarMedia: null,
      createdAt: group.createdAt,
      description: group.description,
      id: group.id,
      maxMembers: group.maxMembers,
      name: group.name,
      pendingInvitationsCount: group.pendingInvitationIds.length,
      status: group.status,
      updatedAt: group.updatedAt,
      visibility: group.visibility,
    },
    members: group.memberIds
      .map((id) => world.entities.users[id])
      .filter(Boolean)
      .map((user, index) => ({
        avatar: user.avatar,
        avatarMedia: null,
        compatibilityScore: user.id === world.viewerId ? null : 90 - index * 4,
        id: `membership-${group.id}-${user.id}`,
        joinedAt: group.createdAt,
        knownConnection: index === 1 ? "1 shared group" : null,
        lastSeenAt: user.lastSeenAt ?? null,
        name: user.name,
        onlineStatus: user.onlineStatus,
        personalityType: user.personalityType,
        role: index === 0 ? "ADMIN" : "MEMBER",
        trustScore: user.trustScore,
        userId: user.id,
      })),
    pendingInvitations: group.pendingInvitationIds
      .map((id) => world.entities.invitations[id])
      .filter(Boolean)
      .map((invitation) => ({
        avatar: invitation.invitee.avatar,
        avatarMedia: null,
        createdAt: invitation.createdAt,
        id: invitation.id,
        name: invitation.invitee.name,
        personalityType: invitation.invitee.personalityType ?? null,
        trustScore: invitation.invitee.trustScore ?? 0,
        userId: invitation.invitee.id,
      })),
    plan: plan
      ? {
          ...toDetailPlan(plan),
          externalInvitesEnabled: isAdmin,
          seatRecoveryEnabled: isAdmin,
        }
      : null,
    planHistory: [],
    planning: {
      pendingProposalCount: 0,
      proposals: [],
      visibility: isMember ? "MEMBER_ONLY" : "PUBLIC_SUMMARY",
    },
    timestamps: { createdAt: group.createdAt, updatedAt: group.updatedAt },
    viewer: {
      canCancelRequest: false,
      canInviteMembers: isAdmin,
      canJoin: relationship === "NOT_MEMBER" && group.access === "OPEN",
      canLeaveGroup: isMember,
      canManageGroup: isAdmin,
      canOpenActivity: isMember,
      canRequestToJoin:
        relationship === "NOT_MEMBER" && group.access === "BY_REQUEST",
      canSuggestPlanChange: isMember,
      canVoteOnPlanChange: isMember,
      joinDisabledReason: isMember ? "ALREADY_MEMBER" : null,
      pendingInviteId:
        relationship === "INVITED"
          ? (group.pendingInvitationIds.find(
              (id) =>
                world.entities.invitations[id]?.inviteeId === world.viewerId,
            ) ?? null)
          : null,
      relationship,
      role: isMember ? (isAdmin ? "ADMIN" : "MEMBER") : null,
      userId: world.viewerId ?? "scenario-public-viewer",
    },
  });
}

export function projectViewerProfile(world: ScenarioWorld, userId: string) {
  const user = world.entities.users[userId];
  if (!user) {
    return null;
  }

  return {
    age: user.age,
    avatar: user.avatar,
    avatarMedia: null,
    bio: user.bio,
    canReport: userId !== world.viewerId,
    city: user.city,
    createdAt: user.createdAt,
    gender: user.gender,
    id: user.id,
    interests: user.interests ?? [],
    name: user.name,
    personalityProfile: user.personalityType
      ? {
          assessmentId: `scenario-assessment-${user.id}`,
          displayVersion: "scenario-v1",
          instrumentVersion: "ipip-50-v1",
          ocean: {
            agreeableness: user.oceanA ?? 0,
            conscientiousness: user.oceanC ?? 0,
            extraversion: user.oceanE ?? 0,
            neuroticism: user.oceanN ?? 0,
            openness: user.oceanO ?? 0,
          },
          personalityType: user.personalityType,
          scoringVersion: "scenario-v1",
        }
      : null,
    showFriendsListOnProfile: user.showFriendsListOnProfile,
    trustScore: user.trustScore,
    viewerContext: userId === world.viewerId ? "SELF" : "ACCEPTED_FRIEND",
  };
}

function getCurrentPlan(world: ScenarioWorld, groupId: string) {
  const planId = world.entities.groups[groupId]?.planIds.at(0);
  return planId ? world.entities.plans[planId] : null;
}

function toHomePlan(plan: ScenarioWorld["entities"]["plans"][string]) {
  const durationMinutes = plan.dateTime ? 90 : null;
  return {
    calendarSequence: 0,
    category: plan.category,
    cost: plan.cost,
    dateTime: plan.dateTime,
    durationMinutes,
    endAt:
      plan.dateTime && durationMinutes
        ? new Date(
            new Date(plan.dateTime).getTime() + durationMinutes * 60_000,
          ).toISOString()
        : null,
    id: plan.id,
    isLocationResolved:
      plan.locationMode === "ONLINE" || plan.location !== null,
    isScheduleResolved: plan.dateTime !== null,
    localStartDate: null,
    localStartTime: null,
    location: plan.location,
    locationMode: plan.locationMode,
    nextRequiredAction: plan.dateTime ? null : "PROPOSE_TIME",
    revision: plan.revision,
    materialRevision: plan.materialRevision,
    scheduleFold: null,
    scheduleMode: plan.scheduleMode,
    status: plan.status,
    timeZoneId: null,
    title: plan.title,
  };
}

function toDetailPlan(plan: ScenarioWorld["entities"]["plans"][string]) {
  return {
    ...toHomePlan(plan),
    costAmount: plan.costAmount,
    costDetails: plan.costDetails,
    coverImage: plan.coverImage,
    coverImageMedia: null,
    description: plan.description,
    locationLat: plan.locationLat,
    locationLng: plan.locationLng,
  };
}

export function toPublicFriendSummary(user: CurrentUser) {
  return {
    avatar: user.avatar,
    city: user.city,
    id: user.id,
    name: user.name,
  };
}
