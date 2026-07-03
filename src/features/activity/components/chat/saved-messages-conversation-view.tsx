import { useState } from "react";
import { SAVED_MESSAGES_TITLE } from "@/features/activity/lib/saved-messages-identity";
import { ChatHeader } from "../conversation-workspace/chat-header";
import { ChatBackground } from "../conversation-workspace/message-timeline/chat-background";
import { SavedMessagesContent } from "./saved-messages-conversation-view/saved-messages-content";
import type { SavedMessagesConversationViewProps } from "./saved-messages-conversation-view/types";
import {
  getSavedMessageRows,
  getSavedMessagesSubtitle,
} from "./saved-messages-conversation-view-state";

export function SavedMessagesConversationView({
  conversations,
  isError = false,
  isLoading = false,
  isRetrying = false,
  savedMessages,
  onBack,
  onOpenMessage,
  onRemoveMessage,
  onRetry,
}: SavedMessagesConversationViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const rows = getSavedMessageRows(savedMessages, conversations, searchQuery);
  const savedMessagesCount = savedMessages.length;
  const subtitle = getSavedMessagesSubtitle(savedMessagesCount);

  return (
    <div className="relative isolate flex min-h-0 flex-1 flex-col overflow-hidden bg-canvas/40">
      <ChatBackground />

      <ChatHeader
        kind="dm"
        title={SAVED_MESSAGES_TITLE}
        subtitle={subtitle}
        avatarKind="saved"
        showAction={false}
        searchQuery={searchQuery}
        searchResultLabel={
          searchQuery.trim() ? `${rows.length} found` : undefined
        }
        isSearchNavigationDisabled
        onBack={onBack}
        onSearchQueryChange={setSearchQuery}
        onToggleAction={() => {}}
      />

      <div className="relative min-h-0 flex-1 overflow-hidden">
        <div className="relative z-10 h-full overflow-y-auto px-3 pt-4 pb-safe-bottom sm:px-5">
          <SavedMessagesContent
            isError={isError}
            isLoading={isLoading}
            isRetrying={isRetrying}
            rows={rows}
            savedMessagesCount={savedMessagesCount}
            searchQuery={searchQuery}
            onOpenMessage={onOpenMessage}
            onRemoveMessage={onRemoveMessage}
            onRetry={onRetry}
          />
        </div>
      </div>
    </div>
  );
}
