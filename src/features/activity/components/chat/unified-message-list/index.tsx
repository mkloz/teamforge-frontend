import { useChatScroll } from "@/features/activity/hooks/use-chat-scroll";
import { useMessageGrouping } from "@/features/activity/hooks/use-message-grouping";
import { useVirtualizedMessageBlocks } from "@/features/activity/hooks/use-virtualized-message-blocks";
import type { UnifiedMessage } from "@/features/activity/lib/activity-contract";
import { UserProfilePanel } from "@/shared/components/user-profile-panel/user-profile-panel";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import React, {
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ChatBackground } from "../chat-background";
import { DateSeparator } from "./date-separator";
import { MessageRenderer } from "./message-renderer";
import { ScrollActionButtons } from "./scroll-action-buttons";
import { TypingPresence } from "./typing-presence";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/shared/components/ui/drawer";
import type { ActivityParticipant } from "@/features/activity/lib/activity-contract";

interface UnifiedMessageListProps {
  messages: UnifiedMessage[];
  kind: "dm" | "group";
  hasOlderMessages?: boolean;
  focusedMessageId?: string | null;
  isLoadingOlderMessages?: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  containerRef?: React.RefObject<HTMLDivElement | null>;
  onLoadOlderMessages?: () => Promise<void> | void;
  typingUsers?: { name: string; avatar: string | null }[];
  onToggleAction?: () => void;
}

function getParticipantDisplayName(participant?: ActivityParticipant | null) {
  return participant?.name?.trim() || "User";
}

function getParticipantInitials(participant?: ActivityParticipant | null) {
  const initials = getParticipantDisplayName(participant)
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return initials || "TF";
}

/**
 * UnifiedMessageList - Shared container for message rendering.
 * Handles grouping logic, date separators, and vertical layout.
 */
