import { useState } from "react";
import { Search, MessageCircle } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { Input } from "@/shared/components/ui/input";
import type { DirectChatPreview } from "../../types/direct-chats.types";
import { DirectChatListItem } from "./direct-chat-list-item";

type FilterTab = "all" | "online" | "unread";

interface DirectChatListProps {
  chats: DirectChatPreview[];
  selectedChatId: string | null;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSelectChat: (chatId: string) => void;
}

const filterTabs: { id: FilterTab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "online", label: "Online" },
  { id: "unread", label: "Unread" },
];

export function DirectChatList({
  chats,
  selectedChatId,
  searchQuery,
  onSearchChange,
  onSelectChat,
}: DirectChatListProps) {
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");

  // Filter logic
  const filteredChats = chats.filter((chat) => {
    // Search filter
    if (searchQuery && !chat.participantName.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    // Tab filter
    if (activeFilter === "online" && chat.onlineStatus !== "ONLINE") return false;
    if (activeFilter === "unread" && chat.unreadCount === 0) return false;
    return true;
  });

  const unreadCount = chats.filter((c) => c.unreadCount > 0).length;
  const onlineCount = chats.filter((c) => c.onlineStatus === "ONLINE").length;

  return (
    <div className="flex flex-col h-full">
      {/* Search and filters */}
      <div className="flex-shrink-0 p-3 pb-2">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            type="text"
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 h-10 bg-muted/50 border-transparent focus-visible:bg-background"
          />
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-1 mt-3 -mx-1 overflow-x-auto scrollbar-hide">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors",
                activeFilter === tab.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {tab.label}
              {tab.id === "unread" && unreadCount > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-primary-foreground/20 text-[10px]">
                  {unreadCount}
                </span>
              )}
              {tab.id === "online" && onlineCount > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-primary-foreground/20 text-[10px]">
                  {onlineCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Chat list */}
      <div className="flex-1 overflow-y-auto" role="listbox" aria-label="Direct messages">
        {filteredChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
              <MessageCircle size={28} className="text-muted-foreground/60" />
            </div>
            <p className="text-foreground font-semibold">
              {searchQuery ? "No conversations found" : "No messages yet"}
            </p>
            <p className="text-muted-foreground text-sm mt-1 max-w-[200px]">
              {searchQuery
                ? "Try adjusting your search"
                : "Start a conversation with someone from your groups"}
            </p>
          </div>
        ) : (
          filteredChats.map((chat) => (
            <DirectChatListItem
              key={chat.id}
              chat={chat}
              isSelected={chat.id === selectedChatId}
              onSelect={() => onSelectChat(chat.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
