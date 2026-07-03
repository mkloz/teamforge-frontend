import type { ConversationWorkspaceProps } from "@/features/activity/components/conversation-workspace/conversation-workspace/conversation-workspace.types";
import type { UseConversationDataProps } from "@/features/activity/hooks/use-conversation-data";
import type {
  Group,
  Plan,
  UnifiedMessage,
} from "@/features/activity/lib/activity-contract";

export function getConversationDataProps(
  props: ConversationWorkspaceProps,
  isTyping: boolean,
  typingUsers: { name: string; avatar: string | null }[],
): UseConversationDataProps {
  if (props.kind === "group") {
    return { kind: props.kind, data: props.data, isTyping, typingUsers };
  }

  return { kind: props.kind, data: props.data, isTyping, typingUsers };
}

export function getHeaderAvatarKind(isNotesChat: boolean) {
  return isNotesChat ? "notes" : "default";
}

export function getHeaderDetailsNavigation<T>(
  openHeaderDetailsInPanel: boolean,
  detailsNavigation: T,
) {
  return openHeaderDetailsInPanel ? undefined : detailsNavigation;
}

export function getHeaderToggleHandler(
  isNotesChat: boolean,
  onToggleAction: () => void,
) {
  return isNotesChat ? noop : onToggleAction;
}

export function getConversationStatusBarPlan(
  props: ConversationWorkspaceProps,
): Plan | undefined {
  return props.kind === "group" ? (props.data.plan ?? undefined) : undefined;
}

export function getStatusBarDetailsHandler({
  isNotesChat,
  onToggleAction,
  onViewPlan,
}: {
  isNotesChat: boolean;
  onToggleAction: () => void;
  onViewPlan?: () => void;
}) {
  return isNotesChat ? noop : (onViewPlan ?? onToggleAction);
}

export function createPinnedMessageUnpinHandler({
  allPinnedMessages,
  unpinMessage,
}: {
  allPinnedMessages: UnifiedMessage[];
  unpinMessage: (message: UnifiedMessage) => Promise<void> | void;
}) {
  return (messageId: string) => {
    const targetMessage = allPinnedMessages.find(
      (message) => message.id === messageId,
    );

    if (!targetMessage) {
      return;
    }

    void unpinMessage(targetMessage);
  };
}

export function getConversationComposerGroup(
  props: ConversationWorkspaceProps,
): Group | null {
  return props.kind === "group" ? props.data : null;
}

const noop = () => {};
