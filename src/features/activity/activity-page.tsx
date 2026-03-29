import { cn } from "@/shared/lib/utils";
import { useUiStore } from "@/shared/store/ui.store";
import { MessageSquare } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

// Groups
import { ConversationView } from "../groups/components/conversation-view/conversation-view";
import { GroupDetailPanel } from "../groups/components/group-detail-panel/group-detail-panel";
import {
  MOCK_GROUP_PREVIEWS,
  MOCK_GROUPS,
  MOCK_MESSAGES,
} from "../groups/data/mock-groups";
import type { GroupsPageState } from "../groups/types/groups.types";

// Direct chats
import { DirectChatView } from "../direct-chats/components/direct-chat-view";
import {
  ProfilePanel,
  ProfilePanelMobile,
} from "../direct-chats/components/profile-panel";
import {
  MOCK_DIRECT_CHAT_PREVIEWS,
  MOCK_DIRECT_CHATS,
  MOCK_DIRECT_MESSAGES,
} from "../direct-chats/data/mock-direct-chats";
import type { DirectChatsState } from "../direct-chats/types/direct-chats.types";

// Unified inbox
import { UnifiedConversationList } from "./components/unified-conversation-list";
import {
  applyFilter,
  dmPreviewToUnified,
  groupPreviewToUnified,
  sortByRecency,
} from "./lib/unify-conversations";
import type { FilterChip } from "./types/unified-conversation.types";

