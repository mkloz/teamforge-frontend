import { useState, useCallback } from "react";
import type { DirectChatsState } from "./types/direct-chats.types";
import { DirectChatList } from "./components/direct-chat-list";
import { DirectChatView } from "./components/direct-chat-view";
import { ProfilePanel, ProfilePanelMobile } from "./components/profile-panel";
import {
  MOCK_DIRECT_CHAT_PREVIEWS,
  MOCK_DIRECT_CHATS,
  MOCK_DIRECT_MESSAGES,
} from "./data/mock-direct-chats";
import { ThreeColumnLayout } from "@/shared/components/layout";
import { MessageSquare } from "lucide-react";

export function DirectChatsPage() {
  const [state, setState] = useState<DirectChatsState>({
    selectedChatId: null,
    isProfilePanelOpen: false,
    searchQuery: "",
    draftMessages: {},
  });

  const [messages, setMessages] = useState(MOCK_DIRECT_MESSAGES);

  const selectedChat = state.selectedChatId
    ? MOCK_DIRECT_CHATS[state.selectedChatId]
    : null;
  const selectedMessages = state.selectedChatId
    ? (messages[state.selectedChatId] ?? [])
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

  const handleSendMessage = useCallback(
    (content: string) => {
      if (!state.selectedChatId) return;

      setMessages((prev) => {
        const chatMessages = prev[state.selectedChatId!] || [];
        return {
          ...prev,
          [state.selectedChatId!]: [
            ...chatMessages,
            {
              id: `msg-${Date.now()}`,
              chatId: state.selectedChatId!,
              type: "TEXT",
              content,
              senderId: "current-user",
              timestamp: new Date().toISOString(),
              isOwn: true,
              status: "SENT",
            },
          ],
        };
      });
    },
    [state.selectedChatId],
  );

  const handleSearchChange = useCallback((query: string) => {
    setState((s) => ({ ...s, searchQuery: query }));
  }, []);

  const filteredChats = MOCK_DIRECT_CHAT_PREVIEWS.filter((c) =>
    c.participantName.toLowerCase().includes(state.searchQuery.toLowerCase()),
  );

  return (
    <ThreeColumnLayout
      hasSelection={!!state.selectedChatId}
      listContent={
        <DirectChatList
          chats={filteredChats}
          selectedChatId={state.selectedChatId}
          searchQuery={state.searchQuery}
          onSearchChange={handleSearchChange}
          onSelectChat={handleSelectChat}
        />
      }
      mainContent={
        selectedChat ? (
          <DirectChatView
            chat={selectedChat}
            messages={selectedMessages}
            isTyping={selectedPreview?.isTyping}
            onBack={handleBack}
            onToggleProfile={handleToggleProfile}
            onSendMessage={handleSendMessage}
          />
        ) : (
          <div className="hidden lg:flex flex-1 items-center justify-center text-muted-foreground w-full h-full">
            <div className="text-center p-6">
              <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                <MessageSquare size={40} className="text-muted-foreground/60" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">
                Select a conversation
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Choose a chat from the list to start messaging
              </p>
            </div>
          </div>
        )
      }
      detailContent={
        selectedChat ? (
          <>
            <ProfilePanel
              chat={selectedChat}
              isOpen={state.isProfilePanelOpen}
              onClose={() =>
                setState((s) => ({ ...s, isProfilePanelOpen: false }))
              }
            />
            <ProfilePanelMobile
              chat={selectedChat}
              isOpen={state.isProfilePanelOpen}
              onClose={() =>
                setState((s) => ({ ...s, isProfilePanelOpen: false }))
              }
            />
          </>
        ) : null
      }
    />
  );
}
