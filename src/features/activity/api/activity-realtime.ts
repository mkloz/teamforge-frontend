import { appQueryClient } from "@/shared/api/query-client";
import { APP_QUERY_KEYS } from "@/shared/api/query-keys";
import type {
  ChatApi,
  FriendshipApi,
  GroupApi,
  MessageApi,
  OnlineStatus,
  PlanProposal,
  PlanUpdateKind,
  User,
} from "@/shared/schemas";

import { ActivityActions } from "./activity-actions";
import type { ActivityGroupSelectionData } from "./activity-query-data";
import {
  ActivityMessageCache,
  findMatchingOptimisticMessage,
} from "./activity-message-cache";
import {
  ACTIVITY_CHATS_QUERY_KEY,
  ACTIVITY_GROUPS_QUERY_KEY,
} from "./activity-query-keys";
import { ActivitySurfaceCache } from "./activity-surface-cache";
import type {
  ActivityParticipant,
  Group,
  Plan,
  UnifiedMessage,
} from "@/features/activity/lib/activity-contract";

export interface ApplyRealtimeMessageOptions {
  activeChatId?: string | null;
}

export interface ActivityRealtimeContext {
  buildGroupParticipants(
    group: Group,
    currentUserParticipant: ActivityParticipant,
  ): ActivityParticipant[];
  buildParticipantsFromChatSummary(
    chat: ChatApi,
    currentUser: User,
  ): ActivityParticipant[];
  buildProposalMessage(
    proposal: PlanProposal,
    chatId: string,
    currentUserId: string,
    participants: ActivityParticipant[],
  ): UnifiedMessage;
  getPlanVersion(
    plan: Pick<Plan, "createdAt" | "updatedAt" | "version">,
  ): number;
  getGroupVersion(
    group:
      | Pick<GroupApi, "updatedAt" | "version">
      | Pick<Group, "updatedAt" | "version">,
  ): number;
  isSameFriendshipPair(
    requesterId: string,
    receiverId: string,
    friendship: Pick<FriendshipApi, "requesterId" | "receiverId">,
  ): boolean;
  mapApiGroupFromSelection(group: Group): GroupApi;
  mapCurrentUserParticipant(user: User): ActivityParticipant;
  mapGroup(
    group: GroupApi,
    currentUserId: string | null,
    proposals?: PlanProposal[],
    chatSummary?: Pick<ChatApi, "id" | "pinnedMessages"> | null,
  ): Group;
  mapMessages(
    items: MessageApi[],
    participants: ActivityParticipant[],
    currentUserId: string | null,
  ): UnifiedMessage[];
  mergeProposalIntoList(
    currentProposals: PlanProposal[],
    proposal: PlanProposal,
    kind: PlanUpdateKind,
  ): PlanProposal[];
  mergeFriendshipList(
    current: FriendshipApi[] | undefined,
    incoming: FriendshipApi,
  ): FriendshipApi[];
  removePinnedMessage(chatId: string, messageId: string): void;
  syncPinnedMessage(chatId: string, message: UnifiedMessage): void;
  updateChatSummaryCache(updatedChat: ChatApi): void;
}

