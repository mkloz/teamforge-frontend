import type { VirtualizedMessageBlock } from "@/features/activity/hooks/use-virtualized-message-blocks";
import type {
  ActivityParticipant,
  UnifiedMessage,
} from "@/features/activity/lib/activity-contract";
import type {
  getMessageRowRenderState,
  getMessageSenderBlockRenderState,
} from "../message-row-render-state";

export interface MessageSenderBlockProps {
  block: VirtualizedMessageBlock;
  kind: "dm" | "group";
  highlightedMessageId: string | null;
  isSelectionMode?: boolean;
  selectedMessageIds?: ReadonlySet<string>;
  blockRef: (node: HTMLDivElement | null) => void;
  getMessageRef: (messageId: string) => (node: HTMLDivElement | null) => void;
  onActivateReplyTarget: (messageId: string) => void;
  onStartSelection?: (message: UnifiedMessage) => void;
  onToggleSelected?: (message: UnifiedMessage) => void;
  onShowParticipantProfile?: (participant: ActivityParticipant) => void;
  searchQuery: string;
}

export type MessageRowRenderState = ReturnType<typeof getMessageRowRenderState>;
export type MessageSenderBlockRenderState = ReturnType<
  typeof getMessageSenderBlockRenderState
>;
export type MessageSenderBlockKind = MessageSenderBlockProps["kind"];
export type MessageRefGetter = MessageSenderBlockProps["getMessageRef"];

export interface MessageSenderBlockRendererProps {
  kind: MessageSenderBlockKind;
  onActivateReplyTarget: MessageSenderBlockProps["onActivateReplyTarget"];
  onStartSelection: MessageSenderBlockProps["onStartSelection"];
  onToggleSelected: MessageSenderBlockProps["onToggleSelected"];
  searchQuery: string;
}

export interface MessageSenderBlockSelectionState {
  isSelectionMode: boolean;
  selectedMessageIds: MessageSenderBlockProps["selectedMessageIds"];
}

export interface MessageSenderBlockFrameProps {
  block: VirtualizedMessageBlock;
  blockRef: MessageSenderBlockProps["blockRef"];
  getMessageRef: MessageRefGetter;
  highlightedMessageId: string | null;
  onShowParticipantProfile: MessageSenderBlockProps["onShowParticipantProfile"];
  rendererProps: MessageSenderBlockRendererProps;
  renderState: MessageSenderBlockRenderState;
  selectionState: MessageSenderBlockSelectionState;
}

export interface SenderAvatarSlotProps {
  onShowParticipantProfile: MessageSenderBlockProps["onShowParticipantProfile"];
  sender: ActivityParticipant | null | undefined;
  shouldShowSenderAvatar: boolean;
}

export interface SenderProfileTriggerProps {
  onShowParticipantProfile: MessageSenderBlockProps["onShowParticipantProfile"];
  sender: ActivityParticipant;
}

export interface MessageSenderBlockRowsProps {
  block: VirtualizedMessageBlock;
  getMessageRef: MessageRefGetter;
  highlightedMessageId: string | null;
  isSystemBlock: boolean;
  rendererProps: MessageSenderBlockRendererProps;
  selectionState: MessageSenderBlockSelectionState;
}

export interface MessageSenderBlockRowProps
  extends MessageSenderBlockRowsProps {
  message: UnifiedMessage;
  messageIndex: number;
}

export interface MessageRowSeparatorProps {
  block: VirtualizedMessageBlock;
  isSystemBlock: boolean;
  rowState: Pick<MessageRowRenderState, "hasNewMessagesSeparator">;
}

export interface MessageRowContentProps {
  message: UnifiedMessage;
  rendererProps: MessageSenderBlockRendererProps;
  rowState: MessageRowRenderState;
  selectionState: Pick<MessageSenderBlockSelectionState, "isSelectionMode">;
}

export interface MessageSelectionToggleProps {
  isSelected: boolean;
  onToggle: () => void;
}

export interface MessageBlockDateSeparatorProps {
  block: Pick<VirtualizedMessageBlock, "date" | "showDateSeparator">;
}
