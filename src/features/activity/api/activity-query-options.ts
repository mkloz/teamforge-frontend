import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";

import { APP_QUERY_KEYS } from "@/shared/api/query-keys";
import type {
  ChatApi,
  FriendshipApi,
  GroupApi,
  MessageApi,
  PlanProposal,
} from "@/shared/schemas";

import { ActivityApi } from "./activity.api";
import type {
  ActivityDirectSelectionData,
  ActivityGroupSelectionData,
} from "./activity-query-data";
import {
  DEFAULT_ACTIVITY_MESSAGE_LIMIT,
  type ActivityMessagesPageData,
} from "./activity-message-cache";
import {
  ACTIVITY_CHATS_QUERY_KEY,
  ACTIVITY_FRIENDSHIPS_QUERY_KEY,
  ACTIVITY_GROUPS_QUERY_KEY,
} from "./activity-query-keys";
import type {
  ActivityParticipant,
  DirectChat,
  Group,
  UnifiedMessage,
} from "@/features/activity/lib/activity-contract";

interface ActivitySelectionBaseData {
  chats: ChatApi[];
  currentUserParticipant: ActivityParticipant;
  friendships: FriendshipApi[];
}

export interface ActivityQueryOptionsContext {
  buildGroupParticipants(
    group: Group,
    currentUserParticipant: ActivityParticipant,
  ): ActivityParticipant[];
  buildProposalMessage(
    proposal: PlanProposal,
    chatId: string,
    currentUserId: string,
    participants: ActivityParticipant[],
  ): UnifiedMessage;
  ensureBaseData(): Promise<ActivitySelectionBaseData>;
  findGroupChat(chats: ChatApi[], groupId: string): ChatApi | null | undefined;
  mapDirectChat(
    friendship: FriendshipApi,
    currentUser: ActivityParticipant,
    chatSummary?: ChatApi | null,
  ): DirectChat | null;
  mapGroup(
    group: GroupApi,
    currentUserId: string | null,
    proposals: PlanProposal[],
    chatSummary?: Pick<ChatApi, "id" | "pinnedMessages"> | null,
  ): Group;
  mapMessages(
    items: MessageApi[],
    participants: ActivityParticipant[],
    currentUserId: string | null,
  ): UnifiedMessage[];
}

export const ActivityQueryOptions = {
  groups() {
    return queryOptions({
      queryKey: ACTIVITY_GROUPS_QUERY_KEY,
      queryFn: () => ActivityApi.getGroups(),
      staleTime: 30_000,
    });
  },

  chats() {
    return queryOptions({
      queryKey: ACTIVITY_CHATS_QUERY_KEY,
      queryFn: () => ActivityApi.getChats(),
      staleTime: 30_000,
    });
  },

  friendships() {
    return queryOptions({
      queryKey: ACTIVITY_FRIENDSHIPS_QUERY_KEY,
      queryFn: () => ActivityApi.getFriendships(),
      staleTime: 30_000,
    });
  },

  groupRatings(groupId: string) {
    return queryOptions({
      queryKey: APP_QUERY_KEYS.activity.groupRatings(groupId),
      queryFn: () => ActivityApi.getGroupRatings(groupId),
      enabled: groupId.length > 0,
      staleTime: 30_000,
    });
  },

  linkPreview(url: string) {
    return queryOptions({
      queryKey: APP_QUERY_KEYS.activity.linkPreview(url),
      queryFn: () => ActivityApi.getLinkPreview(url),
      staleTime: 10 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    });
  },

  groupSelection(context: ActivityQueryOptionsContext, groupId: string) {
    return queryOptions({
      queryKey: APP_QUERY_KEYS.activity.groupSelectionById(groupId),
      queryFn: async (): Promise<ActivityGroupSelectionData> => {
        const { currentUserParticipant, chats } =
          await context.ensureBaseData();
        const groupDto = await ActivityApi.getGroup(groupId);
        const proposals =
          groupDto.plan !== null
            ? await ActivityApi.getPlanProposals(groupDto.plan.id)
            : [];
        const chat = context.findGroupChat(chats, groupId);
        const group = context.mapGroup(
          groupDto,
          currentUserParticipant.id,
          proposals,
          chat ?? null,
        );
        const participants = context.buildGroupParticipants(
          group,
          currentUserParticipant,
        );
        const proposalMessages =
          chat?.id && proposals.length > 0
            ? proposals.map((proposal) =>
                context.buildProposalMessage(
                  proposal,
                  chat.id,
                  currentUserParticipant.id,
                  participants,
                ),
              )
            : [];

        return {
          chatId: group.chat?.id ?? chat?.id ?? null,
          group,
          proposalMessages,
          typingUsers: [],
        };
      },
      staleTime: 30_000,
    });
  },

  directSelection(context: ActivityQueryOptionsContext, chatId: string) {
    return queryOptions({
      queryKey: APP_QUERY_KEYS.activity.directSelectionByChatId(chatId),
      queryFn: async (): Promise<ActivityDirectSelectionData> => {
        const { chats, currentUserParticipant, friendships } =
          await context.ensureBaseData();
        const friendship =
          friendships.find((item) => item.privateChat?.id === chatId) ?? null;
        const chatSummary = chats.find((item) => item.id === chatId) ?? null;
        const chat = friendship
          ? context.mapDirectChat(
              friendship,
              currentUserParticipant,
              chatSummary,
            )
          : null;

        return {
          chat,
          chatId,
          isTyping: false,
        };
      },
      staleTime: 30_000,
    });
  },

  conversationMessages(chatId: string) {
    return infiniteQueryOptions({
      queryKey: APP_QUERY_KEYS.activity.conversationMessages(chatId),
      initialPageParam: 1,
      staleTime: 30_000,
      queryFn: async ({ pageParam }): Promise<ActivityMessagesPageData> => {
        return ActivityApi.getChatMessages(chatId, {
          limit: DEFAULT_ACTIVITY_MESSAGE_LIMIT,
          page: pageParam,
        });
      },
      getNextPageParam: (lastPage) =>
        lastPage.meta.currentPage < lastPage.meta.totalPages
          ? lastPage.meta.currentPage + 1
          : undefined,
    });
  },
};
