import { cn } from "@/shared/lib/utils";

const QUEUE_ITEM_CLASS_NAME =
  "group border-border/55 border-b px-1 py-3 transition-colors duration-150 last:border-b-0 sm:px-3";

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
    isFocused ? "bg-forge-teal/8" : hoverClassName,
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
