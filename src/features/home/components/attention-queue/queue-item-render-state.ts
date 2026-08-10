import { cn } from "@/shared/lib/utils";

const QUEUE_ITEM_CLASS_NAME =
  "group min-w-0 rounded-2xl bg-card px-3 py-3 transition-colors duration-150 sm:px-4";

interface QueueActionStateInput {
  isAccepting: boolean;
  isDeclining: boolean;
  isOnline: boolean;
}

export function getQueueItemClassName(
  isFocused: boolean,
  hoverClassName: string,
) {
  return cn(
    QUEUE_ITEM_CLASS_NAME,
    isFocused
      ? "bg-primary-soft ring-1 ring-brand-teal/30 ring-inset"
      : hoverClassName,
  );
}

export function getQueueActionDisabled({
  isAccepting,
  isDeclining,
  isOnline,
}: QueueActionStateInput) {
  return !isOnline || isAccepting || isDeclining;
}

export function getQueueOfflineTitle(isOnline: boolean, offlineTitle: string) {
  return isOnline ? undefined : offlineTitle;
}
