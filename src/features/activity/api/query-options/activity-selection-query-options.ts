import { queryOptions } from "@tanstack/react-query";
import { ActivityApi } from "@/features/activity/api/activity.api";
import type {
  ActivityDirectSelectionData,
  ActivityGroupSelectionData,
} from "@/features/activity/api/activity-query-data";
import { APP_QUERY_KEYS } from "@/shared/api/query-keys";

import type { ActivityQueryOptionsContext } from "./activity-query-options-context";

type ActivitySelectionBaseData = Awaited<
  ReturnType<ActivityQueryOptionsContext["ensureBaseData"]>
>;
type GroupChatSummary = ReturnType<
  ActivityQueryOptionsContext["findGroupChat"]
>;
type GroupDto = Awaited<ReturnType<typeof ActivityApi.getGroup>>;
type GroupPlanProposals = Awaited<ReturnType<typeof fetchGroupPlanProposals>>;

interface BuildGroupSelectionDataInput {
  baseData: Pick<ActivitySelectionBaseData, "chats" | "currentUserParticipant">;
  context: ActivityQueryOptionsContext;
  groupDto: GroupDto;
  groupId: string;
  proposals: GroupPlanProposals;
}

export function groupSelectionQueryOptions(
  context: ActivityQueryOptionsContext,
  groupId: string,
) {
  return queryOptions({
    queryKey: APP_QUERY_KEYS.activity.groupSelectionById(groupId),
    queryFn: createGroupSelectionQueryFn(context, groupId),
    staleTime: 30_000,
  });
}

export function directSelectionQueryOptions(
  context: ActivityQueryOptionsContext,
  chatId: string,
) {
  return queryOptions({
    queryKey: APP_QUERY_KEYS.activity.directSelectionByChatId(chatId),
    queryFn: createDirectSelectionQueryFn(context, chatId),
    staleTime: 30_000,
  });
}

function createGroupSelectionQueryFn(
  context: ActivityQueryOptionsContext,
  groupId: string,
) {
  return () => fetchGroupSelectionData(context, groupId);
}

function createDirectSelectionQueryFn(
  context: ActivityQueryOptionsContext,
  chatId: string,
) {
  return () => fetchDirectSelectionData(context, chatId);
}

async function fetchGroupSelectionData(
  context: ActivityQueryOptionsContext,
  groupId: string,
): Promise<ActivityGroupSelectionData> {
  const baseData = await context.ensureBaseData();
  const groupDto = await ActivityApi.getGroup(groupId);
  const proposals = await fetchGroupPlanProposals(groupDto);

  return buildGroupSelectionData({
    baseData,
    context,
    groupDto,
    groupId,
    proposals,
  });
}

function buildGroupSelectionData({
  baseData,
  context,
  groupDto,
  groupId,
  proposals,
}: BuildGroupSelectionDataInput): ActivityGroupSelectionData {
  const chat = context.findGroupChat(baseData.chats, groupId);
  const group = context.mapGroup(
    groupDto,
    baseData.currentUserParticipant.id,
    proposals,
    chat ?? null,
  );
  const proposalMessages = buildGroupProposalMessages({
    context,
    currentUserParticipant: baseData.currentUserParticipant,
    group,
    chatId: chat?.id,
    proposals,
  });

  return {
    chatId: getGroupSelectionChatId(group, chat),
    group,
    proposalMessages,
    typingUsers: [],
  };
}

async function fetchGroupPlanProposals(groupDto: GroupDto) {
  return groupDto.plan !== null
    ? ActivityApi.getPlanProposals(groupDto.plan.id)
    : [];
}

function getGroupSelectionChatId(
  group: ActivityGroupSelectionData["group"],
  chat: GroupChatSummary,
) {
  return group?.chat?.id ?? chat?.id ?? null;
}

function buildGroupProposalMessages({
  context,
  currentUserParticipant,
  group,
  chatId,
  proposals,
}: {
  context: ActivityQueryOptionsContext;
  currentUserParticipant: ActivitySelectionBaseData["currentUserParticipant"];
  group: Parameters<ActivityQueryOptionsContext["buildGroupParticipants"]>[0];
  chatId: string | null | undefined;
  proposals: GroupPlanProposals;
}) {
  if (!chatId || proposals.length === 0) {
    return [];
  }

  const participants = context.buildGroupParticipants(
    group,
    currentUserParticipant,
  );

  return proposals.map((proposal) =>
    context.buildProposalMessage(
      proposal,
      chatId,
      currentUserParticipant.id,
      participants,
    ),
  );
}

async function fetchDirectSelectionData(
  context: ActivityQueryOptionsContext,
  chatId: string,
): Promise<ActivityDirectSelectionData> {
  const baseData = await context.ensureBaseData();
  const friendship =
    baseData.friendships.find((item) => item.privateChat?.id === chatId) ??
    null;
  const chatSummary = baseData.chats.find((item) => item.id === chatId) ?? null;
  const chatSource = await getDirectSelectionChatSource(chatId, chatSummary);

  return {
    chat: mapDirectSelectionChat({
      chatSource,
      context,
      currentUserParticipant: baseData.currentUserParticipant,
      friendship,
    }),
    chatId,
    isTyping: false,
  };
}

async function getDirectSelectionChatSource(
  chatId: string,
  chatSummary: ActivitySelectionBaseData["chats"][number] | null,
) {
  const detailedChat = await ActivityApi.getChat(chatId).catch(
    () => chatSummary,
  );

  return detailedChat ?? chatSummary;
}

function mapDirectSelectionChat({
  chatSource,
  context,
  currentUserParticipant,
  friendship,
}: {
  chatSource: Awaited<ReturnType<typeof getDirectSelectionChatSource>>;
  context: ActivityQueryOptionsContext;
  currentUserParticipant: ActivitySelectionBaseData["currentUserParticipant"];
  friendship: ActivitySelectionBaseData["friendships"][number] | null;
}) {
  if (friendship) {
    return context.mapDirectChat(
      friendship,
      currentUserParticipant,
      chatSource,
    );
  }

  if (chatSource?.type === "NOTES") {
    return context.mapNotesChat(chatSource, currentUserParticipant);
  }

  return null;
}
