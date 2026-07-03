import { ChatHeader } from "@/features/activity/components/conversation-workspace/chat-header";
import type { ConversationWorkspaceProps } from "@/features/activity/components/conversation-workspace/conversation-workspace/conversation-workspace.types";
import {
  getHeaderAvatarKind,
  getHeaderDetailsNavigation,
  getHeaderToggleHandler,
} from "@/features/activity/components/conversation-workspace/conversation-workspace/conversation-workspace-helpers";
import type { ConversationDetailsNavigation } from "@/features/activity/hooks/use-conversation-data";
import type { OnlineStatus } from "@/features/activity/lib/activity-contract";

interface WorkspaceHeaderProps {
  activeTypingUsers: Array<{ name: string; avatar: string | null }>;
  headerProps: {
    avatarUrl?: string | null;
    detailsNavigation?: ConversationDetailsNavigation;
    onlineStatus?: OnlineStatus;
    subtitle?: string;
    title: string;
  };
  isActionOpen: boolean;
  isNotesChat: boolean;
  kind: ConversationWorkspaceProps["kind"];
  matchCount: number;
  onBack: () => void;
  onSearchNext: () => void;
  onSearchPrevious: () => void;
  onSearchQueryChange: (query: string) => void;
  onToggleAction: () => void;
  openHeaderDetailsInPanel: boolean;
  searchQuery: string;
  searchResultLabel?: string;
  typingText?: string;
}

export function WorkspaceHeader({
  activeTypingUsers,
  headerProps,
  isActionOpen,
  isNotesChat,
  kind,
  matchCount,
  onBack,
  onSearchNext,
  onSearchPrevious,
  onSearchQueryChange,
  onToggleAction,
  openHeaderDetailsInPanel,
  searchQuery,
  searchResultLabel,
  typingText,
}: WorkspaceHeaderProps) {
  return (
    <ChatHeader
      kind={kind}
      title={headerProps.title}
      subtitle={headerProps.subtitle}
      avatarUrl={headerProps.avatarUrl}
      avatarKind={getHeaderAvatarKind(isNotesChat)}
      detailsNavigation={getHeaderDetailsNavigation(
        openHeaderDetailsInPanel,
        headerProps.detailsNavigation,
      )}
      onlineStatus={headerProps.onlineStatus}
      isTyping={activeTypingUsers.length > 0}
      typingText={typingText}
      isActionOpen={isActionOpen}
      searchQuery={searchQuery}
      searchResultLabel={searchResultLabel}
      isSearchNavigationDisabled={matchCount === 0}
      showAction={!isNotesChat}
      onBack={onBack}
      onSearchQueryChange={onSearchQueryChange}
      onSearchNext={onSearchNext}
      onSearchPrevious={onSearchPrevious}
      onToggleAction={getHeaderToggleHandler(isNotesChat, onToggleAction)}
    />
  );
}
