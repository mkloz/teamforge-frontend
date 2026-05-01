import { appQueryClient } from "@/shared/api/query-client";
import { currentUserQueryOptions } from "@/shared/api/current-user-query";
import type {
  ChatApi,
  FriendshipApi,
  GroupApi,
  MessageApi,
  PlanProposal,
  PlanUpdateKind,
  User,
} from "@/shared/schemas";

import type { ActivityActionContext } from "./activity-actions";
import type { ActivityFeedData } from "./activity-query-data";
import { ActivityProjections } from "./activity-projections";
import { ActivityQueryOptions } from "./activity-query-options";
import type { ActivityQueryOptionsContext } from "./activity-query-options";
import type { ActivityRealtimeContext } from "./activity-realtime";
import { ActivitySurfaceCache } from "./activity-surface-cache";
import type {
  ActivityParticipant,
  DirectChat,
  FilterChip,
  Group,
  Plan,
  UnifiedMessage,
} from "@/features/activity/lib/activity-contract";

function mapCurrentUserParticipant(user: User): ActivityParticipant {
  return ActivityProjections.mapCurrentUserParticipant(user);
}

function mapGroup(
  group: GroupApi,
  currentUserId: string | null,
  proposals: PlanProposal[] = [],
  chatSummary?: Pick<ChatApi, "id" | "pinnedMessages"> | null,
): Group {
  return ActivityProjections.mapGroup(
    group,
    currentUserId,
    proposals,
    chatSummary,
  );
}

function mapApiGroupFromSelection(group: Group): GroupApi {
  return ActivityProjections.mapApiGroupFromSelection(group);
}

function mapDirectChat(
  friendship: FriendshipApi,
  currentUser: ActivityParticipant,
  chatSummary?: ChatApi | null,
): DirectChat | null {
  return ActivityProjections.mapDirectChat(
    friendship,
    currentUser,
    chatSummary,
  );
}

function mapMessages(
  items: MessageApi[],
  participants: ActivityParticipant[],
  currentUserId: string | null,
): UnifiedMessage[] {
  return ActivityProjections.mapMessages(items, participants, currentUserId);
}

function buildProposalMessage(
  proposal: PlanProposal,
  chatId: string,
  currentUserId: string,
  participants: ActivityParticipant[],
): UnifiedMessage {
  return ActivityProjections.buildProposalMessage(
    proposal,
    chatId,
    currentUserId,
    participants,
  );
}

function buildParticipantsFromChatSummary(chat: ChatApi, currentUser: User) {
  return ActivityProjections.buildParticipantsFromChatSummary(
    chat,
    currentUser,
  );
}

function buildGroupParticipants(
  group: Group,
  currentUserParticipant: ActivityParticipant,
) {
  return ActivityProjections.buildGroupParticipants(
    group,
    currentUserParticipant,
  );
}

function getGroupVersion(
  group:
    | Pick<GroupApi, "updatedAt" | "version">
    | Pick<Group, "updatedAt" | "version">,
) {
  return group.version ?? new Date(group.updatedAt).getTime();
}

function getFriendshipVersion(friendship: FriendshipApi) {
  return friendship.version ?? new Date(friendship.updatedAt).getTime();
}

function getPlanVersion(
  plan: Pick<Plan, "createdAt" | "updatedAt" | "version">,
) {
  return plan.version ?? new Date(plan.updatedAt ?? plan.createdAt).getTime();
}

function getProposalVersion(
  proposal: Pick<PlanProposal, "createdAt" | "updatedAt" | "version">,
) {
  return (
    proposal.version ??
    new Date(proposal.updatedAt ?? proposal.createdAt).getTime()
  );
}

function isSameFriendshipPair(
  requesterId: string,
  receiverId: string,
  friendship: Pick<FriendshipApi, "requesterId" | "receiverId">,
) {
  return (
    (requesterId === friendship.requesterId &&
      receiverId === friendship.receiverId) ||
    (requesterId === friendship.receiverId &&
      receiverId === friendship.requesterId)
  );
}

function mergeProposalIntoList(
  currentProposals: PlanProposal[],
  proposal: PlanProposal,
  kind: PlanUpdateKind,
) {
  const existingProposal = currentProposals.find(
    (item) => item.id === proposal.id,
  );
  const nextProposal =
    existingProposal &&
    getProposalVersion(existingProposal) > getProposalVersion(proposal)
      ? existingProposal
      : proposal;
  const withoutExisting = currentProposals.filter(
    (item) => item.id !== proposal.id,
  );

  if (kind === "proposal_created") {
    return [nextProposal, ...withoutExisting];
  }

  return [nextProposal, ...withoutExisting].sort(
    (left, right) => getProposalVersion(right) - getProposalVersion(left),
  );
}

function mergeFriendshipList(
  current: FriendshipApi[] | undefined,
  incoming: FriendshipApi,
) {
  const existing = current?.find((item) =>
    isSameFriendshipPair(item.requesterId, item.receiverId, incoming),
  );
  const nextFriendship =
    existing && getFriendshipVersion(existing) > getFriendshipVersion(incoming)
      ? existing
      : incoming;
  const withoutExisting =
    current?.filter(
      (item) =>
        !isSameFriendshipPair(item.requesterId, item.receiverId, incoming),
    ) ?? [];

  return [nextFriendship, ...withoutExisting].sort(
    (left, right) => getFriendshipVersion(right) - getFriendshipVersion(left),
  );
}

