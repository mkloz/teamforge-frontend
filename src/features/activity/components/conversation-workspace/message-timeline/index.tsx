import { MessageListContent } from "@/features/activity/components/conversation-workspace/message-timeline/message-list-content";
import { MessageListScrollActions } from "@/features/activity/components/conversation-workspace/message-timeline/message-list-scroll-actions";
import { MessageListViewport } from "@/features/activity/components/conversation-workspace/message-timeline/message-list-viewport";
import type { MessageTimelineProps } from "@/features/activity/components/conversation-workspace/message-timeline/message-timeline.types";
import { useMessageTimelineState } from "@/features/activity/components/conversation-workspace/message-timeline/use-message-timeline-state";

/**
 * MessageTimeline - Shared container for message rendering.
 * Handles grouping logic, date separators, and vertical layout.
 */
export function MessageTimeline(props: MessageTimelineProps) {
  const { contentProps, scrollActionsProps, viewportProps } =
    useMessageTimelineState(props);

  return (
    <div className="relative flex h-full min-h-0 flex-col">
      <MessageListViewport {...viewportProps}>
        <MessageListContent {...contentProps} />
      </MessageListViewport>

      <MessageListScrollActions {...scrollActionsProps} />
    </div>
  );
}
