import { ArrowLeft } from "lucide-react";
import { memo } from "react";
import type { ConversationDetailsNavigation } from "@/features/activity/hooks/use-conversation-data";
import { useHeaderSearch } from "@/features/activity/hooks/use-header-search";
import type { OnlineStatus } from "@/features/activity/lib/activity-contract";
import { Button } from "@/shared/components/ui/button";
import { HeaderActions } from "./header-actions";
import { HeaderInfo } from "./header-info";
import { HeaderSearch } from "./header-search";

interface UnifiedChatHeaderProps {
  title: string;
  subtitle?: string;
  avatarUrl?: string | null;
  detailsNavigation?: ConversationDetailsNavigation;
  kind: "dm" | "group";
  onlineStatus?: OnlineStatus;
  secondaryAvatar?: string | null;
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
  detailsNavigation,
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
    <header className="sticky top-0 z-100 flex shrink-0 items-center gap-2 border-border border-b bg-canvas/80 px-3 pt-2 pb-3 backdrop-blur-md md:pt-3">
      {onBack && (
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onBack}
          className="mr-1 shrink-0 text-slate-muted lg:hidden"
          aria-label="Back to conversations"
        >
          <ArrowLeft size={20} strokeWidth={2.5} />
        </Button>
      )}

      <div className="flex min-w-0 flex-1 items-center">
        {!isSearching ? (
          <HeaderInfo
            title={title}
            subtitle={subtitle}
            avatarUrl={avatarUrl}
            detailsNavigation={detailsNavigation}
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
