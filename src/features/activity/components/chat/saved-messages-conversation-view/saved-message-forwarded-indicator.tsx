import { Forward } from "lucide-react";
import type { SavedMessageSnapshot } from "@/features/activity/lib/saved-message";
import { StatusPill } from "@/shared/components/ui/status-pill";
import { getSavedMessageForwardedIndicatorViewState } from "../saved-messages-conversation-view-state";

interface ForwardedIndicatorProps {
  message: SavedMessageSnapshot["message"];
  isOwn: boolean;
}

export function ForwardedIndicator({
  message,
  isOwn,
}: ForwardedIndicatorProps) {
  const viewState = getSavedMessageForwardedIndicatorViewState({
    isOwn,
    message,
  });

  if (!viewState) {
    return null;
  }

  return (
    <StatusPill
      icon={Forward}
      iconClassName="size-3"
      tone={viewState.tone}
      surface="soft"
      className={viewState.className}
    >
      <span className="min-w-0 truncate">{viewState.label}</span>
    </StatusPill>
  );
}
