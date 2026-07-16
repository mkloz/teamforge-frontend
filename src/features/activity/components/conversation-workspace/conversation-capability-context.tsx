import { createContext, type ReactNode, useContext } from "react";

import type { Group } from "@/features/activity/lib/activity-contract";
import {
  type GroupChatReadOnlyReason,
  hasMissingAutoGovernance,
  isSystemManagedGroupGovernance,
} from "@/shared/schemas/group-governance";

export interface ConversationCapabilities {
  canAttachMedia: boolean;
  canForwardMessages: boolean;
  canSendGifs: boolean;
  canSendText: boolean;
  canSendVoiceMessages: boolean;
  canLeaveGroup: boolean;
  canSuggestPlanChange: boolean;
  canVoteOnPlanChange: boolean;
  chatMode: "READ_ONLY" | "STANDARD" | "TEXT_ONLY";
  isSystemManaged: boolean;
  readOnlyReason: GroupChatReadOnlyReason | null;
  writable: boolean;
}

const STANDARD_CONVERSATION_CAPABILITIES: ConversationCapabilities = {
  canAttachMedia: true,
  canForwardMessages: true,
  canSendGifs: true,
  canSendText: true,
  canSendVoiceMessages: true,
  canLeaveGroup: true,
  canSuggestPlanChange: true,
  canVoteOnPlanChange: true,
  chatMode: "STANDARD",
  isSystemManaged: false,
  readOnlyReason: null,
  writable: true,
};

const ConversationCapabilityContext = createContext<ConversationCapabilities>(
  STANDARD_CONVERSATION_CAPABILITIES,
);

export function ConversationCapabilityProvider({
  capabilities,
  children,
}: {
  capabilities: ConversationCapabilities;
  children: ReactNode;
}) {
  return (
    <ConversationCapabilityContext value={capabilities}>
      {children}
    </ConversationCapabilityContext>
  );
}

export function useConversationCapabilities() {
  return useContext(ConversationCapabilityContext);
}

export function getConversationCapabilities(
  group: Group | null,
): ConversationCapabilities {
  const governance = group?.governance;
  const hasMissingGovernance = hasMissingAutoGovernance({
    forgeMode: group?.activity?.forgeMode,
    governance,
  });

  if (hasMissingGovernance) {
    return {
      canAttachMedia: false,
      canForwardMessages: false,
      canSendGifs: false,
      canSendText: false,
      canSendVoiceMessages: false,
      canLeaveGroup: false,
      canSuggestPlanChange: false,
      canVoteOnPlanChange: false,
      chatMode: "READ_ONLY",
      isSystemManaged: true,
      readOnlyReason: "ACCESS_RESTRICTED",
      writable: false,
    };
  }

  if (!isSystemManagedGroupGovernance(governance)) {
    return STANDARD_CONVERSATION_CAPABILITIES;
  }

  const chat = governance.chat;
  const isReadOnly = chat.mode === "READ_ONLY" || !chat.writable;
  const isTextOnly = chat.mode === "TEXT_ONLY";

  return {
    canAttachMedia:
      !isReadOnly && !isTextOnly && chat.capabilities.canAttachMedia,
    canForwardMessages:
      !isReadOnly && !isTextOnly && chat.capabilities.canForwardMessages,
    canSendGifs:
      !isReadOnly &&
      !isTextOnly &&
      chat.capabilities.canAttachMedia &&
      chat.capabilities.canSendGifs,
    canSendText: !isReadOnly && chat.capabilities.canSendText,
    canSendVoiceMessages:
      !isReadOnly &&
      !isTextOnly &&
      chat.capabilities.canAttachMedia &&
      chat.capabilities.canSendVoiceMessages,
    canLeaveGroup: governance.capabilities.canLeaveGroup,
    canSuggestPlanChange: governance.capabilities.canSuggestPlanChange,
    canVoteOnPlanChange: governance.capabilities.canVoteOnPlanChange,
    chatMode: chat.mode,
    isSystemManaged: true,
    readOnlyReason: chat.readOnlyReason,
    writable: !isReadOnly,
  };
}
