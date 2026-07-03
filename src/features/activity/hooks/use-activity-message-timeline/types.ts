import type { ActivityMessagesInfiniteData } from "@/features/activity/api/messages/message-cache-types";
import type {
  ActivityParticipant,
  UnifiedMessage,
} from "@/features/activity/lib/activity-contract";
import type { ActivityKind } from "@/shared/navigation/activity-navigation";
import type { ChatApi } from "@/shared/schemas";

export interface UseActivityMessageTimelineInput {
  chatId: string | null;
  currentUserId: string | null;
  proposalMessages: UnifiedMessage[];
  selectedKind: ActivityKind | null;
  selectedParticipants: ActivityParticipant[];
}

export interface UseActivityMessageTimelineQueriesInput {
  chatId: string | null;
  currentUserId: string | null;
  selectedParticipantCount: number;
}

export interface TimelineMessagesProjectionInput {
  currentUserId: string | null;
  messagesData: ActivityMessagesInfiniteData | undefined;
  proposalMessages: UnifiedMessage[];
  selectedKind: ActivityKind | null;
  selectedParticipants: ActivityParticipant[];
}

export interface TimelineUnreadProjectionInput {
  chatId: string | null;
  chats: ChatApi[] | undefined;
  currentUserId: string | null;
  selectedTimelineMessages: UnifiedMessage[];
}
