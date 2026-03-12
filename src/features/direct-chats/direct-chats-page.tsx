import { useState, useCallback } from "react";
import { cn } from "@/shared/lib/utils";
import type { DirectChatsState } from "./types/direct-chats.types";
import { DirectChatList } from "./components/direct-chat-list";
import { DirectChatView } from "./components/direct-chat-view";
import { ProfilePanel, ProfilePanelMobile } from "./components/profile-panel";
import {
  MOCK_DIRECT_CHAT_PREVIEWS,
  MOCK_DIRECT_CHATS,
  MOCK_DIRECT_MESSAGES,
} from "./data/mock-direct-chats";

export function DirectChatsPage() {
  const [state, setState] = useState<DirectChatsState>({
    selectedChatId: null,
    isProfilePanelOpen: false,
    searchQuery: "",
    draftMessages: {},
  });

  const selectedChat = state.selectedChatId
    ? MOCK_DIRECT_CHATS[state.selectedChatId]
    : null;
  const selectedMessages = state.selectedChatId
    ? MOCK_DIRECT_MESSAGES[state.selectedChatId] ?? []
    : [];
  const selectedPreview = MOCK_DIRECT_CHAT_PREVIEWS.find(
    (c) => c.id === state.selectedChatId,
  );

  const handleSelectChat = useCallback((chatId: string) => {
    setState((s) => ({
      ...s,
      selectedChatId: chatId,
      isProfilePanelOpen: false,
    }));
  }, []);

  const handleBack = useCallback(() => {
    setState((s) => ({
      ...s,
      selectedChatId: null,
      isProfilePanelOpen: false,
    }));
  }, []);

  const handleToggleProfile = useCallback(() => {
    setState((s) => ({
      ...s,
      isProfilePanelOpen: !s.isProfilePanelOpen,
    }));
  }, []);

  const handleSendMessage = useCallback((content: string) => {
    // Mock send - in real app would call API
    console.log("Send message:", content);
  }, []);

  const handleSearchChange = useCallback((query: string) => {
    setState((s) => ({ ...s, searchQuery: query }));
  }, []);

  return (
    <div className="flex h-full bg-background">
      {/* Chat list - always visible on desktop, hidden when chat selected on mobile */}
      <div
        className={cn(
          "w-full lg:w-80 xl:w-96 flex-shrink-0 border-r border-border",
          "lg:block",
          state.selectedChatId ? "hidden" : "block",
        )}
      >
        <DirectChatList
          chats={MOCK_DIRECT_CHAT_PREVIEWS}
          selectedChatId={state.selectedChatId}
          searchQuery={state.searchQuery}
          onSearchChange={handleSearchChange}
          onSelectChat={handleSelectChat}
        />
      </div>

      {/* Chat view - hidden on mobile when no chat selected */}
      <div
        className={cn(
          "flex-1 flex",
          state.selectedChatId ? "flex" : "hidden lg:flex",
        )}
      >
        {selectedChat ? (
          <>
            <div className="flex-1">
              <DirectChatView
                chat={selectedChat}
                messages={selectedMessages}
                isTyping={selectedPreview?.isTyping}
                onBack={handleBack}
                onToggleProfile={handleToggleProfile}
                onSendMessage={handleSendMessage}
              />
            </div>

            {/* Profile panel - desktop */}
            <ProfilePanel
              chat={selectedChat}
              isOpen={state.isProfilePanelOpen}
              onClose={() => setState((s) => ({ ...s, isProfilePanelOpen: false }))}
            />

            {/* Profile panel - mobile */}
            <ProfilePanelMobile
              chat={selectedChat}
              isOpen={state.isProfilePanelOpen}
              onClose={() => setState((s) => ({ ...s, isProfilePanelOpen: false }))}
            />
          </>
        ) : (
          // Empty state for desktop when no chat selected
          <div className="flex-1 hidden lg:flex items-center justify-center">
            <div className="text-center p-6">
              <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-10 h-10 text-muted-foreground/60"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-foreground">
                Select a conversation
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Choose a chat from the list to start messaging
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
