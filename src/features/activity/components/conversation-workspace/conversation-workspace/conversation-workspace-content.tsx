import { ConversationCapabilityProvider } from "@/features/activity/components/conversation-workspace/conversation-capability-context";
import {
  ConversationAlertBanners,
  ConversationComposer,
  ConversationMessageArea,
} from "@/features/activity/components/conversation-workspace/conversation-view-sections";
import { ConversationPlanProposalDialog } from "@/features/activity/components/conversation-workspace/conversation-workspace/plan-proposal-dialog";
import type { ConversationWorkspaceController } from "@/features/activity/components/conversation-workspace/conversation-workspace/use-conversation-workspace-controller";
import { WorkspaceHeader } from "@/features/activity/components/conversation-workspace/conversation-workspace/workspace-header";
import { WorkspaceStatusBar } from "@/features/activity/components/conversation-workspace/conversation-workspace/workspace-status-bar";
import { ChatBackground } from "@/features/activity/components/conversation-workspace/message-timeline/chat-background";

interface ConversationWorkspaceContentProps {
  workspace: ConversationWorkspaceController;
}

export function ConversationWorkspaceContent({
  workspace,
}: ConversationWorkspaceContentProps) {
  return (
    <ConversationCapabilityProvider capabilities={workspace.capabilities}>
      <div
        data-chat-dropzone-root
        className="relative isolate flex min-h-0 flex-1 flex-col overflow-hidden bg-canvas/40"
      >
        <ChatBackground />

        <ConversationPlanProposalDialog {...workspace.dialogProps} />

        <WorkspaceHeader {...workspace.headerProps} />

        <WorkspaceStatusBar {...workspace.statusBarProps} />

        <ConversationAlertBanners {...workspace.alertProps} />

        <ConversationMessageArea {...workspace.messageAreaProps} />

        <ConversationComposer {...workspace.composerProps} />
      </div>
    </ConversationCapabilityProvider>
  );
}