export const UnifiedMessageList = memo(function UnifiedMessageList({
  messages,
  kind,
  hasOlderMessages = false,
  focusedMessageId = null,
  isLoadingOlderMessages = false,
  messagesEndRef,
  containerRef,
  onLoadOlderMessages,
  typingUsers = [],
  onToggleAction,
}: UnifiedMessageListProps) {
  const [selectedSender, setSelectedSender] =
    useState<ActivityParticipant | null>(null);
  const [highlightedMessageId, setHighlightedMessageId] = useState<
    string | null
  >(null);
  const prependAnchorRef = useRef<{
    previousHeight: number;
    previousScrollTop: number;
  } | null>(null);
  const viewportAnchorRef = useRef<{
    key: string;
    scrollTop: number;
    start: number;
  } | null>(null);

  const handleAvatarClick = useCallback(
    (sender: ActivityParticipant) => {
      if (kind === "dm") {
        onToggleAction?.();
      } else {
        setSelectedSender(sender);
      }
    },
    [kind, onToggleAction],
  );

  const handleCloseProfile = useCallback(() => setSelectedSender(null), []);

  const { showScrollToBottom, handleScroll, isNearBottom, scrollToBottom } =
    useChatScroll(messagesEndRef, containerRef, messages.length, kind);
  const groupedMessages = useMessageGrouping(messages);
  const blocks = useMemo(
    () =>
      groupedMessages.flatMap((dateGroup) =>
        dateGroup.senderGroups.map((senderGroup, groupIdx) => ({
          date: dateGroup.date,
          isOwn:
            senderGroup.items[0]?.isOwn ??
            (senderGroup.senderId === "current-user" ||
              senderGroup.senderId === "user-current"),
          key: `sender-group-${dateGroup.date}-${senderGroup.senderId}-${groupIdx}`,
          senderGroup,
          showDateSeparator: groupIdx === 0,
        })),
      ),
    [groupedMessages],
  );
  const { setScrollTop, totalHeight, virtualizedBlocks, visibleBlocks } =
    useVirtualizedMessageBlocks({
      blocks,
      containerRef,
    });

  useEffect(() => {
    if (
      !prependAnchorRef.current ||
      !containerRef?.current ||
      isLoadingOlderMessages
    ) {
      return;
    }

    const { previousHeight, previousScrollTop } = prependAnchorRef.current;
    const delta = totalHeight - previousHeight;
    containerRef.current.scrollTop = previousScrollTop + delta;
    prependAnchorRef.current = null;
  }, [containerRef, isLoadingOlderMessages, totalHeight]);

  useLayoutEffect(() => {
    const viewport = containerRef?.current;
    const currentAnchor = visibleBlocks[0];

    if (!viewport || !currentAnchor) {
      viewportAnchorRef.current = null;
      return;
    }

    if (
      !isNearBottom &&
      !isLoadingOlderMessages &&
      !prependAnchorRef.current &&
      viewportAnchorRef.current?.key === currentAnchor.key
    ) {
      const delta = currentAnchor.start - viewportAnchorRef.current.start;

      if (delta !== 0) {
        viewport.scrollTo({
          behavior: "instant",
          top: viewportAnchorRef.current.scrollTop + delta,
        });
      }
    }

    viewportAnchorRef.current = {
      key: currentAnchor.key,
      scrollTop: viewport.scrollTop,
      start: currentAnchor.start,
    };
  }, [
    containerRef,
    isLoadingOlderMessages,
    isNearBottom,
    totalHeight,
    visibleBlocks,
  ]);

  useEffect(() => {
    if (!focusedMessageId) {
      return;
    }

    const targetMessage = messages.some(
      (message) => message.id === focusedMessageId,
    );

    if (!targetMessage) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      const element = document.getElementById(`msg-${focusedMessageId}`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        setHighlightedMessageId(focusedMessageId);
        return;
      }

      const targetBlock = virtualizedBlocks.find((block) =>
        block.senderGroup.items.some(
          (message) => message.id === focusedMessageId,
        ),
      );

      if (targetBlock && containerRef?.current) {
        containerRef.current.scrollTo({
          behavior: "smooth",
          top: Math.max(targetBlock.start - 120, 0),
        });
        setHighlightedMessageId(focusedMessageId);
      }
    });

    const timeout = window.setTimeout(() => {
      setHighlightedMessageId((current) =>
        current === focusedMessageId ? null : current,
      );
    }, 2200);

    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timeout);
    };
  }, [containerRef, focusedMessageId, messages, virtualizedBlocks]);

  const scrollToUnvoted = useCallback(
    (id: string) => {
      const el = document.getElementById(`msg-${id}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }

      const targetBlock = virtualizedBlocks.find((block) =>
        block.senderGroup.items.some((message) => message.id === id),
      );

      if (targetBlock && containerRef?.current) {
        containerRef.current.scrollTo({
          behavior: "smooth",
          top: Math.max(targetBlock.start - 120, 0),
        });
      }
    },
    [containerRef, virtualizedBlocks],
  );

  const pendingProposalMessages = messages.filter(
    (message) =>
      message.type === "PLAN_UPDATE" && message.proposal?.status === "PENDING",
  );

  const scrollToClosestProposal = useCallback(() => {
    const targetIds = pendingProposalMessages.map((message) => message.id);

    if (targetIds.length === 0) {
      return;
    }

    const viewport = containerRef?.current;

    if (!viewport) {
      scrollToUnvoted(targetIds[0]);
      return;
    }

    const viewportCenter = viewport.scrollTop + viewport.clientHeight / 2;

    const closestTarget = targetIds
      .map((id) => {
        const element = document.getElementById(`msg-${id}`);

        if (!element) {
          return null;
        }

        const distance = Math.abs(
          element.offsetTop + element.offsetHeight / 2 - viewportCenter,
        );

        return { distance, id };
      })
      .flatMap((candidate) => (candidate ? [candidate] : []))
      .sort((left, right) => left.distance - right.distance)[0];

    scrollToUnvoted(closestTarget?.id ?? targetIds[0]);
  }, [containerRef, pendingProposalMessages, scrollToUnvoted]);

  const handleViewportScroll = useCallback(
    (event: React.UIEvent<HTMLDivElement>) => {
      handleScroll(event);
      setScrollTop(event.currentTarget.scrollTop);

      if (
        event.currentTarget.scrollTop < 180 &&
        hasOlderMessages &&
        !isLoadingOlderMessages &&
        onLoadOlderMessages
      ) {
        prependAnchorRef.current = {
          previousHeight: totalHeight,
          previousScrollTop: event.currentTarget.scrollTop,
        };
        void onLoadOlderMessages();
      }
    },
    [
      handleScroll,
      hasOlderMessages,
      isLoadingOlderMessages,
      onLoadOlderMessages,
      setScrollTop,
      totalHeight,
    ],
  );

  return (
    <div className="relative h-full flex flex-col min-h-0 bg-canvas">
      <ChatBackground />
      <div
        ref={containerRef}
        onScroll={handleViewportScroll}
        className="relative z-10 flex-1 overflow-y-auto px-1 pt-4 pb-0 scroll-smooth scrollbar-none scroll-margin-top-12"
      >
        <div className="relative pb-2" style={{ height: `${totalHeight}px` }}>
          {isLoadingOlderMessages && (
            <div className="absolute left-0 right-0 top-0 z-20 flex justify-center py-2">
              <div className="rounded-full border border-border/60 bg-canvas/90 px-3 py-1 text-micro font-semibold text-slate-muted shadow-sm backdrop-blur-sm">
                Loading earlier messages...
              </div>
            </div>
          )}

          {visibleBlocks.map((block) => (
            <div
              key={block.key}
              className="absolute left-0 right-0 flex flex-col gap-0.5"
              style={{
                minHeight: `${block.estimatedHeight}px`,
                top: `${block.start}px`,
              }}
            >
              {block.showDateSeparator && <DateSeparator date={block.date} />}

              <div
                className={cn(
                  "flex items-stretch gap-3 group/sender mb-3 relative",
                  block.isOwn ? "flex-row-reverse" : "flex-row",
                )}
              >
                {!block.isOwn && block.senderGroup.senderId !== "system" && (
                  <div className="w-8 shrink-0 flex flex-col justify-end">
                    <div className="sticky bottom-2 flex flex-col items-center">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() =>
                          block.senderGroup.sender &&
                          handleAvatarClick(block.senderGroup.sender)
                        }
                        className="rounded-full h-8 w-8 p-0"
                        aria-label={`View ${getParticipantDisplayName(block.senderGroup.sender)}'s profile`}
                      >
                        {block.senderGroup.sender?.avatar ? (
                          <img
                            src={block.senderGroup.sender.avatar}
                            alt={getParticipantDisplayName(
                              block.senderGroup.sender,
                            )}
                            className="w-8 h-8 rounded-full object-cover ring-1 ring-border shadow-sm"
                          />
                        ) : (
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-[10px] font-bold text-muted-foreground ring-1 ring-border shadow-sm">
                            {getParticipantInitials(block.senderGroup.sender)}
                          </div>
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                <div
                  className={cn(
                    "flex-1 flex flex-col min-w-0",
                    block.isOwn ? "items-end" : "items-start",
                  )}
                >
                  {block.senderGroup.items.map((message, msgIdx) => {
                    const isFirstInGroup = msgIdx === 0;

                    return (
                      <div
                        key={message.id}
                        id={`msg-${message.id}`}
                        className={cn(
                          "w-full rounded-2xl transition-[background-color,box-shadow] duration-500",
                          highlightedMessageId === message.id &&
                            "bg-forge-teal/8 shadow-[0_0_0_1px_rgba(13,148,136,0.18)]",
                        )}
                      >
                        <MessageRenderer
                          message={message}
                          showSender={isFirstInGroup}
                          kind={kind}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}

          <div
            className="absolute left-0 right-0"
            style={{ top: `${totalHeight}px` }}
          >
            <TypingPresence typingUsers={typingUsers} />
          </div>
          <div
            ref={messagesEndRef}
            className="absolute left-0 h-0 w-full shrink-0"
            style={{
              top: `${Math.max(totalHeight + (typingUsers.length > 0 ? 44 : 0) - 1, 0)}px`,
            }}
          />
        </div>
      </div>

      <ScrollActionButtons
        showScrollToBottom={showScrollToBottom}
        onScrollToBottom={scrollToBottom}
        hasProposalShortcut={pendingProposalMessages.length > 0}
        onScrollToProposal={scrollToClosestProposal}
      />

      {/* User Profile Panel - Using shadcn Drawer for better accessibility and unified physics */}
      <Drawer
        open={!!selectedSender}
        onOpenChange={(open) => !open && handleCloseProfile()}
      >
        <DrawerContent className="bg-canvas border-t rounded-t-3xl max-h-[75svh] sm:max-w-md mx-auto">
          <DrawerHeader className="sr-only">
            <DrawerTitle>User Profile</DrawerTitle>
          </DrawerHeader>

          {selectedSender && (
            <UserProfilePanel
              participant={selectedSender}
              isMobile={true}
              isDirectChat={false}
              onBack={handleCloseProfile}
            />
          )}
        </DrawerContent>
      </Drawer>
    </div>
  );
});
