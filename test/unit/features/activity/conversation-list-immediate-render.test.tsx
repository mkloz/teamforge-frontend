// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { UnifiedConversation } from "@/features/activity/lib/activity-contract";

vi.mock(
  "@/features/activity/components/activity-page/activity-template-starting-points.lazy",
  () => ({ LazyActivityTemplateStartingPoints: () => null }),
);

vi.mock(
  "@/features/activity/components/conversation-list/conversation-list-render-state",
  () => ({
    ConversationListBody: ({
      items,
    }: {
      items: Array<Pick<UnifiedConversation, "id">>;
    }) => (
      <div>
        {items.map((item) => (
          <button
            type="button"
            className="activity-list-row-containment"
            key={item.id}
          >
            {item.id}
          </button>
        ))}
      </div>
    ),
  }),
);

vi.mock(
  "@/features/activity/components/conversation-list/filter-header",
  () => ({ FilterHeader: () => null }),
);

vi.mock(
  "@/features/activity/components/conversation-list/search-header",
  () => ({ SearchHeader: () => null }),
);

vi.mock(
  "@/features/activity/components/conversation-list/list-feedback-state",
  () => ({ ConversationListOfflineBanner: () => null }),
);

vi.mock(
  "@/features/activity/components/conversation-list/saved-messages-chat-list-item",
  () => ({ SavedMessagesChatListItem: () => null }),
);

vi.mock("@/shared/hooks/use-reset-scroll-on-change", () => ({
  useResetScrollOnChange: () => undefined,
}));

import { ConversationList } from "@/features/activity/components/conversation-list";

const conversations: UnifiedConversation[] = Array.from(
  { length: 30 },
  (_, index) => ({
    id: `conversation-${String(index + 1).padStart(2, "0")}`,
    kind: "dm",
    unreadCount: 0,
    isTyping: false,
  }),
);

describe("Activity conversation list rendering", () => {
  it("makes every loaded conversation available in the first render", () => {
    render(
      <ConversationList
        items={conversations}
        savedMessages={[]}
        selectedId={null}
        selectedKind={null}
        searchQuery=""
        activeFilter="all"
        sidebarDensity="default"
        pinnedCount={0}
        allUnreadMessageCount={0}
        groupUnreadMessageCount={0}
        dmUnreadMessageCount={0}
        pinnedUnreadMessageCount={0}
        savedCount={0}
        showTemplateStartingPoints={false}
        isFeedError={false}
        isFeedRetrying={false}
        isOnline
        onSearchChange={() => undefined}
        onFilterChange={() => undefined}
        onDensityChange={() => undefined}
        onTogglePinnedItem={() => undefined}
        onToggleMutedItem={() => undefined}
        onMarkReadItem={() => undefined}
        onRemoveSavedMessage={() => undefined}
        onRetryFeed={() => undefined}
        onSelectItem={() => undefined}
      />,
    );

    const rows = screen.getAllByRole("button");
    expect(rows).toHaveLength(30);
    expect(rows.map((row) => row.textContent)).toEqual(
      conversations.map((conversation) => conversation.id),
    );
    expect(
      screen.getByRole("button", { name: "conversation-25" }),
    ).toBeVisible();

    const finalRow = screen.getByRole("button", { name: "conversation-30" });
    expect(finalRow).toHaveClass("activity-list-row-containment");
    finalRow.focus();
    expect(finalRow).toHaveFocus();
  });
});
