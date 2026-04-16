import { useHeaderSearch } from "@/features/activity/hooks/use-header-search";
import type { OnlineStatus } from "@/features/activity/types/direct-chats.types";
import { Button } from "@/shared/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { memo } from "react";
import { HeaderActions } from "./header-actions";
import { HeaderInfo } from "./header-info";
import { HeaderSearch } from "./header-search";

interface UnifiedChatHeaderProps {
  title: string;
  subtitle?: string;
  avatarUrl: string;
  kind: "dm" | "group";
  onlineStatus?: OnlineStatus;
  secondaryAvatar?: string;
  isTyping?: boolean;
  typingText?: string;
  isActionOpen?: boolean;
  onBack?: () => void;
  onToggleAction: () => void;
}

/**
 * UnifiedChatHeader - Shared header for both DMs and Groups.
 * Consolidates the layout of avatars, titles, and action buttons.
 */
export const UnifiedChatHeader = memo(function UnifiedChatHeader({
  title,
  subtitle,
  avatarUrl,
  kind,
  onlineStatus,
  secondaryAvatar,
  isTyping,
  typingText,
  isActionOpen = false,
  onBack,
  onToggleAction,
}: UnifiedChatHeaderProps) {
  const isGroup = kind === "group";
  const {
    isSearching,
    searchQuery,
    setSearchQuery,
    searchInputRef,
    toggleSearch,
  } = useHeaderSearch();

  return (
    <header className="shrink-0 flex items-center gap-2 px-3 pb-3 pt-2 md:pt-3 border-b border-border bg-canvas/80 backdrop-blur-md sticky top-0 z-100">
      {onBack && (
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onBack}
          className="lg:hidden mr-1 text-slate-muted shrink-0"
          aria-label="Back to conversations"
        >
          <ArrowLeft size={20} strokeWidth={2.5} />
        </Button>
      )}

      <div className="flex-1 flex items-center min-w-0">
        {!isSearching ? (
          <HeaderInfo
            title={title}
            subtitle={subtitle}
            avatarUrl={avatarUrl}
            isGroup={isGroup}
            secondaryAvatar={secondaryAvatar}
            onlineStatus={onlineStatus}
            isTyping={isTyping}
            typingText={typingText}
            onToggle={onToggleAction}
          />
        ) : (
          <HeaderSearch
            ref={searchInputRef}
            query={searchQuery}
            setQuery={setSearchQuery}
          />
        )}
      </div>

      <HeaderActions
        isSearching={isSearching}
        isActionOpen={isActionOpen}
        onToggleSearch={(state) => toggleSearch(state)}
        onToggleAction={onToggleAction}
      />
    </header>
  );
});