export function ActivityPage() {
  // ── Unified list state ──────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterChip>("all");

  // Selected conversation (replaces activeTab + per-feature selectedId)
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedKind, setSelectedKind] = useState<"group" | "dm" | null>(null);

  // ── Per-feature state (panel toggles, drafts) ───────────────────────────────
  const [groupsState, setGroupsState] = useState<GroupsPageState>({
    selectedGroupId: null,
    isDetailPanelOpen: false,
    searchQuery: "",
    draftMessages: {},
  });

  const [directState, setDirectState] = useState<DirectChatsState>({
    selectedChatId: null,
    isProfilePanelOpen: false,
    searchQuery: "",
    draftMessages: {},
  });

  const setBottomNavHidden = useUiStore((s) => s.setBottomNavHidden);

  // ── Unified data ────────────────────────────────────────────────────────────
  const allUnified = useMemo(
    () =>
      sortByRecency([
        ...MOCK_GROUP_PREVIEWS.map(groupPreviewToUnified),
        ...MOCK_DIRECT_CHAT_PREVIEWS.map(dmPreviewToUnified),
      ]),
    [],
  );

  const filteredItems = useMemo(
    () => applyFilter(allUnified, activeFilter, searchQuery),
    [allUnified, activeFilter, searchQuery],
  );

  // Badge counts for filter chips
  const groupCount = MOCK_GROUP_PREVIEWS.length;
  const dmCount = MOCK_DIRECT_CHAT_PREVIEWS.length;
  const unreadCount = useMemo(
    () => allUnified.filter((i) => i.unreadCount > 0).length,
    [allUnified],
  );

  // ── Derived view data ───────────────────────────────────────────────────────
  const selectedGroup =
    selectedKind === "group" && selectedId ? MOCK_GROUPS[selectedId] : null;
  const selectedGroupMessages =
    selectedKind === "group" && selectedId
      ? (MOCK_MESSAGES[selectedId] ?? [])
      : [];

  const selectedChat =
    selectedKind === "dm" && selectedId ? MOCK_DIRECT_CHATS[selectedId] : null;
  const selectedDirectMessages =
    selectedKind === "dm" && selectedId
      ? (MOCK_DIRECT_MESSAGES[selectedId] ?? [])
      : [];
  const selectedChatPreview = MOCK_DIRECT_CHAT_PREVIEWS.find(
    (c) => c.id === selectedId,
  );

  // ── Selection handler ───────────────────────────────────────────────────────
  const handleSelectItem = useCallback((id: string, kind: "group" | "dm") => {
    setSelectedId(id);
    setSelectedKind(kind);

    if (kind === "group") {
      setGroupsState((prev) => ({
        ...prev,
        selectedGroupId: id,
        isDetailPanelOpen: window.innerWidth >= 1024,
      }));
      setDirectState((prev) => ({
        ...prev,
        selectedChatId: null,
        isProfilePanelOpen: false,
      }));
    } else {
      setDirectState((prev) => ({
        ...prev,
        selectedChatId: id,
        isProfilePanelOpen: false,
      }));
      setGroupsState((prev) => ({
        ...prev,
        selectedGroupId: null,
        isDetailPanelOpen: false,
      }));
    }
  }, []);

  // ── Back handlers ───────────────────────────────────────────────────────────
  const handleBack = useCallback(() => {
    setSelectedId(null);
    setSelectedKind(null);
    setGroupsState((prev) => ({
      ...prev,
      selectedGroupId: null,
      isDetailPanelOpen: false,
    }));
    setDirectState((prev) => ({
      ...prev,
      selectedChatId: null,
      isProfilePanelOpen: false,
    }));
  }, []);

  // ── Panel toggles ───────────────────────────────────────────────────────────
  const handleToggleGroupDetail = useCallback(() => {
    setGroupsState((prev) => ({
      ...prev,
      isDetailPanelOpen: !prev.isDetailPanelOpen,
    }));
  }, []);

  const handleCloseGroupDetail = useCallback(() => {
    setGroupsState((prev) => ({ ...prev, isDetailPanelOpen: false }));
  }, []);

  const handleToggleProfile = useCallback(() => {
    setDirectState((s) => ({
      ...s,
      isProfilePanelOpen: !s.isProfilePanelOpen,
    }));
  }, []);

  const handleCloseProfile = useCallback(() => {
    setDirectState((s) => ({ ...s, isProfilePanelOpen: false }));
  }, []);

  // ── Message senders (no-op for mock) ────────────────────────────────────────
  const handleGroupSendMessage = useCallback(() => {
    console.log("Mock group send");
  }, []);
  const handleDirectSendMessage = useCallback(() => {
    console.log("Mock direct send");
  }, []);

  // ── Bottom nav hide on mobile when viewing a conversation ──────────────────
  const hasSelection = !!selectedId;

  useEffect(() => {
    const handleResize = () => {
      setBottomNavHidden(hasSelection && window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      setBottomNavHidden(false);
    };
  }, [hasSelection, setBottomNavHidden]);

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div
      className={cn(
        "fixed inset-0 top-0 md:top-16 md:left-16 lg:left-60 flex bg-canvas",
        !hasSelection ? "pb-24 md:pb-0" : "pb-0",
      )}
    >
      {/* Left sidebar — unified list */}
      <div
        className={cn(
          "flex-shrink-0 border-r border-border bg-canvas flex flex-col",
          "w-full md:w-72 lg:w-80",
          hasSelection && "hidden md:flex",
        )}
      >
        <UnifiedConversationList
          items={filteredItems}
          selectedId={selectedId}
          searchQuery={searchQuery}
          activeFilter={activeFilter}
          groupCount={groupCount}
          dmCount={dmCount}
          unreadCount={unreadCount}
          onSearchChange={setSearchQuery}
          onFilterChange={setActiveFilter}
          onSelectItem={handleSelectItem}
        />
      </div>

      {/* Main content area */}
      <div
        className={cn("flex-1 flex min-w-0", !hasSelection && "hidden md:flex")}
      >
        {selectedKind === "group" && selectedId && selectedGroup ? (
          <div className="flex-1 flex">
            <div className="flex-1">
              <ConversationView
                group={selectedGroup}
                messages={selectedGroupMessages}
                onBack={handleBack}
                onToggleDetail={handleToggleGroupDetail}
                onSendMessage={handleGroupSendMessage}
              />
            </div>
            <GroupDetailPanel
              group={selectedGroup}
              isOpen={groupsState.isDetailPanelOpen}
              onClose={handleCloseGroupDetail}
            />
          </div>
        ) : selectedKind === "dm" && selectedId && selectedChat ? (
          <>
            <div className="flex-1">
              <DirectChatView
                chat={selectedChat}
                messages={selectedDirectMessages}
                isTyping={selectedChatPreview?.isTyping}
                onBack={handleBack}
                onToggleProfile={handleToggleProfile}
                onSendMessage={handleDirectSendMessage}
              />
            </div>
            <ProfilePanel
              chat={selectedChat}
              isOpen={directState.isProfilePanelOpen}
              onClose={handleCloseProfile}
            />
            <ProfilePanelMobile
              chat={selectedChat}
              isOpen={directState.isProfilePanelOpen}
              onClose={handleCloseProfile}
            />
          </>
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex-1 hidden md:flex items-center justify-center">
      <div className="text-center max-w-xs">
        <div className="mx-auto w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
          <MessageSquare size={28} className="text-muted-foreground/60" />
        </div>
        <p className="text-lg font-semibold text-foreground">
          Select a conversation
        </p>
        <p className="text-sm mt-2 text-muted-foreground leading-relaxed">
          Choose a group or direct message from the list to start chatting.
        </p>
      </div>
    </div>
  );
}
