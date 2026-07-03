import type { ConversationWorkspaceProps } from "@/features/activity/components/conversation-workspace/conversation-workspace/conversation-workspace.types";
import { ConversationWorkspaceContent } from "@/features/activity/components/conversation-workspace/conversation-workspace/conversation-workspace-content";
import { useConversationWorkspaceController } from "@/features/activity/components/conversation-workspace/conversation-workspace/use-conversation-workspace-controller";

export type { ConversationWorkspaceProps } from "@/features/activity/components/conversation-workspace/conversation-workspace/conversation-workspace.types";

/**
 * ConversationWorkspace - The flagship container for all conversations.
 * Consolidates Groups and Direct Chats into a single, high-performance UI.
 */
export function ConversationWorkspace(props: ConversationWorkspaceProps) {
  const workspace = useConversationWorkspaceController(props);

  return <ConversationWorkspaceContent workspace={workspace} />;
}
