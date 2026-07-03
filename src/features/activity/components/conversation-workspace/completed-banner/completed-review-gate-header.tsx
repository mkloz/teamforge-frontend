import { UserStar } from "lucide-react";
import type { CompletedReviewGateViewState } from "./view-state";

interface CompletedReviewGateHeaderProps {
  pendingCountLabel: CompletedReviewGateViewState["pendingCountLabel"];
}

export function CompletedReviewGateHeader({
  pendingCountLabel,
}: CompletedReviewGateHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-3 border-accent/20 border-b bg-accent/8 px-4 py-2">
      <div className="flex min-w-0 items-center gap-2">
        <UserStar className="size-4 shrink-0 text-accent" />
        <span className="truncate font-semibold text-accent text-xs">
          Review checkpoint
        </span>
      </div>
      <span className="inline-flex min-h-6 shrink-0 items-center rounded-full border border-accent/30 bg-accent/12 px-2.5 py-0.5 font-black text-accent text-xs tabular-nums leading-none shadow-sm">
        {pendingCountLabel} left
      </span>
    </div>
  );
}