export const ActivityRealtime = {
  async applyMessage(
    context: ActivityRealtimeContext,
    chatId: string,
    message: MessageApi,
    options: ApplyRealtimeMessageOptions = {},
  ) {
    const currentUser = appQueryClient.getQueryData<User>(
      APP_QUERY_KEYS.auth.currentUser,
    );

    if (!currentUser) {
      await appQueryClient.invalidateQueries({
        queryKey: ACTIVITY_CHATS_QUERY_KEY,
      });
      return;
    }

    const chats =
      appQueryClient.getQueryData<ChatApi[]>(ACTIVITY_CHATS_QUERY_KEY) ?? [];
    const chat = chats.find((item) => item.id === chatId);

    if (!chat) {
      await appQueryClient.invalidateQueries({
        queryKey: ACTIVITY_CHATS_QUERY_KEY,
      });
      return;
    }

    const participants = context.buildParticipantsFromChatSummary(
      chat,
      currentUser,
    );
    const mappedMessage = context.mapMessages(
      [message],
      participants,
      currentUser.id,
    )[0];
    const existingMessages = ActivityMessageCache.getMessages(chatId);
    const alreadyExists = existingMessages.some(
      (item) => item.id === mappedMessage.id,
    );
    const optimisticMatch = findMatchingOptimisticMessage(
      existingMessages,
      mappedMessage,
    );
    const isActiveChat = options.activeChatId === chatId;
    const isOwnMessage = mappedMessage.senderId === currentUser.id;

    if (message.deletedAt) {
      ActivityMessageCache.remove(chatId, mappedMessage.id);
      context.removePinnedMessage(chatId, mappedMessage.id);
      ActivityMessageCache.syncChatLastMessageFromMessagesCache(chatId);
      await appQueryClient.invalidateQueries({
        queryKey: ACTIVITY_CHATS_QUERY_KEY,
      });
      return;
    }

    if (optimisticMatch) {
      ActivityActions.releaseOptimisticMessageResources(optimisticMatch);
      ActivityMessageCache.replace(chatId, optimisticMatch.id, mappedMessage);
      ActivityActions.forgetRetryableMessage(optimisticMatch.id);
    } else if (alreadyExists) {
      ActivityMessageCache.replace(chatId, mappedMessage.id, mappedMessage);
    } else {
      ActivityMessageCache.insert(chatId, mappedMessage);
    }

    context.syncPinnedMessage(chatId, mappedMessage);

    if (optimisticMatch || alreadyExists) {
      ActivityMessageCache.syncChatLastMessageFromMessagesCache(chatId);
      return;
    }

    context.updateChatSummaryCache({
      ...chat,
      hasUnread: isOwnMessage ? (chat.hasUnread ?? false) : !isActiveChat,
      lastMessage: message,
      unreadCount: isOwnMessage
        ? (chat.unreadCount ?? 0)
        : isActiveChat
          ? 0
          : (chat.unreadCount ?? 0) + 1,
    });
  },

  applyChatRead(context: ActivityRealtimeContext, chat: ChatApi) {
    context.updateChatSummaryCache(chat);
  },

  applyPresenceChanged(userId: string, onlineStatus: OnlineStatus) {
    ActivitySurfaceCache.applyPresenceChanged(userId, onlineStatus);
  },

  applyFriendshipUpdate(
    context: ActivityRealtimeContext,
    friendship: FriendshipApi,
  ) {
    ActivitySurfaceCache.applyFriendshipUpdate({
      friendship,
      mergeFriendshipList: (current, incoming) =>
        context.mergeFriendshipList(current, incoming),
    });
  },

  removeFriendshipFromActivity(
    context: ActivityRealtimeContext,
    friendship: FriendshipApi,
  ) {
    ActivitySurfaceCache.removeFriendshipFromActivity({
      friendship,
      isSameFriendshipPair: (requesterId, receiverId, incoming) =>
        context.isSameFriendshipPair(requesterId, receiverId, incoming),
    });
  },

  applyGroupUpdate(
    context: ActivityRealtimeContext,
    currentUserId: string,
    group: GroupApi,
  ) {
    ActivitySurfaceCache.applyRealtimeGroupUpdate({
      currentUserId,
      getGroupVersion: (incomingGroup) =>
        context.getGroupVersion(incomingGroup),
      group,
      mapApiGroupFromSelection: (selectionGroup) =>
        context.mapApiGroupFromSelection(selectionGroup),
      mapGroup: (incomingGroup, userId, proposals, chatSummary) =>
        context.mapGroup(incomingGroup, userId, proposals, chatSummary),
    });
  },

  async handlePlanUpdated(groupId: string) {
    await Promise.all([
      appQueryClient.invalidateQueries({
        queryKey: APP_QUERY_KEYS.activity.groupSelectionById(groupId),
      }),
      appQueryClient.invalidateQueries({ queryKey: ACTIVITY_GROUPS_QUERY_KEY }),
    ]);
  },

  applyPlanUpdate(
    context: ActivityRealtimeContext,
    groupId: string,
    plan: Plan,
    proposal: PlanProposal | null,
    kind: PlanUpdateKind,
  ) {
    const currentUser = appQueryClient.getQueryData<User>(
      APP_QUERY_KEYS.auth.currentUser,
    );

    appQueryClient.setQueryData<ActivityGroupSelectionData | undefined>(
      APP_QUERY_KEYS.activity.groupSelectionById(groupId),
      (current) => {
        if (!current?.group || !current.group.plan) {
          return current;
        }

        const currentPlan = current.group.plan;
        const currentProposals = currentPlan.proposals ?? [];
        const nextProposals = proposal
          ? context.mergeProposalIntoList(currentProposals, proposal, kind)
          : currentProposals;
        const nextPlanBase =
          context.getPlanVersion(plan) >= context.getPlanVersion(currentPlan)
            ? {
                ...currentPlan,
                ...plan,
              }
            : currentPlan;
        const nextPlan = {
          ...nextPlanBase,
          proposals: nextProposals,
        };
        const nextGroup = {
          ...current.group,
          plan: nextPlan,
        };

        if (!currentUser) {
          return {
            ...current,
            group: nextGroup,
          };
        }

        const participants = context.buildGroupParticipants(
          nextGroup,
          context.mapCurrentUserParticipant(currentUser),
        );

        return {
          ...current,
          group: nextGroup,
          proposalMessages:
            current.chatId && currentUser
              ? nextProposals.map((item) =>
                  context.buildProposalMessage(
                    item,
                    current.chatId!,
                    currentUser.id,
                    participants,
                  ),
                )
              : current.proposalMessages,
        };
      },
    );

    void appQueryClient.invalidateQueries({
      queryKey: ACTIVITY_GROUPS_QUERY_KEY,
    });
  },
};
