import { ArrowLeft } from "lucide-react";
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
  avatarKind?: "default" | "notes" | "saved";
  detailsNavigation?: ConversationDetailsNavigation;
  kind: "dm" | "group";
  onlineStatus?: OnlineStatus;
  isTyping?: boolean;
  typingText?: string;
  isActionOpen?: boolean;
  showAction?: boolean;
  searchQuery?: string;
  searchResultLabel?: string;
  isSearchNavigationDisabled?: boolean;
  onBack?: () => void;
  onSearchQueryChange?: (query: string) => void;
  onSearchNext?: () => void;
  onSearchPrevious?: () => void;
  onToggleAction: () => void;
}

/**
 * UnifiedChatHeader - Shared header for both DMs and Groups.
 * Consolidates the layout of avatars, titles, and action buttons.
 */
export function UnifiedChatHeader(props: UnifiedChatHeaderProps) {
  const {
    title,
    subtitle,
    avatarUrl,
    avatarKind = "default",
    detailsNavigation,
    kind,
    onlineStatus,
    isTyping,
    typingText,
    isActionOpen = false,
    showAction = true,
    searchQuery = "",
    searchResultLabel,
    isSearchNavigationDisabled = true,
    onBack,
    onSearchQueryChange,
    onSearchNext,
    onSearchPrevious,
    onToggleAction,
  } = props;
  const isGroup = kind === "group";
  const { isSearching, searchInputRef, toggleSearch } = useHeaderSearch({
    onClose: () => onSearchQueryChange?.(""),
  });

  return (
    <header className="sticky top-0 z-100 flex min-h-15 shrink-0 items-center gap-1.5 border-border border-b bg-canvas/80 px-2.5 pt-2 pb-2.5 backdrop-blur-md md:min-h-16 md:gap-2 md:px-3 md:pt-3 md:pb-3">
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
            avatarKind={avatarKind}
            detailsNavigation={detailsNavigation}
            canToggleAction={showAction}
            isGroup={isGroup}
            onlineStatus={onlineStatus}
            isTyping={isTyping}
            isActionOpen={isActionOpen}
            typingText={typingText}
            onToggle={onToggleAction}
          />
        ) : (
          <HeaderSearch
            ref={searchInputRef}
            query={searchQuery}
            resultLabel={searchResultLabel}
            isNavigationDisabled={isSearchNavigationDisabled}
            setQuery={onSearchQueryChange ?? (() => {})}
            onNextResult={onSearchNext}
            onPreviousResult={onSearchPrevious}
          />
        )}
      </div>

      <HeaderActions
        isSearching={isSearching}
        isActionOpen={isActionOpen}
        actionLabel={isGroup ? "group details" : "profile"}
        showAction={showAction}
        onToggleSearch={(state) => toggleSearch(state)}
        onToggleAction={onToggleAction}
      />
    </header>
  );
}
