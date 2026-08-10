import { ClipboardCheck, UserStar } from "lucide-react";
import type { CompletedReviewGateViewState } from "./view-state";

interface CompletedReviewGateHeaderProps {
  label: CompletedReviewGateViewState["headerLabel"];
  pendingCountLabel: CompletedReviewGateViewState["pendingCountLabel"];
  showPendingCount: boolean;
}

export function CompletedReviewGateHeader({
  label,
  pendingCountLabel,
  showPendingCount,
}: CompletedReviewGateHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-3 border-accent/20 border-b bg-accent-soft px-4 py-2">
      <div className="flex min-w-0 items-center gap-2">
        <HeaderIcon label={label} />
        <span className="truncate font-semibold text-accent text-xs">
          {label}
        </span>
      </div>
      {showPendingCount ? (
        <span className="inline-flex min-h-6 shrink-0 items-center rounded-full border border-accent/30 bg-accent-soft px-2.5 py-0.5 font-black text-accent text-xs tabular-nums leading-none shadow-sm">
          {pendingCountLabel} left
        </span>
      ) : null}
    </div>
  );
}

function HeaderIcon({
  label,
}: {
  label: CompletedReviewGateViewState["headerLabel"];
}) {
  const Icon = label === "Plan check-in" ? ClipboardCheck : UserStar;

  return <Icon className="size-4 shrink-0 text-accent" aria-hidden="true" />;
}
