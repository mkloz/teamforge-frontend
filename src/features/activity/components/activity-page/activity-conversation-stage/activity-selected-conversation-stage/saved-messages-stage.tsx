import { SavedMessagesConversationView } from "@/features/activity/components/chat/saved-messages-conversation-view";
import type { ActivityWorkspace } from "@/features/activity/hooks/use-activity";
import type { SavedMessageSnapshot } from "@/features/activity/lib/saved-message";

interface SavedMessagesStageProps {
  activity: ActivityWorkspace;
  onOpenMessage: (snapshot: SavedMessageSnapshot) => void;
}

export function SavedMessagesStage({
  activity,
  onOpenMessage,
}: SavedMessagesStageProps) {
  return (
    <div className="flex h-full min-h-0 min-w-0 flex-1 overflow-hidden">
      <SavedMessagesConversationView
        conversations={activity.allItems}
        isError={activity.isSavedMessagesError}
        isLoading={activity.isSavedMessagesLoading}
        isRetrying={activity.isSavedMessagesRetrying}
        savedMessages={activity.savedMessages}
        onBack={activity.handleBack}
        onOpenMessage={onOpenMessage}
        onRemoveMessage={activity.removeSavedMessage}
        onRetry={activity.retrySavedMessages}
      />
    </div>
  );
}