async function ensureBaseData() {
  const [currentUser, groups, chats, friendships] = await Promise.all([
    appQueryClient.ensureQueryData(currentUserQueryOptions()),
    appQueryClient.ensureQueryData(ActivityQueryOptions.groups()),
    appQueryClient.ensureQueryData(ActivityQueryOptions.chats()),
    appQueryClient.ensureQueryData(ActivityQueryOptions.friendships()),
  ]);

  return {
    currentUser,
    currentUserParticipant: mapCurrentUserParticipant(currentUser),
    groups,
    chats,
    friendships,
  };
}

async function resolveParticipants(
  kind: "group" | "dm",
  selectedId: string,
  currentUserParticipant: ActivityParticipant,
) {
  if (kind === "group") {
    const selection = await appQueryClient.ensureQueryData(
      ActivityQueryOptions.groupSelection(
        ACTIVITY_QUERY_OPTIONS_CONTEXT,
        selectedId,
      ),
    );

    return selection.group
      ? buildGroupParticipants(selection.group, currentUserParticipant)
      : [currentUserParticipant];
  }

  const selection = await appQueryClient.ensureQueryData(
    ActivityQueryOptions.directSelection(
      ACTIVITY_QUERY_OPTIONS_CONTEXT,
      selectedId,
    ),
  );

  return (
    selection.chat?.participants
      ?.map((participant) => participant.user)
      .filter(
        (participant): participant is ActivityParticipant =>
          participant !== undefined,
      ) ?? [currentUserParticipant]
  );
}

async function resolveChatId(kind: "group" | "dm", selectedId: string) {
  if (kind === "dm") {
    return selectedId;
  }

  const chats = await appQueryClient.ensureQueryData(
    ActivityQueryOptions.chats(),
  );

  return chats.find((chat) => chat.groupId === selectedId)?.id ?? null;
}

function syncPinnedMessage(chatId: string, message: UnifiedMessage) {
  ActivitySurfaceCache.syncPinnedMessage(chatId, message);
}

function removePinnedMessage(chatId: string, messageId: string) {
  ActivitySurfaceCache.removePinnedMessage(chatId, messageId);
}

export function updateActivityChatSummaryCache(updatedChat: ChatApi) {
  ActivitySurfaceCache.updateChatSummary(updatedChat);
}

function updateChatLastMessage(
  chatId: string,
  message: UnifiedMessage,
  {
    hasUnread,
    unreadCount,
  }: {
    hasUnread: boolean;
    unreadCount: number;
  },
) {
  ActivitySurfaceCache.updateChatLastMessage(chatId, message, {
    hasUnread,
    unreadCount,
  });
}

export function deriveActivityFeedData(
  activeFilter: FilterChip,
  searchQuery: string,
  groups: GroupApi[],
  chats: ChatApi[],
  friendships: FriendshipApi[],
  currentUser: User,
  typingByChatId: Record<
    string,
    Array<{ id: string; name: string; avatar: string | null }>
  >,
): ActivityFeedData {
  return ActivityProjections.deriveFeedData(
    activeFilter,
    searchQuery,
    groups,
    chats,
    friendships,
    currentUser,
    typingByChatId,
  );
}

export function mergeActivityConversationTimeline(
  messages: UnifiedMessage[],
  proposalMessages: UnifiedMessage[],
) {
  return ActivityProjections.mergeConversationTimeline(
    messages,
    proposalMessages,
  );
}

export const ACTIVITY_QUERY_OPTIONS_CONTEXT: ActivityQueryOptionsContext = {
  buildGroupParticipants,
  buildProposalMessage,
  ensureBaseData,
  findGroupChat: (chats, groupId) =>
    ActivityProjections.findGroupChat(chats, groupId),
  mapDirectChat,
  mapGroup,
  mapMessages,
};

export const ACTIVITY_ACTION_CONTEXT: ActivityActionContext = {
  applyFriendshipUpdate: (friendship) =>
    ActivitySurfaceCache.applyFriendshipUpdate({
      friendship,
      mergeFriendshipList,
    }),
  applyRealtimeGroupUpdate: (currentUserId, group) =>
    ActivitySurfaceCache.applyRealtimeGroupUpdate({
      currentUserId,
      getGroupVersion,
      group,
      mapApiGroupFromSelection,
      mapGroup,
    }),
  ensureBaseData,
  mapMessages,
  removeFriendshipFromActivity: (friendship) =>
    ActivitySurfaceCache.removeFriendshipFromActivity({
      friendship,
      isSameFriendshipPair,
    }),
  removePinnedMessage,
  resolveChatId,
  resolveParticipants,
  syncPinnedMessage,
  updateChatLastMessage,
};

export const ACTIVITY_REALTIME_CONTEXT: ActivityRealtimeContext = {
  buildGroupParticipants,
  buildParticipantsFromChatSummary,
  buildProposalMessage,
  getGroupVersion,
  getPlanVersion,
  isSameFriendshipPair,
  mapApiGroupFromSelection,
  mapCurrentUserParticipant,
  mapGroup,
  mapMessages,
  mergeFriendshipList,
  mergeProposalIntoList,
  removePinnedMessage,
  syncPinnedMessage,
  updateChatSummaryCache: updateActivityChatSummaryCache,
};
