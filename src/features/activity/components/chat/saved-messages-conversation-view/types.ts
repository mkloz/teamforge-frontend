import type { useMessageLayout } from "@/features/activity/hooks/use-message-layout";
import type { UnifiedConversation } from "@/features/activity/lib/activity-contract";
import type { SavedMessageSnapshot } from "@/features/activity/lib/saved-message";

export interface SavedMessagesConversationViewProps {
  conversations: UnifiedConversation[];
  isError?: boolean;
  isLoading?: boolean;
  isRetrying?: boolean;
  savedMessages: SavedMessageSnapshot[];
  onBack: () => void;
  onOpenMessage: (snapshot: SavedMessageSnapshot) => void;
  onRemoveMessage: (messageId: string) => Promise<void> | void;
  onRetry?: () => Promise<void> | void;
}

export type SavedMessageLayoutState = ReturnType<typeof useMessageLayout>;
