import type { UnifiedMessage } from "@/features/activity/lib/activity-contract";

export type UnifiedMessageListKind = "dm" | "group";

export interface MessageSelectionRendererProps {
  isSelectable?: boolean;
  isSelected?: boolean;
  isSelectionMode?: boolean;
  onStartSelection?: (message: UnifiedMessage) => void;
  onToggleSelected?: (message: UnifiedMessage) => void;
}

export interface MessageReplyTargetRendererProps {
  onActivateReplyTarget: (messageId: string) => void;
}

export interface SharedMessageRendererProps
  extends MessageReplyTargetRendererProps,
    MessageSelectionRendererProps {
  message: UnifiedMessage;
  showSender: boolean;
  isHighlighted?: boolean;
  kind: UnifiedMessageListKind;
}

export interface MessageRendererProps extends SharedMessageRendererProps {
  isHighlighted: boolean;
  searchQuery: string;
}

export type ProposalMessageProps = SharedMessageRendererProps;

export interface UnifiedMessageItemProps extends SharedMessageRendererProps {
  searchQuery?: string;
}
