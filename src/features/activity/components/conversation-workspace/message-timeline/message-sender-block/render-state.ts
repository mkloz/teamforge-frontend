import type {
  MessageSenderBlockProps,
  MessageSenderBlockRendererProps,
  MessageSenderBlockSelectionState,
} from "./types";

export function getMessageSenderBlockRendererProps({
  kind,
  onActivateReplyTarget,
  onStartSelection,
  onToggleSelected,
  searchQuery,
}: Pick<
  MessageSenderBlockProps,
  | "kind"
  | "onActivateReplyTarget"
  | "onStartSelection"
  | "onToggleSelected"
  | "searchQuery"
>): MessageSenderBlockRendererProps {
  return {
    kind,
    onActivateReplyTarget,
    onStartSelection,
    onToggleSelected,
    searchQuery,
  };
}

export function getMessageSenderBlockSelectionState({
  isSelectionMode,
  selectedMessageIds,
}: Pick<Required<MessageSenderBlockProps>, "isSelectionMode"> &
  Pick<MessageSenderBlockProps, "selectedMessageIds">) {
  return {
    isSelectionMode,
    selectedMessageIds,
  } satisfies MessageSenderBlockSelectionState;
}
