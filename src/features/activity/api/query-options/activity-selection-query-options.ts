import { queryOptions } from "@tanstack/react-query";
import { ActivityApi } from "@/features/activity/api/activity.api";
import type {
  ActivityDirectSelectionData,
  ActivityGroupSelectionData,
} from "@/features/activity/api/activity-query-data";
import { APP_QUERY_KEYS } from "@/shared/api/query-keys";

import type { ActivityQueryOptionsContext } from "./activity-query-options-context";

export function groupSelectionQueryOptions(
  context: ActivityQueryOptionsContext,
  groupId: string,
) {
  return queryOptions({
    queryKey: APP_QUERY_KEYS.activity.groupSelectionById(groupId),
    queryFn: async (): Promise<ActivityGroupSelectionData> => {
      const { currentUserParticipant, chats } = await context.ensureBaseData();
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
}

export function directSelectionQueryOptions(
  context: ActivityQueryOptionsContext,
  chatId: string,
) {
  return queryOptions({
    queryKey: APP_QUERY_KEYS.activity.directSelectionByChatId(chatId),
    queryFn: async (): Promise<ActivityDirectSelectionData> => {
      const { chats, currentUserParticipant, friendships } =
        await context.ensureBaseData();
      const friendship =
        friendships.find((item) => item.privateChat?.id === chatId) ?? null;
      const chatSummary = chats.find((item) => item.id === chatId) ?? null;
      const chat = friendship
        ? context.mapDirectChat(friendship, currentUserParticipant, chatSummary)
        : null;

      return {
        chat,
        chatId,
        isTyping: false,
      };
    },
    staleTime: 30_000,
  });
}
