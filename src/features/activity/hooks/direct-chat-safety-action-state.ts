import type { QueryClient } from "@tanstack/react-query";
import { ActivityApi } from "@/features/activity/api/activity.api";
import { ActivityCommands } from "@/features/activity/api/activity-commands";
import {
  getActivityMutationKey,
  runExclusiveActivityMutation,
} from "@/features/activity/api/activity-mutation-lock";
import type { ActivityDirectSelectionData } from "@/features/activity/api/activity-query-data";
import { ACTIVITY_CHATS_QUERY_KEY } from "@/features/activity/api/activity-query-keys";
import type {
  ActivityParticipant,
  DirectChat,
} from "@/features/activity/lib/activity-contract";
import { APP_QUERY_KEYS } from "@/shared/api/query-keys";
import { trackMutationOutcome } from "@/shared/lib/telemetry";
import { trackedMutationNames } from "@/shared/lib/telemetry-contract";
import type { ChatApi } from "@/shared/schemas";

export type DirectChatSafetyAction = "block" | "unblock";

interface DirectChatActionGuard {
  description: string;
  id: string;
}

export const DIRECT_CHAT_SAFETY_ACTION_GUARD = {
  description: "Reconnect before blocking or unblocking someone.",
  id: "activity-direct-chat-safety-offline",
} as const satisfies DirectChatActionGuard;

export const DIRECT_CHAT_MUTE_ACTION_GUARD = {
  description: "Reconnect before changing chat notifications.",
  id: "activity-direct-chat-mute-offline",
} as const satisfies DirectChatActionGuard;

export function getDirectChatSafetyTargetUser(
  chat: DirectChat,
  currentUserId: string | null | undefined,
): ActivityParticipant | null {
  if (!currentUserId) {
    return null;
  }

  return (
    chat.participants?.find(
      (participant) => participant.userId !== currentUserId,
    )?.user ?? null
  );
}

export function getNextDirectChatSafetyAction(
  chat: DirectChat,
): DirectChatSafetyAction {
  return chat.isBlocked ? "unblock" : "block";
}

export function shouldSkipDirectChatSafetyAction(input: {
  isPending: boolean;
  isSubmitPending: boolean;
  targetUser: ActivityParticipant | null;
}) {
  return !input.targetUser || input.isPending || input.isSubmitPending;
}

export function shouldSkipDirectChatMuteAction(input: {
  isPending: boolean;
  isSubmitPending: boolean;
}) {
  return input.isPending || input.isSubmitPending;
}

export function runDirectChatSafetyMutation({
  action,
  targetUserId,
}: {
  action: DirectChatSafetyAction;
  targetUserId: string;
}) {
  return runExclusiveActivityMutation(
    getActivityMutationKey("friendship", targetUserId, "safety"),
    () =>
      action === "block"
        ? ActivityCommands.blockUser(targetUserId)
        : ActivityCommands.unblockUser(targetUserId),
  );
}

export function runDirectChatMuteMutation(chat: DirectChat) {
  return runExclusiveActivityMutation(
    getActivityMutationKey("chat", chat.id, "muted"),
    () =>
      chat.isMuted
        ? ActivityApi.unmuteChat(chat.id)
        : ActivityApi.muteChat(chat.id),
  );
}

export async function optimisticallyToggleDirectChatMute(
  queryClient: QueryClient,
  chat: DirectChat,
): Promise<{
  previousChats: ChatApi[] | undefined;
  previousSelection: ActivityDirectSelectionData | undefined;
}> {
  await Promise.all([
    queryClient.cancelQueries({ queryKey: ACTIVITY_CHATS_QUERY_KEY }),
    queryClient.cancelQueries({
      queryKey: APP_QUERY_KEYS.activity.directSelectionByChatId(chat.id),
    }),
  ]);

  const previousChats = queryClient.getQueryData<ChatApi[]>(
    ACTIVITY_CHATS_QUERY_KEY,
  );
  const previousSelection =
    queryClient.getQueryData<ActivityDirectSelectionData>(
      APP_QUERY_KEYS.activity.directSelectionByChatId(chat.id),
    );
  const isMuted = !chat.isMuted;

  queryClient.setQueryData<ChatApi[]>(
    ACTIVITY_CHATS_QUERY_KEY,
    (current) =>
      current?.map((item) =>
        item.id === chat.id ? { ...item, isMuted } : item,
      ) ?? current,
  );
  queryClient.setQueryData<ActivityDirectSelectionData>(
    APP_QUERY_KEYS.activity.directSelectionByChatId(chat.id),
    (current) =>
      current?.chat
        ? {
            ...current,
            chat: {
              ...current.chat,
              isMuted,
            },
          }
        : current,
  );

  return { previousChats, previousSelection };
}

export function syncDirectChatMuteResult(
  queryClient: QueryClient,
  updatedChat: ChatApi,
) {
  queryClient.setQueryData<ChatApi[]>(
    ACTIVITY_CHATS_QUERY_KEY,
    (current) =>
      current?.map((item) =>
        item.id === updatedChat.id ? { ...item, ...updatedChat } : item,
      ) ?? current,
  );
  queryClient.setQueryData<ActivityDirectSelectionData>(
    APP_QUERY_KEYS.activity.directSelectionByChatId(updatedChat.id),
    (current) =>
      current?.chat
        ? {
            ...current,
            chat: {
              ...current.chat,
              hasUnread: updatedChat.hasUnread,
              isMuted: updatedChat.isMuted,
              isPinned: updatedChat.isPinned,
              unreadCount: updatedChat.unreadCount,
            },
          }
        : current,
  );
}

export function restoreDirectChatMuteSnapshot(
  queryClient: QueryClient,
  chatId: string,
  context:
    | Awaited<ReturnType<typeof optimisticallyToggleDirectChatMute>>
    | undefined,
) {
  queryClient.setQueryData(ACTIVITY_CHATS_QUERY_KEY, context?.previousChats);
  queryClient.setQueryData(
    APP_QUERY_KEYS.activity.directSelectionByChatId(chatId),
    context?.previousSelection,
  );
}

export function invalidateDirectChatMuteQueries(
  queryClient: QueryClient,
  chatId: string,
) {
  return Promise.allSettled([
    queryClient.invalidateQueries({ queryKey: ACTIVITY_CHATS_QUERY_KEY }),
    queryClient.invalidateQueries({
      queryKey: APP_QUERY_KEYS.activity.directSelectionByChatId(chatId),
    }),
  ]);
}

export function shouldClearSelectionAfterSafetyAction(
  action: DirectChatSafetyAction,
) {
  return action === "block";
}

export function trackDirectChatSafetyMutation(
  action: DirectChatSafetyAction,
  status: "error" | "success",
  chatId: string,
  requestId?: string | null,
) {
  const payload = requestId === undefined ? { chatId } : { chatId, requestId };

  trackMutationOutcome(getSafetyMutationName(action), status, payload);
}

function getSafetyMutationName(action: DirectChatSafetyAction) {
  return action === "block"
    ? trackedMutationNames.activityBlockUser
    : trackedMutationNames.activityUnblockUser;
}
