import { ChatStatusBar } from "@/features/activity/components/conversation-workspace/chat-status-bar";
import type {
  Plan,
  UnifiedMessage,
} from "@/features/activity/lib/activity-contract";

interface WorkspaceStatusBarProps {
  onActivatePinnedMessage: (messageId: string) => void;
  onUnpinPinnedMessage: (messageId: string) => void;
  onViewDetails: () => void;
  pinnedMessages: UnifiedMessage[];
  plan?: Plan;
}

export function WorkspaceStatusBar({
  onActivatePinnedMessage,
  onUnpinPinnedMessage,
  onViewDetails,
  pinnedMessages,
  plan,
}: WorkspaceStatusBarProps) {
  return (
    <ChatStatusBar
      plan={plan}
      pinnedMessages={pinnedMessages}
      onViewDetails={onViewDetails}
      onUnpinPinnedMessage={onUnpinPinnedMessage}
      onActivatePinnedMessage={onActivatePinnedMessage}
    />
  );
}
