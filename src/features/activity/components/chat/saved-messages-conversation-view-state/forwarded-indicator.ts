import type { SavedMessageSnapshot } from "@/features/activity/lib/saved-message";
import { cn } from "@/shared/lib/utils";

import type { SavedMessageForwardedIndicatorViewState } from "./types";

const FORWARDED_INDICATOR_BASE_CLASS_NAME =
  "mx-1.5 mt-1 mb-0.5 min-w-0 shrink rounded-lg px-1.5";
const FORWARDED_INDICATOR_RECEIVED_CLASS_NAME = "bg-muted/55 text-slate-muted";

export function getSavedMessageForwardedIndicatorViewState({
  isOwn,
  message,
}: {
  isOwn: boolean;
  message: SavedMessageSnapshot["message"];
}): SavedMessageForwardedIndicatorViewState | null {
  if (!isForwardedSavedMessage(message)) {
    return null;
  }

  return {
    className: getSavedMessageForwardedIndicatorClassName(isOwn),
    label: getSavedMessageForwardedIndicatorLabel(message),
    tone: getSavedMessageForwardedIndicatorTone(isOwn),
  };
}

function isForwardedSavedMessage(message: SavedMessageSnapshot["message"]) {
  return Boolean(message.forwardedFromMessageId);
}

function getSavedMessageForwardedIndicatorClassName(isOwn: boolean) {
  return cn(
    FORWARDED_INDICATOR_BASE_CLASS_NAME,
    !isOwn && FORWARDED_INDICATOR_RECEIVED_CLASS_NAME,
  );
}

function getSavedMessageForwardedIndicatorLabel(
  message: SavedMessageSnapshot["message"],
) {
  const sourceName = message.forwardedFromSenderName?.trim();

  return sourceName ? `Forwarded from ${sourceName}` : "Forwarded";
}

function getSavedMessageForwardedIndicatorTone(
  isOwn: boolean,
): SavedMessageForwardedIndicatorViewState["tone"] {
  return isOwn ? "teal" : "neutral";
}
